-- ===== TABELA sessions =====
CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

-- ===== TABELA users =====
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    phone TEXT UNIQUE,
    user_type TEXT DEFAULT 'client',
    roles TEXT DEFAULT 'client',
    can_offer_services BOOLEAN DEFAULT FALSE,
    avatar TEXT,
    rating REAL DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status TEXT DEFAULT 'pending',
    verification_date TIMESTAMP,
    verification_notes TEXT,
    identity_document_url TEXT,
    identity_document_type TEXT,
    profile_photo_url TEXT,
    full_name TEXT,
    document_number TEXT,
    date_of_birth TIMESTAMP,
    registration_completed BOOLEAN DEFAULT FALSE,
    verification_badge TEXT,
    badge_earned_date TIMESTAMP
);

-- ===== TABELA rides =====
CREATE TABLE IF NOT EXISTS rides (
    id TEXT PRIMARY KEY,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    price REAL NOT NULL,
    max_passengers INTEGER NOT NULL,
    available_seats INTEGER NOT NULL,
    driver_name TEXT,
    departure_date TIMESTAMP NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== TABELA bookings =====
CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    ride_id TEXT REFERENCES rides(id),
    passengers INTEGER DEFAULT 1,
    total_price REAL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== INSERIR DADOS DE EXEMPLO =====
INSERT INTO users (id, email, first_name, last_name, phone, user_type) VALUES
('user_001', 'joao@email.com', 'João', 'Silva', '+258841234567', 'client'),
('user_002', 'carlos@email.com', 'Carlos', 'Santos', '+258851234567', 'driver');

INSERT INTO rides (id, from_address, to_address, price, max_passengers, available_seats, driver_name, departure_date) VALUES
('ride_001', 'Avenida 24 de Julho, Maputo', 'Praça da Independência, Matola', 150.50, 4, 4, 'Carlos Santos', '2024-01-15T10:00:00Z');

INSERT INTO bookings (id, user_id, ride_id, passengers, total_price, status) VALUES
('booking_001', 'user_001', 'ride_001', 2, 301.00, 'confirmed');

-- ===== CRIAR ÍNDICES =====
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_rides_departure_date ON rides(departure_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);

-- ===== VERIFICAR TABELAS CRIADAS =====
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
