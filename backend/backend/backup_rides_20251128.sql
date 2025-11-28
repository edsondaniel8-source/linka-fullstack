--
-- PostgreSQL database dump
--

\restrict NuVN227wVB4e6QbSyDGDpTvSlDsqGIVayXICYO3THp5qWRaLgB1a3SwHUtZCgyJ

-- Dumped from database version 18.0 (Ubuntu 18.0-1.pgdg24.04+3)
-- Dumped by pg_dump version 18.0 (Ubuntu 18.0-1.pgdg24.04+3)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- Name: rides; Type: TABLE; Schema: public; Owner: linka_user
--

CREATE TABLE public.rides (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "driverId" text NOT NULL,
    "driverName" text,
    "fromAddress" character varying(255) NOT NULL,
    "toAddress" character varying(255) NOT NULL,
    "fromProvince" character varying(100),
    "toProvince" character varying(100),
    "departureDate" timestamp without time zone NOT NULL,
    "departureTime" text NOT NULL,
    "availableSeats" integer NOT NULL,
    "maxPassengers" integer DEFAULT 4,
    "pricePerSeat" numeric(10,2) NOT NULL,
    "vehicleType" character varying(50),
    "additionalInfo" text,
    status character varying(20) DEFAULT 'active'::character varying,
    type character varying(20) DEFAULT 'regular'::character varying,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "fromCity" character varying(100),
    "fromDistrict" character varying(100),
    "toCity" character varying(100),
    "toDistrict" character varying(100),
    from_geom public.geometry(Point,4326),
    to_geom public.geometry(Point,4326),
    distance_real_km numeric(10,2),
    polyline public.geography(LineString,4326),
    "fromLocality" character varying(100),
    "toLocality" character varying(100),
    "vehicleId" uuid,
    route_geom public.geography(LineString,4326)
);


ALTER TABLE public.rides OWNER TO linka_user;

--
-- Data for Name: rides; Type: TABLE DATA; Schema: public; Owner: linka_user
--

