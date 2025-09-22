-- ===== SCRIPT DE INICIALIZAÇÃO DO SISTEMA UNIFICADO LINK-A =====
-- Este script cria todas as tabelas necessárias para o sistema unificado

-- Criar extensão para UUIDs se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== TABELA DE USUÁRIOS =====
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  phone TEXT,
  rating DECIMAL(3,2) DEFAULT 4.50,
  roles JSON DEFAULT '["client"]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===== TABELA DE VIAGENS UNIFICADAS =====
CREATE TABLE IF NOT EXISTS rides_unified (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id VARCHAR REFERENCES users(id) NOT NULL,
  from_address VARCHAR(255) NOT NULL,
  to_address VARCHAR(255) NOT NULL,
  departure_date DATE NOT NULL,
  departure_time TIME NOT NULL,
  max_passengers INTEGER NOT NULL,
  available_seats INTEGER NOT NULL,
  price_per_seat DECIMAL(10,2) NOT NULL,
  vehicle_type VARCHAR(50) DEFAULT 'sedan',
  vehicle_info TEXT,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active',
  allow_negotiation BOOLEAN DEFAULT false,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== TABELA DE ALOJAMENTOS =====
CREATE TABLE IF NOT EXISTS accommodations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id VARCHAR REFERENCES users(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- hotel, guesthouse, apartment, villa, lodge
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  description TEXT,
  amenities JSON DEFAULT '[]',
  images JSON DEFAULT '[]',
  max_guests INTEGER NOT NULL,
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  price_per_night DECIMAL(10,2) NOT NULL,
  rating DECIMAL(3,2) DEFAULT 4.00,
  total_reviews INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  minimum_nights INTEGER DEFAULT 1,
  check_in_time TIME DEFAULT '15:00',
  check_out_time TIME DEFAULT '11:00',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== TABELA DE RESERVAS UNIFICADAS =====
CREATE TABLE IF NOT EXISTS bookings_unified (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id VARCHAR REFERENCES users(id) NOT NULL,
  service_type VARCHAR(20) NOT NULL, -- 'ride' | 'accommodation'
  service_id VARCHAR NOT NULL, -- ID do ride ou accommodation
  provider_id VARCHAR REFERENCES users(id) NOT NULL, -- driver ou host
  
  -- Detalhes comuns
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  special_requests TEXT,
  contact_phone VARCHAR,
  contact_email VARCHAR,
  
  -- Para viagens
  seats_booked INTEGER,
  pickup_location TEXT,
  
  -- Para alojamentos
  check_in_date DATE,
  check_out_date DATE,
  guests INTEGER,
  nights INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== TABELA DE DISPONIBILIDADE (para alojamentos) =====
CREATE TABLE IF NOT EXISTS availability (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  accommodation_id VARCHAR REFERENCES accommodations(id) NOT NULL,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  special_price DECIMAL(10,2),
  reason TEXT -- "booked", "maintenance", "holiday_pricing"
);

-- ===== ÍNDICES PARA PERFORMANCE =====
CREATE INDEX IF NOT EXISTS idx_rides_departure ON rides_unified(departure_date, departure_time);
CREATE INDEX IF NOT EXISTS idx_rides_driver ON rides_unified(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides_unified(status);
CREATE INDEX IF NOT EXISTS idx_rides_location ON rides_unified(from_address, to_address);

CREATE INDEX IF NOT EXISTS idx_accommodations_location ON accommodations(city, province);
CREATE INDEX IF NOT EXISTS idx_accommodations_type ON accommodations(type);
CREATE INDEX IF NOT EXISTS idx_accommodations_price ON accommodations(price_per_night);
CREATE INDEX IF NOT EXISTS idx_accommodations_host ON accommodations(host_id);

CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings_unified(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings_unified(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service ON bookings_unified(service_type, service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings_unified(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings_unified(check_in_date, check_out_date);

CREATE INDEX IF NOT EXISTS idx_availability_accommodation ON availability(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_availability_date ON availability(date);

-- ===== DADOS DE TESTE =====
-- Inserir usuários de teste se não existirem
INSERT INTO users (id, email, first_name, last_name, phone, roles) VALUES 
  ('9624afd4-5385-4601-af6e-4cf747dba1bc', 'driver.test@linka.mz', 'João', 'Motorista', '+258843123456', '["driver", "client"]'),
  ('cdaaee9b-5ef6-4b6e-98bc-79533d795d73', 'client.test@linka.mz', 'Maria', 'Cliente', '+258843654321', '["client"]'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'host.test@linka.mz', 'Carlos', 'Anfitrião', '+258843789012', '["hotel_manager", "client"]')
ON CONFLICT (id) DO NOTHING;

-- Inserir viagens de teste
INSERT INTO rides_unified (driver_id, from_address, to_address, departure_date, departure_time, max_passengers, available_seats, price_per_seat, vehicle_type, description) VALUES 
  ('9624afd4-5385-4601-af6e-4cf747dba1bc', 'Maputo Centro', 'Matola Gare', CURRENT_DATE + INTERVAL '1 day', '08:00', 4, 4, 150.00, 'sedan', 'Viagem diária para Matola, partida pontual'),
  ('9624afd4-5385-4601-af6e-4cf747dba1bc', 'Maputo', 'Xai-Xai', CURRENT_DATE + INTERVAL '2 days', '06:30', 6, 6, 450.00, 'van', 'Viagem para Xai-Xai, carro confortável')
ON CONFLICT DO NOTHING;

-- Inserir alojamentos de teste
INSERT INTO accommodations (host_id, name, type, address, city, province, description, amenities, max_guests, bedrooms, bathrooms, price_per_night) VALUES 
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Casa Vista Mar - Tofo', 'villa', 'Praia do Tofo, Inhambane', 'Tofo', 'Inhambane', 'Casa moderna com vista para o mar, ideal para famílias', '["wifi", "parking", "kitchen", "pool"]', 6, 3, 2, 3500.00),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Apartamento Centro Maputo', 'apartment', 'Av. Julius Nyerere, 123', 'Maputo', 'Maputo', 'Apartamento moderno no centro da cidade', '["wifi", "parking", "kitchen"]', 4, 2, 1, 2800.00)
ON CONFLICT DO NOTHING;

-- ===== VERIFICAÇÃO FINAL =====
SELECT 'Tabelas criadas com sucesso!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_rides FROM rides_unified;
SELECT COUNT(*) as total_accommodations FROM accommodations;
SELECT COUNT(*) as total_bookings FROM bookings_unified;