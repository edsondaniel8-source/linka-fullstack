-- database_schema.sql
-- Schema completo para Link-AMZAPP 
-- Baseado em shared/database-schema.ts e shared/schema.ts

BEGIN;

-- ===== TABELAS PRINCIPAIS =====

-- Sessões
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR(255) PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

-- Usuários
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    profile_image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    phone TEXT UNIQUE,
    user_type TEXT DEFAULT 'client',
    roles TEXT[] DEFAULT '{client}',
    can_offer_services BOOLEAN DEFAULT false,
    avatar TEXT,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    verification_status TEXT DEFAULT 'pending',
    verification_date TIMESTAMP,
    verification_notes TEXT,
    identity_document_url TEXT,
    identity_document_type TEXT,
    profile_photo_url TEXT,
    full_name TEXT,
    document_number TEXT,
    date_of_birth TIMESTAMP,
    registration_completed BOOLEAN DEFAULT false,
    verification_badge TEXT,
    badge_earned_date TIMESTAMP
);

-- Corridas
CREATE TABLE IF NOT EXISTS rides (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id VARCHAR(255) REFERENCES users(id),
    from_location VARCHAR(255) NOT NULL,
    to_location VARCHAR(255) NOT NULL,
    departure_date TIMESTAMP NOT NULL,
    departure_time TEXT NOT NULL,
    available_seats INTEGER NOT NULL,
    price_per_seat DECIMAL(10,2) NOT NULL,
    vehicle_type VARCHAR(50),
    additional_info TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Campos adicionais do schema original
    type TEXT,
    from_address TEXT,
    to_address TEXT,
    from_lat DECIMAL(10,7),
    from_lng DECIMAL(10,7),
    to_lat DECIMAL(10,7),
    to_lng DECIMAL(10,7),
    price DECIMAL(10,2),
    estimated_duration INTEGER,
    estimated_distance DECIMAL(10,2),
    available_in INTEGER,
    driver_name TEXT,
    vehicle_info TEXT,
    max_passengers INTEGER,
        is_active BOOLEAN DEFAULT true,
    route TEXT[],
    allow_pickup_en_route BOOLEAN DEFAULT false,
    allow_negotiation BOOLEAN DEFAULT false,
    is_round_trip BOOLEAN DEFAULT false,
    return_date TIMESTAMP,
    return_departure_time TIMESTAMP,
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2)
);

-- Reservas
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) REFERENCES users(id),
    ride_id VARCHAR(255) REFERENCES rides(id),
    type TEXT,
    status TEXT,
    accommodation_id VARCHAR(255),
    check_in_date TIMESTAMP,
    check_out_date TIMESTAMP,
    guests INTEGER,
    nights INTEGER,
    passengers INTEGER DEFAULT 1,
    total_price DECIMAL(10,2),
    guest_name TEXT,
    guest_email TEXT,
    guest_phone TEXT,
    payment_method TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    seats_booked INTEGER,
    passenger_id VARCHAR(255) REFERENCES users(id)
);

-- Acomodações
CREATE TABLE IF NOT EXISTS accommodations (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    host_id VARCHAR(255) REFERENCES users(id),
    address TEXT NOT NULL,
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    price_per_night DECIMAL(8,2) NOT NULL,
    rating DECIMAL(3,1),
    review_count INTEGER DEFAULT 0,
    images TEXT[],
    amenities TEXT[],
    description TEXT,
    distance_from_center DECIMAL(4,1),
    is_available BOOLEAN DEFAULT true,
    offer_driver_discounts BOOLEAN DEFAULT false,
    driver_discount_rate DECIMAL(5,2) DEFAULT 10.00,
    minimum_driver_level TEXT DEFAULT 'bronze',
    partnership_badge_visible BOOLEAN DEFAULT false
);

-- ===== ÍNDICES =====
CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_ride_id ON bookings(ride_id);
CREATE INDEX IF NOT EXISTS idx_accommodations_host_id ON accommodations(host_id);

COMMIT;

-- ===== COMANDOS PARA EXECUTAR =====
-- sudo -u postgres psql -d link_amzapp -f database_schema.sql
-- sudo -u postgres psql -d link_amzapp -c "\dt"