COPY public.rides (id, "driverId", "driverName", "fromAddress", "toAddress", "fromProvince", "toProvince", "departureDate", "departureTime", "availableSeats", "maxPassengers", "pricePerSeat", "vehicleType", "additionalInfo", status, type, "createdAt", "updatedAt", "fromCity", "fromDistrict", "toCity", "toDistrict", from_geom, to_geom, distance_real_km, polyline, "fromLocality", "toLocality", "vehicleId", route_geom) FROM stdin;
00cec937-b3e1-45e1-b833-0a1d355b3c80	bB88VrzVx8dbUUpXV7qSrGA5eiy2	Motorista	Coop, Cidade de Maputo	Tofo, Inhambane, Inhambane	maputo	sofala	2025-12-18 00:00:00	12:20	4	4	1800.00	sedan		active	regular	2025-11-03 16:22:28.696	2025-11-03 16:22:28.696	coop	Coop	inhambane	Tofo	0101000020E6100000480845A9734B404092C5A28E33F439C0	0101000020E6100000454772F90FB141403D0AD7A370DD37C0	364.85	0102000020E610000002000000480845A9734B404092C5A28E33F439C0CEAB95647848414053CA6B2574C736C0	\N	\N	f91ad420-d332-4289-a66e-98b1a8fe39cc	0102000020E610000002000000480845A9734B404092C5A28E33F439C0454772F90FB141403D0AD7A370DD37C0
e5b97fca-5125-4c8c-b28a-b10093df91e1	bB88VrzVx8dbUUpXV7qSrGA5eiy2	Motorista	Laulane, Cidade de Maputo	Tofo, Inhambane, Inhambane	maputo	sofala	2025-12-20 09:15:00	12:20	4	4	1500.00	sedan		active	regular	2025-11-03 17:26:45.794	2025-11-03 17:26:45.794	laulane	Laulane	inhambane	Tofo	0101000020E61000008CAB8031114E40401E13CE1374E639C0	0101000020E6100000454772F90FB141403D0AD7A370DD37C0	360.09	0102000020E6100000020000008CAB8031114E40401E13CE1374E639C0CEAB95647848414053CA6B2574C736C0	\N	\N	29c98a73-9826-4559-acc8-638f4a51dc91	0102000020E6100000020000008CAB8031114E40401E13CE1374E639C0454772F90FB141403D0AD7A370DD37C0
b878aa92-17b7-49a3-b72f-b9f9e9bfc392	bB88VrzVx8dbUUpXV7qSrGA5eiy2	Motorista	Laulane, Cidade de Maputo	Beira, Sofala	maputo	sofala	2025-12-20 17:30:00	14:00	5	4	2000.00	sedan		active	regular	2025-10-30 11:21:03.281	2025-10-30 11:21:03.281	laulane	Laulane	beira	Beira	0101000020E61000008CAB8031114E40401E13CE1374E639C0	0101000020E6100000C7DF51BEFB6A4140DFA3FE7A85D533C0	710.78	0102000020E6100000020000008CAB8031114E40401E13CE1374E639C0C7DF51BEFB6A4140DFA3FE7A85D533C0	\N	\N	ff0ab552-48d5-4b66-a2f3-57f9a9a49947	0102000020E6100000020000008CAB8031114E40401E13CE1374E639C0C7DF51BEFB6A4140DFA3FE7A85D533C0
dbf39e8c-0d50-4a1b-9cde-e0300d0caf52	6YIGplX4LBP0UhBsNBESUwAKPXk2	Motorista	Coop, Cidade de Maputo	Tofo, Inhambane, Inhambane	maputo	inhambane	2025-12-15 00:00:00	12:00	4	4	1400.00	suv	Viagem confortável	available	regular	2025-10-29 00:36:53.228	2025-10-29 00:36:53.228	coop	Coop	inhambane	Tofo	0101000020E6100000480845A9734B404092C5A28E33F439C0	0101000020E6100000454772F90FB141403D0AD7A370DD37C0	364.85	0102000020E610000002000000480845A9734B404092C5A28E33F439C0CEAB95647848414053CA6B2574C736C0	\N	\N	10fc361e-b9ae-4234-86a2-9899e7f2f6fd	0102000020E610000002000000480845A9734B404092C5A28E33F439C0454772F90FB141403D0AD7A370DD37C0
f3f1a56b-8fe8-4560-ad73-ab05b9f94630	6YIGplX4LBP0UhBsNBESUwAKPXk2	\N	Matola	Inhambane	maputo	inhambane	2025-11-03 15:53:03.62641	08:00	3	4	1400.00	\N	\N	active	regular	2025-11-03 15:53:03.62641	2025-11-03 15:53:03.62641	matola	Matola	inhambane	Inhambane	0101000020E6100000E355D636C53B404049F25CDF87F739C0	0101000020E6100000454772F90FB141403D0AD7A370DD37C0	375.28	0102000020E610000002000000E355D636C53B404049F25CDF87F739C0CEAB95647848414053CA6B2574C736C0	\N	\N	10fc361e-b9ae-4234-86a2-9899e7f2f6fd	0102000020E610000002000000E355D636C53B404049F25CDF87F739C0454772F90FB141403D0AD7A370DD37C0
6bc5ddba-0e91-4687-9670-31c8a3994b3c	bB88VrzVx8dbUUpXV7qSrGA5eiy2	Edson Daniel	Maputo, Cidade de Maputo	Praia do Tofo, Inhambane	maputo	inhambane	2025-12-20 13:00:00	22:00	2	4	350.00	suv	Viagem confortável	available	regular	2025-10-25 20:14:51.681	2025-10-25 20:14:51.681	maputo	Maputo	praia do tofo	Praia do Tofo	0101000020E6100000BF0E9C33A248404055F833BC59F739C0	0101000020E61000006666666666C641409A99999999D937C0	381.61	0102000020E610000002000000B69267A89B3A404037A04A72658B39C06666666666C641409A99999999D937C0	\N	\N	f4cd3489-3e87-4d04-9849-8e7563803e24	0102000020E610000002000000BF0E9C33A248404055F833BC59F739C06666666666C641409A99999999D937C0
76b80cc5-9b76-43f5-8a72-7f43b8c3acc1	bB88VrzVx8dbUUpXV7qSrGA5eiy2	Motorista	Coop, Cidade de Maputo	Tofo, Inhambane, Inhambane	maputo	inhambane	2025-12-20 14:30:00	12:00	4	4	2500.00	sedan		available	regular	2025-10-29 21:59:05.941	2025-10-29 21:59:05.941	coop	Coop	inhambane	Tofo	0101000020E6100000480845A9734B404092C5A28E33F439C0	0101000020E6100000454772F90FB141403D0AD7A370DD37C0	364.85	0102000020E610000002000000480845A9734B404092C5A28E33F439C0CEAB95647848414053CA6B2574C736C0	\N	\N	17b79549-fbf0-4ea2-a410-4c4bb8816609	0102000020E610000002000000480845A9734B404092C5A28E33F439C0454772F90FB141403D0AD7A370DD37C0
23687c1a-c2fb-4cca-83de-f04498d75056	bB88VrzVx8dbUUpXV7qSrGA5eiy2	Motorista	Songo	Costa do Sol	tete	cidade de maputo	2025-12-23 00:00:00	10:00	3	4	1600.00	luxury	\N	available	regular	2025-11-28 08:43:25.974	2025-11-28 08:43:25.974	songo		costa do sol		0101000020E61000001C25AFCE3163404094A06417B1302FC0	0101000020E6100000520DFB3DB152404075F2D885D5E439C0	\N	\N			29c98a73-9826-4559-acc8-638f4a51dc91	\N
d7fb8895-984f-4f24-a4bc-68ef19051385	6YIGplX4LBP0UhBsNBESUwAKPXk2	\N	Centro de Maputo	Centro de Xai-Xai	Maputo	Gaza	2025-11-10 00:00:00	08:00	3	4	500.00	\N	\N	active	regular	2025-11-05 14:25:23.677964	2025-11-05 14:25:23.677964	Maputo	\N	Xai-Xai	\N	0101000020E6100000BF0E9C33A248404055F833BC59F739C0	0101000020E610000075C8CD7003D24040D95BCAF9620B39C0	148.72	0102000020E610000002000000B69267A89B3A404037A04A72658B39C075C8CD7003D24040D95BCAF9620B39C0	\N	\N	10fc361e-b9ae-4234-86a2-9899e7f2f6fd	0102000020E610000002000000BF0E9C33A248404055F833BC59F739C075C8CD7003D24040D95BCAF9620B39C0
2d269b6f-b1ec-4b08-9114-9b9a8a9b8f1c	6YIGplX4LBP0UhBsNBESUwAKPXk2	\N	Zimpeto, Distrito Municipal de KaMubukwana, Cidade de Maputo, Zona Sul, 0105-14, Moçambique	Matacuane, Esturro, Beira, Cidade da Beira, Sofala, Zona Centro, 2100, Moçambique	cidade de maputo	sofala	2025-12-20 16:45:00	08:00	4	4	1600.00	sedan	\N	available	regular	2025-11-20 22:05:48.163	2025-11-20 22:05:48.163	zimpeto	\N	matacuane	\N	0101000020E61000008AC10D428A49404029C5330D2FD739C0	0101000020E6100000B149230B3D6E41402244E856BED533C0	\N	\N			4f3009dd-b6a3-4e31-a2ed-4061fce0b233	0102000020E6100000020000008AC10D428A49404029C5330D2FD739C0B149230B3D6E41402244E856BED533C0
8d717fd6-3840-4aca-b5f6-2cedcc31c412	bB88VrzVx8dbUUpXV7qSrGA5eiy2	Motorista	Maxixe	Catembe	inhambane	cidade de maputo	2025-12-20 00:00:00	10:00	1	4	1500.00	luxury	\N	available	regular	2025-11-27 03:23:21.154	2025-11-27 16:23:33.024233	maxixe		catembe		0101000020E6100000323B8BDEA9AC41405182FE428FDC37C0	0101000020E61000006E6EA708CB474040F42A7CC73A023AC0	\N	\N			29c98a73-9826-4559-acc8-638f4a51dc91	\N
\.


