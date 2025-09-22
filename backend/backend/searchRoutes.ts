import { Router } from "express";
import { storage } from "./storage";
import { verifyFirebaseToken, type AuthenticatedRequest } from "./src/shared/firebaseAuth";

const router = Router();

// Enhanced Ride Search with filters
router.get("/rides", async (req, res) => {
  try {
    const { 
      from, 
      to, 
      departureDate,
      minPrice,
      maxPrice,
      vehicleType,
      seats,
      allowNegotiation,
      driverId
    } = req.query;

    if (!from || !to) {
      return res.status(400).json({ 
        error: "Origem e destino são obrigatórios",
        details: "Os parâmetros 'from' e 'to' devem ser fornecidos"
      });
    }

    // Mock enhanced ride search results for demonstration
    const mockRides = [
      {
        id: "ride_1",
        driverId: "driver_001",
        driverName: "João Silva",
        driverRating: 4.8,
        driverPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        fromAddress: from,
        toAddress: to,
        price: 250.00,
        vehicleInfo: "Toyota Corolla Branco 2020",
        maxPassengers: 4,
        availableSeats: 3,
        departureDate: new Date("2024-12-30T08:00:00Z"),
        estimatedDuration: 120, // minutes
        estimatedDistance: 85.5, // km
        allowNegotiation: true,
        minPrice: 200.00,
        maxPrice: 300.00,
        route: ["Maputo", "Matola", "Beira"],
        isRoundTrip: false,
        vehicleFeatures: ["AC", "WiFi", "Phone Charger"],
        isVerifiedDriver: true
      },
      {
        id: "ride_2", 
        driverId: "driver_002",
        driverName: "Maria Santos",
        driverRating: 4.9,
        driverPhoto: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
        fromAddress: from,
        toAddress: to,
        price: 300.00,
        vehicleInfo: "Honda Civic Azul 2021",
        maxPassengers: 4,
        availableSeats: 2,
        departureDate: new Date("2024-12-30T09:30:00Z"),
        estimatedDuration: 105,
        estimatedDistance: 85.5,
        allowNegotiation: false,
        route: ["Maputo", "Beira"],
        isRoundTrip: false,
        vehicleFeatures: ["AC", "WiFi", "Music System", "Premium Seats"],
        isVerifiedDriver: true
      },
      {
        id: "ride_3",
        driverId: "driver_003", 
        driverName: "Pedro Machado",
        driverRating: 4.6,
        driverPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        fromAddress: from,
        toAddress: to,
        price: 180.00,
        vehicleInfo: "Nissan Almera Vermelho 2019",
        maxPassengers: 4,
        availableSeats: 4,
        departureDate: new Date("2024-12-30T14:00:00Z"),
        estimatedDuration: 135,
        estimatedDistance: 85.5,
        allowNegotiation: true,
        minPrice: 150.00,
        maxPrice: 250.00,
        route: ["Maputo", "Xai-Xai", "Beira"],
        isRoundTrip: false,
        vehicleFeatures: ["AC"],
        isVerifiedDriver: true
      }
    ];

    // Apply filters
    let filteredRides = mockRides;

    if (minPrice) {
      filteredRides = filteredRides.filter(ride => ride.price >= Number(minPrice));
    }

    if (maxPrice) {
      filteredRides = filteredRides.filter(ride => ride.price <= Number(maxPrice));
    }

    if (seats) {
      filteredRides = filteredRides.filter(ride => ride.availableSeats >= Number(seats));
    }

    if (allowNegotiation === 'true') {
      filteredRides = filteredRides.filter(ride => ride.allowNegotiation);
    }

    if (driverId) {
      filteredRides = filteredRides.filter(ride => ride.driverId === driverId);
    }

    res.json({
      success: true,
      rides: filteredRides,
      searchParams: {
        from,
        to,
        departureDate,
        appliedFilters: {
          minPrice: minPrice ? Number(minPrice) : null,
          maxPrice: maxPrice ? Number(maxPrice) : null,
          seats: seats ? Number(seats) : null,
          allowNegotiation: allowNegotiation === 'true'
        }
      },
      total: filteredRides.length
    });
  } catch (error) {
    console.error("Error searching rides:", error);
    res.status(500).json({ 
      error: "Erro ao pesquisar viagens",
      message: "Tente novamente mais tarde" 
    });
  }
});

