CREATE TABLE "accommodations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
	"partnership_badge_visible" boolean DEFAULT false
);
--> statement-breakpoint
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
CREATE TABLE "bookings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"type" text NOT NULL,
	"status" text DEFAULT 'pending_approval' NOT NULL,
	"provider_id" varchar,
	"requested_at" timestamp DEFAULT now(),
	"approved_at" timestamp,
	"rejected_at" timestamp,
	"confirmed_at" timestamp,
	"rejection_reason" text,
	"customer_notified" boolean DEFAULT false,
	"provider_notified" boolean DEFAULT false,
	"ride_id" varchar,
	"pickup_time" timestamp,
	"accommodation_id" varchar,
	"check_in_date" timestamp,
	"check_out_date" timestamp,
	"guests" integer,
	"nights" integer,
	"event_id" varchar,
	"ticket_quantity" integer DEFAULT 1,
	"ticket_numbers" text[],
	"qr_codes" text[],
	"original_price" numeric(10, 2) NOT NULL,
	"discount_applied" numeric(10, 2) DEFAULT '0.00',
	"total_price" numeric(10, 2) NOT NULL,
	"payment_method" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_user_id" varchar,
	"to_user_id" varchar,
	"message" text NOT NULL,
	"message_type" text DEFAULT 'text',
	"booking_id" varchar,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
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
CREATE TABLE "rides" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"from_address" text NOT NULL,
	"to_address" text NOT NULL,
	"from_lat" numeric(10, 7),
	"from_lng" numeric(10, 7),
	"to_lat" numeric(10, 7),
	"to_lng" numeric(10, 7),
	"price" numeric(8, 2) NOT NULL,
	"estimated_duration" integer,
	"estimated_distance" numeric(5, 2),
	"available_in" integer,
	"driver_id" varchar,
	"driver_name" text,
	"vehicle_info" text,
	"max_passengers" integer DEFAULT 4,
	"available_seats" integer DEFAULT 4,
	"is_active" boolean DEFAULT true,
	"route" text[],
	"allow_pickup_en_route" boolean DEFAULT false,
	"allow_negotiation" boolean DEFAULT false,
	"is_round_trip" boolean DEFAULT false,
	"return_date" timestamp,
	"return_departure_time" timestamp,
	"min_price" numeric(8, 2),
	"max_price" numeric(8, 2),
	"departure_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"phone" text NOT NULL,
	"user_type" text DEFAULT 'user',
	"can_offer_services" boolean DEFAULT false,
	"avatar" text,
	"rating" numeric(3, 2) DEFAULT '0.00',
	"total_reviews" integer DEFAULT 0,
	"is_verified" boolean DEFAULT false,
	"verification_status" text DEFAULT 'pending',
	"verification_date" timestamp,
	"verification_notes" text,
	"identity_document_url" text,
	"identity_document_type" text NOT NULL,
	"profile_photo_url" text,
	"full_name" text,
	"document_number" text NOT NULL,
	"date_of_birth" timestamp,
	"registration_completed" boolean DEFAULT false,
	"verification_badge" text,
	"badge_earned_date" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "accommodations" ADD CONSTRAINT "accommodations_host_id_users_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."rides"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_accommodation_id_accommodations_id_fk" FOREIGN KEY ("accommodation_id") REFERENCES "public"."accommodations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_documents" ADD CONSTRAINT "driver_documents_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_stats" ADD CONSTRAINT "driver_stats_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_managers" ADD CONSTRAINT "event_managers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_manager_id_event_managers_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."event_managers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_program" ADD CONSTRAINT "loyalty_program_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "rides" ADD CONSTRAINT "rides_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");