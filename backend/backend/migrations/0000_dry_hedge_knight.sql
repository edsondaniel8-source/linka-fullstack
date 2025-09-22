CREATE TABLE IF NOT EXISTS "accommodations" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"host_id" varchar,
	"address" text NOT NULL,
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"price_per_night" numeric(8, 2) NOT NULL,
	"rating" numeric(3, 1),
	"review_count" integer DEFAULT 0,
	"images" text[],
	"amenities" text[],
	"description" text,
	"distance_from_center" numeric(4, 1),
	"is_available" boolean DEFAULT true,
	"offer_driver_discounts" boolean DEFAULT false,
	"driver_discount_rate" numeric(5, 2) DEFAULT '10.00',
	"minimum_driver_level" text DEFAULT 'bronze',
	"partnership_badge_visible" boolean DEFAULT false,
	"enable_partnerships" boolean DEFAULT false,
	"accommodation_discount" integer DEFAULT 10,
	"transport_discount" integer DEFAULT 15
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_actions" (
	"id" varchar PRIMARY KEY NOT NULL,
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
CREATE TABLE IF NOT EXISTS "bookings" (
	"id" varchar PRIMARY KEY NOT NULL,
	"ride_id" varchar,
	"passenger_id" varchar,
	"accommodation_id" varchar,
	"type" varchar(20) DEFAULT 'ride',
	"status" varchar(20) DEFAULT 'pending',
	"total_price" numeric(10, 2) NOT NULL,
	"seats_booked" integer NOT NULL,
	"passengers" integer DEFAULT 1,
	"guest_name" text,
	"guest_email" text,
	"guest_phone" text,
	"check_in_date" timestamp,
	"check_out_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_messages" (
	"id" varchar PRIMARY KEY NOT NULL,
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
CREATE TABLE IF NOT EXISTS "chat_rooms" (
	"id" varchar PRIMARY KEY NOT NULL,
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
CREATE TABLE IF NOT EXISTS "driver_documents" (
	"id" varchar PRIMARY KEY NOT NULL,
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
CREATE TABLE IF NOT EXISTS "driver_stats" (
	"id" varchar PRIMARY KEY NOT NULL,
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
CREATE TABLE IF NOT EXISTS "event_managers" (
	"id" varchar PRIMARY KEY NOT NULL,
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
CREATE TABLE IF NOT EXISTS "events" (
	"id" varchar PRIMARY KEY NOT NULL,
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
CREATE TABLE IF NOT EXISTS "hotel_financial_reports" (
	"id" varchar PRIMARY KEY NOT NULL,
	"accommodation_id" varchar NOT NULL,
	"report_date" timestamp NOT NULL,
	"report_type" text NOT NULL,
	"total_revenue" numeric(10, 2) NOT NULL,
	"room_revenue" numeric(10, 2) NOT NULL,
	"service_revenue" numeric(10, 2) DEFAULT '0.00',
	"total_bookings" integer DEFAULT 0,
	"confirmed_bookings" integer DEFAULT 0,
	"c cancelled_bookings" integer DEFAULT 0,
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
CREATE TABLE IF NOT EXISTS "hotel_rooms" (
	"id" varchar PRIMARY KEY NOT NULL,
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
CREATE TABLE IF NOT EXISTS "hotels" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "loyalty_program" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"total_points" integer DEFAULT 0,
	"current_points" integer DEFAULT 0,
	"membership_level" text DEFAULT 'bronze',
	"joined_at" timestamp DEFAULT now(),
	"last_activity_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "loyalty_rewards" (
	"id" varchar PRIMARY KEY NOT NULL,
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
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" varchar PRIMARY KEY NOT NULL,
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
CREATE TABLE IF NOT EXISTS "partnership_applications" (
	"id" varchar PRIMARY KEY NOT NULL,
	"proposal_id" varchar NOT NULL,
	"driver_id" varchar NOT NULL,
	"status" text DEFAULT 'pending',
	"application_date" timestamp DEFAULT now(),
	"accepted_at" timestamp,
	"completed_at" timestamp,
	"message" text,
	"estimated_completion" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "partnership_proposals" (
	"id" varchar PRIMARY KEY NOT NULL,
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
CREATE TABLE IF NOT EXISTS "payments" (
	"id" varchar PRIMARY KEY NOT NULL,
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
CREATE TABLE IF NOT EXISTS "pickup_requests" (
	"id" varchar PRIMARY KEY NOT NULL,
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
CREATE TABLE IF NOT EXISTS "points_history" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"loyalty_id" varchar,
	"action_type" text NOT NULL,
	"points_amount" integer NOT NULL,
	"reason" text NOT NULL,
	"related_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "price_negotiations" (
	"id" varchar PRIMARY KEY NOT NULL,
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
CREATE TABLE IF NOT EXISTS "price_regulations" (
	"id" varchar PRIMARY KEY NOT NULL,
	"ride_type" text NOT NULL,
	"min_price_per_km" numeric(8, 2) NOT NULL,
	"max_price_per_km" numeric(8, 2) NOT NULL,
	"base_fare" numeric(8, 2) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ratings" (
	"id" varchar PRIMARY KEY NOT NULL,
	"from_user_id" varchar,
	"to_user_id" varchar,
	"rating" integer NOT NULL,
	"comment" text,
	"service_type" text NOT NULL,
	"booking_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reward_redemptions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"reward_id" varchar,
	"points_used" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"expires_at" timestamp,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rides" (
	"id" varchar PRIMARY KEY NOT NULL,
	"driver_id" varchar,
	"from_location" varchar(255) NOT NULL,
	"to_location" varchar(255) NOT NULL,
	"departure_date" timestamp NOT NULL,
	"departure_time" text NOT NULL,
	"available_seats" integer NOT NULL,
	"price_per_seat" numeric(10, 2) NOT NULL,
	"vehicle_type" varchar(50),
	"additional_info" text,
	"status" varchar(20) DEFAULT 'active',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "room_types" (
	"id" varchar PRIMARY KEY NOT NULL,
	"hotel_id" varchar,
	"type" text NOT NULL,
	"price_per_night" numeric(8, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_settings" (
	"id" varchar PRIMARY KEY NOT NULL,
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
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"phone" text,
	"user_type" text DEFAULT 'client',
	"roles" text[] DEFAULT '{client}',
	"can_offer_services" boolean DEFAULT false,
	"avatar" text,
	"rating" numeric(3, 2) DEFAULT '0.00',
	"total_reviews" integer DEFAULT 0,
	"is_verified" boolean DEFAULT false,
	"verification_status" text DEFAULT 'pending',
	"verification_date" timestamp,
	"verification_notes" text,
	"identity_document_url" text,
	"identity_document_type" text,
	"profile_photo_url" text,
	"full_name" text,
	"document_number" text,
	"date_of_birth" timestamp,
	"registration_completed" boolean DEFAULT false,
	"verification_badge" text,
	"badge_earned_date" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" ("expire");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accommodations" ADD CONSTRAINT "accommodations_host_id_users_id_fk" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookings" ADD CONSTRAINT "bookings_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "rides"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookings" ADD CONSTRAINT "bookings_passenger_id_users_id_fk" FOREIGN KEY ("passenger_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookings" ADD CONSTRAINT "bookings_accommodation_id_accommodations_id_fk" FOREIGN KEY ("accommodation_id") REFERENCES "accommodations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_room_id_chat_rooms_id_fk" FOREIGN KEY ("chat_room_id") REFERENCES "chat_rooms"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_participant_one_id_users_id_fk" FOREIGN KEY ("participant_one_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_participant_two_id_users_id_fk" FOREIGN KEY ("participant_two_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "driver_documents" ADD CONSTRAINT "driver_documents_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "driver_stats" ADD CONSTRAINT "driver_stats_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_managers" ADD CONSTRAINT "event_managers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_manager_id_event_managers_id_fk" FOREIGN KEY ("manager_id") REFERENCES "event_managers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hotel_financial_reports" ADD CONSTRAINT "hotel_financial_reports_accommodation_id_accommodations_id_fk" FOREIGN KEY ("accommodation_id") REFERENCES "accommodations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hotel_rooms" ADD CONSTRAINT "hotel_rooms_accommodation_id_accommodations_id_fk" FOREIGN KEY ("accommodation_id") REFERENCES "accommodations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "loyalty_program" ADD CONSTRAINT "loyalty_program_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "partnership_applications" ADD CONSTRAINT "partnership_applications_proposal_id_partnership_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "partnership_proposals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "partnership_applications" ADD CONSTRAINT "partnership_applications_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "partnership_proposals" ADD CONSTRAINT "partnership_proposals_hotel_id_accommodations_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "accommodations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pickup_requests" ADD CONSTRAINT "pickup_requests_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "rides"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pickup_requests" ADD CONSTRAINT "pickup_requests_passenger_id_users_id_fk" FOREIGN KEY ("passenger_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pickup_requests" ADD CONSTRAINT "pickup_requests_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "points_history" ADD CONSTRAINT "points_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "points_history" ADD CONSTRAINT "points_history_loyalty_id_loyalty_program_id_fk" FOREIGN KEY ("loyalty_id") REFERENCES "loyalty_program"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "price_negotiations" ADD CONSTRAINT "price_negotiations_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "rides"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "price_negotiations" ADD CONSTRAINT "price_negotiations_passenger_id_users_id_fk" FOREIGN KEY ("passenger_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "price_negotiations" ADD CONSTRAINT "price_negotiations_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ratings" ADD CONSTRAINT "ratings_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ratings" ADD CONSTRAINT "ratings_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_reward_id_loyalty_rewards_id_fk" FOREIGN KEY ("reward_id") REFERENCES "loyalty_rewards"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rides" ADD CONSTRAINT "rides_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "room_types" ADD CONSTRAINT "room_types_hotel_id_hotels_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