// Enhanced Accommodation Search
router.get("/accommodations", async (req, res) => {
  try {
    const { 
      location, 
      checkIn, 
      checkOut, 
      guests,
      minPrice,
      maxPrice,
      amenities,
      accommodationType
    } = req.query;

    if (!location) {
      return res.status(400).json({ 
        error: "Localização é obrigatória",
        details: "O parâmetro 'location' deve ser fornecido"
      });
    }

    // Mock enhanced accommodation search results
    const mockAccommodations = [
      {
        id: "acc_1",
        hostId: "host_001",
        name: "Hotel Maputo Luxury",
        type: "Hotel",
        hostName: "Ana Costa",
        hostRating: 4.7,
        address: `${location} Centro`,
        pricePerNight: 3500.00,
        rating: 4.8,
        reviewCount: 156,
        images: [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
          "https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=400"
        ],
        amenities: ["WiFi", "AC", "Pool", "Restaurant", "Parking"],
        description: "Hotel de luxo no centro da cidade com vista panorâmica",
        distanceFromCenter: 0.5,
        maxGuests: 4,
        offerDriverDiscounts: true,
        driverDiscountRate: 15.00,
        partnershipBadgeVisible: true,
        isVerified: true
      },
      {
        id: "acc_2",
        hostId: "host_002", 
        name: "Casa Aconchegante",
        type: "House",
        hostName: "Miguel Torres",
        hostRating: 4.9,
        address: `${location} Zona Residencial`,
        pricePerNight: 2800.00,
        rating: 4.9,
        reviewCount: 89,
        images: [
          "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400",
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400"
        ],
        amenities: ["WiFi", "Kitchen", "Garden", "Parking", "AC"],
        description: "Casa completa para famílias com jardim privado",
        distanceFromCenter: 2.1,
        maxGuests: 6,
        offerDriverDiscounts: false,
        isVerified: true
      },
      {
        id: "acc_3",
        hostId: "host_003",
        name: "Apartamento Moderno",
        type: "Apartment", 
        hostName: "Sofia Vilanculos",
        hostRating: 4.5,
        address: `${location} Baixa`,
        pricePerNight: 1950.00,
        rating: 4.6,
        reviewCount: 203,
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"
        ],
        amenities: ["WiFi", "Kitchen", "AC", "Balcony"],
        description: "Apartamento moderno e bem localizado",
        distanceFromCenter: 0.8,
        maxGuests: 2,
        offerDriverDiscounts: true,
        driverDiscountRate: 10.00,
        isVerified: true
      }
    ];

    // Apply filters
    let filteredAccommodations = mockAccommodations;

    if (guests) {
      filteredAccommodations = filteredAccommodations.filter(acc => acc.maxGuests >= Number(guests));
    }

    if (minPrice) {
      filteredAccommodations = filteredAccommodations.filter(acc => acc.pricePerNight >= Number(minPrice));
    }

    if (maxPrice) {
      filteredAccommodations = filteredAccommodations.filter(acc => acc.pricePerNight <= Number(maxPrice));
    }

    if (accommodationType) {
      filteredAccommodations = filteredAccommodations.filter(acc => 
        acc.type.toLowerCase() === (accommodationType as string).toLowerCase()
      );
    }

    if (amenities) {
      const requestedAmenities = (amenities as string).split(',');
      filteredAccommodations = filteredAccommodations.filter(acc =>
        requestedAmenities.every(amenity => 
          acc.amenities.some(accAmenity => 
            accAmenity.toLowerCase().includes(amenity.toLowerCase())
          )
        )
      );
    }

    res.json({
      success: true,
      accommodations: filteredAccommodations,
      searchParams: {
        location,
        checkIn,
        checkOut,
        guests: guests ? Number(guests) : null,
        appliedFilters: {
          minPrice: minPrice ? Number(minPrice) : null,
          maxPrice: maxPrice ? Number(maxPrice) : null,
          accommodationType,
          amenities: amenities ? (amenities as string).split(',') : null
        }
      },
      total: filteredAccommodations.length
    });
  } catch (error) {
    console.error("Error searching accommodations:", error);
    res.status(500).json({ 
      error: "Erro ao pesquisar hospedagens",
      message: "Tente novamente mais tarde" 
    });
  }
});

