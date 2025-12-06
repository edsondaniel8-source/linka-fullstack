// src/apps/hotels-app/pages/settings/HotelSettingsPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { 
  Settings, Building2, Mail, Phone, Globe, CreditCard,
  Bell, Shield, Users, Save, AlertTriangle, CheckCircle
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/shared/hooks/use-toast';

export default function HotelSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    // Geral
    name: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    timezone: 'Africa/Maputo',
    currency: 'MZN',
    
    // Reservas
    requireConfirmation: true,
    allowOnlineBookings: true,
    minStay: 1,
    maxStay: 30,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    requireIdAtCheckIn: true,
    
    // Pagamentos
    requireDeposit: false,
    depositPercentage: 30,
    acceptedPaymentMethods: ['cash', 'credit_card', 'bank_transfer'],
    taxPercentage: 0,
    
    // Notificações
    emailNotifications: true,
    smsNotifications: false,
    newBookingNotification: true,
    cancellationNotification: true,
    reminder24hBefore: true,
    
    // Políticas
    cancellationPolicy: 'Cancelamento gratuito até 48h antes do check-in.',
    houseRules: 'Proibido fumar nos quartos. Animais não são permitidos.',
    termsAndConditions: '',
  });

  // Buscar hotéis do usuário
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await apiService.getAllHotels();
        if (response.success && response.data) {
          const hotelsList = Array.isArray(response.data) ? response.data : [];
          setHotels(hotelsList);
          if (hotelsList.length > 0) {
            setSelectedHotelId(hotelsList[0].id || hotelsList[0].hotel_id);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar hotéis:', error);
      }
    };
    fetchHotels();
  }, []);

  // Buscar configurações do hotel selecionado
  const { data: hotelData, isLoading: hotelLoading } = useQuery({
    queryKey: ['hotel-settings', selectedHotelId],
    queryFn: async () => {
      if (!selectedHotelId) return null;
      try {
        const response = await apiService.getHotelById(selectedHotelId);
        if (response.success && response.data) {
          const hotel = response.data;
          // Carregar configurações existentes
          setSettings(prev => ({
            ...prev,
            name: hotel.name || '',
            contactEmail: hotel.contact_email || '',
            contactPhone: hotel.contact_phone || '',
            checkInTime: hotel.check_in_time || '14:00',
            checkOutTime: hotel.check_out_time || '12:00',
          }));
          return hotel;
        }
        return null;
      } catch (error) {
        console.error('Erro ao buscar hotel:', error);
        return null;
      }
    },
    enabled: !!selectedHotelId,
  });

  const updateHotelMutation = useMutation({
    mutationFn: async () => {
      if (!selectedHotelId) throw new Error('Selecione um hotel');
      
      return await apiService.updateHotel(selectedHotelId, {
        name: settings.name,
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        checkInTime: settings.checkInTime,
        checkOutTime: settings.checkOutTime,
        policies: settings.cancellationPolicy,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso!',
        description: 'Configurações salvas com sucesso.',
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      });
      queryClient.invalidateQueries({ queryKey: ['hotel-settings', selectedHotelId] });
      queryClient.invalidateQueries({ queryKey: ['user-hotels'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar configurações',
        variant: 'destructive',
      });
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setLoading(true);
    updateHotelMutation.mutate();
    setLoading(false);
  };

  const selectedHotel = hotels.find(h => (h.id || h.hotel_id) === selectedHotelId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerencie as configurações do seu hotel</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            value={selectedHotelId}
            onChange={(e) => setSelectedHotelId(e.target.value)}
          >
            <option value="">Selecione um hotel</option>
            {hotels.map((hotel) => (
              <option key={hotel.id || hotel.hotel_id} value={hotel.id || hotel.hotel_id}>
                {hotel.name || hotel.hotel_name}
              </option>
            ))}
          </select>
          <Button 
            onClick={handleSave} 
            disabled={loading || !selectedHotelId || updateHotelMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {loading || updateHotelMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      {!selectedHotelId ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Selecione um hotel
            </h3>
            <p className="text-gray-600 mb-6">
              Escolha um hotel para configurar suas definições.
            </p>
            <Link href="/hotels/create">
              <Button>
                <Building2 className="mr-2 h-4 w-4" />
                Criar Novo Hotel
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : hotelLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando configurações...</p>
        </div>
      ) : (
        <>
          {/* Alertas */}
          {updateHotelMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-600">Erro ao salvar configurações. Tente novamente.</p>
              </div>
            </div>
          )}

          {updateHotelMutation.isSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-green-600">Configurações salvas com sucesso!</p>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="general">
                <Settings className="h-4 w-4 mr-2" />
                Geral
              </TabsTrigger>
              <TabsTrigger value="bookings">
                <Calendar className="h-4 w-4 mr-2" />
                Reservas
              </TabsTrigger>
              <TabsTrigger value="payments">
                <CreditCard className="h-4 w-4 mr-2" />
                Pagamentos
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </TabsTrigger>
              <TabsTrigger value="policies">
                <Shield className="h-4 w-4 mr-2" />
                Políticas
              </TabsTrigger>
            </TabsList>

            {/* Geral */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                  <CardDescription>
                    Informações de contacto e identificação do hotel
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Hotel *</Label>
                      <Input
                        id="name"
                        value={settings.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Nome do seu hotel"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email de Contacto *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        placeholder="exemplo@hotel.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Telefone</Label>
                      <Input
                        id="contactPhone"
                        value={settings.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        placeholder="+258 84 000 0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={settings.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://www.seuhotel.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Fuso Horário</Label>
                      <select
                        id="timezone"
                        value={settings.timezone}
                        onChange={(e) => handleInputChange('timezone', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="Africa/Maputo">Maputo (GMT+2)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Moeda</Label>
                      <select
                        id="currency"
                        value={settings.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="MZN">Metical (MZN)</option>
                        <option value="USD">Dólar Americano (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reservas */}
            <TabsContent value="bookings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Reservas</CardTitle>
                  <CardDescription>
                    Configure como as reservas funcionam no seu hotel
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Requer confirmação manual</Label>
                        <p className="text-sm text-gray-500">
                          As reservas precisam ser confirmadas manualmente
                        </p>
                      </div>
                      <Switch
                        checked={settings.requireConfirmation}
                        onCheckedChange={(checked) => handleInputChange('requireConfirmation', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Permitir reservas online</Label>
                        <p className="text-sm text-gray-500">
                          Clientes podem reservar diretamente pelo site
                        </p>
                      </div>
                      <Switch
                        checked={settings.allowOnlineBookings}
                        onCheckedChange={(checked) => handleInputChange('allowOnlineBookings', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Requer identificação no check-in</Label>
                        <p className="text-sm text-gray-500">
                          Hóspedes devem apresentar documento de identificação
                        </p>
                      </div>
                      <Switch
                        checked={settings.requireIdAtCheckIn}
                        onCheckedChange={(checked) => handleInputChange('requireIdAtCheckIn', checked)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="checkInTime">Horário de Check-in</Label>
                      <Input
                        id="checkInTime"
                        type="time"
                        value={settings.checkInTime}
                        onChange={(e) => handleInputChange('checkInTime', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkOutTime">Horário de Check-out</Label>
                      <Input
                        id="checkOutTime"
                        type="time"
                        value={settings.checkOutTime}
                        onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minStay">Estadia mínima (noites)</Label>
                      <Input
                        id="minStay"
                        type="number"
                        min="1"
                        value={settings.minStay}
                        onChange={(e) => handleInputChange('minStay', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxStay">Estadia máxima (noites)</Label>
                      <Input
                        id="maxStay"
                        type="number"
                        min="1"
                        value={settings.maxStay}
                        onChange={(e) => handleInputChange('maxStay', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pagamentos */}
            <TabsContent value="payments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Pagamento</CardTitle>
                  <CardDescription>
                        Métodos de pagamento aceitos e políticas
                      </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Requer depósito</Label>
                        <p className="text-sm text-gray-500">
                          Reservas requerem um depósito para confirmação
                        </p>
                      </div>
                      <Switch
                        checked={settings.requireDeposit}
                        onCheckedChange={(checked) => handleInputChange('requireDeposit', checked)}
                      />
                    </div>

                    {settings.requireDeposit && (
                      <div className="space-y-2">
                        <Label htmlFor="depositPercentage">Percentual do depósito (%)</Label>
                        <Input
                          id="depositPercentage"
                          type="number"
                          min="0"
                          max="100"
                          value={settings.depositPercentage}
                          onChange={(e) => handleInputChange('depositPercentage', parseInt(e.target.value))}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Métodos de pagamento aceitos</Label>
                      <div className="flex flex-wrap gap-3">
                        {['cash', 'credit_card', 'bank_transfer', 'mobile_money'].map((method) => (
                          <div key={method} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`payment-${method}`}
                              checked={settings.acceptedPaymentMethods.includes(method)}
                              onChange={(e) => {
                                const newMethods = e.target.checked
                                  ? [...settings.acceptedPaymentMethods, method]
                                  : settings.acceptedPaymentMethods.filter(m => m !== method);
                                handleInputChange('acceptedPaymentMethods', newMethods);
                              }}
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                            <Label htmlFor={`payment-${method}`} className="ml-2 capitalize">
                              {method.replace('_', ' ')}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taxPercentage">Imposto/IVA (%)</Label>
                      <Input
                        id="taxPercentage"
                        type="number"
                        min="0"
                        max="50"
                        step="0.1"
                        value={settings.taxPercentage}
                        onChange={(e) => handleInputChange('taxPercentage', parseFloat(e.target.value))}
                      />
                      <p className="text-sm text-gray-500">
                        Percentual de imposto a ser adicionado ao preço final
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notificações */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Notificações</CardTitle>
                  <CardDescription>
                    Configure como e quando receber notificações
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Notificações por Email</Label>
                        <p className="text-sm text-gray-500">
                          Receber notificações por email
                        </p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Notificações por SMS</Label>
                        <p className="text-sm text-gray-500">
                          Receber notificações por SMS (pode ter custos)
                        </p>
                      </div>
                      <Switch
                        checked={settings.smsNotifications}
                        onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
                      />
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-medium">Notificações específicas</h4>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Nova reserva</Label>
                          <p className="text-sm text-gray-500">
                            Notificar quando uma nova reserva é feita
                          </p>
                        </div>
                        <Switch
                          checked={settings.newBookingNotification}
                          onCheckedChange={(checked) => handleInputChange('newBookingNotification', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Cancelamento</Label>
                          <p className="text-sm text-gray-500">
                            Notificar quando uma reserva é cancelada
                          </p>
                        </div>
                        <Switch
                          checked={settings.cancellationNotification}
                          onCheckedChange={(checked) => handleInputChange('cancellationNotification', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Lembrete 24h antes</Label>
                          <p className="text-sm text-gray-500">
                            Enviar lembrete 24h antes do check-in
                          </p>
                        </div>
                        <Switch
                          checked={settings.reminder24hBefore}
                          onCheckedChange={(checked) => handleInputChange('reminder24hBefore', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Políticas */}
            <TabsContent value="policies" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Políticas e Regras</CardTitle>
                  <CardDescription>
                    Defina as políticas e regras do seu hotel
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cancellationPolicy">Política de Cancelamento</Label>
                      <Textarea
                        id="cancellationPolicy"
                        value={settings.cancellationPolicy}
                        onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
                        rows={3}
                        placeholder="Descreva sua política de cancelamento..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="houseRules">Regras da Casa</Label>
                      <Textarea
                        id="houseRules"
                        value={settings.houseRules}
                        onChange={(e) => handleInputChange('houseRules', e.target.value)}
                        rows={3}
                        placeholder="Descreva as regras do hotel..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="termsAndConditions">Termos e Condições</Label>
                      <Textarea
                        id="termsAndConditions"
                        value={settings.termsAndConditions}
                        onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
                        rows={5}
                        placeholder="Termos e condições gerais..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}