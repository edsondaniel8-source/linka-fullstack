import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Handshake, Users, MapPin, DollarSign, Plus, MessageSquare, Star, Calendar, TrendingUp } from "lucide-react";

export default function Partnerships() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPartnership, setNewPartnership] = useState({
    title: "",
    description: "",
    offerType: "",
    commission: 10,
    benefits: "",
    requirements: "",
    targetRoutes: [] as string[]
  });

  // Parcerias ativas
  const activePartnerships = [
    {
      id: 1,
      driver: "João M.",
      route: "Maputo → Beira",
      commission: 10,
      clientsBrought: 8,
      totalEarnings: 15600,
      lastMonth: 4200,
      rating: 4.8,
      joinedDate: "2023-11-15",
      status: "active"
    },
    {
      id: 2,
      driver: "Maria S.",
      route: "Nampula → Nacala",
      commission: 12,
      clientsBrought: 12,
      totalEarnings: 22400,
      lastMonth: 6800,
      rating: 4.9,
      joinedDate: "2023-10-20",
      status: "active"
    }
  ];

  // Posts de parceria publicados
  const publishedPosts = [
    {
      id: 1,
      title: "Parceria Exclusiva - 15% Comissão",
      description: "Procuramos motoristas regulares Maputo-Beira. Oferecemos comissão atrativa + benefícios extras.",
      offerType: "Comissão + Benefícios",
      commission: 15,
      interested: 8,
      posted: "1 semana",
      status: "active"
    },
    {
      id: 2, 
      title: "Programa VIP Motoristas",
      description: "Para motoristas com alta avaliação. Inclui estadia gratuita mensal + comissões especiais.",
      offerType: "Programa VIP",
      commission: 20,
      interested: 12,
      posted: "3 dias",
      status: "active"
    }
  ];

  const handleCreatePartnership = () => {
    console.log("Criar post de parceria:", newPartnership);
    setShowCreateForm(false);
    setNewPartnership({
      title: "",
      description: "",
      offerType: "",
      commission: 10,
      benefits: "",
      requirements: "",
      targetRoutes: []
    });
    // TODO: Implementar criação do post
    alert("Post de parceria criado com sucesso!");
  };

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setNewPartnership(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Parcerias com Motoristas</h1>
          <p className="text-gray-600">Gerir parceiros e publicar novas oportunidades de colaboração</p>
        </div>

        <Tabs defaultValue="active">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active" data-testid="tab-active-partnerships">
              Parceiros Ativos ({activePartnerships.length})
            </TabsTrigger>
            <TabsTrigger value="posts" data-testid="tab-partnership-posts">
              Posts Publicados ({publishedPosts.length})
            </TabsTrigger>
          </TabsList>

          {/* Parceiros Ativos */}
          <TabsContent value="active" className="mt-6">
            <div className="mb-6">
              <Card className="bg-gradient-to-r from-blue-50 to-green-50">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{activePartnerships.length}</p>
                      <p className="text-sm text-gray-600">Parceiros Ativos</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {activePartnerships.reduce((sum, p) => sum + p.clientsBrought, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Clientes Trazidos</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">
                        {activePartnerships.reduce((sum, p) => sum + p.lastMonth, 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Comissões (último mês)</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">
                        {(activePartnerships.reduce((sum, p) => sum + p.rating, 0) / activePartnerships.length).toFixed(1)}
                      </p>
                      <p className="text-sm text-gray-600">Avaliação Média</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activePartnerships.map((partner) => (
                <Card key={partner.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          {partner.driver}
                        </CardTitle>
                        <p className="text-gray-600 flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4" />
                          {partner.route}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{partner.commission}% comissão</Badge>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{partner.rating}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Clientes Trazidos</p>
                        <p className="text-xl font-bold text-green-600">{partner.clientsBrought}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Último Mês</p>
                        <p className="text-xl font-bold text-purple-600">
                          {partner.lastMonth.toLocaleString()} MZN
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-4">
                      <p>💰 Total ganho: {partner.totalEarnings.toLocaleString()} MZN</p>
                      <p>📅 Parceiro desde: {partner.joinedDate}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" data-testid={`button-chat-${partner.id}`}>
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Chat Privado
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Posts Publicados */}
          <TabsContent value="posts" className="mt-6">
            <div className="mb-6">
              <Button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                data-testid="button-create-partnership-post"
              >
                <Plus className="w-4 h-4 mr-2" />
                {showCreateForm ? "Cancelar" : "Criar Novo Post"}
              </Button>
            </div>

            {/* Formulário de Criação */}
            {showCreateForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Novo Post de Parceria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título do Post</Label>
                      <Input
                        id="title"
                        placeholder="Ex: Parceria Exclusiva - 15% Comissão"
                        value={newPartnership.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        data-testid="input-partnership-title"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="offerType">Tipo de Oferta</Label>
                      <Select onValueChange={(value) => handleInputChange("offerType", value)}>
                        <SelectTrigger data-testid="select-offer-type">
                          <SelectValue placeholder="Tipo de parceria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="commission">Comissão Simples</SelectItem>
                          <SelectItem value="commission-plus">Comissão + Benefícios</SelectItem>
                          <SelectItem value="vip">Programa VIP</SelectItem>
                          <SelectItem value="package">Pacote Completo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição da Parceria</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva os detalhes da parceria, benefícios oferecidos..."
                      value={newPartnership.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={3}
                      data-testid="textarea-partnership-description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="commission">Comissão (%)</Label>
                      <Select onValueChange={(value) => handleInputChange("commission", parseInt(value))}>
                        <SelectTrigger data-testid="select-commission">
                          <SelectValue placeholder={`${newPartnership.commission}%`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="8">8%</SelectItem>
                          <SelectItem value="10">10%</SelectItem>
                          <SelectItem value="12">12%</SelectItem>
                          <SelectItem value="15">15%</SelectItem>
                          <SelectItem value="18">18%</SelectItem>
                          <SelectItem value="20">20%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="benefits">Benefícios Extras</Label>
                      <Input
                        id="benefits"
                        placeholder="Ex: Estadia gratuita, descontos, prioridade"
                        value={newPartnership.benefits}
                        onChange={(e) => handleInputChange("benefits", e.target.value)}
                        data-testid="input-benefits"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requisitos</Label>
                    <Textarea
                      id="requirements"
                      placeholder="Ex: Avaliação mínima 4.5, pelo menos 2 viagens/mês..."
                      value={newPartnership.requirements}
                      onChange={(e) => handleInputChange("requirements", e.target.value)}
                      rows={2}
                      data-testid="textarea-requirements"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCreatePartnership}
                      disabled={!newPartnership.title || !newPartnership.description}
                      data-testid="button-submit-partnership"
                    >
                      Publicar Post
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateForm(false)}
                      data-testid="button-cancel-partnership"
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de Posts */}
            <div className="space-y-4">
              {publishedPosts.map((post) => (
                <Card key={post.id} className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{post.title}</CardTitle>
                        <Badge variant="outline" className="mt-2">
                          {post.offerType}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Publicado há {post.posted}</p>
                        <Badge className="mt-1 bg-blue-100 text-blue-800">
                          {post.commission}% comissão
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-700 mb-4">{post.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{post.interested} interessados</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>{post.status === "active" ? "Ativo" : "Inativo"}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" data-testid={`button-edit-post-${post.id}`}>
                          Editar
                        </Button>
                        <Button size="sm" variant="outline" data-testid={`button-responses-${post.id}`}>
                          Ver Respostas
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Tips Section */}
        <Card className="mt-8 bg-orange-50 border-orange-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-orange-900 mb-3">💡 Dicas para atrair bons parceiros:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-orange-800">
              <div className="space-y-2">
                <p><strong>Ofereça comissões competitivas:</strong> 10-15% é o padrão do mercado.</p>
                <p><strong>Benefícios extras:</strong> Estadias gratuitas e descontos pessoais atraem mais motoristas.</p>
                <p><strong>Seja claro nos requisitos:</strong> Especifique avaliação mínima e frequência esperada.</p>
              </div>
              <div className="space-y-2">
                <p><strong>Comunicação rápida:</strong> Responda aos interessados em até 24 horas.</p>
                <p><strong>Pagamentos pontuais:</strong> Pague comissões sempre no prazo acordado.</p>
                <p><strong>Feedback positivo:</strong> Avalie bem os motoristas para manter a parceria.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}