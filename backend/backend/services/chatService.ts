import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { db } from '../db';
import { chatMessages, chatRooms, bookings, users, rides } from '../shared/schema';
import { eq, and, or, desc } from 'drizzle-orm';

interface ChatUser {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  message: string;
  messageType: string;
  createdAt: Date;
  sender?: ChatUser;
}

interface ChatRoom {
  id: string;
  bookingId: string;
  fromUserId: string;
  toUserId: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  isActive: boolean;
  participants?: ChatUser[];
  messages?: ChatMessage[];
}

export class ChatService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5000",
        methods: ["GET", "POST"]
      },
      path: '/ws'
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Utilizador conectado:', socket.id);

      // Autenticação do utilizador
      socket.on('authenticate', async (userId: string) => {
        if (userId) {
          this.connectedUsers.set(userId, socket.id);
          socket.userId = userId;
          console.log(`Utilizador ${userId} autenticado`);
          
          // Juntar-se às salas de chat activas
          const userChatRooms = await this.getUserChatRooms(userId);
          for (const room of userChatRooms) {
            socket.join(`chat_${room.id}`);
          }
        }
      });

      // Enviar mensagem
      socket.on('send_message', async (data: {
        chatRoomId: string;
        message: string;
        messageType?: string;
      }) => {
        try {
          const { chatRoomId, message, messageType = 'text' } = data;
          const senderId = socket.userId;

          if (!senderId) {
            socket.emit('error', { message: 'Utilizador não autenticado' });
            return;
          }

          // Verificar se o utilizador pode enviar mensagens nesta sala
          const hasAccess = await this.checkChatRoomAccess(chatRoomId, senderId);
          if (!hasAccess) {
            socket.emit('error', { message: 'Sem permissão para enviar mensagens' });
            return;
          }

          // Guardar mensagem na base de dados
          const [newMessage] = await db
            .insert(chatMessages)
            .values({
              chatRoomId,
              fromUserId: senderId,
              message,
              messageType,
              isRead: false
            })
            .returning();

          // Actualizar última mensagem da sala
          await db
            .update(chatRooms)
            .set({
              lastMessage: message,
              lastMessageAt: new Date(),
              updatedAt: new Date()
            })
            .where(eq(chatRooms.id, chatRoomId));

          // Obter dados do remetente
          const [sender] = await db
            .select({
              id: users.id,
              firstName: users.firstName,
              lastName: users.lastName,
              profileImageUrl: users.profileImageUrl
            })
            .from(users)
            .where(eq(users.id, senderId))
            .limit(1);

          const messageWithSender = {
            id: newMessage.id,
            chatRoomId: newMessage.chatRoomId,
            senderId: newMessage.fromUserId,
            message: newMessage.message,
            messageType: newMessage.messageType || 'text',
            createdAt: newMessage.createdAt,
            sender
          };

          // Enviar mensagem para todos na sala
          this.io.to(`chat_${chatRoomId}`).emit('new_message', messageWithSender);

        } catch (error) {
          console.error('Erro ao enviar mensagem:', error);
          socket.emit('error', { message: 'Erro ao enviar mensagem' });
        }
      });

      // Marcar mensagens como lidas
      socket.on('mark_as_read', async (data: { chatRoomId: string }) => {
        try {
          const { chatRoomId } = data;
          const userId = socket.userId;

          if (!userId) return;

          await db
            .update(chatMessages)
            .set({ isRead: true })
            .where(and(
              eq(chatMessages.chatRoomId, chatRoomId),
              eq(chatMessages.fromUserId, userId)
            ));

          this.io.to(`chat_${chatRoomId}`).emit('messages_read', { chatRoomId, userId });

        } catch (error) {
          console.error('Erro ao marcar mensagens como lidas:', error);
        }
      });

      // Desconexão
      socket.on('disconnect', () => {
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          console.log(`Utilizador ${socket.userId} desconectado`);
        }
      });
    });
  }

  /**
   * Obtém o outro participante da sala de chat
   */
  async getOtherParticipant(chatRoomId: string, userId: string): Promise<string> {
    const [room] = await db
      .select()
      .from(chatRooms)
      .where(eq(chatRooms.id, chatRoomId))
      .limit(1);

    if (!room) throw new Error('Sala de chat não encontrada');

    return room.participantOneId === userId ? room.participantTwoId : room.participantOneId;
  }

  /**
   * Cria ou obtém uma sala de chat para uma reserva
   */
  async getOrCreateChatRoom(bookingId: string): Promise<any> {
    // Obter informações da reserva
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      throw new Error('Reserva não encontrada');
    }

    // Para boleias, o provider é o driver
    let providerId = null;
    if (booking.rideId) {
      const [ride] = await db
        .select({ driverId: rides.driverId })
        .from(rides)
        .where(eq(rides.id, booking.rideId))
        .limit(1);
      providerId = ride?.driverId;
    }

    // Para simplificar, retornar informações básicas do chat
    return {
      id: `chat_${bookingId}`,
      bookingId,
      fromUserId: booking.passengerId!,
      toUserId: providerId,
      isActive: true
    };
  }

  /**
   * Obtém salas de chat de um utilizador
   */
  async getUserChatRooms(userId: string): Promise<any[]> {
    // Buscar conversas onde o utilizador participou
    const recentChats = await db
      .select({
        chatRoomId: chatMessages.chatRoomId,
        fromUserId: chatMessages.fromUserId,
        message: chatMessages.message,
        createdAt: chatMessages.createdAt
      })
      .from(chatMessages)
      .where(or(
        eq(chatMessages.fromUserId, userId)
      ))
      .orderBy(desc(chatMessages.createdAt))
      .limit(10);

    // Agrupar por sala de chat
    const uniqueChats = new Map();
    for (const chat of recentChats) {
      if (!uniqueChats.has(chat.chatRoomId)) {
        uniqueChats.set(chat.chatRoomId, {
          id: chat.chatRoomId,
          lastMessage: chat.message,
          lastMessageAt: chat.createdAt
        });
      }
    }

    return Array.from(uniqueChats.values());
  }

  /**
   * Obtém mensagens de uma sala de chat
   */
  async getChatMessages(chatRoomId: string, limit: number = 50): Promise<any[]> {
    const messages = await db
      .select({
        id: chatMessages.id,
        fromUserId: chatMessages.fromUserId,
        message: chatMessages.message,
        messageType: chatMessages.messageType,
        createdAt: chatMessages.createdAt,
        senderFirstName: users.firstName,
        senderLastName: users.lastName,
        senderProfileImage: users.profileImageUrl
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.fromUserId, users.id))
      .where(eq(chatMessages.chatRoomId, chatRoomId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);

    return messages.map(msg => ({
      id: msg.id,
      senderId: msg.fromUserId,
      message: msg.message,
      messageType: msg.messageType,
      createdAt: msg.createdAt,
      sender: {
        id: msg.fromUserId,
        firstName: msg.senderFirstName || '',
        lastName: msg.senderLastName || '',
        profileImageUrl: msg.senderProfileImage || undefined
      }
    }));
  }

  /**
   * Verifica se um utilizador tem acesso a uma sala de chat
   */
  async checkChatRoomAccess(chatRoomId: string, userId: string): Promise<boolean> {
    const [room] = await db
      .select()
      .from(chatRooms)
      .where(eq(chatRooms.id, chatRoomId))
      .limit(1);

    if (!room) return false;

    return room.participantOneId === userId || room.participantTwoId === userId;
  }

  /**
   * Envia notificação de nova mensagem
   */
  async notifyNewMessage(chatRoomId: string, senderId: string, message: string) {
    // Obter participantes da sala
    const [room] = await db
      .select()
      .from(chatRooms)
      .where(eq(chatRooms.id, chatRoomId))
      .limit(1);

    if (!room) return;

    const recipientId = room.participantOneId === senderId ? room.participantTwoId : room.participantOneId;
    const recipientSocketId = this.connectedUsers.get(recipientId);

    if (recipientSocketId) {
      this.io.to(recipientSocketId).emit('notification', {
        type: 'new_message',
        message: 'Nova mensagem recebida',
        chatRoomId,
        senderId
      });
    }
  }

  /**
   * Desactiva uma sala de chat
   */
  async deactivateChatRoom(chatRoomId: string): Promise<void> {
    await db
      .update(chatRooms)
      .set({ isActive: false })
      .where(eq(chatRooms.id, chatRoomId));
  }

  /**
   * Obtém estatísticas de chat para admin
   */
  async getChatStatistics() {
    const totalRooms = await db
      .select()
      .from(chatRooms)
      .where(eq(chatRooms.isActive, true));

    const totalMessages = await db
      .select()
      .from(chatMessages);

    const recentActivity = await db
      .select()
      .from(chatRooms)
      .where(and(
        eq(chatRooms.isActive, true)
      ))
      .limit(10);

    return {
      totalActiveRooms: totalRooms.length,
      totalMessages: totalMessages.length,
      connectedUsers: this.connectedUsers.size,
      recentActivity: recentActivity.length
    };
  }
}

// Extensão do tipo Socket para incluir userId
declare module 'socket.io' {
  interface Socket {
    userId?: string;
  }
}

export let chatService: ChatService;

export function initializeChatService(server: HTTPServer) {
  chatService = new ChatService(server);
  return chatService;
}