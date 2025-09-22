import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Calendar, MapPin, Users, Search } from 'lucide-react';
import { RideSearchParams } from '@/shared/hooks/useModalState';
import { useLocation } from 'wouter';
import { useToast } from '@/shared/hooks/use-toast';

interface RideSearchFormProps {
  initialParams?: RideSearchParams;
}

export default function RideSearchForm({ initialParams }: RideSearchFormProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState({
    from: initialParams?.from || '',
    to: initialParams?.to || '',
    date: initialParams?.date || '',
    passengers: initialParams?.passengers || 1,
  });

  const [isSearching, setIsSearching] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    if (!searchParams.from || !searchParams.to || !searchParams.date) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha origem, destino e data.',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    const params = new URLSearchParams({
      from: searchParams.from,
      to: searchParams.to,
      date: searchParams.date,
      passengers: searchParams.passengers.toString(),
    });

    // 🔹 Redireciona para a página de resultados que faz fetch correto
    setLocation(`/rides-simple/search?${params.toString()}`);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="space-y-6">
        {/* Origem / Destino */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="from" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Origem
            </Label>
            <Input
              id="from"
              value={searchParams.from}
              onChange={e => handleInputChange('from', e.target.value)}
              placeholder="De onde você sai?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Destino
            </Label>
            <Input
              id="to"
              value={searchParams.to}
              onChange={e => handleInputChange('to', e.target.value)}
              placeholder="Para onde você vai?"
            />
          </div>
        </div>

        {/* Data / Passageiros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Data da viagem
            </Label>
            <Input
              id="date"
              type="date"
              value={searchParams.date}
              onChange={e => handleInputChange('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="passengers" className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Passageiros
            </Label>
            <Input
              id="passengers"
              type="number"
              min={1}
              max={8}
              value={searchParams.passengers}
              onChange={e => handleInputChange('passengers', parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        <Button onClick={handleSearch} disabled={isSearching} className="w-full">
          <Search className="w-4 h-4 mr-2" />
          {isSearching ? 'Buscando...' : 'Buscar Viagens'}
        </Button>
      </div>
    </div>
  );
}