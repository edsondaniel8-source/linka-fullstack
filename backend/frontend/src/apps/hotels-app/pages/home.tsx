import { useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { useMutation } from '@tanstack/react-query';
import { 
  Hotel, 
  Plus, 
  MapPin, 
  Users, 
  TrendingUp,
  Star,
  DollarSign,
  UserCheck,
  Handshake,
  BarChart3,
  MessageCircle,
  Edit,
  Save,
  Calendar,
  Eye,
  Settings,
  PartyPopper,
  Send,
  Clock,
  Building2,
  Home
} from 'lucide-react';
import LocationAutocomplete from '@/shared/components/LocationAutocomplete';
import apiService from '@/services/api';
import { useToast } from '@/shared/hooks/use-toast';
import { useAccommodations } from '@/shared/hooks/useAccommodations';
import { AppUser } from '@/shared/hooks/useAuth';
import HotelCreationWizard from '@/components/hotel-wizard/HotelCreationWizard';

interface HotelEvent {
  id: string;
  title: string;
  description: string;
  eventType: string;
  venue: string;
  startDate: string;
  endDate: string;
  ticketPrice: number;
  maxTickets: number;
  ticketsSold: number;
  status: string;
  organizerId?: string;
}

interface HotelStats {
  totalBookings: number;
  monthlyRevenue: number;
  averageRating: number;
  averageOccupancy: number;
  totalEvents: number;
  upcomingEvents: number;
  activePartnerships: number;
  partnershipEarnings: number;
  totalRoomTypes: number;
  totalRooms: number;
  availableRooms: number;
}

interface DriverPartnership {
  id: string;
  driver: string;
  route: string;
  commission: number;
  clientsBrought: number;
  totalEarnings: number;
  lastMonth: number;
  rating: number;
  joinedDate: string;
  status: string;
}

interface ChatMessage {
  id: number;
  sender: string;
  message: string;
  time: string;
  isHotel: boolean;
}

interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  type: string;
  description?: string;
  pricePerNight: number;
  totalRooms: number;
  availableRooms: number;
  images?: string[];
  amenities?: string[];
  size?: number;
  bedType?: string;
  hasBalcony: boolean;
  hasSeaView: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
}

interface ExtendedCreateAccommodationRequest {
  name: string;
  type: string;
  address?: string;
  description?: string;
  pricePerNight?: number;
  maxGuests?: number;
  amenities?: string[];
  images?: string[];
  bedrooms?: number;
  bathrooms?: number;
  isAvailable?: boolean;
  unavailableDates?: string[];
}

