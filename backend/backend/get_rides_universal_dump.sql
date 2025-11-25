            r.to_geom::geography
        )) ASC
    LIMIT 50;
END;
$$;


ALTER FUNCTION public.get_rides_smart_final(city_from text, city_to text, radius_km double precision) OWNER TO linka_user;

--
-- Name: get_rides_universal(text, text, double precision, double precision, double precision, double precision, double precision); Type: FUNCTION; Schema: public; Owner: linka_user
--

CREATE FUNCTION public.get_rides_universal(from_city_in text DEFAULT NULL::text, to_city_in text DEFAULT NULL::text, from_lat double precision DEFAULT NULL::double precision, from_lng double precision DEFAULT NULL::double precision, to_lat double precision DEFAULT NULL::double precision, to_lng double precision DEFAULT NULL::double precision, radius_km double precision DEFAULT 20) RETURNS TABLE(ride_id uuid, driver_id text, from_city_out text, to_city_out text, from_lat_out double precision, from_lng_out double precision, to_lat_out double precision, to_lng_out double precision, departuredate timestamp without time zone, availableseats integer, priceperseat numeric, distance_from_km double precision, distance_to_km double precision, match_type text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r."driverId",
        r."fromCity"::text AS from_city_out,
        r."toCity"::text AS to_city_out,
        ST_Y(r.from_geom) AS from_lat_out,
        ST_X(r.from_geom) AS from_lng_out,
        ST_Y(r.to_geom) AS to_lat_out,
        ST_X(r.to_geom) AS to_lng_out,
        r."departureDate",
        r."availableSeats",
        r."pricePerSeat",
        COALESCE(
            CASE 
                WHEN from_lat IS NOT NULL AND from_lng IS NOT NULL THEN
                    ST_Distance(
                        ST_SetSRID(ST_MakePoint(from_lng, from_lat), 4326)::geography,
                        ST_MakeLine(r.from_geom, r.to_geom)::geography
                    ) / 1000
            END,
            0
        ) AS distance_from_km,
        COALESCE(
            CASE 
                WHEN to_lat IS NOT NULL AND to_lng IS NOT NULL THEN
                    ST_Distance(
                        ST_SetSRID(ST_MakePoint(to_lng, to_lat), 4326)::geography,
                        ST_MakeLine(r.from_geom, r.to_geom)::geography
                    ) / 1000
            END,
            0
        ) AS distance_to_km,
        CASE
            WHEN from_lat IS NOT NULL AND from_lng IS NOT NULL AND to_lat IS NOT NULL AND to_lng IS NOT NULL THEN 'geo_match'
            WHEN from_city_in IS NOT NULL OR to_city_in IS NOT NULL THEN 'city_match'
            ELSE 'nearby_match'
        END AS match_type
    FROM rides r
    WHERE r."availableSeats" > 0
      AND r."departureDate" >= NOW()
      AND (
          (from_lat IS NULL OR from_lng IS NULL OR
           ST_DWithin(
               ST_SetSRID(ST_MakePoint(from_lng, from_lat), 4326)::geography,
               ST_MakeLine(r.from_geom, r.to_geom)::geography,
               radius_km * 1000
--
      AND (
          (from_city_in IS NULL OR r."fromCity" ILIKE '%' || from_city_in || '%')
          AND (to_city_in IS NULL OR r."toCity" ILIKE '%' || to_city_in || '%')
      )
    ORDER BY (distance_from_km + distance_to_km) ASC
    LIMIT 50;
END;
$$;


ALTER FUNCTION public.get_rides_universal(from_city_in text, to_city_in text, from_lat double precision, from_lng double precision, to_lat double precision, to_lng double precision, radius_km double precision) OWNER TO linka_user;

--
-- Name: is_ride_in_corridor(text, text, text, text); Type: FUNCTION; Schema: public; Owner: linka_user
--

CREATE FUNCTION public.is_ride_in_corridor(ride_from_province text, ride_to_province text, search_from_province text, search_to_province text) RETURNS TABLE(is_match boolean, corridor_name text, match_type text, compatibility integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
 IF (LOWER(ride_from_province) IN ('maputo', 'cidade de maputo') 
        AND LOWER(ride_to_province) = 'inhambane'
        AND LOWER(search_from_province) = 'gaza'
        AND LOWER(search_to_province) = 'inhambane') THEN
        
        RETURN QUERY SELECT true, 'EN1-Sul-Extendido', 'covers_route', 95;
        RETURN;
    END IF;
 IF (LOWER(ride_from_province) IN ('maputo', 'cidade de maputo') 
        AND LOWER(ride_to_province) = 'inhambane'
        AND LOWER(search_from_province) = 'maputo'
        AND LOWER(search_to_province) = 'gaza') THEN
        
        RETURN QUERY SELECT true, 'EN1-Sul', 'first_leg', 80;
        RETURN;
    END IF;
IF (LOWER(ride_from_province) = LOWER(search_from_province)
        AND LOWER(ride_to_province) = LOWER(search_to_province)) THEN
        
        RETURN QUERY SELECT true, 'Rota-Exata', 'exact_match', 100;
        RETURN;
    END IF;
 RETURN QUERY SELECT false, '', 'no_match', 0;
END;
$$;


ALTER FUNCTION public.is_ride_in_corridor(ride_from_province text, ride_to_province text, search_from_province text, search_to_province text) OWNER TO linka_user;

--
-- Name: normalize_location_name(text); Type: FUNCTION; Schema: public; Owner: linka_user
--

CREATE FUNCTION public.normalize_location_name(location_text text) RETURNS text
    LANGUAGE plpgsql
    AS $_$
DECLARE
    clean_text TEXT;
    result TEXT;
BEGIN
    -- Limpa o texto mantendo a especificidade