// Event Search with comprehensive filters
router.get("/events", async (req, res) => {
  try {
    const { 
      city, 
      month, 
      year, 
      category,
      eventType,
      isPaid,
      enablePartnerships,
      organizerId
    } = req.query;

    if (!city || !month || !year) {
      return res.status(400).json({ 
        error: "Cidade, mês e ano são obrigatórios",
        details: "Os parâmetros 'city', 'month' e 'year' devem ser fornecidos"
      });
    }

    // Mock comprehensive event data
    const mockEvents = [
      {
        id: "event_1",
        organizerId: "org_001",
        organizerName: "Associação Cultural Maputo",
        title: "Festival de Música Moçambicana",
        description: "Grande festival celebrando a música tradicional e moderna de Moçambique com artistas nacionais e internacionais.",
        eventType: "festival",
        category: "cultura",
        venue: "Estádio Nacional do Zimpeto",
        address: `${city}, Estádio Nacional`,
        startDate: `${year}-${String(month).padStart(2, '0')}-15`,
        endDate: `${year}-${String(month).padStart(2, '0')}-17`,
        startTime: "18:00",
        endTime: "23:00",
        isPaid: true,
        ticketPrice: 500.00,
        maxTickets: 5000,
        ticketsSold: 1250,
        enablePartnerships: true,
        accommodationDiscount: 20,
        transportDiscount: 15,
        images: [
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400"
        ],
        organizerContact: "+258 84 123 4567",
        organizerEmail: "cultura@maputo.mz",
        maxAttendees: 5000,
        currentAttendees: 1250,
        status: "approved",
        isFeatured: true,
        tags: ["música", "cultura", "festival", "artistas"],
        hasPartnerships: true
      },
      {
        id: "event_2",
        organizerId: "org_002", 
        organizerName: "Centro de Negócios Beira",
        title: "Conferência de Empreendedorismo Digital",
        description: "Evento focado em estratégias digitais para pequenas e médias empresas em Moçambique.",
        eventType: "conferencia",
        category: "negocios",
        venue: "Hotel VIP Executive Beira",
        address: `${city}, Centro da Cidade`,
        startDate: `${year}-${String(month).padStart(2, '0')}-08`,
        endDate: `${year}-${String(month).padStart(2, '0')}-08`,
        startTime: "09:00",
        endTime: "17:00",
        isPaid: true,
        ticketPrice: 750.00,
        maxTickets: 200,
        ticketsSold: 89,
        enablePartnerships: true,
        accommodationDiscount: 25,
        transportDiscount: 20,
        images: [
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
          "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400"
        ],
        organizerContact: "+258 82 987 6543",
        organizerEmail: "eventos@negocios-beira.mz",
        maxAttendees: 200,
        currentAttendees: 89,
        status: "approved",
        isFeatured: false,
        tags: ["negócios", "empreendedorismo", "digital", "PME"],
        hasPartnerships: true
      },
      {
        id: "event_3",
        organizerId: "org_003",
        organizerName: "Produtora Festa Livre",
        title: "Noite de Marrabenta e Afrobeat",
        description: "Festa com os melhores DJs e bandas de marrabenta e afrobeat da região.",
        eventType: "festa",
        category: "entretenimento",
        venue: "Praia do Tofo",
        address: `${city}, Praia do Tofo`,
        startDate: `${year}-${String(month).padStart(2, '0')}-22`,
        endDate: `${year}-${String(month).padStart(2, '0')}-23`,
        startTime: "20:00",
        endTime: "04:00",
        isPaid: true,
        ticketPrice: 300.00,
        maxTickets: 1000,
        ticketsSold: 456,
        enablePartnerships: false,
        images: [
          "https://images.unsplash.com/photo-1571266028243-cdb221e9f4cb?w=400",
          "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=400"
        ],
        organizerContact: "+258 86 555 1234",
        organizerEmail: "festa@praialivre.mz",
        maxAttendees: 1000,
        currentAttendees: 456,
        status: "approved",
        isFeatured: false,
        tags: ["festa", "marrabenta", "afrobeat", "praia"],
        hasPartnerships: false
      }
    ];

    // Apply filters
    let filteredEvents = mockEvents;

    if (category && category !== "") {
      filteredEvents = filteredEvents.filter(event => event.category === category);
    }

    if (eventType) {
      filteredEvents = filteredEvents.filter(event => event.eventType === eventType);
    }

    if (isPaid !== undefined) {
      const paidFilter = isPaid === 'true';
      filteredEvents = filteredEvents.filter(event => event.isPaid === paidFilter);
    }

    if (enablePartnerships === 'true') {
      filteredEvents = filteredEvents.filter(event => event.enablePartnerships);
    }

    if (organizerId) {
      filteredEvents = filteredEvents.filter(event => event.organizerId === organizerId);
    }

    res.json({
      success: true,
      events: filteredEvents,
      searchParams: {
        city,
        month: parseInt(month as string),
        year: parseInt(year as string),
        appliedFilters: {
          category,
          eventType,
          isPaid: isPaid ? isPaid === 'true' : null,
          enablePartnerships: enablePartnerships === 'true',
          organizerId
        }
      },
      total: filteredEvents.length,
      summary: {
        totalEvents: filteredEvents.length,
        paidEvents: filteredEvents.filter(e => e.isPaid).length,
        freeEvents: filteredEvents.filter(e => !e.isPaid).length,
        eventsWithPartnerships: filteredEvents.filter(e => e.enablePartnerships).length
      }
    });
  } catch (error) {
    console.error("Error searching events:", error);
    res.status(500).json({ 
      error: "Erro ao pesquisar eventos",
      message: "Tente novamente mais tarde" 
    });
  }
});

