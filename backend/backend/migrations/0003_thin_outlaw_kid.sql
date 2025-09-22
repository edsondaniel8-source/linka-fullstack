ALTER TABLE "admin_actions" RENAME TO "adminActions";--> statement-breakpoint
ALTER TABLE "chat_messages" RENAME TO "chatMessages";--> statement-breakpoint
ALTER TABLE "chat_rooms" RENAME TO "chatRooms";--> statement-breakpoint
ALTER TABLE "driver_documents" RENAME TO "driverDocuments";--> statement-breakpoint
ALTER TABLE "driver_stats" RENAME TO "driverStats";--> statement-breakpoint
ALTER TABLE "event_managers" RENAME TO "eventManagers";--> statement-breakpoint
ALTER TABLE "hotel_financial_reports" RENAME TO "hotelFinancialReports";--> statement-breakpoint
ALTER TABLE "hotel_rooms" RENAME TO "hotelRooms";--> statement-breakpoint
ALTER TABLE "loyalty_program" RENAME TO "loyaltyProgram";--> statement-breakpoint
ALTER TABLE "loyalty_rewards" RENAME TO "loyaltyRewards";--> statement-breakpoint
ALTER TABLE "partnership_applications" RENAME TO "partnershipApplications";--> statement-breakpoint
ALTER TABLE "partnership_proposals" RENAME TO "partnershipProposals";--> statement-breakpoint
ALTER TABLE "pickup_requests" RENAME TO "pickupRequests";--> statement-breakpoint
ALTER TABLE "points_history" RENAME TO "pointsHistory";--> statement-breakpoint
ALTER TABLE "price_negotiations" RENAME TO "priceNegotiations";--> statement-breakpoint
ALTER TABLE "price_regulations" RENAME TO "priceRegulations";--> statement-breakpoint
ALTER TABLE "reward_redemptions" RENAME TO "rewardRedemptions";--> statement-breakpoint
ALTER TABLE "room_types" RENAME TO "roomTypes";--> statement-breakpoint
ALTER TABLE "system_settings" RENAME TO "systemSettings";--> statement-breakpoint
ALTER TABLE "accommodations" RENAME COLUMN "host_id" TO "hostId";--> statement-breakpoint
ALTER TABLE "accommodations" RENAME COLUMN "price_per_night" TO "pricePerNight";--> statement-breakpoint
ALTER TABLE "accommodations" RENAME COLUMN "review_count" TO "reviewCount";--> statement-breakpoint
ALTER TABLE "accommodations" RENAME COLUMN "distance_from_center" TO "distanceFromCenter";--> statement-breakpoint
ALTER TABLE "accommodations" RENAME COLUMN "is_available" TO "isAvailable";--> statement-breakpoint
ALTER TABLE "accommodations" RENAME COLUMN "offer_driver_discounts" TO "offerDriverDiscounts";--> statement-breakpoint
ALTER TABLE "accommodations" RENAME COLUMN "driver_discount_rate" TO "driverDiscountRate";--> statement-breakpoint
ALTER TABLE "accommodations" RENAME COLUMN "minimum_driver_level" TO "minimumDriverLevel";--> statement-breakpoint
ALTER TABLE "accommodations" RENAME COLUMN "partnership_badge_visible" TO "partnershipBadgeVisible";--> statement-breakpoint
ALTER TABLE "accommodations" RENAME COLUMN "enable_partnerships" TO "enablePartnerships";--> statement-breakpoint
ALTER TABLE "accommodations" RENAME COLUMN "accommodation_discount" TO "accommodationDiscount";--> statement-breakpoint
ALTER TABLE "accommodations" RENAME COLUMN "transport_discount" TO "transportDiscount";--> statement-breakpoint
ALTER TABLE "bookings" RENAME COLUMN "ride_id" TO "rideId";--> statement-breakpoint
ALTER TABLE "bookings" RENAME COLUMN "passenger_id" TO "passengerId";--> statement-breakpoint
ALTER TABLE "bookings" RENAME COLUMN "accommodation_id" TO "accommodationId";--> statement-breakpoint
ALTER TABLE "bookings" RENAME COLUMN "total_price" TO "totalPrice";--> statement-breakpoint
ALTER TABLE "bookings" RENAME COLUMN "seats_booked" TO "seatsBooked";--> statement-breakpoint
ALTER TABLE "bookings" RENAME COLUMN "guest_name" TO "guestName";--> statement-breakpoint
ALTER TABLE "bookings" RENAME COLUMN "guest_email" TO "guestEmail";--> statement-breakpoint
ALTER TABLE "bookings" RENAME COLUMN "guest_phone" TO "guestPhone";--> statement-breakpoint
ALTER TABLE "bookings" RENAME COLUMN "check_in_date" TO "checkInDate";--> statement-breakpoint
ALTER TABLE "bookings" RENAME COLUMN "check_out_date" TO "checkOutDate";--> statement-breakpoint
ALTER TABLE "bookings" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "bookings" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "organizer_id" TO "organizerId";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "manager_id" TO "managerId";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "event_type" TO "eventType";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "start_date" TO "startDate";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "end_date" TO "endDate";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "start_time" TO "startTime";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "end_time" TO "endTime";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "is_paid" TO "isPaid";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "ticket_price" TO "ticketPrice";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "max_tickets" TO "maxTickets";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "tickets_sold" TO "ticketsSold";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "enable_partnerships" TO "enablePartnerships";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "accommodation_discount" TO "accommodationDiscount";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "transport_discount" TO "transportDiscount";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "organizer_name" TO "organizerName";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "organizer_contact" TO "organizerContact";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "organizer_email" TO "organizerEmail";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "max_attendees" TO "maxAttendees";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "current_attendees" TO "currentAttendees";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "requires_approval" TO "requiresApproval";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "is_public" TO "isPublic";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "is_featured" TO "isFeatured";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "has_partnerships" TO "hasPartnerships";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "website_url" TO "websiteUrl";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "social_media_links" TO "socialMediaLinks";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "notifications" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "notifications" RENAME COLUMN "is_read" TO "isRead";--> statement-breakpoint
ALTER TABLE "notifications" RENAME COLUMN "action_url" TO "actionUrl";--> statement-breakpoint
ALTER TABLE "notifications" RENAME COLUMN "related_id" TO "relatedId";--> statement-breakpoint
ALTER TABLE "notifications" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "notifications" RENAME COLUMN "read_at" TO "readAt";--> statement-breakpoint
ALTER TABLE "payments" RENAME COLUMN "booking_id" TO "bookingId";--> statement-breakpoint
ALTER TABLE "payments" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "payments" RENAME COLUMN "service_type" TO "serviceType";--> statement-breakpoint
ALTER TABLE "payments" RENAME COLUMN "platform_fee" TO "platformFee";--> statement-breakpoint
ALTER TABLE "payments" RENAME COLUMN "discount_amount" TO "discountAmount";--> statement-breakpoint
ALTER TABLE "payments" RENAME COLUMN "payment_method" TO "paymentMethod";--> statement-breakpoint
ALTER TABLE "payments" RENAME COLUMN "card_last4" TO "cardLast4";--> statement-breakpoint
ALTER TABLE "payments" RENAME COLUMN "card_brand" TO "cardBrand";--> statement-breakpoint
ALTER TABLE "payments" RENAME COLUMN "mpesa_number" TO "mpesaNumber";--> statement-breakpoint
ALTER TABLE "payments" RENAME COLUMN "payment_status" TO "paymentStatus";--> statement-breakpoint
ALTER TABLE "payments" RENAME COLUMN "payment_reference" TO "paymentReference";--> statement-breakpoint
ALTER TABLE "payments" RENAME COLUMN "paid_at" TO "paidAt";--> statement-breakpoint
ALTER TABLE "payments" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "payments" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "ratings" RENAME COLUMN "from_user_id" TO "fromUserId";--> statement-breakpoint
ALTER TABLE "ratings" RENAME COLUMN "to_user_id" TO "toUserId";--> statement-breakpoint
ALTER TABLE "ratings" RENAME COLUMN "service_type" TO "serviceType";--> statement-breakpoint
ALTER TABLE "ratings" RENAME COLUMN "booking_id" TO "bookingId";--> statement-breakpoint
ALTER TABLE "ratings" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "rides" RENAME COLUMN "driver_id" TO "driverId";--> statement-breakpoint
ALTER TABLE "rides" RENAME COLUMN "departure_date" TO "departureDate";--> statement-breakpoint
ALTER TABLE "rides" RENAME COLUMN "departure_time" TO "departureTime";--> statement-breakpoint
ALTER TABLE "rides" RENAME COLUMN "available_seats" TO "availableSeats";--> statement-breakpoint
ALTER TABLE "rides" RENAME COLUMN "price_per_seat" TO "pricePerSeat";--> statement-breakpoint
ALTER TABLE "rides" RENAME COLUMN "vehicle_type" TO "vehicleType";--> statement-breakpoint
ALTER TABLE "rides" RENAME COLUMN "additional_info" TO "additionalInfo";--> statement-breakpoint
ALTER TABLE "rides" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "first_name" TO "firstName";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "last_name" TO "lastName";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "profile_image_url" TO "profileImageUrl";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "user_type" TO "userType";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "can_offer_services" TO "canOfferServices";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "total_reviews" TO "totalReviews";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "is_verified" TO "isVerified";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "verification_status" TO "verificationStatus";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "verification_date" TO "verificationDate";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "verification_notes" TO "verificationNotes";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "identity_document_url" TO "identityDocumentUrl";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "identity_document_type" TO "identityDocumentType";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "profile_photo_url" TO "profilePhotoUrl";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "full_name" TO "fullName";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "document_number" TO "documentNumber";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "date_of_birth" TO "dateOfBirth";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "registration_completed" TO "registrationCompleted";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "verification_badge" TO "verificationBadge";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "badge_earned_date" TO "badgeEarnedDate";--> statement-breakpoint
ALTER TABLE "adminActions" RENAME COLUMN "admin_id" TO "adminId";--> statement-breakpoint
ALTER TABLE "adminActions" RENAME COLUMN "target_user_id" TO "targetUserId";--> statement-breakpoint
ALTER TABLE "adminActions" RENAME COLUMN "is_active" TO "isActive";--> statement-breakpoint
ALTER TABLE "adminActions" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "chatMessages" RENAME COLUMN "chat_room_id" TO "chatRoomId";--> statement-breakpoint
ALTER TABLE "chatMessages" RENAME COLUMN "from_user_id" TO "fromUserId";--> statement-breakpoint
ALTER TABLE "chatMessages" RENAME COLUMN "to_user_id" TO "toUserId";--> statement-breakpoint
ALTER TABLE "chatMessages" RENAME COLUMN "message_type" TO "messageType";--> statement-breakpoint
ALTER TABLE "chatMessages" RENAME COLUMN "booking_id" TO "bookingId";--> statement-breakpoint
ALTER TABLE "chatMessages" RENAME COLUMN "is_read" TO "isRead";--> statement-breakpoint
ALTER TABLE "chatMessages" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "chatRooms" RENAME COLUMN "participant_one_id" TO "participantOneId";--> statement-breakpoint
ALTER TABLE "chatRooms" RENAME COLUMN "participant_two_id" TO "participantTwoId";--> statement-breakpoint
ALTER TABLE "chatRooms" RENAME COLUMN "booking_id" TO "bookingId";--> statement-breakpoint
ALTER TABLE "chatRooms" RENAME COLUMN "service_type" TO "serviceType";--> statement-breakpoint
ALTER TABLE "chatRooms" RENAME COLUMN "last_message" TO "lastMessage";--> statement-breakpoint
ALTER TABLE "chatRooms" RENAME COLUMN "last_message_at" TO "lastMessageAt";--> statement-breakpoint
ALTER TABLE "chatRooms" RENAME COLUMN "is_active" TO "isActive";--> statement-breakpoint
ALTER TABLE "chatRooms" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "chatRooms" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "driverDocuments" RENAME COLUMN "driver_id" TO "driverId";--> statement-breakpoint
ALTER TABLE "driverDocuments" RENAME COLUMN "vehicle_registration_url" TO "vehicleRegistrationUrl";--> statement-breakpoint
ALTER TABLE "driverDocuments" RENAME COLUMN "driving_license_url" TO "drivingLicenseUrl";--> statement-breakpoint
ALTER TABLE "driverDocuments" RENAME COLUMN "vehicle_insurance_url" TO "vehicleInsuranceUrl";--> statement-breakpoint
ALTER TABLE "driverDocuments" RENAME COLUMN "vehicle_inspection_url" TO "vehicleInspectionUrl";--> statement-breakpoint
ALTER TABLE "driverDocuments" RENAME COLUMN "vehicle_make" TO "vehicleMake";--> statement-breakpoint
ALTER TABLE "driverDocuments" RENAME COLUMN "vehicle_model" TO "vehicleModel";--> statement-breakpoint
ALTER TABLE "driverDocuments" RENAME COLUMN "vehicle_year" TO "vehicleYear";--> statement-breakpoint
ALTER TABLE "driverDocuments" RENAME COLUMN "vehicle_plate" TO "vehiclePlate";--> statement-breakpoint
ALTER TABLE "driverDocuments" RENAME COLUMN "vehicle_color" TO "vehicleColor";--> statement-breakpoint
ALTER TABLE "driverDocuments" RENAME COLUMN "is_verified" TO "isVerified";--> statement-breakpoint
ALTER TABLE "driverDocuments" RENAME COLUMN "verification_date" TO "verificationDate";--> statement-breakpoint
ALTER TABLE "driverDocuments" RENAME COLUMN "verification_notes" TO "verificationNotes";--> statement-breakpoint
ALTER TABLE "driverDocuments" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "driverDocuments" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "driverStats" RENAME COLUMN "driver_id" TO "driverId";--> statement-breakpoint
ALTER TABLE "driverStats" RENAME COLUMN "total_rides" TO "totalRides";--> statement-breakpoint
ALTER TABLE "driverStats" RENAME COLUMN "total_distance" TO "totalDistance";--> statement-breakpoint
ALTER TABLE "driverStats" RENAME COLUMN "total_earnings" TO "totalEarnings";--> statement-breakpoint
ALTER TABLE "driverStats" RENAME COLUMN "average_rating" TO "averageRating";--> statement-breakpoint
ALTER TABLE "driverStats" RENAME COLUMN "completed_rides_this_month" TO "completedRidesThisMonth";--> statement-breakpoint
ALTER TABLE "driverStats" RENAME COLUMN "completed_rides_this_year" TO "completedRidesThisYear";--> statement-breakpoint
ALTER TABLE "driverStats" RENAME COLUMN "partnership_level" TO "partnershipLevel";--> statement-breakpoint
ALTER TABLE "driverStats" RENAME COLUMN "last_ride_date" TO "lastRideDate";--> statement-breakpoint
ALTER TABLE "driverStats" RENAME COLUMN "joined_at" TO "joinedAt";--> statement-breakpoint
ALTER TABLE "driverStats" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "eventManagers" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "eventManagers" RENAME COLUMN "company_name" TO "companyName";--> statement-breakpoint
ALTER TABLE "eventManagers" RENAME COLUMN "company_type" TO "companyType";--> statement-breakpoint
ALTER TABLE "eventManagers" RENAME COLUMN "contact_email" TO "contactEmail";--> statement-breakpoint
ALTER TABLE "eventManagers" RENAME COLUMN "contact_phone" TO "contactPhone";--> statement-breakpoint
ALTER TABLE "eventManagers" RENAME COLUMN "is_verified" TO "isVerified";--> statement-breakpoint
ALTER TABLE "eventManagers" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "eventManagers" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "hotelFinancialReports" RENAME COLUMN "accommodation_id" TO "accommodationId";--> statement-breakpoint
ALTER TABLE "hotelFinancialReports" RENAME COLUMN "report_date" TO "reportDate";--> statement-breakpoint
ALTER TABLE "hotelFinancialReports" RENAME COLUMN "report_type" TO "reportType";--> statement-breakpoint
ALTER TABLE "hotelFinancialReports" RENAME COLUMN "total_revenue" TO "totalRevenue";--> statement-breakpoint
ALTER TABLE "hotelFinancialReports" RENAME COLUMN "room_revenue" TO "roomRevenue";--> statement-breakpoint
ALTER TABLE "hotelFinancialReports" RENAME COLUMN "service_revenue" TO "serviceRevenue";--> statement-breakpoint
ALTER TABLE "hotelFinancialReports" RENAME COLUMN "total_bookings" TO "totalBookings";--> statement-breakpoint
ALTER TABLE "hotelFinancialReports" RENAME COLUMN "confirmed_bookings" TO "confirmedBookings";--> statement-breakpoint
ALTER TABLE "hotelFinancialReports" RENAME COLUMN "cancelled_bookings" TO "cancelledBookings";--> statement-breakpoint
ALTER TABLE "hotelFinancialReports" RENAME COLUMN "no_show_bookings" TO "noShowBookings";--> statement-breakpoint
ALTER TABLE "hotelFinancialReports" RENAME COLUMN "total_rooms" TO "totalRooms";--> statement-breakpoint
ALTER TABLE "hotelFinancialReports" RENAME COLUMN "occupied_rooms" TO "occupiedRooms";--> statement-breakpoint
ALTER TABLE "hotelFinancialReports" RENAME COLUMN "occupancy_rate" TO "occupancyRate";--> statement-breakpoint
ALTER TABLE "hotelFinancialReports" RENAME COLUMN "average_daily_rate" TO "averageDailyRate";--> statement-breakpoint
ALTER TABLE "hotelFinancialReports" RENAME COLUMN "revenue_per_available_room" TO "revenuePerAvailableRoom";--> statement-breakpoint
ALTER TABLE "hotelFinancialReports" RENAME COLUMN "platform_fees" TO "platformFees";--> statement-breakpoint
ALTER TABLE "hotelFinancialReports" RENAME COLUMN "net_revenue" TO "netRevenue";--> statement-breakpoint
ALTER TABLE "hotelFinancialReports" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "hotelRooms" RENAME COLUMN "accommodation_id" TO "accommodationId";--> statement-breakpoint
ALTER TABLE "hotelRooms" RENAME COLUMN "room_number" TO "roomNumber";--> statement-breakpoint
ALTER TABLE "hotelRooms" RENAME COLUMN "room_type" TO "roomType";--> statement-breakpoint
ALTER TABLE "hotelRooms" RENAME COLUMN "base_price" TO "basePrice";--> statement-breakpoint
ALTER TABLE "hotelRooms" RENAME COLUMN "weekend_price" TO "weekendPrice";--> statement-breakpoint
ALTER TABLE "hotelRooms" RENAME COLUMN "holiday_price" TO "holidayPrice";--> statement-breakpoint
ALTER TABLE "hotelRooms" RENAME COLUMN "max_occupancy" TO "maxOccupancy";--> statement-breakpoint
ALTER TABLE "hotelRooms" RENAME COLUMN "bed_type" TO "bedType";--> statement-breakpoint
ALTER TABLE "hotelRooms" RENAME COLUMN "bed_count" TO "bedCount";--> statement-breakpoint
ALTER TABLE "hotelRooms" RENAME COLUMN "has_private_bathroom" TO "hasPrivateBathroom";--> statement-breakpoint
ALTER TABLE "hotelRooms" RENAME COLUMN "has_air_conditioning" TO "hasAirConditioning";--> statement-breakpoint
ALTER TABLE "hotelRooms" RENAME COLUMN "has_wifi" TO "hasWifi";--> statement-breakpoint
ALTER TABLE "hotelRooms" RENAME COLUMN "has_tv" TO "hasTV";--> statement-breakpoint
ALTER TABLE "hotelRooms" RENAME COLUMN "has_balcony" TO "hasBalcony";--> statement-breakpoint
ALTER TABLE "hotelRooms" RENAME COLUMN "has_kitchen" TO "hasKitchen";--> statement-breakpoint
ALTER TABLE "hotelRooms" RENAME COLUMN "room_amenities" TO "roomAmenities";--> statement-breakpoint
ALTER TABLE "hotelRooms" RENAME COLUMN "is_available" TO "isAvailable";--> statement-breakpoint
ALTER TABLE "hotelRooms" RENAME COLUMN "maintenance_until" TO "maintenanceUntil";--> statement-breakpoint
ALTER TABLE "hotelRooms" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "hotelRooms" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "loyaltyProgram" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "loyaltyProgram" RENAME COLUMN "total_points" TO "totalPoints";--> statement-breakpoint
ALTER TABLE "loyaltyProgram" RENAME COLUMN "current_points" TO "currentPoints";--> statement-breakpoint
ALTER TABLE "loyaltyProgram" RENAME COLUMN "membership_level" TO "membershipLevel";--> statement-breakpoint
ALTER TABLE "loyaltyProgram" RENAME COLUMN "joined_at" TO "joinedAt";--> statement-breakpoint
ALTER TABLE "loyaltyProgram" RENAME COLUMN "last_activity_at" TO "lastActivityAt";--> statement-breakpoint
ALTER TABLE "loyaltyProgram" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "loyaltyRewards" RENAME COLUMN "reward_type" TO "rewardType";--> statement-breakpoint
ALTER TABLE "loyaltyRewards" RENAME COLUMN "points_cost" TO "pointsCost";--> statement-breakpoint
ALTER TABLE "loyaltyRewards" RENAME COLUMN "discount_value" TO "discountValue";--> statement-breakpoint
ALTER TABLE "loyaltyRewards" RENAME COLUMN "minimum_level" TO "minimumLevel";--> statement-breakpoint
ALTER TABLE "loyaltyRewards" RENAME COLUMN "is_active" TO "isActive";--> statement-breakpoint
ALTER TABLE "loyaltyRewards" RENAME COLUMN "max_redemptions" TO "maxRedemptions";--> statement-breakpoint
ALTER TABLE "loyaltyRewards" RENAME COLUMN "valid_until" TO "validUntil";--> statement-breakpoint
ALTER TABLE "loyaltyRewards" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "loyaltyRewards" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "partnershipApplications" RENAME COLUMN "proposal_id" TO "proposalId";--> statement-breakpoint
ALTER TABLE "partnershipApplications" RENAME COLUMN "driver_id" TO "driverId";--> statement-breakpoint
ALTER TABLE "partnershipApplications" RENAME COLUMN "application_date" TO "applicationDate";--> statement-breakpoint
ALTER TABLE "partnershipApplications" RENAME COLUMN "accepted_at" TO "acceptedAt";--> statement-breakpoint
ALTER TABLE "partnershipApplications" RENAME COLUMN "completed_at" TO "completedAt";--> statement-breakpoint
ALTER TABLE "partnershipApplications" RENAME COLUMN "estimated_completion" TO "estimatedCompletion";--> statement-breakpoint
ALTER TABLE "partnershipApplications" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "partnershipApplications" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "hotel_id" TO "hotelId";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "proposal_type" TO "proposalType";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "target_regions" TO "targetRegions";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "minimum_driver_level" TO "minimumDriverLevel";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "required_vehicle_type" TO "requiredVehicleType";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "start_date" TO "startDate";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "end_date" TO "endDate";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "specific_dates" TO "specificDates";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "time_slots" TO "timeSlots";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "base_payment_mzn" TO "basePaymentMzn";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "bonus_payment_mzn" TO "bonusPaymentMzn";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "premium_rate" TO "premiumRate";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "offer_free_accommodation" TO "offerFreeAccommodation";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "offer_meals" TO "offerMeals";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "offer_fuel" TO "offerFuel";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "additional_benefits" TO "additionalBenefits";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "max_drivers_needed" TO "maxDriversNeeded";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "current_applicants" TO "currentApplicants";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "minimum_rides" TO "minimumRides";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "estimated_earnings" TO "estimatedEarnings";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "featured_until" TO "featuredUntil";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "contact_method" TO "contactMethod";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "application_deadline" TO "applicationDeadline";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "requires_interview" TO "requiresInterview";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "partnershipProposals" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "pickupRequests" RENAME COLUMN "ride_id" TO "rideId";--> statement-breakpoint
ALTER TABLE "pickupRequests" RENAME COLUMN "passenger_id" TO "passengerId";--> statement-breakpoint
ALTER TABLE "pickupRequests" RENAME COLUMN "driver_id" TO "driverId";--> statement-breakpoint
ALTER TABLE "pickupRequests" RENAME COLUMN "pickup_location" TO "pickupLocation";--> statement-breakpoint
ALTER TABLE "pickupRequests" RENAME COLUMN "pickup_lat" TO "pickupLat";--> statement-breakpoint
ALTER TABLE "pickupRequests" RENAME COLUMN "pickup_lng" TO "pickupLng";--> statement-breakpoint
ALTER TABLE "pickupRequests" RENAME COLUMN "destination_location" TO "destinationLocation";--> statement-breakpoint
ALTER TABLE "pickupRequests" RENAME COLUMN "destination_lat" TO "destinationLat";--> statement-breakpoint
ALTER TABLE "pickupRequests" RENAME COLUMN "destination_lng" TO "destinationLng";--> statement-breakpoint
ALTER TABLE "pickupRequests" RENAME COLUMN "requested_seats" TO "requestedSeats";--> statement-breakpoint
ALTER TABLE "pickupRequests" RENAME COLUMN "proposed_price" TO "proposedPrice";--> statement-breakpoint
ALTER TABLE "pickupRequests" RENAME COLUMN "estimated_detour" TO "estimatedDetour";--> statement-breakpoint
ALTER TABLE "pickupRequests" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "pickupRequests" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "pointsHistory" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "pointsHistory" RENAME COLUMN "loyalty_id" TO "loyaltyId";--> statement-breakpoint
ALTER TABLE "pointsHistory" RENAME COLUMN "action_type" TO "actionType";--> statement-breakpoint
ALTER TABLE "pointsHistory" RENAME COLUMN "points_amount" TO "pointsAmount";--> statement-breakpoint
ALTER TABLE "pointsHistory" RENAME COLUMN "related_id" TO "relatedId";--> statement-breakpoint
ALTER TABLE "pointsHistory" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "priceNegotiations" RENAME COLUMN "ride_id" TO "rideId";--> statement-breakpoint
ALTER TABLE "priceNegotiations" RENAME COLUMN "passenger_id" TO "passengerId";--> statement-breakpoint
ALTER TABLE "priceNegotiations" RENAME COLUMN "driver_id" TO "driverId";--> statement-breakpoint
ALTER TABLE "priceNegotiations" RENAME COLUMN "original_price" TO "originalPrice";--> statement-breakpoint
ALTER TABLE "priceNegotiations" RENAME COLUMN "proposed_price" TO "proposedPrice";--> statement-breakpoint
ALTER TABLE "priceNegotiations" RENAME COLUMN "counter_price" TO "counterPrice";--> statement-breakpoint
ALTER TABLE "priceNegotiations" RENAME COLUMN "expires_at" TO "expiresAt";--> statement-breakpoint
ALTER TABLE "priceNegotiations" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "priceNegotiations" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "priceRegulations" RENAME COLUMN "ride_type" TO "rideType";--> statement-breakpoint
ALTER TABLE "priceRegulations" RENAME COLUMN "min_price_per_km" TO "minPricePerKm";--> statement-breakpoint
ALTER TABLE "priceRegulations" RENAME COLUMN "max_price_per_km" TO "maxPricePerKm";--> statement-breakpoint
ALTER TABLE "priceRegulations" RENAME COLUMN "base_fare" TO "baseFare";--> statement-breakpoint
ALTER TABLE "priceRegulations" RENAME COLUMN "is_active" TO "isActive";--> statement-breakpoint
ALTER TABLE "priceRegulations" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "priceRegulations" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "rewardRedemptions" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "rewardRedemptions" RENAME COLUMN "reward_id" TO "rewardId";--> statement-breakpoint
ALTER TABLE "rewardRedemptions" RENAME COLUMN "points_used" TO "pointsUsed";--> statement-breakpoint
ALTER TABLE "rewardRedemptions" RENAME COLUMN "expires_at" TO "expiresAt";--> statement-breakpoint
ALTER TABLE "rewardRedemptions" RENAME COLUMN "used_at" TO "usedAt";--> statement-breakpoint
ALTER TABLE "rewardRedemptions" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "roomTypes" RENAME COLUMN "accommodation_id" TO "accommodationId";--> statement-breakpoint
ALTER TABLE "roomTypes" RENAME COLUMN "price_per_night" TO "pricePerNight";--> statement-breakpoint
ALTER TABLE "systemSettings" RENAME COLUMN "updated_by" TO "updatedBy";--> statement-breakpoint
ALTER TABLE "systemSettings" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "systemSettings" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "driverStats" DROP CONSTRAINT "driver_stats_driver_id_unique";--> statement-breakpoint
ALTER TABLE "systemSettings" DROP CONSTRAINT "system_settings_key_unique";--> statement-breakpoint
ALTER TABLE "accommodations" DROP CONSTRAINT "accommodations_host_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_ride_id_rides_id_fk";
--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_passenger_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_accommodation_id_accommodations_id_fk";
--> statement-breakpoint
ALTER TABLE "events" DROP CONSTRAINT "events_organizer_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "events" DROP CONSTRAINT "events_manager_id_event_managers_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_booking_id_bookings_id_fk";
--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "ratings" DROP CONSTRAINT "ratings_from_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "ratings" DROP CONSTRAINT "ratings_to_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "rides" DROP CONSTRAINT "rides_driver_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "adminActions" DROP CONSTRAINT "admin_actions_admin_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "adminActions" DROP CONSTRAINT "admin_actions_target_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "chatMessages" DROP CONSTRAINT "chat_messages_chat_room_id_chat_rooms_id_fk";
--> statement-breakpoint
ALTER TABLE "chatMessages" DROP CONSTRAINT "chat_messages_from_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "chatMessages" DROP CONSTRAINT "chat_messages_to_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "chatRooms" DROP CONSTRAINT "chat_rooms_participant_one_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "chatRooms" DROP CONSTRAINT "chat_rooms_participant_two_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "driverDocuments" DROP CONSTRAINT "driver_documents_driver_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "driverStats" DROP CONSTRAINT "driver_stats_driver_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "eventManagers" DROP CONSTRAINT "event_managers_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "hotelFinancialReports" DROP CONSTRAINT "hotel_financial_reports_accommodation_id_accommodations_id_fk";
--> statement-breakpoint
ALTER TABLE "hotelRooms" DROP CONSTRAINT "hotel_rooms_accommodation_id_accommodations_id_fk";
--> statement-breakpoint
ALTER TABLE "loyaltyProgram" DROP CONSTRAINT "loyalty_program_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "partnershipApplications" DROP CONSTRAINT "partnership_applications_proposal_id_partnership_proposals_id_fk";
--> statement-breakpoint
ALTER TABLE "partnershipApplications" DROP CONSTRAINT "partnership_applications_driver_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "partnershipProposals" DROP CONSTRAINT "partnership_proposals_hotel_id_accommodations_id_fk";
--> statement-breakpoint
ALTER TABLE "pickupRequests" DROP CONSTRAINT "pickup_requests_ride_id_rides_id_fk";
--> statement-breakpoint
ALTER TABLE "pickupRequests" DROP CONSTRAINT "pickup_requests_passenger_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "pickupRequests" DROP CONSTRAINT "pickup_requests_driver_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "pointsHistory" DROP CONSTRAINT "points_history_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "pointsHistory" DROP CONSTRAINT "points_history_loyalty_id_loyalty_program_id_fk";
--> statement-breakpoint
ALTER TABLE "priceNegotiations" DROP CONSTRAINT "price_negotiations_ride_id_rides_id_fk";
--> statement-breakpoint
ALTER TABLE "priceNegotiations" DROP CONSTRAINT "price_negotiations_passenger_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "priceNegotiations" DROP CONSTRAINT "price_negotiations_driver_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "rewardRedemptions" DROP CONSTRAINT "reward_redemptions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "rewardRedemptions" DROP CONSTRAINT "reward_redemptions_reward_id_loyalty_rewards_id_fk";
--> statement-breakpoint
ALTER TABLE "roomTypes" DROP CONSTRAINT "room_types_accommodation_id_accommodations_id_fk";
--> statement-breakpoint
ALTER TABLE "accommodations" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "accommodations" ALTER COLUMN "images" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "accommodations" ALTER COLUMN "amenities" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "images" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "tags" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "socialMediaLinks" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "ratings" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "roles" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "adminActions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "chatMessages" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "chatRooms" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "driverDocuments" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "driverStats" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "eventManagers" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "hotelFinancialReports" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "hotelRooms" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "hotelRooms" ALTER COLUMN "images" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "hotelRooms" ALTER COLUMN "roomAmenities" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "loyaltyProgram" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "loyaltyRewards" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "partnershipApplications" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "partnershipProposals" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "partnershipProposals" ALTER COLUMN "targetRegions" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "partnershipProposals" ALTER COLUMN "specificDates" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "partnershipProposals" ALTER COLUMN "timeSlots" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "partnershipProposals" ALTER COLUMN "additionalBenefits" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "pickupRequests" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "pointsHistory" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "priceNegotiations" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "priceRegulations" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "rewardRedemptions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "roomTypes" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "systemSettings" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "rides" ADD COLUMN "driverName" text;--> statement-breakpoint
ALTER TABLE "rides" ADD COLUMN "fromAddress" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "rides" ADD COLUMN "toAddress" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "rides" ADD COLUMN "maxPassengers" integer DEFAULT 4;--> statement-breakpoint
ALTER TABLE "rides" ADD COLUMN "updatedAt" timestamp DEFAULT now();--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accommodations" ADD CONSTRAINT "accommodations_hostId_users_id_fk" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookings" ADD CONSTRAINT "bookings_rideId_rides_id_fk" FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookings" ADD CONSTRAINT "bookings_passengerId_users_id_fk" FOREIGN KEY ("passengerId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookings" ADD CONSTRAINT "bookings_accommodationId_accommodations_id_fk" FOREIGN KEY ("accommodationId") REFERENCES "accommodations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_organizerId_users_id_fk" FOREIGN KEY ("organizerId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_managerId_eventManagers_id_fk" FOREIGN KEY ("managerId") REFERENCES "eventManagers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_bookings_id_fk" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ratings" ADD CONSTRAINT "ratings_fromUserId_users_id_fk" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ratings" ADD CONSTRAINT "ratings_toUserId_users_id_fk" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rides" ADD CONSTRAINT "rides_driverId_users_id_fk" FOREIGN KEY ("driverId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "adminActions" ADD CONSTRAINT "adminActions_adminId_users_id_fk" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "adminActions" ADD CONSTRAINT "adminActions_targetUserId_users_id_fk" FOREIGN KEY ("targetUserId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chatMessages" ADD CONSTRAINT "chatMessages_chatRoomId_chatRooms_id_fk" FOREIGN KEY ("chatRoomId") REFERENCES "chatRooms"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chatMessages" ADD CONSTRAINT "chatMessages_fromUserId_users_id_fk" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chatMessages" ADD CONSTRAINT "chatMessages_toUserId_users_id_fk" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chatRooms" ADD CONSTRAINT "chatRooms_participantOneId_users_id_fk" FOREIGN KEY ("participantOneId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chatRooms" ADD CONSTRAINT "chatRooms_participantTwoId_users_id_fk" FOREIGN KEY ("participantTwoId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "driverDocuments" ADD CONSTRAINT "driverDocuments_driverId_users_id_fk" FOREIGN KEY ("driverId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "driverStats" ADD CONSTRAINT "driverStats_driverId_users_id_fk" FOREIGN KEY ("driverId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "eventManagers" ADD CONSTRAINT "eventManagers_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hotelFinancialReports" ADD CONSTRAINT "hotelFinancialReports_accommodationId_accommodations_id_fk" FOREIGN KEY ("accommodationId") REFERENCES "accommodations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hotelRooms" ADD CONSTRAINT "hotelRooms_accommodationId_accommodations_id_fk" FOREIGN KEY ("accommodationId") REFERENCES "accommodations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "loyaltyProgram" ADD CONSTRAINT "loyaltyProgram_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "partnershipApplications" ADD CONSTRAINT "partnershipApplications_proposalId_partnershipProposals_id_fk" FOREIGN KEY ("proposalId") REFERENCES "partnershipProposals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "partnershipApplications" ADD CONSTRAINT "partnershipApplications_driverId_users_id_fk" FOREIGN KEY ("driverId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "partnershipProposals" ADD CONSTRAINT "partnershipProposals_hotelId_accommodations_id_fk" FOREIGN KEY ("hotelId") REFERENCES "accommodations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pickupRequests" ADD CONSTRAINT "pickupRequests_rideId_rides_id_fk" FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pickupRequests" ADD CONSTRAINT "pickupRequests_passengerId_users_id_fk" FOREIGN KEY ("passengerId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pickupRequests" ADD CONSTRAINT "pickupRequests_driverId_users_id_fk" FOREIGN KEY ("driverId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pointsHistory" ADD CONSTRAINT "pointsHistory_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pointsHistory" ADD CONSTRAINT "pointsHistory_loyaltyId_loyaltyProgram_id_fk" FOREIGN KEY ("loyaltyId") REFERENCES "loyaltyProgram"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "priceNegotiations" ADD CONSTRAINT "priceNegotiations_rideId_rides_id_fk" FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "priceNegotiations" ADD CONSTRAINT "priceNegotiations_passengerId_users_id_fk" FOREIGN KEY ("passengerId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "priceNegotiations" ADD CONSTRAINT "priceNegotiations_driverId_users_id_fk" FOREIGN KEY ("driverId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rewardRedemptions" ADD CONSTRAINT "rewardRedemptions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rewardRedemptions" ADD CONSTRAINT "rewardRedemptions_rewardId_loyaltyRewards_id_fk" FOREIGN KEY ("rewardId") REFERENCES "loyaltyRewards"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roomTypes" ADD CONSTRAINT "roomTypes_accommodationId_accommodations_id_fk" FOREIGN KEY ("accommodationId") REFERENCES "accommodations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN IF EXISTS "from_location";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN IF EXISTS "to_location";--> statement-breakpoint
ALTER TABLE "driverStats" ADD CONSTRAINT "driverStats_driverId_unique" UNIQUE("driverId");--> statement-breakpoint
ALTER TABLE "systemSettings" ADD CONSTRAINT "systemSettings_key_unique" UNIQUE("key");