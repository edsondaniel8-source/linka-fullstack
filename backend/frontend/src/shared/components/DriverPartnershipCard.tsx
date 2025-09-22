import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { formatMzn } from "@/shared/lib/currency";
// Types for partnership system
interface DriverHotelPartnership {
  id: string;
  driverId: string;
  accommodationId: string;
  partnershipType: string;
  discountPercentage: string;
  minimumRides: number;
  isActive: boolean;
  validFrom: Date;
  validUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Accommodation {
  id: string;
  name: string;
  type: string;
  address: string;
  lat: string | null;
  lng: string | null;
  pricePerNight: string;
  rating: string | null;
  reviewCount: number;
  images: string[] | null;
  amenities: string[] | null;
  description: string | null;
  distanceFromCenter: string | null;
  isAvailable: boolean;
}

interface PartnershipBenefit {
  id: string;
  level: string;
  benefitType: string;
  benefitValue: string | null;
  description: string;
  minimumRidesRequired: number;
  minimumRatingRequired: string;
  isActive: boolean;
  createdAt: Date;
}

interface DriverPartnershipCardProps {
  partnership: DriverHotelPartnership;
  accommodation: Accommodation;
  benefits: PartnershipBenefit[];
  onUseDiscount: (partnershipId: string) => void;
}

export default function DriverPartnershipCard({ 
  partnership, 
  accommodation, 
  benefits,
  onUseDiscount 
}: DriverPartnershipCardProps) {
  const getPartnershipColor = (type: string) => {
    switch (type) {
      case "bronze": return "bg-amber-100 text-amber-800 border-amber-200";
      case "silver": return "bg-gray-100 text-gray-800 border-gray-200";
      case "gold": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "platinum": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPartnershipIcon = (type: string) => {
    switch (type) {
      case "bronze": return "🥉";
      case "silver": return "🥈";
      case "gold": return "🥇";
      case "platinum": return "💎";
      default: return "⭐";
    }
  };

  const isExpired = partnership.validUntil && new Date(partnership.validUntil) < new Date();
  const accommodationBenefits = benefits.filter(b => b.level === partnership.partnershipType);

  return (
    <Card className="border-2 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getPartnershipIcon(partnership.partnershipType)}</span>
            <div>
              <CardTitle className="text-lg">{accommodation.name}</CardTitle>
              <p className="text-sm text-gray-600">{accommodation.address}</p>
            </div>
          </div>
          <Badge className={`${getPartnershipColor(partnership.partnershipType)} font-medium`}>
            {partnership.partnershipType.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Discount Information */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-green-800 font-medium">
              <i className="fas fa-percentage mr-2"></i>
              Desconto Especial
            </span>
            <span className="text-2xl font-bold text-green-600">
              {partnership.discountPercentage}%
            </span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Válido para estadias neste hotel parceiro
          </p>
        </div>

        {/* Benefits List */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800">Benefícios Incluídos:</h4>
          {accommodationBenefits.map((benefit, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <i className="fas fa-check-circle text-green-500"></i>
              <span>{benefit.description}</span>
              {benefit.benefitValue && parseFloat(benefit.benefitValue) > 0 && (
                <Badge variant="outline" className="text-xs">
                  {benefit.benefitType === 'accommodation_discount' 
                    ? `${benefit.benefitValue}%` 
                    : formatMzn(parseFloat(benefit.benefitValue))}
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* Accommodation Info */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                <i className="fas fa-star text-yellow-400 mr-1"></i>
                {accommodation.rating}/5 ({accommodation.reviewCount} avaliações)
              </span>
              <span className="text-gray-600">
                <i className="fas fa-map-marker-alt text-gray-400 mr-1"></i>
                {accommodation.distanceFromCenter}km do centro
              </span>
            </div>
            <span className="font-medium text-lg">
              {formatMzn(parseFloat(accommodation.pricePerNight))}/noite
            </span>
          </div>
        </div>

        {/* Validity and Requirements */}
        <div className="text-xs text-gray-500 space-y-1">
          {partnership.minimumRides && partnership.minimumRides > 0 && (
            <p>
              <i className="fas fa-road mr-1"></i>
              Mínimo de {partnership.minimumRides} viagens realizadas
            </p>
          )}
          {partnership.validUntil && (
            <p className={isExpired ? "text-red-500" : ""}>
              <i className="fas fa-calendar mr-1"></i>
              Válido até {new Date(partnership.validUntil).toLocaleDateString('pt-PT')}
              {isExpired && " (Expirado)"}
            </p>
          )}
        </div>

        {/* Action Button */}
        <Button 
          onClick={() => onUseDiscount(partnership.id)}
          disabled={isExpired || !partnership.isActive}
          className="w-full"
          data-testid={`use-discount-${partnership.id}`}
        >
          {isExpired ? "Parceria Expirada" : "Usar Desconto"}
        </Button>
      </CardContent>
    </Card>
  );
}