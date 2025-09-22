CREATE TABLE "admin_actions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" varchar,
	"target_user_id" varchar,
	"action" text NOT NULL,
	"reason" text NOT NULL,
	"duration" integer,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_room_id" varchar NOT NULL,
	"from_user_id" varchar,
	"to_user_id" varchar,
	"message" text NOT NULL,
	"message_type" text DEFAULT 'text',
	"booking_id" varchar,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_rooms" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_one_id" varchar NOT NULL,
	"participant_two_id" varchar NOT NULL,
	"booking_id" varchar,
	"service_type" text,
	"last_message" text,
	"last_message_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "driver_documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"driver_id" varchar NOT NULL,
	"vehicle_registration_url" text,
	"driving_license_url" text,
	"vehicle_insurance_url" text,
	"vehicle_inspection_url" text,
	"vehicle_make" text,
	"vehicle_model" text,
	"vehicle_year" integer,
	"vehicle_plate" text,
	"vehicle_color" text,
	"is_verified" boolean DEFAULT false,
	"verification_date" timestamp,
	"verification_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "driver_stats" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"driver_id" varchar,
	"total_rides" integer DEFAULT 0,
	"total_distance" numeric(10, 2) DEFAULT '0.00',
	"total_earnings" numeric(12, 2) DEFAULT '0.00',
	"average_rating" numeric(3, 2) DEFAULT '0.00',
	"completed_rides_this_month" integer DEFAULT 0,
	"completed_rides_this_year" integer DEFAULT 0,
	"partnership_level" text DEFAULT 'bronze',
	"last_ride_date" timestamp,
	"joined_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "driver_stats_driver_id_unique" UNIQUE("driver_id")
);
--> statement-breakpoint
CREATE TABLE "event_managers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"company_name" text NOT NULL,
	"company_type" text NOT NULL,
	"description" text,
	"contact_email" text NOT NULL,
	"contact_phone" text,
	"website" text,
	"logo" text,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organizer_id" varchar,
	"manager_id" varchar,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"event_type" text NOT NULL,
	"category" text NOT NULL,
	"venue" text NOT NULL,
	"address" text NOT NULL,
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"start_time" text,
	"end_time" text,
	"is_paid" boolean DEFAULT false,
	"ticket_price" numeric(8, 2) DEFAULT '0',
	"max_tickets" integer DEFAULT 100,
	"tickets_sold" integer DEFAULT 0,
	"enable_partnerships" boolean DEFAULT false,
	"accommodation_discount" integer DEFAULT 10,
	"transport_discount" integer DEFAULT 15,
	"organizer_name" text,
	"organizer_contact" text,
	"organizer_email" text,
	"images" text[],
	"max_attendees" integer,
	"current_attendees" integer DEFAULT 0,
	"status" text DEFAULT 'pending' NOT NULL,
	"requires_approval" boolean DEFAULT true,
	"is_public" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"has_partnerships" boolean DEFAULT false,
	"website_url" text,
	"social_media_links" text[],
	"tags" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hotel_financial_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"accommodation_id" varchar NOT NULL,
	"report_date" timestamp NOT NULL,
	"report_type" text NOT NULL,
	"total_revenue" numeric(10, 2) NOT NULL,
	"room_revenue" numeric(10, 2) NOT NULL,
	"service_revenue" numeric(10, 2) DEFAULT '0.00',
	"total_bookings" integer DEFAULT 0,
	"confirmed_bookings" integer DEFAULT 0,
	"cancelled_bookings" integer DEFAULT 0,
	"no_show_bookings" integer DEFAULT 0,
	"total_rooms" integer NOT NULL,
	"occupied_rooms" integer DEFAULT 0,
	"occupancy_rate" numeric(5, 2) DEFAULT '0.00',
	"average_daily_rate" numeric(8, 2) DEFAULT '0.00',
	"revenue_per_available_room" numeric(8, 2) DEFAULT '0.00',
	"platform_fees" numeric(8, 2) DEFAULT '0.00',
	"net_revenue" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hotel_rooms" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"accommodation_id" varchar NOT NULL,
	"room_number" text NOT NULL,
	"room_type" text NOT NULL,
	"description" text,
	"images" text[],
	"base_price" numeric(8, 2) NOT NULL,
	"weekend_price" numeric(8, 2),
	"holiday_price" numeric(8, 2),
	"max_occupancy" integer DEFAULT 2 NOT NULL,
	"bed_type" text,
	"bed_count" integer DEFAULT 1,
	"has_private_bathroom" boolean DEFAULT true,
	"has_air_conditioning" boolean DEFAULT false,
	"has_wifi" boolean DEFAULT false,
	"has_tv" boolean DEFAULT false,
	"has_balcony" boolean DEFAULT false,
	"has_kitchen" boolean DEFAULT false,
	"room_amenities" text[],
	"is_available" boolean DEFAULT true,
	"maintenance_until" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "loyalty_program" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"total_points" integer DEFAULT 0,
	"current_points" integer DEFAULT 0,
	"membership_level" text DEFAULT 'bronze',
	"joined_at" timestamp DEFAULT now(),
	"last_activity_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "loyalty_rewards" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"reward_type" text NOT NULL,
	"points_cost" integer NOT NULL,
	"discount_value" numeric(8, 2),
	"minimum_level" text DEFAULT 'bronze',
	"is_active" boolean DEFAULT true,
	"max_redemptions" integer,
	"valid_until" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text NOT NULL,
	"priority" text DEFAULT 'normal',
	"is_read" boolean DEFAULT false,
	"action_url" text,
	"related_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "partnership_proposals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hotel_id" varchar NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"proposal_type" text NOT NULL,
	"target_regions" text[],
	"minimum_driver_level" text DEFAULT 'bronze',
	"required_vehicle_type" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"specific_dates" text[],
	"time_slots" text[],
	"base_payment_mzn" numeric(8, 2) NOT NULL,
	"bonus_payment_mzn" numeric(8, 2) DEFAULT '0.00',
	"premium_rate" numeric(5, 2) DEFAULT '0.00',
	"offer_free_accommodation" boolean DEFAULT false,
	"offer_meals" boolean DEFAULT false,
	"offer_fuel" boolean DEFAULT false,
	"additional_benefits" text[],
	"max_drivers_needed" integer NOT NULL,
	"current_applicants" integer DEFAULT 0,
	"minimum_rides" integer,
	"estimated_earnings" text,
	"status" text DEFAULT 'active',
	"priority" text DEFAULT 'normal',
	"featured_until" timestamp,
	"contact_method" text DEFAULT 'in_app',
	"application_deadline" timestamp,
	"requires_interview" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" varchar,
	"user_id" varchar,
	"service_type" text NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"platform_fee" numeric(10, 2) NOT NULL,
	"discount_amount" numeric(10, 2) DEFAULT '0.00',
	"total" numeric(10, 2) NOT NULL,
	"payment_method" text,
	"card_last4" text,
	"card_brand" text,
	"mpesa_number" text,
	"payment_status" text DEFAULT 'pending',
	"payment_reference" text,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pickup_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ride_id" varchar,
	"passenger_id" varchar,
	"driver_id" varchar,
	"pickup_location" text NOT NULL,
	"pickup_lat" numeric(10, 7),
	"pickup_lng" numeric(10, 7),
	"destination_location" text NOT NULL,
	"destination_lat" numeric(10, 7),
	"destination_lng" numeric(10, 7),
	"requested_seats" integer DEFAULT 1,
	"proposed_price" numeric(8, 2),
	"status" text DEFAULT 'pending',
	"message" text,
	"estimated_detour" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "points_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"loyalty_id" varchar,
	"action_type" text NOT NULL,
	"points_amount" integer NOT NULL,
	"reason" text NOT NULL,
	"related_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "price_negotiations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ride_id" varchar,
	"passenger_id" varchar,
	"driver_id" varchar,
	"original_price" numeric(8, 2) NOT NULL,
	"proposed_price" numeric(8, 2) NOT NULL,
	"counter_price" numeric(8, 2),
	"status" text DEFAULT 'pending',
	"message" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "price_regulations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ride_type" text NOT NULL,
	"min_price_per_km" numeric(8, 2) NOT NULL,
	"max_price_per_km" numeric(8, 2) NOT NULL,
	"base_fare" numeric(8, 2) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_user_id" varchar,
	"to_user_id" varchar,
	"rating" integer NOT NULL,
	"comment" text,
	"service_type" text NOT NULL,
	"booking_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reward_redemptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"reward_id" varchar,
	"points_used" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"expires_at" timestamp,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"type" varchar,
	"updated_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "hotels" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "room_types" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "hotels" CASCADE;--> statement-breakpoint
