import {
  pgTable,
  text,
  timestamp,
  uuid,
  numeric,
  jsonb,
  pgEnum,
  index,
  integer,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
]);

export const bannerStatusEnum = pgEnum("banner_status", [
  "generating",
  "ready",
  "failed",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  imageUrl: text("image_url"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type OrderLineItem = {
  name: string;
  qty: number;
  /** Line total (qty × unit), GST-inclusive, AUD dollars. */
  amount: number;
  productId?: string | null;
};

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    stripeSessionId: text("stripe_session_id").notNull().unique(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    email: text("email").notNull(),
    fullName: text("full_name"),
    phone: text("phone"),
    shippingAddress: text("shipping_address"),
    items: jsonb("items").$type<OrderLineItem[]>().default([]).notNull(),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    gst: numeric("gst", { precision: 10, scale: 2 }).notNull(),
    shipping: numeric("shipping", { precision: 10, scale: 2 }).notNull(),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("AUD"),
    status: text("status").notNull().default("paid"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("orders_user_idx").on(table.userId),
    createdAtIdx: index("orders_created_at_idx").on(table.createdAt),
  }),
);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    confirmationCode: text("confirmation_code").notNull().unique(),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    serviceId: text("service_id").notNull(),
    serviceName: text("service_name").notNull(),
    vehicleType: text("vehicle_type").notNull(),
    location: text("location").notNull().default("loganholme"),
    date: text("date").notNull(),
    time: text("time").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    address: text("address").notNull(),
    notes: text("notes"),
    extras: jsonb("extras").$type<string[]>().default([]).notNull(),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    gst: numeric("gst", { precision: 10, scale: 2 }).notNull(),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    status: bookingStatusEnum("status").notNull().default("pending"),
    paymentMethod: text("payment_method").notNull().default("pay_on_collection"),
    paymentStatus: text("payment_status").notNull().default("unpaid"),
    stripeSessionId: text("stripe_session_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("bookings_user_idx").on(table.userId),
    dateIdx: index("bookings_date_idx").on(table.date),
    createdAtIdx: index("bookings_created_at_idx").on(table.createdAt),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  orders: many(orders),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
}));

export type ProductImage = { url: string; publicId?: string | null };

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    tagline: text("tagline").notNull(),
    description: text("description").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    category: text("category").notNull(),
    features: jsonb("features").$type<string[]>().notNull().default([]),
    images: jsonb("images").$type<ProductImage[]>().notNull().default([]),
    badge: text("badge"),
    brand: text("brand"),
    sku: text("sku"),
    sourceUrl: text("source_url"),
    inStock: boolean("in_stock").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    sortIdx: index("products_sort_idx").on(table.sortOrder),
  }),
);

export const servicePriceOverrides = pgTable(
  "service_price_overrides",
  {
    serviceId: text("service_id").notNull(),
    vehicleType: text("vehicle_type").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.serviceId, table.vehicleType] }),
  }),
);

export const extraPriceOverrides = pgTable(
  "extra_price_overrides",
  {
    extraId: text("extra_id").notNull(),
    vehicleType: text("vehicle_type").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.extraId, table.vehicleType] }),
  }),
);

/**
 * AI-generated marketing banners. Created via the admin banner chat
 * (`/hyperdome-dashboard/banners`): the agent generates a design in Canva,
 * exports it, and the export is mirrored into Cloudinary (permanent) here.
 * `isLive` is exclusive *per slot* — only one banner renders in a given
 * slot on the public site at a time (enforced transactionally in
 * `setBannerLive`). `href` is where the banner links to when clicked.
 */
export const banners = pgTable(
  "banners",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    prompt: text("prompt").notNull(),
    canvaDesignId: text("canva_design_id"),
    cloudinaryUrl: text("cloudinary_url"),
    cloudinaryPublicId: text("cloudinary_public_id"),
    width: integer("width"),
    height: integer("height"),
    altText: text("alt_text"),
    href: text("href").notNull().default("#booking"),
    status: bannerStatusEnum("status").notNull().default("generating"),
    isLive: boolean("is_live").notNull().default(false),
    slot: text("slot").notNull().default("homepage-hero"),
    createdBy: text("created_by"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    liveIdx: index("banners_live_idx").on(table.slot, table.isLive),
    createdAtIdx: index("banners_created_at_idx").on(table.createdAt),
  }),
);

/**
 * Singleton store (one row, `id = 1`) for the business's shared Canva Connect
 * OAuth credentials. The refresh token rotates on every use, so it must live
 * in the DB (not env) and be written transactionally — see `src/lib/canva`.
 */
export const canvaOauth = pgTable("canva_oauth", {
  id: integer("id").primaryKey().default(1),
  refreshToken: text("refresh_token").notNull(),
  accessToken: text("access_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type BannerRow = typeof banners.$inferSelect;
export type NewBannerRow = typeof banners.$inferInsert;
export type CanvaOauthRow = typeof canvaOauth.$inferSelect;

export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;
export type ServicePriceOverride = typeof servicePriceOverrides.$inferSelect;
export type ExtraPriceOverride = typeof extraPriceOverrides.$inferSelect;

export const insertBookingSchema = createInsertSchema(bookings);
export const selectBookingSchema = createSelectSchema(bookings);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