// Universal search endpoint (searches across all services)
router.get("/all", async (req, res) => {
  try {
    const { query, type } = req.query;

    if (!query) {
      return res.status(400).json({ 
        error: "Termo de pesquisa é obrigatório",
        details: "O parâmetro 'query' deve ser fornecido"
      });
    }

    const searchTerm = (query as string).toLowerCase();
    
    const results = {
      rides: [] as any[],
      accommodations: [] as any[],
      events: [] as any[],
      total: 0
    };

    // Search rides (mock implementation)
    if (!type || type === 'rides') {
      // This would search through actual ride data in a real implementation
      results.rides = [
        {
          id: "ride_search_1",
          title: "Maputo → Beira",
          type: "ride",
          price: 250.00,
          description: "Viagem confortável com motorista verificado"
        }
      ].filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
      );
    }

    // Search accommodations
    if (!type || type === 'accommodations') {
      results.accommodations = [
        {
          id: "acc_search_1",
          title: "Hotel Maputo Luxury",
          type: "accommodation",
          price: 3500.00,
          description: "Hotel de luxo no centro da cidade"
        }
      ].filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
      );
    }

    // Search events
    if (!type || type === 'events') {
      results.events = [
        {
          id: "event_search_1",
          title: "Festival de Música Moçambicana",
          type: "event",
          price: 500.00,
          description: "Grande festival de música tradicional"
        }
      ].filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
      );
    }

    results.total = results.rides.length + results.accommodations.length + results.events.length;

    res.json({
      success: true,
      query: searchTerm,
      results,
      searchType: type || 'all'
    });
  } catch (error) {
    console.error("Error in universal search:", error);
    res.status(500).json({ 
      error: "Erro na pesquisa",
      message: "Tente novamente mais tarde" 
    });
  }
});

export default router;