--
-- Name: rides rides_pkey; Type: CONSTRAINT; Schema: public; Owner: linka_user
--

ALTER TABLE ONLY public.rides
    ADD CONSTRAINT rides_pkey PRIMARY KEY (id);


--
-- Name: idx_rides_from_city; Type: INDEX; Schema: public; Owner: linka_user
--

CREATE INDEX idx_rides_from_city ON public.rides USING gin ("fromCity" public.gin_trgm_ops);


--
-- Name: idx_rides_from_geom; Type: INDEX; Schema: public; Owner: linka_user
--

CREATE INDEX idx_rides_from_geom ON public.rides USING gist (from_geom);


--
-- Name: idx_rides_from_geom_gist; Type: INDEX; Schema: public; Owner: linka_user
--

CREATE INDEX idx_rides_from_geom_gist ON public.rides USING gist (from_geom);


--
-- Name: idx_rides_from_province; Type: INDEX; Schema: public; Owner: linka_user
--

CREATE INDEX idx_rides_from_province ON public.rides USING gin ("fromProvince" public.gin_trgm_ops);


--
-- Name: idx_rides_status_departure; Type: INDEX; Schema: public; Owner: linka_user
--

CREATE INDEX idx_rides_status_departure ON public.rides USING btree (status, "departureDate") WHERE ((status)::text = 'available'::text);