export default function HotelsHome() {
  const { user } = useAuth() as { user: AppUser | null };
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showHotelSetup, setShowHotelSetup] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreatePartnership, setShowCreatePartnership] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('accommodations');
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Estados para o Hotel Wizard
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomType | null>(null);
  const [wizardMode, setWizardMode] = useState<'create' | 'edit'>('create');

  const [accommodationForm, setAccommodationForm] = useState<ExtendedCreateAccommodationRequest>({
    name: '',
    address: '',
    type: 'hotel_room',
    pricePerNight: 0,
    amenities: [],
    description: '',
    images: [],
    isAvailable: true,
    maxGuests: 2,
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    eventType: 'festival',
    venue: '',
    startDate: '',
    endDate: '',
    ticketPrice: 0,
    maxTickets: 100
  });

  const [partnershipForm, setPartnershipForm] = useState({
    title: '',
    description: '',
    commission: 10,
    benefits: '',
    requirements: '',
    targetRoutes: [] as string[]
  });

  // Fetch hotel profile
  const { data: hotelProfile } = useQuery({
    queryKey: ['hotel-profile', user?.id],
    queryFn: () => apiService.getUserProfile(),
    enabled: !!user?.id
  });

  // Fetch hotel stats
  const { data: hotelStats } = useQuery<HotelStats>({
    queryKey: ['hotel-stats', user?.id],
    queryFn: async (): Promise<HotelStats> => {
      try {
        return {
          totalBookings: 73,
          monthlyRevenue: 224500,
          averageRating: 4.8,
          averageOccupancy: 82,
          totalEvents: 1,
          upcomingEvents: 1,
          activePartnerships: 2,
          partnershipEarnings: 11000,
          totalRoomTypes: 2,
          totalRooms: 8,
          availableRooms: 6
        };
      } catch (error) {
        return {
          totalBookings: 73,
          monthlyRevenue: 224500,
          averageRating: 4.8,
          averageOccupancy: 82,
          totalEvents: 1,
          upcomingEvents: 1,
          activePartnerships: 2,
          partnershipEarnings: 11000,
          totalRoomTypes: 2,
          totalRooms: 8,
          availableRooms: 6
        };
      }
    },
    enabled: !!user?.id
  });

  // Fetch hotel events
  const { data: hotelEvents } = useQuery<HotelEvent[]>({
    queryKey: ['hotel-events', user?.id],
    queryFn: async (): Promise<HotelEvent[]> => {
      try {
        const result = await (apiService.getEvents?.() || Promise.resolve([]));
        return Array.isArray(result) ? result : [];
      } catch (error) {
        return [];
      }
    },
    enabled: !!user?.id,
    initialData: [
      {
        id: '1',
        title: 'Festival de Verão na Costa',
        description: 'Evento musical com artistas locais',
        eventType: 'festival',
        venue: 'Costa do Sol Beach',
        startDate: '2025-09-20',
        endDate: '2025-09-22',
        ticketPrice: 150,
        maxTickets: 200,
        ticketsSold: 45,
        status: 'upcoming'
      }
    ]
  });

  // Use accommodations hook
  const { 
    accommodations: realAccommodations, 
    loading: accommodationsLoading, 
    createAccommodation,
    error: accommodationsError 
  } = useAccommodations();

  // Mutation for creating event
  const createEventMutation = useMutation({
    mutationFn: (data: any) => apiService.createEvent?.(data) || Promise.resolve({ success: true }),
    onSuccess: () => {
      toast({ title: 'Sucesso', description: 'Evento criado com sucesso!' });
      setShowCreateEvent(false);
      setEventForm({ title: '', description: '', eventType: 'festival', venue: '', startDate: '', endDate: '', ticketPrice: 0, maxTickets: 100 });
      queryClient.invalidateQueries({ queryKey: ['hotel-events'] });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Erro ao criar evento', variant: 'destructive' });
    }
  });

  // Partnership and chat data
  const driverPartnerships: DriverPartnership[] = [
    {
      id: '1',
      driver: 'João M.',
      route: 'Maputo → Beira',
      commission: 10,
      clientsBrought: 8,
      totalEarnings: 15600,
      lastMonth: 4200,
      rating: 4.8,
      joinedDate: '2023-11-15',
      status: 'active'
    },
    {
      id: '2',
      driver: 'Maria S.',
      route: 'Nampula → Nacala',
      commission: 12,
      clientsBrought: 12,
      totalEarnings: 22400,
      lastMonth: 6800,
      rating: 4.9,
      joinedDate: '2023-10-20',
      status: 'active'
    }
  ];

  const driverChats = [
    {
      id: 1,
      driver: 'João M.',
      route: 'Maputo → Beira',
      subject: 'Negociação Parceria - 15% Comissão',
      lastMessage: 'Posso começar na próxima semana',
      timestamp: '14:30',
      unread: 1,
      status: 'negotiating',
      rating: 4.8
    },
    {
      id: 2,
      driver: 'Maria S.',
      route: 'Nampula → Nacala',
      subject: 'Parceria Ativa - Comissões',
      lastMessage: 'Cliente confirmado para amanhã',
      timestamp: '11:15',
      unread: 0,
      status: 'active',
      rating: 4.9
    }
  ];

  const chatMessages: Record<number, ChatMessage[]> = {
    1: [
      { id: 1, sender: 'João M.', message: 'Olá! Vi o post sobre parceria com 15% de comissão', time: '13:00', isHotel: false },
      { id: 2, sender: 'Eu', message: 'Olá João! Sim, procuramos motoristas regulares para Beira', time: '13:15', isHotel: true },
      { id: 3, sender: 'João M.', message: 'Faço essa rota 3x por semana. Posso começar na próxima semana', time: '14:30', isHotel: false }
    ],
    2: [
      { id: 1, sender: 'Maria S.', message: 'Trouxe uma família de 4 pessoas hoje', time: '10:00', isHotel: false },
      { id: 2, sender: 'Eu', message: 'Excelente Maria! Já temos a reserva confirmada', time: '10:30', isHotel: true },
      { id: 3, sender: 'Maria S.', message: 'Cliente confirmado para amanhã', time: '11:15', isHotel: false }
    ]
  };

  // Convert existing accommodations to room types
  const roomTypes: RoomType[] = realAccommodations?.map((acc: any) => ({
    id: acc.id,
    hotelId: acc.hostId || '1',
    name: acc.name,
    type: acc.type === 'hotel_room' ? 'standard' : acc.type === 'hotel_suite' ? 'suite' : 'standard',
    description: acc.description || '',
    pricePerNight: Number(acc.pricePerNight),
    totalRooms: 4,
    availableRooms: acc.isAvailable ? 3 : 0,
    images: acc.images || [],
    amenities: acc.amenities || [],
    size: 25,
    bedType: 'Cama de Casal',
    hasBalcony: (acc.amenities || []).includes('Varanda'),
    hasSeaView: (acc.amenities || []).includes('Vista Mar'),
    isActive: acc.isAvailable,
    createdAt: '2024-01-01',
    updatedAt: '2024-09-07',
    address: acc.address,
    rating: acc.rating || 0,
    reviewCount: acc.reviewCount || 0
  })) || [];

  const handleCreateAccommodation = async () => {
    // Validações básicas
    if (!accommodationForm.name?.trim()) {
      toast({ title: "Erro", description: "Nome da propriedade é obrigatório", variant: "destructive" });
      return;
    }

    if (!accommodationForm.pricePerNight || accommodationForm.pricePerNight <= 0) {
      toast({ title: "Erro", description: "Preço por noite deve ser maior que zero", variant: "destructive" });
      return;
    }

    if (!accommodationForm.address?.trim()) {
      toast({ title: "Erro", description: "Endereço é obrigatório", variant: "destructive" });
      return;
    }

    if (!accommodationForm.description?.trim()) {
      toast({ title: "Erro", description: "Descrição é obrigatória", variant: "destructive" });
      return;
    }

    try {
      const result = await createAccommodation({
        name: accommodationForm.name,
        type: accommodationForm.type || 'hotel_room',          // garante string
        address: accommodationForm.address || '',               // garante string
        description: accommodationForm.description || '',       // garante string
        maxGuests: accommodationForm.maxGuests || 2,
        amenities: accommodationForm.amenities || [],
        images: accommodationForm.images || [],
        isAvailable: accommodationForm.isAvailable ?? true,    // garante boolean
        bedrooms: accommodationForm.bedrooms ?? 1,             // valor padrão
        bathrooms: accommodationForm.bathrooms ?? 1,           // valor padrão
      });

      if (result.success) {
        toast({ title: "Sucesso", description: "Acomodação criada com sucesso!" });
        setShowHotelSetup(false);
        setAccommodationForm({
          name: '',
          address: '',
          type: 'hotel_room',
          pricePerNight: 0,
          amenities: [],
          description: '',
          images: [],
          isAvailable: true,
          maxGuests: 2,
          bedrooms: 1,
          bathrooms: 1,
          unavailableDates: []
        });
      } else {
        toast({ title: "Erro", description: result.error || "Falha ao criar acomodação", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Erro ao criar acomodação", variant: "destructive" });
    }
  };

  const handleCreateEvent = () => {
    const eventData = {
      ...eventForm,
      organizerId: user?.id,
      ticketPrice: parseFloat(eventForm.ticketPrice.toString()),
      maxTickets: parseInt(eventForm.maxTickets.toString())
    };
    createEventMutation.mutate(eventData);
  };

  const handleCreateNewRoomType = () => {
    console.log("Criando novo tipo de quarto...");
    setShowHotelSetup(true);
    toast({ 
      title: "Novo Tipo de Quarto", 
      description: "Adicione as informações do novo tipo de quarto." 
    });
  };

  // Funções para manipular o Hotel Wizard
  const handleWizardClose = () => {
    setIsWizardOpen(false);
    setEditingRoom(null);
    setWizardMode('create');
  };

  const handleWizardSubmit = (formData: any) => {
    console.log('Dados do wizard submetidos:', formData);
    
    // Aqui você pode adicionar a lógica para atualizar o quarto no backend
    toast({
      title: "Quarto Atualizado",
      description: `${formData.rooms?.[0]?.name || 'Quarto'} foi atualizado com sucesso`
    });
    
    handleWizardClose();
    
    // Recarregar os dados se necessário
    // queryClient.invalidateQueries({ queryKey: ['accommodations'] });
  };

  const handleEditRoom = (roomType: RoomType) => {
    console.log("Editando quarto:", roomType.id);
    setEditingRoom(roomType);
    setWizardMode('edit');
    setIsWizardOpen(true);
    
    toast({
      title: "Editando Quarto",
      description: `Abrindo editor para ${roomType.name}`
    });
  };

  const handleViewDetails = (roomType: RoomType) => {
    console.log("Visualizando detalhes do quarto:", roomType.id);
    toast({ 
      title: "Detalhes do Quarto", 
      description: `Visualizando ${roomType.name}` 
    });
  };

  const handleConfigureRoom = (roomType: RoomType) => {
    console.log("Configurando quarto:", roomType.id);
    // Você pode usar o mesmo wizard ou criar um modal específico
    setEditingRoom(roomType);
    setWizardMode('edit');
    setIsWizardOpen(true);
    
    toast({ 
      title: "Configurar Quarto", 
      description: `Configurando ${roomType.name}` 
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;
    console.log('Sending message:', newMessage, 'to driver:', selectedChat);
    setNewMessage('');
    // TODO: Implement message sending logic
  };

  // Complete stats based on room types and hotelStats
  const stats = hotelStats || {
    totalRoomTypes: roomTypes?.length || 0,
    totalRooms: roomTypes?.reduce((sum, rt) => sum + rt.totalRooms, 0) || 0,
    availableRooms: roomTypes?.reduce((sum, rt) => sum + rt.availableRooms, 0) || 0,
    monthlyRevenue: 224500,
    averageRating: roomTypes?.reduce((sum, rt) => sum + (rt.rating || 0), 0) / (roomTypes?.length || 1) || 0,
    averageOccupancy: 82,
    totalEvents: hotelEvents?.length || 0,
    upcomingEvents: hotelEvents?.filter(e => e.status === 'upcoming').length || 0,
    activePartnerships: driverPartnerships.filter(p => p.status === 'active').length || 0,
    partnershipEarnings: driverPartnerships.reduce((sum, p) => sum + p.lastMonth, 0) || 0,
    totalBookings: 73
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Hotel className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-gray-600 mb-4">
              Esta área é exclusiva para gestores de alojamento registados.
            </p>
            <Link href="/login">
              <Button className="w-full">Fazer Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Link-A Alojamentos
            </h1>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
              Gestão Simplificada
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Botão para criar novo hotel usando o wizard */}
            <Link href="/hotels/create">
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Criar Novo Hotel
              </Button>
            </Link>

            <Link href="/" data-testid="link-main-app">
              <Button variant="outline">
                <Home className="w-4 h-4 mr-2" />
                App Principal
              </Button>
            </Link>
            <Badge data-testid="user-badge" variant="secondary">
              <UserCheck className="w-4 h-4 mr-2" />
              {user.email?.split('@')[0]}
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Cards de Ação Rápida */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card de Criar Hotel */}
          <Link href="/hotels/create">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-dashed border-green-200 hover:border-green-400 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="pt-6 text-center">
                <div className="text-green-600 mb-4">
                  <Hotel className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Criar Novo Hotel
                </h3>
                <p className="text-gray-600 text-sm">
                  Use nosso wizard completo para cadastrar um novo estabelecimento
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Card de Gerenciar Hotéis */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="pt-6 text-center">
              <div className="text-blue-600 mb-4">
                <Building2 className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Meus Hotéis
              </h3>
              <p className="text-gray-600 text-sm">
                Visualize e gerencie seus estabelecimentos existentes
              </p>
            </CardContent>
          </Card>

          {/* Card de Relatórios */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="pt-6 text-center">
              <div className="text-purple-600 mb-4">
                <BarChart3 className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Relatórios
              </h3>
              <p className="text-gray-600 text-sm">
                Acesse relatórios e estatísticas detalhadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-500 rounded-lg">
                  <Hotel className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-700">Quartos Disponíveis</p>
                  <p className="text-3xl font-bold text-green-900">{stats.availableRooms}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-700">Reservas Total</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-700">Taxa Ocupação</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.averageOccupancy.toFixed(0)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-500 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-700">Receita Mensal</p>
                  <p className="text-3xl font-bold text-yellow-900">{stats.monthlyRevenue.toLocaleString()} MT</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab management */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="accommodations">Acomodações</TabsTrigger>
            <TabsTrigger value="partnerships">Parcerias</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Dashboard do Alojamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Hotel profile */}
                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Perfil do Estabelecimento</h3>
                    <Button variant="outline" size="sm" onClick={() => setEditingProfile(!editingProfile)}>
                      <Edit className="w-4 h-4 mr-2" />
                      {editingProfile ? 'Cancelar' : 'Editar'}
                    </Button>
                  </div>
                  
                  {!editingProfile ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Nome do Hotel</p>
                        <p className="font-medium">{(hotelProfile as any)?.firstName || 'Hotel Costa do Sol'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Localização</p>
                        <p className="font-medium">Costa do Sol, Maputo</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Descrição</p>
                        <p className="text-sm">Hotel boutique com vista para o mar, oferecendo experiências únicas aos hóspedes.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="hotel-name">Nome do Hotel</Label>
                        <Input id="hotel-name" defaultValue={(hotelProfile as any)?.firstName || 'Hotel Costa do Sol'} />
                      </div>
                      <div>
                        <Label htmlFor="hotel-location">Localização</Label>
                        <LocationAutocomplete
                          id="hotel-location"
                          value="Costa do Sol, Maputo"
                          onChange={(value) => console.log(value)}
                          placeholder="Localização do hotel..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="hotel-description">Descrição</Label>
                        <Textarea 
                          id="hotel-description" 
                          defaultValue="Hotel boutique com vista para o mar, oferecendo experiências únicas aos hóspedes."
                          rows={3}
                        />
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Perfil
                      </Button>
                    </div>
                  )}
                </div>

                {/* Dashboard statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{stats.availableRooms}</p>
                    <p className="text-sm text-gray-600">Quartos Disponíveis</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{stats.totalBookings}</p>
                    <p className="text-sm text-gray-600">Reservas Total</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{stats.monthlyRevenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Receita (MT)</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{stats.activePartnerships}</p>
                    <p className="text-sm text-gray-600">Parcerias Ativas</p>
                  </div>
                </div>
                
                {/* Additional statistics */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{stats.averageRating.toFixed(1)}</p>
                    <p className="text-sm text-gray-600">Avaliação Média</p>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <p className="text-2xl font-bold text-indigo-600">{stats.upcomingEvents}</p>
                    <p className="text-sm text-gray-600">Eventos Próximos</p>
                  </div>
                  <div className="text-center p-4 bg-teal-50 rounded-lg">
                    <p className="text-2xl font-bold text-teal-600">{stats.partnershipEarnings.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Ganhos Parcerias (MT)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accommodations">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Gestão de Quartos
                  </CardTitle>
                  <div className="flex gap-2">
                    <Link href="/hotels/create">
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Hotel (Wizard)
                      </Button>
                    </Link>
                    <Button 
                      onClick={handleCreateNewRoomType}
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tipo de Quarto Rápido
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="published">
                  <TabsList>
                    <TabsTrigger value="published">Publicadas ({stats.availableRooms})</TabsTrigger>
                    <TabsTrigger value="reservations">Reservas</TabsTrigger>
                    <TabsTrigger value="conditions">Condições</TabsTrigger>
                  </TabsList>

                  <TabsContent value="published" className="space-y-4">
                    {accommodationsLoading ? (
                      <div>Carregando acomodações...</div>
                    ) : accommodationsError ? (
                      <div>Erro ao carregar acomodações</div>
                    ) : realAccommodations.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">Nenhuma acomodação criada</h3>
                        <p className="text-sm mb-4">Use nosso wizard completo para criar seu primeiro hotel com todos os detalhes.</p>
                        <Link href="/hotels/create">
                          <Button className="bg-green-600 hover:bg-green-700">
                            <Hotel className="w-4 h-4 mr-2" />
                            Criar Primeiro Hotel
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {roomTypes?.filter(rt => rt.isActive).map((roomType: RoomType) => (
                          <Card key={roomType.id} className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                      <Building2 className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-lg">{roomType.name}</h3>
                                      <Badge variant="secondary" className="mt-1">{roomType.type}</Badge>
                                      <Badge 
                                        variant={roomType.isActive ? "default" : "secondary"}
                                        className={`ml-2 ${roomType.isActive ? 'bg-green-100 text-green-800' : ''}`}
                                      >
                                        {roomType.isActive ? 'Ativo' : 'Inativo'}
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <MapPin className="h-4 w-4" />
                                      <span className="text-sm">{roomType.address}</span>
                                    </div>
                                    
                                    {roomType.amenities && roomType.amenities.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {roomType.amenities.map((amenity: string, index: number) => (
                                          <Badge key={index} variant="outline" className="text-xs">{amenity}</Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div className="flex items-center gap-1 text-gray-600">
                                      <Star className="h-4 w-4 text-yellow-500" />
                                      <span>{roomType.rating} ({roomType.reviewCount})</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-600">
                                      <DollarSign className="h-4 w-4" />
                                      <span className="font-semibold">{roomType.pricePerNight.toLocaleString()} MT</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-600">
                                      <Users className="h-4 w-4" />
                                      <span>{roomType.totalRooms} quartos</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-600">
                                      <TrendingUp className="h-4 w-4" />
                                      <span>{roomType.availableRooms} disponíveis</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex flex-col gap-2 ml-4">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => handleEditRoom(roomType)}
                                  >
                                    <Edit className="w-4 h-4 mr-1" />
                                    Editar
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => handleViewDetails(roomType)}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Ver Detalhes
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => handleConfigureRoom(roomType)}
                                  >
                                    <Settings className="w-4 h-4 mr-1" />
                                    Configurar
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="reservations">
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Gestão de Reservas</h3>
                      <p className="text-sm mb-4">Gerir reservas ativas, confirmadas e canceladas.</p>
                      <Button variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Ver Todas as Reservas
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="conditions">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold mb-4">Condições de Reserva</h3>
                      
                      <div className="grid gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">Política de Cancelamento</h4>
                                  <p className="text-sm text-gray-600">Cancelamento gratuito até 24 horas antes</p>
                                </div>
                                <Switch defaultChecked />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">Check-in Automático</h4>
                                  <p className="text-sm text-gray-600">Permitir check-in sem presença do anfitrião</p>
                                </div>
                                <Switch />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">Reserva Instantânea</h4>
                                  <p className="text-sm text-gray-600">Aprovação automática de reservas</p>
                                </div>
                                <Switch defaultChecked />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="pt-6">
                            <h4 className="font-medium mb-4">Horários de Check-in/Check-out</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Check-in</Label>
                                <Input type="time" defaultValue="15:00" />
                              </div>
                              <div>
                                <Label>Check-out</Label>
                                <Input type="time" defaultValue="11:00" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partnerships">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Partnership list */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Handshake className="w-5 h-5" />
                        Parcerias com Motoristas
                      </CardTitle>
                      <Button onClick={() => setShowCreatePartnership(true)} size="sm" className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Parceria
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {driverPartnerships.map((partnership) => (
                        <Card key={partnership.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="p-2 bg-blue-100 rounded-lg">
                                    <Users className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">{partnership.driver}</h4>
                                    <p className="text-sm text-gray-600">{partnership.route}</p>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">Comissão:</span>
                                    <p className="font-semibold">{partnership.commission}%</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Clientes:</span>
                                    <p className="font-semibold">{partnership.clientsBrought}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Este mês:</span>
                                    <p className="font-semibold">{partnership.lastMonth.toLocaleString()} MT</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Avaliação:</span>
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3 text-yellow-500" />
                                      <span className="font-semibold">{partnership.rating}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-2">
                                <Badge 
                                  variant={partnership.status === 'active' ? 'default' : 'secondary'}
                                  className={partnership.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                                >
                                  {partnership.status === 'active' ? 'Ativa' : 'Inactiva'}
                                </Badge>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => setSelectedChat(parseInt(partnership.id))}
                                >
                                  <MessageCircle className="w-3 h-3 mr-1" />
                                  Chat
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Integrated chat */}
              <div>
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Chat Motoristas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!selectedChat ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Selecione uma parceria para iniciar o chat</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Chat header */}
                        <div className="flex items-center gap-3 pb-3 border-b">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{driverChats.find(c => c.id === selectedChat)?.driver}</h4>
                            <p className="text-xs text-gray-600">{driverChats.find(c => c.id === selectedChat)?.route}</p>
                          </div>
                        </div>
                        
                        {/* Messages */}
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {chatMessages[selectedChat]?.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.isHotel ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-xs p-3 rounded-lg text-sm ${
                                msg.isHotel 
                                  ? 'bg-green-600 text-white' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                <p>{msg.message}</p>
                                <p className={`text-xs mt-1 ${
                                  msg.isHotel ? 'text-green-100' : 'text-gray-500'
                                }`}>
                                  {msg.time}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                                               
                        {/* Message input */}
                        <div className="flex gap-2 pt-3 border-t">
                          <Input 
                            placeholder="Escreva sua mensagem..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          />
                          <Button 
                            size="sm" 
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <PartyPopper className="w-5 h-5" />
                    Eventos do Hotel
                  </CardTitle>
                  <Button onClick={() => setShowCreateEvent(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Evento
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="active">
                  <TabsList>
                    <TabsTrigger value="active">Ativos ({stats.upcomingEvents})</TabsTrigger>
                    <TabsTrigger value="past">Anteriores</TabsTrigger>
                    <TabsTrigger value="draft">Rascunhos</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="active" className="space-y-4">
                    {hotelEvents?.filter((e: HotelEvent) => e.status === 'upcoming').length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <PartyPopper className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">Nenhum evento ativo</h3>
                        <p className="text-sm mb-4">Crie eventos para atrair mais hóspedes ao seu hotel.</p>
                        <Button 
                          onClick={() => setShowCreateEvent(true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Criar Primeiro Evento
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {hotelEvents?.filter((e: HotelEvent) => e.status === 'upcoming').map((event: HotelEvent) => (
                          <Card key={event.id} className="border-l-4 border-l-purple-500">
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                      <PartyPopper className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-lg">{event.title}</h3>
                                      <Badge variant="secondary" className="mt-1">{event.eventType}</Badge>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2 mb-4">
                                    <p className="text-sm text-gray-700">{event.description}</p>
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <MapPin className="h-4 w-4" />
                                      <span className="text-sm">{event.venue}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <Calendar className="h-4 w-4" />
                                      <span className="text-sm">{event.startDate} - {event.endDate}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-600">Preço:</span>
                                      <p className="font-semibold">{event.ticketPrice} MT</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Vendidos:</span>
                                      <p className="font-semibold">{event.ticketsSold}/{event.maxTickets}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Status:</span>
                                      <Badge variant="default" className="bg-green-100 text-green-800">
                                        {event.status === 'upcoming' ? 'Próximo' : event.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex flex-col gap-2 ml-4">
                                  <Button size="sm" variant="outline">
                                    <Edit className="w-4 h-4 mr-1" />
                                    Editar
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Eye className="w-4 h-4 mr-1" />
                                    Ver Detalhes
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="past">
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Eventos anteriores aparecerão aqui</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="draft">
                    <div className="text-center py-8 text-gray-500">
                      <Edit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Rascunhos de eventos aparecerão aqui</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Hotel Creation Wizard */}
        <HotelCreationWizard
          open={isWizardOpen}
          onClose={handleWizardClose}
          onSubmit={handleWizardSubmit}
          mode={wizardMode}
          initialData={editingRoom ? {
            rooms: [{
              id: editingRoom.id,
              name: editingRoom.name,
              type: editingRoom.type,
              capacity: 2, // valor padrão
              quantity: editingRoom.totalRooms,
              price: editingRoom.pricePerNight,
              description: editingRoom.description,
              amenities: editingRoom.amenities || [],
              images: editingRoom.images || []
            }]
          } : undefined}
        />

        {/* Modals */}
        
        {/* Modal for hotel setup */}
        <Dialog open={showHotelSetup} onOpenChange={setShowHotelSetup}>
          <DialogContent className="sm:max-w-[600px]" aria-describedby="hotel-setup-description">
            <DialogHeader>
              <DialogTitle>Configurar Perfil do Hotel</DialogTitle>
            </DialogHeader>
            <DialogDescription id="hotel-setup-description">
              Formulário para configurar o perfil do hotel incluindo nome, localização, tipo de quarto, preço, comodidades e descrição.
            </DialogDescription>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hotel-name">Nome do Hotel</Label>
                  <Input 
                    id="hotel-name" 
                    placeholder="ex: Hotel Vista Mar Maputo"
                    value={accommodationForm.name}
                    onChange={(e) => setAccommodationForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo de Quarto</Label>
                  <Select 
                    value={accommodationForm.type || 'hotel_room'} 
                    onValueChange={(value) => setAccommodationForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hotel_room">Quarto de Hotel</SelectItem>
                      <SelectItem value="hotel_suite">Suite</SelectItem>
                      <SelectItem value="apartment">Apartamento</SelectItem>
                      <SelectItem value="guesthouse">Casa de Hóspedes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Localização</Label>
                <LocationAutocomplete 
                  id="accommodation-address"
                  value={accommodationForm.address || ''}
                  onChange={(value) => setAccommodationForm(prev => ({ ...prev, address: value }))}
                  placeholder="Endereço do alojamento..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Preço por Noite (MT)</Label>
                  <Input 
                    id="price" 
                    type="number"
                    placeholder="2500"
                    value={accommodationForm.pricePerNight}
                    onChange={(e) => setAccommodationForm(prev => ({ 
                      ...prev, 
                      pricePerNight: Number(e.target.value) 
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="occupancy">Máximo de Hóspedes</Label>
                  <Input 
                    id="occupancy" 
                    type="number"
                    placeholder="2"
                    value={accommodationForm.maxGuests}
                    onChange={(e) => setAccommodationForm(prev => ({ 
                      ...prev, 
                      maxGuests: Number(e.target.value) 
                    }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="amenities">Comodidades (separadas por vírgula)</Label>
                <Input 
                  id="amenities" 
                  placeholder="Wi-Fi, Ar Condicionado, Vista Mar"
                  value={accommodationForm.amenities?.join(', ') || ''}
                  onChange={(e) => setAccommodationForm(prev => ({ 
                    ...prev, 
                    amenities: e.target.value.split(',').map(a => a.trim()).filter(a => a) 
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição do Quarto</Label>
                <Textarea 
                  id="description" 
                  placeholder="Descreva o quarto e suas características..."
                  value={accommodationForm.description || ''}
                  onChange={(e) => setAccommodationForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="is-available"
                  checked={accommodationForm.isAvailable}
                  onCheckedChange={(checked) => setAccommodationForm(prev => ({ ...prev, isAvailable: checked }))}
                />
                <Label htmlFor="is-available">Disponível para reservas</Label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleCreateAccommodation}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={accommodationsLoading}
                >
                  {accommodationsLoading ? 'Criando...' : 'Criar Acomodação'}
                </Button>
                <Button variant="outline" onClick={() => setShowHotelSetup(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Modal for creating event */}
        <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
          <DialogContent className="sm:max-w-[600px]" aria-describedby="event-creation-description">
            <DialogHeader>
              <DialogTitle>Criar Novo Evento</DialogTitle>
            </DialogHeader>
            <DialogDescription id="event-creation-description">
              Crie um novo evento para o seu hotel, especificando título, tipo, descrição, local, datas e preço dos bilhetes.
            </DialogDescription>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event-title">Título do Evento</Label>
                  <Input 
                    id="event-title" 
                    placeholder="ex: Festival de Verão"
                    value={eventForm.title}
                    onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="event-type">Tipo de Evento</Label>
                  <Select value={eventForm.eventType} onValueChange={(value) => setEventForm(prev => ({ ...prev, eventType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="festival">Festival</SelectItem>
                      <SelectItem value="conference">Conferência</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="concert">Concerto</SelectItem>
                      <SelectItem value="cultural">Cultural</SelectItem>
                      <SelectItem value="business">Negócios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="event-description">Descrição</Label>
                <Textarea 
                  id="event-description" 
                  placeholder="Descreva o evento..."
                  value={eventForm.description}
                  onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="event-venue">Local do Evento</Label>
                <LocationAutocomplete 
                  id="event-venue"
                  value={eventForm.venue}
                  onChange={(value) => setEventForm(prev => ({ ...prev, venue: value }))}
                  placeholder="Local onde será realizado..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Data de Início</Label>
                  <Input 
                    id="start-date" 
                    type="date"
                    value={eventForm.startDate}
                    onChange={(e) => setEventForm(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">Data de Fim</Label>
                  <Input 
                    id="end-date" 
                    type="date"
                    value={eventForm.endDate}
                    onChange={(e) => setEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ticket-price">Preço do Bilhete (MT)</Label>
                  <Input 
                    id="ticket-price" 
                    type="number"
                    placeholder="150"
                    value={eventForm.ticketPrice}
                    onChange={(e) => setEventForm(prev => ({ ...prev, ticketPrice: parseFloat(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="max-tickets">Máximo de Bilhetes</Label>
                  <Input 
                    id="max-tickets" 
                    type="number"
                    value={eventForm.maxTickets}
                    onChange={(e) => setEventForm(prev => ({ ...prev, maxTickets: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleCreateEvent}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={createEventMutation.isPending}
                >
                  {createEventMutation.isPending ? 'Criando...' : 'Criar Evento'}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateEvent(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Modal for creating partnership */}
        <Dialog open={showCreatePartnership} onOpenChange={setShowCreatePartnership}>
          <DialogContent className="sm:max-w-[600px]" aria-describedby="partnership-creation-description">
            <DialogHeader>
              <DialogTitle>Criar Post de Parceria</DialogTitle>
            </DialogHeader>
            <DialogDescription id="partnership-creation-description">
              Crie um post de parceria para motoristas, especificando título, descrição, comissão, benefícios e requisitos.
            </DialogDescription>
            <div className="space-y-4">
              <div>
                <Label htmlFor="partnership-title">Título da Parceria</Label>
                <Input 
                  id="partnership-title" 
                  placeholder="ex: Parceria Exclusiva - 15% Comissão"
                  value={partnershipForm.title}
                  onChange={(e) => setPartnershipForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="partnership-description">Descrição da Oferta</Label>
                <Textarea 
                  id="partnership-description" 
                  placeholder="Descreva os benefícios e condições da parceria..."
                  value={partnershipForm.description}
                  onChange={(e) => setPartnershipForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="commission">Comissão (%)</Label>
                  <Input 
                    id="commission" 
                    type="number"
                    value={partnershipForm.commission}
                    onChange={(e) => setPartnershipForm(prev => ({ ...prev, commission: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="benefits">Benefícios Extras</Label>
                  <Input 
                    id="benefits" 
                    placeholder="Estadia gratuita, desconto..."
                    value={partnershipForm.benefits}
                    onChange={(e) => setPartnershipForm(prev => ({ ...prev, benefits: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="requirements">Requisitos do Motorista</Label>
                <Textarea 
                  id="requirements" 
                  placeholder="Avaliação mínima, experiência, regularidade..."
                  value={partnershipForm.requirements}
                  onChange={(e) => setPartnershipForm(prev => ({ ...prev, requirements: e.target.value }))}
                  rows={2}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    console.log('Creating partnership post:', partnershipForm);
                    toast({ title: 'Sucesso', description: 'Post de parceria criado!' });
                    setShowCreatePartnership(false);
                    setPartnershipForm({ title: '', description: '', commission: 10, benefits: '', requirements: '', targetRoutes: [] });
                  }}
                >
                  Publicar Parceria
                </Button>
                <Button variant="outline" onClick={() => setShowCreatePartnership(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}