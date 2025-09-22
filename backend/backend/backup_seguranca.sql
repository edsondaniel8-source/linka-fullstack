--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accommodations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accommodations (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    host_id character varying(255),
    address text NOT NULL,
    lat numeric(10,7),
    lng numeric(10,7),
    price_per_night numeric(8,2) NOT NULL,
    rating numeric(3,1),
    review_count integer DEFAULT 0,
    images text[],
    amenities text[],
    description text,
    distance_from_center numeric(4,1),
    is_available boolean DEFAULT true,
    offer_driver_discounts boolean DEFAULT false,
    driver_discount_rate numeric(5,2) DEFAULT 10.00,
    minimum_driver_level text DEFAULT 'bronze'::text,
    partnership_badge_visible boolean DEFAULT false
);


ALTER TABLE public.accommodations OWNER TO postgres;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(255),
    ride_id character varying(255),
    type text,
    status text,
    accommodation_id character varying(255),
    check_in_date timestamp without time zone,
    check_out_date timestamp without time zone,
    guests integer,
    nights integer,
    passengers integer DEFAULT 1,
    total_price numeric(10,2),
    guest_name text,
    guest_email text,
    guest_phone text,
    payment_method text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    seats_booked integer,
    passenger_id character varying(255)
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- Name: rides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rides (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    driver_id character varying(255),
    from_location character varying(255) NOT NULL,
    to_location character varying(255) NOT NULL,
    departure_date timestamp without time zone NOT NULL,
    departure_time text NOT NULL,
    available_seats integer NOT NULL,
    price_per_seat numeric(10,2) NOT NULL,
    vehicle_type character varying(50),
    additional_info text,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    type text,
    from_address text,
    to_address text,
    from_lat numeric(10,7),
    from_lng numeric(10,7),
    to_lat numeric(10,7),
    to_lng numeric(10,7),
    price numeric(10,2),
    estimated_duration integer,
    estimated_distance numeric(10,2),
    available_in integer,
    driver_name text,
    vehicle_info text,
    max_passengers integer,
    is_active boolean DEFAULT true,
    route text[],
    allow_pickup_en_route boolean DEFAULT false,
    allow_negotiation boolean DEFAULT false,
    is_round_trip boolean DEFAULT false,
    return_date timestamp without time zone,
    return_departure_time timestamp without time zone,
    min_price numeric(10,2),
    max_price numeric(10,2)
);


ALTER TABLE public.rides OWNER TO postgres;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    sid character varying(255) NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255),
    first_name character varying(255),
    last_name character varying(255),
    profile_image_url character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    phone text,
    user_type text DEFAULT 'client'::text,
    roles text[] DEFAULT '{client}'::text[],
    can_offer_services boolean DEFAULT false,
    avatar text,
    rating numeric(3,2) DEFAULT 0.00,
    total_reviews integer DEFAULT 0,
    is_verified boolean DEFAULT false,
    verification_status text DEFAULT 'pending'::text,
    verification_date timestamp without time zone,
    verification_notes text,
    identity_document_url text,
    identity_document_type text,
    profile_photo_url text,
    full_name text,
    document_number text,
    date_of_birth timestamp without time zone,
    registration_completed boolean DEFAULT false,
    verification_badge text,
    badge_earned_date timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: accommodations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accommodations (id, name, type, host_id, address, lat, lng, price_per_night, rating, review_count, images, amenities, description, distance_from_center, is_available, offer_driver_discounts, driver_discount_rate, minimum_driver_level, partnership_badge_visible) FROM stdin;
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (id, user_id, ride_id, type, status, accommodation_id, check_in_date, check_out_date, guests, nights, passengers, total_price, guest_name, guest_email, guest_phone, payment_method, created_at, updated_at, seats_booked, passenger_id) FROM stdin;
\.


--
-- Data for Name: rides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rides (id, driver_id, from_location, to_location, departure_date, departure_time, available_seats, price_per_seat, vehicle_type, additional_info, status, created_at, type, from_address, to_address, from_lat, from_lng, to_lat, to_lng, price, estimated_duration, estimated_distance, available_in, driver_name, vehicle_info, max_passengers, is_active, route, allow_pickup_en_route, allow_negotiation, is_round_trip, return_date, return_departure_time, min_price, max_price) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (sid, sess, expire) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, first_name, last_name, profile_image_url, created_at, updated_at, phone, user_type, roles, can_offer_services, avatar, rating, total_reviews, is_verified, verification_status, verification_date, verification_notes, identity_document_url, identity_document_type, profile_photo_url, full_name, document_number, date_of_birth, registration_completed, verification_badge, badge_earned_date) FROM stdin;
\.


--
-- Name: accommodations accommodations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accommodations
    ADD CONSTRAINT accommodations_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: rides rides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rides
    ADD CONSTRAINT rides_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_accommodations_host_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_accommodations_host_id ON public.accommodations USING btree (host_id);


--
-- Name: idx_bookings_ride_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_ride_id ON public.bookings USING btree (ride_id);


--
-- Name: idx_bookings_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_user_id ON public.bookings USING btree (user_id);


--
-- Name: idx_rides_driver_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rides_driver_id ON public.rides USING btree (driver_id);


--
-- Name: idx_rides_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rides_status ON public.rides USING btree (status);


--
-- Name: idx_sessions_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_expire ON public.sessions USING btree (expire);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: accommodations accommodations_host_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accommodations
    ADD CONSTRAINT accommodations_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.users(id);


--
-- Name: bookings bookings_passenger_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_passenger_id_fkey FOREIGN KEY (passenger_id) REFERENCES public.users(id);


--
-- Name: bookings bookings_ride_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_ride_id_fkey FOREIGN KEY (ride_id) REFERENCES public.rides(id);


--
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: rides rides_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rides
    ADD CONSTRAINT rides_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