--
-- Name: idx_rides_to_city; Type: INDEX; Schema: public; Owner: linka_user
--

CREATE INDEX idx_rides_to_city ON public.rides USING gin ("toCity" public.gin_trgm_ops);


--
-- Name: idx_rides_to_geom; Type: INDEX; Schema: public; Owner: linka_user
--

CREATE INDEX idx_rides_to_geom ON public.rides USING gist (to_geom);


--
-- Name: idx_rides_to_geom_gist; Type: INDEX; Schema: public; Owner: linka_user
--

CREATE INDEX idx_rides_to_geom_gist ON public.rides USING gist (to_geom);


--
-- Name: idx_rides_to_province; Type: INDEX; Schema: public; Owner: linka_user
--

CREATE INDEX idx_rides_to_province ON public.rides USING gin ("toProvince" public.gin_trgm_ops);


--
-- Name: rides_status_idx; Type: INDEX; Schema: public; Owner: linka_user
--

CREATE INDEX rides_status_idx ON public.rides USING btree (status);


--
-- Name: rides trigger_auto_fill_provinces; Type: TRIGGER; Schema: public; Owner: linka_user
--

CREATE TRIGGER trigger_auto_fill_provinces BEFORE INSERT OR UPDATE ON public.rides FOR EACH ROW EXECUTE FUNCTION public.auto_fill_provinces();


--
-- Name: rides rides_driverId_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: linka_user
--

ALTER TABLE ONLY public.rides
    ADD CONSTRAINT "rides_driverId_users_id_fk" FOREIGN KEY ("driverId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: rides rides_vehicleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: linka_user
--

ALTER TABLE ONLY public.rides
    ADD CONSTRAINT "rides_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES public."driverVehicles"(id);


--
-- PostgreSQL database dump complete
--

\unrestrict NuVN227wVB4e6QbSyDGDpTvSlDsqGIVayXICYO3THp5qWRaLgB1a3SwHUtZCgyJ

