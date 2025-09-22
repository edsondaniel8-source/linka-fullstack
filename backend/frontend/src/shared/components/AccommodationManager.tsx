import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Calendar } from "@/shared/components/ui/calendar";
import { Hotel, MapPin, Star, Users, CalendarDays, Wifi, Car as CarIcon, Coffee, Utensils, Edit, X } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useAuth } from "../hooks/useAuth";

interface AccommodationManagerProps {
  hostId?: string;
}

export default function AccommodationManager({ hostId }: AccommodationManagerProps) {
  const { user } = useAuth();
  const currentHostId = hostId || user?.uid;
  
  const [activeTab, setActiveTab] = useState("properties");
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  // Mock data para demonstração
  const mockProperties = [
    {
      id: "prop-1",
      hostId: currentHostId,
      name: "Casa Vista Mar - Tofo",
      type: "house",
      location: "Tofo, Inhambane",
      description: "Casa moderna com vista para o mar, ideal para famílias e grupos de amigos.",
      images: [],
      amenities: ["wifi", "parking", "kitchen", "pool"],
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 2,
      pricePerNight: 3500,
      rating: 4.8,
      totalReviews: 45,
      isActive: true,
      unavailableDates: ["2024-09-15", "2024-09-16", "2024-09-17"],
      createdAt: "2024-08-01"
    },
    {
      id: "prop-2", 
      hostId: currentHostId,
      name: "Apartamento Centro Maputo",
      type: "apartment",
      location: "Maputo Centro",
      description: "Apartamento moderno no centro da cidade, próximo a restaurantes e atrações.",
      images: [],
      amenities: ["wifi", "parking", "kitchen"],
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 1,
      pricePerNight: 2800,
      rating: 4.6,
      totalReviews: 89,
      isActive: true,
      unavailableDates: ["2024-09-20", "2024-09-21"],
      createdAt: "2024-07-15"
    }
  ];

  const [newProperty, setNewProperty] = useState({
    name: "",
    type: "house",
    location: "",
    description: "",
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    pricePerNight: "",
    amenities: [] as string[]
  });

  const amenityOptions = [
    { id: "wifi", label: "Wi-Fi", icon: Wifi },
    { id: "parking", label: "Estacionamento", icon: CarIcon },
    { id: "kitchen", label: "Cozinha", icon: Utensils },
    { id: "breakfast", label: "Café da manhã", icon: Coffee },
    { id: "pool", label: "Piscina", icon: Hotel },
    { id: "ac", label: "Ar condicionado", icon: Hotel }
  ];

  const handleSubmitProperty = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Nova propriedade:", newProperty);
    
    // TODO: Integrar com API
    // await apiRequest("POST", "/api/accommodations", newProperty);
    
    setShowAddProperty(false);
    setNewProperty({
      name: "",
      type: "house",
      location: "",
      description: "",
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      pricePerNight: "",
      amenities: []
    });
  };

  const toggleAmenity = (amenityId: string) => {
    setNewProperty(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleDateUnavailable = (date: Date) => {
    if (!selectedProperty) return;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const isAlreadyUnavailable = selectedProperty.unavailableDates.includes(dateStr);
    
    if (isAlreadyUnavailable) {
      // Remover data indisponível
      selectedProperty.unavailableDates = selectedProperty.unavailableDates.filter((d: string) => d !== dateStr);
    } else {
      // Adicionar data indisponível
      selectedProperty.unavailableDates.push(dateStr);
    }
    
    console.log("Datas atualizadas:", selectedProperty.unavailableDates);
    // TODO: Salvar no backend
  };

  const isDateUnavailable = (date: Date) => {
    if (!selectedProperty) return false;
    const dateStr = format(date, 'yyyy-MM-dd');
    return selectedProperty.unavailableDates.includes(dateStr);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Alojamentos</h1>
          <p className="text-gray-600">Gerir as suas propriedades e disponibilidade</p>
        </div>
        
        <Button
          onClick={() => setShowAddProperty(true)}
          className="bg-orange-600 hover:bg-orange-700"
          data-testid="add-property-button"
        >
          <Hotel className="w-4 h-4 mr-2" />
          Adicionar Propriedade
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="properties">Propriedades</TabsTrigger>
          <TabsTrigger value="bookings">Reservas</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
        </TabsList>

        {/* Lista de Propriedades */}
        <TabsContent value="properties" className="space-y-4">
          {mockProperties.map((property) => (
            <Card key={property.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                  
                  {/* Informações da Propriedade */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold">{property.name}</h3>
                        <div className="flex items-center space-x-2 text-gray-600 mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>{property.location}</span>
                          <Badge variant={property.isActive ? "default" : "secondary"}>
                            {property.isActive ? "Ativa" : "Inativa"}
                          </Badge>
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>

                    <p className="text-gray-600 mb-4">{property.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500">Hóspedes</div>
                        <div className="font-medium flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {property.maxGuests}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500">Quartos</div>
                        <div className="font-medium">{property.bedrooms}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500">Casas de banho</div>
                        <div className="font-medium">{property.bathrooms}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500">Avaliação</div>
                        <div className="font-medium flex items-center">
                          <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                          {property.rating} ({property.totalReviews})
                        </div>
                      </div>
                    </div>

                    {/* Comodidades */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {property.amenities.map((amenity) => {
                        const amenityOption = amenityOptions.find(a => a.id === amenity);
                        return (
                          <Badge key={amenity} variant="secondary" className="flex items-center">
                            {amenityOption && <amenityOption.icon className="w-3 h-3 mr-1" />}
                            {amenityOption?.label || amenity}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preço e Ações */}
                  <div className="lg:ml-6">
                    <div className="text-right mb-4">
                      <div className="text-2xl font-bold text-orange-600">
                        {property.pricePerNight} MT
                      </div>
                      <div className="text-sm text-gray-500">por noite</div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setSelectedProperty(property)}
                        data-testid={`manage-calendar-${property.id}`}
                      >
                        <CalendarDays className="w-4 h-4 mr-2" />
                        Gerir Calendário
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="w-full"
                        data-testid={`view-bookings-${property.id}`}
                      >
                        Ver Reservas
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Reservas */}
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Reservas Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Hotel className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma reserva pendente</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendário de Disponibilidade */}
        <TabsContent value="calendar">
          {selectedProperty ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Calendário - {selectedProperty.name}</CardTitle>
                  <p className="text-sm text-gray-600">Clique nas datas para marcar como indisponíveis</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedProperty(null)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Fechar
                </Button>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  onDayClick={handleDateUnavailable}
                  className="rounded-md border"
                  locale={pt}
                  modifiers={{
                    unavailable: (date) => isDateUnavailable(date)
                  }}
                  modifiersStyles={{
                    unavailable: { 
                      backgroundColor: '#fee2e2', 
                      color: '#dc2626',
                      fontWeight: 'bold'
                    }
                  }}
                />
                <div className="mt-4 flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                    <span>Disponível</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                    <span>Indisponível</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CalendarDays className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecione uma Propriedade
                </h3>
                <p className="text-gray-600">
                  Escolha uma propriedade da aba "Propriedades" para gerir o calendário
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal para Adicionar Propriedade */}
      {showAddProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Adicionar Nova Propriedade</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddProperty(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmitProperty} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da propriedade</Label>
                  <Input
                    id="name"
                    placeholder="ex: Casa Vista Mar - Tofo"
                    value={newProperty.name}
                    onChange={(e) => setNewProperty(prev => ({...prev, name: e.target.value}))}
                    required
                    data-testid="property-name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de propriedade</Label>
                    <Select onValueChange={(value) => setNewProperty(prev => ({...prev, type: value}))}>
                      <SelectTrigger data-testid="property-type">
                        <SelectValue placeholder="Selecionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="house">Casa</SelectItem>
                        <SelectItem value="apartment">Apartamento</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="guesthouse">Pensão</SelectItem>
                        <SelectItem value="hostel">Hostel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      placeholder="Cidade, Província"
                      value={newProperty.location}
                      onChange={(e) => setNewProperty(prev => ({...prev, location: e.target.value}))}
                      required
                      data-testid="property-location"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva a propriedade, características especiais, etc."
                    value={newProperty.description}
                    onChange={(e) => setNewProperty(prev => ({...prev, description: e.target.value}))}
                    rows={3}
                    data-testid="property-description"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxGuests">Hóspedes máx.</Label>
                    <Input
                      id="maxGuests"
                      type="number"
                      min="1"
                      value={newProperty.maxGuests}
                      onChange={(e) => setNewProperty(prev => ({...prev, maxGuests: parseInt(e.target.value)}))}
                      data-testid="property-guests"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Quartos</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      min="0"
                      value={newProperty.bedrooms}
                      onChange={(e) => setNewProperty(prev => ({...prev, bedrooms: parseInt(e.target.value)}))}
                      data-testid="property-bedrooms"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Casas de banho</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      min="0"
                      value={newProperty.bathrooms}
                      onChange={(e) => setNewProperty(prev => ({...prev, bathrooms: parseInt(e.target.value)}))}
                      data-testid="property-bathrooms"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço/noite (MT)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="100"
                      placeholder="2500"
                      value={newProperty.pricePerNight}
                      onChange={(e) => setNewProperty(prev => ({...prev, pricePerNight: e.target.value}))}
                      required
                      data-testid="property-price"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Comodidades</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenityOptions.map((amenity) => (
                      <label key={amenity.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newProperty.amenities.includes(amenity.id)}
                          onChange={() => toggleAmenity(amenity.id)}
                          className="rounded"
                        />
                        <amenity.icon className="w-4 h-4" />
                        <span className="text-sm">{amenity.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                    data-testid="property-submit"
                  >
                    Adicionar Propriedade
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddProperty(false)}
                    className="flex-1"
                    data-testid="property-cancel"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}