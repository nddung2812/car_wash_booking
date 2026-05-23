import {
  pgTable,
  text,
  timestamp,
  uuid,
  numeric,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
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

export const insertBookingSchema = createInsertSchema(bookings);
export const selectBookingSchema = createSelectSchema(bookings);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
