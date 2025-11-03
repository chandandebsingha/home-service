import {
	pgTable,
	serial,
	text,
	timestamp,
	boolean,
	integer,
	uniqueIndex,
	pgEnum,
	numeric,
	index,
} from "drizzle-orm/pg-core";
export const roleEnum = pgEnum("role", ["user", "admin", "partner"]);
// Users table
export const users = pgTable(
	"users",
	{
		id: serial("id").primaryKey(),
		supabaseUid: text("supabase_uid").unique().notNull(),
		email: text("email").notNull().unique(),
		passwordHash: text("password_hash"),
		fullName: text("full_name").notNull(),
		role: roleEnum("role").default("user"),
		isEmailVerified: boolean("is_email_verified").default(false).notNull(),
		lastLogin: timestamp("last_login"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => {
		return {
			emailIdx: uniqueIndex("email_idx").on(table.email),
			supabaseUidIdx: uniqueIndex("supabase_uid_idx").on(table.supabaseUid),
		};
	}
);

export const address = pgTable("address", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.references(() => users.id)
		.notNull(),
	street: text("street").notNull(),
	landmark: text("landmark"),
	apartment: text("apartment"),
	city: text("city").notNull(),
	state: text("state").notNull(),
	pinCode: text("pin_code").notNull(),
	country: text("country").notNull(),
	latitude: numeric("latitude", { precision: 10, scale: 8 }),
	longitude: numeric("longitude", { precision: 11, scale: 8 }),
	isDefault: boolean("is_default").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User sessions table
export const userSessions = pgTable("user_sessions", {
	id: serial("id").primaryKey(),
	userId: integer("user_id").references(() => users.id),
	token: text("token").notNull(),
	deviceInfo: text("device_info"),
	ipAddress: text("ip_address"),
	expiresAt: timestamp("expires_at").notNull(),
	isValid: boolean("is_valid").default(true),
	createdAt: timestamp("created_at").defaultNow(),
});

// Service categories
export const serviceCategories = pgTable("service_categories", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	emoji: text("emoji"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Service types (sub-categories) under a category
export const serviceTypes = pgTable("service_types", {
	id: serial("id").primaryKey(),
	categoryId: integer("category_id").references(() => serviceCategories.id),
	name: text("name").notNull(),
	description: text("description"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	price: integer("price").notNull(),
	// legacy free-text service type for backward compatibility
	serviceType: text("service_type"),
	// new relational fields
	categoryId: integer("category_id").references(() => serviceCategories.id),
	serviceTypeId: integer("service_type_id").references(() => serviceTypes.id),
	providerId: integer("provider_id").references(() => users.id), // Service provider who created this service
	durationMinutes: integer("duration_minutes"),
	availability: boolean("availability").default(true).notNull(),
	timeSlots: text("time_slots"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Occupations table (managed by admin only)
export const occupations = pgTable("occupations", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Provider profiles table
export const providerProfiles = pgTable("provider_profiles", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.references(() => users.id)
		.notNull()
		.unique(),
	occupationId: integer("occupation_id").references(() => occupations.id),
	businessName: text("business_name"),
	businessAddress: text("business_address"), // Legacy field, kept for backward compatibility
	addressId: integer("address_id").references(() => address.id), // New field for relational address
	phoneNumber: text("phone_number"),
	experience: text("experience"), // years of experience
	skills: text("skills"), // JSON array of skills
	certifications: text("certifications"), // JSON array of certifications
	bio: text("bio"),
	isVerified: boolean("is_verified").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.references(() => users.id)
		.notNull(),
	serviceId: integer("service_id")
		.references(() => services.id)
		.notNull(),
	date: text("date").notNull(),
	time: text("time").notNull(),
	address: text("address").notNull(),
	specialInstructions: text("special_instructions"),
	price: integer("price").notNull(),
	status: text("status").default("upcoming").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reviews for completed bookings
export const reviewTargetEnum = pgEnum("review_target", ["provider", "customer"]);

export const reviews = pgTable(
	"reviews",
	{
		id: serial("id").primaryKey(),
		bookingId: integer("booking_id")
			.references(() => bookings.id)
			.notNull(),
		userId: integer("user_id").references(() => users.id), // legacy creator id
		serviceId: integer("service_id").references(() => services.id),
		providerId: integer("provider_id").references(() => users.id), // legacy denorm
		reviewerId: integer("reviewer_id").references(() => users.id).notNull(),
		revieweeId: integer("reviewee_id").references(() => users.id).notNull(),
		target: reviewTargetEnum("target").notNull(),
		rating: integer("rating").notNull(),
		comment: text("comment"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		bookingTargetUnique: uniqueIndex("reviews_booking_target_unique").on(
			table.bookingId,
			table.target
		),
		userIdx: index("reviews_user_idx").on(table.userId),
		serviceIdx: index("reviews_service_idx").on(table.serviceId),
		providerIdx: index("reviews_provider_idx").on(table.providerId),
		reviewerIdx: index("reviews_reviewer_idx").on(table.reviewerId),
		revieweeIdx: index("reviews_reviewee_idx").on(table.revieweeId),
	})
);

// Provider rates the customer after a completed booking

export const emailVerificationTokens = pgTable(
	"email_verification_tokens",
	{
		id: serial("id").primaryKey(),
		userId: integer("user_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
		email: text("email").notNull(),
		otpHash: text("otp_hash").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		attempts: integer("attempts").default(0).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		userIdIdx: index("email_verification_tokens_user_id_idx").on(table.userId),
		emailIdx: index("email_verification_tokens_email_idx").on(table.email),
	})
);

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type NewServiceCategory = typeof serviceCategories.$inferInsert;
export type ServiceType = typeof serviceTypes.$inferSelect;
export type NewServiceType = typeof serviceTypes.$inferInsert;
export type Occupation = typeof occupations.$inferSelect;
export type NewOccupation = typeof occupations.$inferInsert;
export type ProviderProfile = typeof providerProfiles.$inferSelect;
export type NewProviderProfile = typeof providerProfiles.$inferInsert;
export type Address = typeof address.$inferSelect;
export type EmailVerificationToken =
	typeof emailVerificationTokens.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
