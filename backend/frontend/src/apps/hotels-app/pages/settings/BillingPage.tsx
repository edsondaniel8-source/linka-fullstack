// src/apps/hotels-app/pages/settings/BillingPage.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { 
  CreditCard, DollarSign, Download, Receipt,
  Calendar, CheckCircle, AlertCircle, Plus,
  History, Settings
} from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const invoices = [
    { id: 'INV-001', date: '2024-11-01', amount: 29900, status: 'paid', plan: 'Premium' },
    { id: 'INV-002', date: '2024-10-01', amount: 29900, status: 'paid', plan: 'Premium' },
    { id: 'INV-003', date: '2024-09-01', amount: 29900, status: 'paid', plan: 'Premium' },
    { id: 'INV-004', date: '2024-08-01', amount: 0, status: 'free', plan: 'Gratuito' },
  ];

  const paymentMethods = [
    { id: 1, type: 'credit_card', last4: '4242', brand: 'Visa', expiry: '12/25', isDefault: true },
    { id: 2, type: 'bank_account', bank: 'Millennium BIM', last4: '7890', isDefault: false },
  ];

  const plans = [
    { name: 'Gratuito', price: 0, features: ['1 Hotel', '10 Quartos', 'Reservas Básicas', 'Suporte por Email'] },
    { name: 'Premium', price: 29900, features: ['Hotéis Ilimitados', 'Quartos Ilimitados', 'Reservas Avançadas', 'Analytics', 'Suporte Prioritário', 'Integrações'] },
    { name: 'Enterprise', price: 99900, features: ['Tudo do Premium', 'API Customizada', 'Suporte 24/7', 'Treinamento', 'Consultoria'] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Faturação e Assinatura</h1>
        <p className="text-gray-600">Gerencie sua assinatura e métodos de pagamento</p>
      </div>

      {/* Plano Atual */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Seu Plano Atual</CardTitle>
              <CardDescription>Plano Premium • R$ 299,00/mês</CardDescription>
            </div>
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Ativo
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Próxima cobrança</p>
              <p className="text-lg font-semibold">01 Dez 2024</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Valor</p>
              <p className="text-lg font-semibold">R$ 299,00</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Ciclo de cobrança</p>
              <div className="flex items-center space-x-2">
                <Button
                  variant={billingCycle === 'monthly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBillingCycle('monthly')}
                >
                  Mensal
                </Button>
                <Button
                  variant={billingCycle === 'yearly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBillingCycle('yearly')}
                >
                  Anual (2 meses grátis)
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planos Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle>Planos Disponíveis</CardTitle>
          <CardDescription>Escolha o plano ideal para o seu negócio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.name} className={
                plan.name === 'Premium' 
                  ? 'border-blue-500 border-2' 
                  : 'border-gray-200'
              }>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                      <span className="text-3xl font-bold">
                        {plan.price === 0 ? 'Grátis' : `R$ ${(plan.price / 100).toFixed(2)}`}
                      </span>
                      <span className="text-gray-500">/{billingCycle === 'monthly' ? 'mês' : 'ano'}</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full"
                    variant={plan.name === 'Premium' ? 'default' : 'outline'}
                  >
                    {plan.name === 'Premium' ? 'Plano Atual' : 'Escolher Plano'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métodos de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Métodos de Pagamento
          </CardTitle>
          <CardDescription>
            Gerencie suas formas de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">
                    {method.type === 'credit_card' 
                      ? `${method.brand} •••• ${method.last4}` 
                      : `${method.bank} •••• ${method.last4}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    {method.type === 'credit_card' 
                      ? `Expira em ${method.expiry}` 
                      : 'Conta bancária'}
                  </p>
                </div>
                {method.isDefault && (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Padrão
                  </Badge>
                )}
              </div>
              <div className="flex space-x-2">
                {!method.isDefault && (
                  <Button variant="outline" size="sm">
                    Tornar Padrão
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm">
                  Remover
                </Button>
              </div>
            </div>
          ))}
          
          <Button variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Novo Método de Pagamento
          </Button>
        </CardContent>
      </Card>

      {/* Histórico de Faturas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="mr-2 h-5 w-5" />
            Histórico de Faturas
          </CardTitle>
          <CardDescription>
            Suas faturas e recibos anteriores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Receipt className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{invoice.id}</p>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {new Date(invoice.date).toLocaleDateString('pt-MZ')}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {invoice.plan}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold">
                      R$ {(invoice.amount / 100).toFixed(2)}
                    </p>
                    <Badge 
                      variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                      className={
                        invoice.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }
                    >
                      {invoice.status === 'paid' ? 'Pago' : 'Grátis'}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Informações de Cobrança */}
      <Card>
        <CardHeader>
          <CardTitle>Informações de Cobrança</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <h4 className="font-medium text-blue-800">Política de Reembolso</h4>
                  <p className="text-sm text-blue-700">
                    Reembolsos estão disponíveis dentro de 30 dias após a compra. 
                    Entre em contato com nosso suporte para solicitar um reembolso.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline">
                Cancelar Assinatura
              </Button>
              <div className="space-x-3">
                <Button variant="outline">
                  Exportar Todas as Faturas
                </Button>
                <Button>
                  Atualizar Método de Pagamento
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}