// src/apps/hotels-app/pages/settings/AccountSettingsPage.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { 
  User, Mail, Phone, Shield, Bell, Globe,
  Save, AlertCircle, CheckCircle
} from 'lucide-react';

export default function AccountSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [accountData, setAccountData] = useState({
    name: 'John Doe',
    email: 'john@exemplo.com',
    phone: '+258 84 123 4567',
    language: 'pt',
    timezone: 'Africa/Maputo',
    notifications: {
      email: true,
      sms: true,
      bookingUpdates: true,
      promotional: false,
      security: true,
    },
    twoFactorAuth: false,
  });

  const handleInputChange = (field: string, value: string) => {
    setAccountData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSwitchChange = (path: string, checked: boolean) => {
    if (path.includes('.')) {
      const [parent, child] = path.split('.');
      setAccountData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: checked
        }
      }));
    } else {
      setAccountData(prev => ({
        ...prev,
        [path]: checked
      }));
    }
  };

  const handleSave = () => {
    setLoading(true);
    // Simular salvamento
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações da Conta</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais e preferências</p>
      </div>

      {/* Perfil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Informações do Perfil
          </CardTitle>
          <CardDescription>
            Atualize suas informações pessoais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={accountData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={accountData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={accountData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+258 84 000 0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <select
                id="language"
                value={accountData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pt">Português</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Preferências de Notificação
          </CardTitle>
          <CardDescription>
            Configure como e quando receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Notificações por Email</Label>
                <p className="text-sm text-gray-500">Receba atualizações por email</p>
              </div>
              <Switch
                checked={accountData.notifications.email}
                onCheckedChange={(checked) => handleSwitchChange('notifications.email', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Notificações por SMS</Label>
                <p className="text-sm text-gray-500">Receba notificações por SMS</p>
              </div>
              <Switch
                checked={accountData.notifications.sms}
                onCheckedChange={(checked) => handleSwitchChange('notifications.sms', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Atualizações de Reservas</Label>
                <p className="text-sm text-gray-500">Notificações sobre novas reservas e alterações</p>
              </div>
              <Switch
                checked={accountData.notifications.bookingUpdates}
                onCheckedChange={(checked) => handleSwitchChange('notifications.bookingUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Alertas de Segurança</Label>
                <p className="text-sm text-gray-500">Notificações importantes sobre segurança</p>
              </div>
              <Switch
                checked={accountData.notifications.security}
                onCheckedChange={(checked) => handleSwitchChange('notifications.security', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Promoções e Ofertas</Label>
                <p className="text-sm text-gray-500">Receba ofertas especiais e promoções</p>
              </div>
              <Switch
                checked={accountData.notifications.promotional}
                onCheckedChange={(checked) => handleSwitchChange('notifications.promotional', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Segurança
          </CardTitle>
          <CardDescription>
            Configure as opções de segurança da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Autenticação de Dois Fatores (2FA)</Label>
              <p className="text-sm text-gray-500">Adicione uma camada extra de segurança à sua conta</p>
            </div>
            <Switch
              checked={accountData.twoFactorAuth}
              onCheckedChange={(checked) => handleSwitchChange('twoFactorAuth', checked)}
            />
          </div>

          {accountData.twoFactorAuth && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                <p className="text-sm text-blue-700">
                  A autenticação de dois fatores está ativa. Use seu aplicativo autenticador para fazer login.
                </p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2">Sessões Ativas</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Navegador Chrome</p>
                  <p className="text-sm text-gray-500">Maputo, Moçambique • Ativa agora</p>
                </div>
                <Button variant="destructive" size="sm">
                  Terminar Sessão
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferências */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="mr-2 h-5 w-5" />
            Preferências Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <select
                id="timezone"
                value={accountData.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Africa/Maputo">Maputo (GMT+2)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-between pt-6">
        <div className="space-x-3">
          <Button variant="outline">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}