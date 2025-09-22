import { useState } from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { MessageCircle, Send, User, Clock, Car, Handshake } from "lucide-react";

export default function DriverChat() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // Mock data - chats especiais entre hotéis e motoristas
  const hotelDriverChats = [
    {
      id: 1,
      type: "partnership_negotiation",
      driver: "João M.",
      route: "Maputo → Beira",
      subject: "Negociação Parceria - 15% Comissão",
      lastMessage: "Posso começar na próxima semana",
      timestamp: "14:30",
      unread: 1,
      status: "negotiating",
      driverRating: 4.8
    },
    {
      id: 2,
      type: "active_partnership",
      driver: "Maria S.", 
      route: "Nampula → Nacala",
      subject: "Parceria Ativa - Comissões",
      lastMessage: "Cliente confirmado para amanhã",
      timestamp: "11:15",
      unread: 0,
      status: "active",
      driverRating: 4.9
    },
    {
      id: 3,
      type: "inquiry",
      driver: "Carlos A.",
      route: "Tete → Chimoio", 
      subject: "Interesse em Parceria",
      lastMessage: "Que tipo de comissão oferecem?",
      timestamp: "Ontem",
      unread: 2,
      status: "inquiry",
      driverRating: 4.7
    }
  ];

  const chatMessages = {
    1: [
      { id: 1, sender: "João M.", message: "Olá! Vi o post sobre parceria com 15% de comissão", time: "13:00", isHotel: false },
      { id: 2, sender: "Eu", message: "Olá João! Sim, procuramos motoristas regulares para Beira", time: "13:15", isHotel: true },
      { id: 3, sender: "João M.", message: "Faço essa rota 3x por semana. Posso começar na próxima semana", time: "14:30", isHotel: false }
    ],
    2: [
      { id: 1, sender: "Maria S.", message: "Trouxe uma família de 4 pessoas hoje", time: "10:00", isHotel: false },
      { id: 2, sender: "Eu", message: "Excelente Maria! Já temos a reserva confirmada", time: "10:30", isHotel: true },
      { id: 3, sender: "Maria S.", message: "Cliente confirmado para amanhã", time: "11:15", isHotel: false }
    ],
    3: [
      { id: 1, sender: "Carlos A.", message: "Bom dia! Faço a rota Tete-Chimoio regularmente", time: "Ontem", isHotel: false },
      { id: 2, sender: "Carlos A.", message: "Que tipo de comissão oferecem?", time: "Ontem", isHotel: false }
    ]
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    console.log("Enviar mensagem:", newMessage, "para motorista:", selectedChat);
    setNewMessage("");
    // TODO: Implementar envio de mensagem
  };

  const getChatIcon = (type: string) => {
    switch (type) {
      case "partnership_negotiation": return <Handshake className="w-4 h-4 text-blue-600" />;
      case "active_partnership": return <Car className="w-4 h-4 text-green-600" />;
      case "inquiry": return <MessageCircle className="w-4 h-4 text-orange-600" />;
      default: return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getChatBadgeColor = (status: string) => {
    switch (status) {
      case "negotiating": return "bg-blue-100 text-blue-800";
      case "active": return "bg-green-100 text-green-800";
      case "inquiry": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "negotiating": return "Negociando";
      case "active": return "Parceiro Ativo";
      case "inquiry": return "Consulta";
      default: return "Desconhecido";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat com Motoristas</h1>
          <p className="text-gray-600">Canal exclusivo para negociar parcerias e coordenar com motoristas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Lista de Chats */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Conversas com Motoristas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {hotelDriverChats.length > 0 ? (
                <div className="space-y-1">
                  {hotelDriverChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`p-4 cursor-pointer border-b hover:bg-gray-50 ${
                        selectedChat === chat.id ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
                      }`}
                      onClick={() => setSelectedChat(chat.id)}
                      data-testid={`chat-item-${chat.id}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {getChatIcon(chat.type)}
                          <div>
                            <h3 className="font-medium text-sm">{chat.driver}</h3>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">⭐ {chat.driverRating}</span>
                            </div>
                          </div>
                        </div>
                        {chat.unread > 0 && (
                          <Badge className="bg-orange-500">
                            {chat.unread}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-1">{chat.route}</p>
                      <p className="text-xs text-gray-600 mb-2">{chat.subject}</p>
                      
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-gray-500 truncate flex-1 mr-2">
                          {chat.lastMessage}
                        </p>
                        <span className="text-xs text-gray-400">{chat.timestamp}</span>
                      </div>
                      
                      <Badge className={`${getChatBadgeColor(chat.status)} text-xs`}>
                        {getStatusLabel(chat.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Nenhuma conversa com motoristas</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Área de Chat */}
          <Card className="lg:col-span-2">
            {selectedChat ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getChatIcon(hotelDriverChats.find(c => c.id === selectedChat)?.type || "")}
                      <div>
                        <CardTitle className="text-lg">
                          {hotelDriverChats.find(c => c.id === selectedChat)?.driver}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          {hotelDriverChats.find(c => c.id === selectedChat)?.route}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge className={getChatBadgeColor(hotelDriverChats.find(c => c.id === selectedChat)?.status || "")}>
                        {getStatusLabel(hotelDriverChats.find(c => c.id === selectedChat)?.status || "")}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        ⭐ {hotelDriverChats.find(c => c.id === selectedChat)?.driverRating}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col h-[400px] p-0">
                  {/* Mensagens */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {(chatMessages[selectedChat as keyof typeof chatMessages] || []).map((message: any) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isHotel ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            message.isHotel
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 opacity-60" />
                            <span className="text-xs opacity-60">{message.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input de Mensagem */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Digite sua mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        data-testid="input-message"
                      />
                      <Button onClick={handleSendMessage} data-testid="button-send">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="mt-2">
                      {hotelDriverChats.find(c => c.id === selectedChat)?.status === "negotiating" && (
                        <p className="text-xs text-gray-500">
                          🤝 Negocie comissões, benefícios e condições da parceria
                        </p>
                      )}
                      {hotelDriverChats.find(c => c.id === selectedChat)?.status === "active" && (
                        <p className="text-xs text-gray-500">
                          ✅ Coordene entregas de clientes e pagamentos de comissão
                        </p>
                      )}
                      {hotelDriverChats.find(c => c.id === selectedChat)?.status === "inquiry" && (
                        <p className="text-xs text-gray-500">
                          💬 Responda às perguntas sobre suas ofertas de parceria
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-[500px]">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Selecione uma conversa
                  </h3>
                  <p className="text-gray-600">
                    Escolha um motorista à esquerda para iniciar a conversa
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Handshake className="w-4 h-4" />
                Negociação
              </h3>
              <p className="text-sm text-blue-800">
                Discuta termos de parceria, comissões e benefícios especiais.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <h3 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                <Car className="w-4 h-4" />
                Coordenação
              </h3>
              <p className="text-sm text-green-800">
                Coordene entregas de clientes e confirmações de reservas com parceiros ativos.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <h3 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Consultas
              </h3>
              <p className="text-sm text-orange-800">
                Responda a perguntas de motoristas interessados em suas ofertas.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}