DROP TABLE "room_types" CASCADE;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "type" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "type" SET DEFAULT 'ride';--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "total_price" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "total_price" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "available_seats" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "departure_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "offer_driver_discounts" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "driver_discount_rate" numeric(5, 2) DEFAULT '10.00';--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "minimum_driver_level" text DEFAULT 'bronze';--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "partnership_badge_visible" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "passenger_id" varchar;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "seats_booked" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "rides" ADD COLUMN "driver_id" varchar;--> statement-breakpoint
ALTER TABLE "rides" ADD COLUMN "from_location" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "rides" ADD COLUMN "to_location" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "rides" ADD COLUMN "departure_time" text NOT NULL;--> statement-breakpoint
ALTER TABLE "rides" ADD COLUMN "price_per_seat" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "rides" ADD COLUMN "vehicle_type" varchar(50);--> statement-breakpoint
ALTER TABLE "rides" ADD COLUMN "additional_info" text;--> statement-breakpoint
ALTER TABLE "rides" ADD COLUMN "status" varchar(20) DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "rides" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_status" text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_date" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_notes" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "identity_document_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "identity_document_type" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_photo_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "full_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "document_number" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "date_of_birth" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "registration_completed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_badge" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "badge_earned_date" timestamp;--> statement-breakpoint
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_room_id_chat_rooms_id_fk" FOREIGN KEY ("chat_room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_participant_one_id_users_id_fk" FOREIGN KEY ("participant_one_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_participant_two_id_users_id_fk" FOREIGN KEY ("participant_two_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_documents" ADD CONSTRAINT "driver_documents_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_stats" ADD CONSTRAINT "driver_stats_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_managers" ADD CONSTRAINT "event_managers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_manager_id_event_managers_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."event_managers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotel_financial_reports" ADD CONSTRAINT "hotel_financial_reports_accommodation_id_accommodations_id_fk" FOREIGN KEY ("accommodation_id") REFERENCES "public"."accommodations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotel_rooms" ADD CONSTRAINT "hotel_rooms_accommodation_id_accommodations_id_fk" FOREIGN KEY ("accommodation_id") REFERENCES "public"."accommodations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_program" ADD CONSTRAINT "loyalty_program_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partnership_proposals" ADD CONSTRAINT "partnership_proposals_hotel_id_accommodations_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."accommodations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pickup_requests" ADD CONSTRAINT "pickup_requests_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."rides"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pickup_requests" ADD CONSTRAINT "pickup_requests_passenger_id_users_id_fk" FOREIGN KEY ("passenger_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pickup_requests" ADD CONSTRAINT "pickup_requests_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_history" ADD CONSTRAINT "points_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_history" ADD CONSTRAINT "points_history_loyalty_id_loyalty_program_id_fk" FOREIGN KEY ("loyalty_id") REFERENCES "public"."loyalty_program"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_negotiations" ADD CONSTRAINT "price_negotiations_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."rides"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_negotiations" ADD CONSTRAINT "price_negotiations_passenger_id_users_id_fk" FOREIGN KEY ("passenger_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_negotiations" ADD CONSTRAINT "price_negotiations_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_reward_id_loyalty_rewards_id_fk" FOREIGN KEY ("reward_id") REFERENCES "public"."loyalty_rewards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."rides"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_passenger_id_users_id_fk" FOREIGN KEY ("passenger_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_accommodation_id_accommodations_id_fk" FOREIGN KEY ("accommodation_id") REFERENCES "public"."accommodations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rides" ADD CONSTRAINT "rides_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "pickup_time";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "guests";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "nights";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "payment_method";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "from_address";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "to_address";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "from_lat";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "from_lng";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "to_lat";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "to_lng";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "price";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "estimated_duration";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "estimated_distance";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "available_in";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "driver_name";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "vehicle_info";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "max_passengers";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "route";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "allow_pickup_en_route";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "allow_negotiation";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "is_round_trip";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "return_date";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "return_departure_time";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "min_price";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "max_price";