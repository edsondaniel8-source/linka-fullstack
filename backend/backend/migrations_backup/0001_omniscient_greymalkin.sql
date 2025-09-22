CREATE TABLE "hotels" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"manager_id" varchar NOT NULL,
	"address" text NOT NULL,
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"description" text,
	"phone" text,
	"email" text,
	"website" text,
	"check_in_time" text DEFAULT '14:00',
	"check_out_time" text DEFAULT '12:00',
	"images" text[],
	"amenities" text[],
	"rating" numeric(3, 1) DEFAULT '0.0',
	"review_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "room_types" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hotel_id" varchar NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"price_per_night" numeric(8, 2) NOT NULL,
	"max_occupancy" integer DEFAULT 2,
	"total_rooms" integer DEFAULT 1,
	"available_rooms" integer DEFAULT 1,
	"images" text[],
	"amenities" text[],
	"size" numeric(5, 1),
	"bed_type" text,
	"has_balcony" boolean DEFAULT false,
	"has_sea_view" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "admin_actions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "chat_messages" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "driver_documents" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "driver_stats" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "event_managers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "events" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "loyalty_program" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "loyalty_rewards" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notifications" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "payments" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pickup_requests" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "points_history" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "price_negotiations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "price_regulations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ratings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "reward_redemptions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "admin_actions" CASCADE;--> statement-breakpoint
DROP TABLE "chat_messages" CASCADE;--> statement-breakpoint
DROP TABLE "driver_documents" CASCADE;--> statement-breakpoint
DROP TABLE "driver_stats" CASCADE;--> statement-breakpoint
DROP TABLE "event_managers" CASCADE;--> statement-breakpoint
DROP TABLE "events" CASCADE;--> statement-breakpoint
DROP TABLE "loyalty_program" CASCADE;--> statement-breakpoint
DROP TABLE "loyalty_rewards" CASCADE;--> statement-breakpoint
DROP TABLE "notifications" CASCADE;--> statement-breakpoint
DROP TABLE "payments" CASCADE;--> statement-breakpoint
DROP TABLE "pickup_requests" CASCADE;--> statement-breakpoint
DROP TABLE "points_history" CASCADE;--> statement-breakpoint
DROP TABLE "price_negotiations" CASCADE;--> statement-breakpoint
DROP TABLE "price_regulations" CASCADE;--> statement-breakpoint
DROP TABLE "ratings" CASCADE;--> statement-breakpoint
DROP TABLE "reward_redemptions" CASCADE;--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_provider_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_ride_id_rides_id_fk";
--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_accommodation_id_accommodations_id_fk";
--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_event_id_events_id_fk";
--> statement-breakpoint
ALTER TABLE "rides" DROP CONSTRAINT "rides_driver_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "total_price" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "total_price" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "from_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "to_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "from_lat" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "from_lng" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "to_lat" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "to_lng" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "price" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "price" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "estimated_distance" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "max_passengers" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "available_seats" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "min_price" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "max_price" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "user_type" SET DEFAULT 'client';--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "passengers" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "guest_name" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "guest_email" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "guest_phone" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "roles" text[] DEFAULT '{client}';--> statement-breakpoint
ALTER TABLE "hotels" ADD CONSTRAINT "hotels_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_types" ADD CONSTRAINT "room_types_hotel_id_hotels_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accommodations" DROP COLUMN "offer_driver_discounts";--> statement-breakpoint
ALTER TABLE "accommodations" DROP COLUMN "driver_discount_rate";--> statement-breakpoint
ALTER TABLE "accommodations" DROP COLUMN "minimum_driver_level";--> statement-breakpoint
ALTER TABLE "accommodations" DROP COLUMN "partnership_badge_visible";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "provider_id";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "requested_at";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "approved_at";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "rejected_at";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "confirmed_at";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "rejection_reason";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "customer_notified";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "provider_notified";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "event_id";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "ticket_quantity";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "ticket_numbers";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "qr_codes";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "original_price";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "discount_applied";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "driver_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "verification_status";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "verification_date";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "verification_notes";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "identity_document_url";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "identity_document_type";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "profile_photo_url";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "full_name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "document_number";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "date_of_birth";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "registration_completed";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "verification_badge";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "badge_earned_date";