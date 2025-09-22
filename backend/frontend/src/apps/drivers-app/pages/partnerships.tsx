import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { MapPin, Calendar, Users, DollarSign, MessageCircle, Search, Filter, Heart, HandHeart } from "lucide-react";

export default function Partnerships() {
  const [searchLocation, setSearchLocation] = useState("");
  const [filterType, setFilterType] = useState("all");
  
  const partnershipPosts = [
    {
      id: 1,
      hotel: "Hotel Marisol",
      location: "Beira",
      type: "Comissão",
      offer: "10% comissão para cada cliente que trouxer + desconto de 15% na estadia",
      description: "Procuramos motoristas de Maputo que façam viagens regulares para Beira. Oferecemos comissão atrativa para cada hóspede indicado.",
      requirements: "Motoristas com boa avaliação (4.5+) e que façam pelo menos 2 viagens/mês para Beira",
      posted: "2 dias",
      interested: 5,
      category: "accommodation",
      contact: "hotel@marisol.co.mz",
      benefits: ["10% comissão", "15% desconto pessoal", "Prioridade nas reservas"]
    },
    {
      id: 2,
      hotel: "Lodge Safari Gorongosa",
      location: "Gorongosa",
      type: "Pacote Completo",
      offer: "Estadia grátis (2 noites) + 1500 MZN por grupo de 4+ pessoas",
      description: "Parceria exclusiva para motoristas que trazem turistas para experiências de safari. Ideal para quem faz Beira-Chimoio-Gorongosa.",
      requirements: "Veículo adequado para estradas rurais, experiência com turistas",
      posted: "1 semana",
      interested: 12,
      category: "tourism",
      contact: "partnerships@gorongosalodge.com",
      benefits: ["Estadia grátis", "Pagamento por grupo", "Marketing conjunto"]
    },
    {
      id: 3,
      hotel: "Pensão Oceano",
      location: "Inhambane",
      type: "Desconto + Comissão",
      offer: "20% desconto + 300 MZN por reserva confirmada",
      description: "Pequena pensão familiar procura parceiros para trazer visitantes a Inhambane. Ambiente acolhedor e preços acessíveis.",
      requirements: "Motoristas que façam Maputo-Inhambane ou Maxixe-Inhambane",
      posted: "5 dias",
      interested: 8,
      category: "accommodation",
      contact: "pensaooceano@gmail.com",
      benefits: ["20% desconto pessoal", "300 MZN/reserva", "Flexibilidade de datas"]
    },
    {
      id: 4,
      hotel: "Resort Ponta Malongane",
      location: "Ponta do Ouro",
      type: "Programa VIP",
      offer: "15% comissão + acesso VIP + transfer gratuito para familiares",
      description: "Resort de luxo oferece programa especial para motoristas que trazem grupos familiares e de amigos para fins de semana.",
      requirements: "Histórico comprovado de viagens para sul de Moçambique, veículos em bom estado",
      posted: "3 dias",
      interested: 15,
      category: "luxury",
      contact: "vip@pontamalongane.co.mz",
      benefits: ["15% comissão", "Acesso VIP", "Transfer gratuito família"]
    }
  ];

  const handleInterest = (partnershipId: number) => {
    console.log("Demonstrar interesse na parceria:", partnershipId);
    // TODO: Implementar demonstração de interesse
    alert("Interesse registrado! O estabelecimento será notificado.");
  };

  const handleStartChat = (partnershipId: number, hotelName: string) => {
    console.log("Iniciar chat com:", hotelName, "sobre parceria:", partnershipId);
    // TODO: Implementar chat com hotel
  };

  const filteredPosts = partnershipPosts.filter(post => {
    const locationMatch = searchLocation === "" || 
      post.location.toLowerCase().includes(searchLocation.toLowerCase());
    const typeMatch = filterType === "all" || post.category === filterType;
    return locationMatch && typeMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Oportunidades de Parceria</h1>
          <p className="text-gray-600">Encontre hotéis e alojamentos oferecendo parcerias exclusivas</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por localização..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-location"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger data-testid="select-filter-type">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="accommodation">Alojamentos</SelectItem>
                  <SelectItem value="tourism">Turismo</SelectItem>
                  <SelectItem value="luxury">Luxo</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center text-sm text-gray-600">
                <HandHeart className="w-4 h-4 mr-2" />
                {filteredPosts.length} oportunidade{filteredPosts.length !== 1 ? "s" : ""} disponível{filteredPosts.length !== 1 ? "eis" : ""}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partnership Posts */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-blue-600" />
                      {post.hotel}
                    </CardTitle>
                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4" />
                      {post.location}
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge variant="outline" className="font-medium">
                      {post.type}
                    </Badge>
                    <p className="text-xs text-gray-500">
                      Publicado há {post.posted}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Oferta Principal */}
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-blue-900 mb-2">🎯 Oferta:</h3>
                  <p className="text-blue-800">{post.offer}</p>
                </div>

                {/* Descrição */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Sobre a Parceria:</h4>
                  <p className="text-gray-700 text-sm">{post.description}</p>
                </div>

                {/* Requisitos */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Requisitos:</h4>
                  <p className="text-gray-600 text-sm">{post.requirements}</p>
                </div>

                {/* Benefícios */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Benefícios Incluídos:</h4>
                  <div className="flex flex-wrap gap-2">
                    {post.benefits.map((benefit, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        ✓ {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Stats e Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{post.interested} interessados</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>há {post.posted}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStartChat(post.id, post.hotel)}
                      data-testid={`button-chat-${post.id}`}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Chat
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleInterest(post.id)}
                      data-testid={`button-interest-${post.id}`}
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      Tenho Interesse
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredPosts.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <HandHeart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma parceria encontrada
                </h3>
                <p className="text-gray-600 mb-4">
                  Tente ajustar os filtros de busca ou verifique novamente em breve.
                </p>
                <Button onClick={() => {setSearchLocation(""); setFilterType("all");}}>
                  Limpar Filtros
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Info Section */}
        <Card className="mt-8 bg-orange-50 border-orange-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-orange-900 mb-3">💡 Como funcionam as parcerias:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-orange-800">
              <div className="space-y-2">
                <p><strong>1. Demonstre interesse:</strong> Clique no botão para mostrar que está interessado na parceria.</p>
                <p><strong>2. Chat direto:</strong> Converse diretamente com o estabelecimento para negociar detalhes.</p>
                <p><strong>3. Acordo personalizado:</strong> Cada parceria pode ter condições específicas adaptadas ao seu perfil.</p>
              </div>
              <div className="space-y-2">
                <p><strong>Tipos de benefícios:</strong> Comissões, descontos pessoais, estadias gratuitas, marketing conjunto.</p>
                <p><strong>Requisitos típicos:</strong> Avaliação mínima, frequência de viagens, tipo de veículo.</p>
                <p><strong>Pagamentos:</strong> Geralmente feitos mensalmente via transferência bancária.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}