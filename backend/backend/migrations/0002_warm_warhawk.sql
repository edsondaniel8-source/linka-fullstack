DROP TABLE "hotels";--> statement-breakpoint
ALTER TABLE "room_types" DROP CONSTRAINT "room_types_hotel_id_hotels_id_fk";
--> statement-breakpoint
ALTER TABLE "accommodations" ALTER COLUMN "price_per_night" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "driver_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "hotel_financial_reports" ADD COLUMN "cancelled_bookings" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "room_types" ADD COLUMN "accommodation_id" varchar;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "room_types" ADD CONSTRAINT "room_types_accommodation_id_accommodations_id_fk" FOREIGN KEY ("accommodation_id") REFERENCES "accommodations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "hotel_financial_reports" DROP COLUMN IF EXISTS "c cancelled_bookings";--> statement-breakpoint
ALTER TABLE "room_types" DROP COLUMN IF EXISTS "hotel_id";