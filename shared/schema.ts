import { pgTable, text, serial, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name"),
  quizData: jsonb("quiz_data").notNull(), // Stores all answers from the quiz
  planData: jsonb("plan_data"), // Stores the generated 4-week plan
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
// No relations for now

// === BASE SCHEMAS ===
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true, planData: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

// Request types
export type CreateLeadRequest = InsertLead;

// Plan Generation types
export interface GeneratePlanRequest {
  answers: Record<string, any>;
  name: string;
}

export interface PlanResponse {
  profile: {
    type: string; // e.g. "The Distracted Sprinter"
    batteryLevel: "Low" | "Medium" | "High";
    mainBlocker: string;
    secondaryBlocker: string;
    skillTrack: string;
  };
  weeklyPlan: {
    week1: string;
    week2: string;
    week3: string;
    week4: string;
  };
  dailyMission: string;
}
