import { db } from "./db";
import { leads, type InsertLead, type Lead } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  createLead(lead: InsertLead): Promise<Lead>;
  getLead(id: number): Promise<Lead | undefined>;
  updateLeadPlan(id: number, planData: any): Promise<Lead>;
}

export class DatabaseStorage implements IStorage {
  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }

  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async updateLeadPlan(id: number, planData: any): Promise<Lead> {
    const [updated] = await db
      .update(leads)
      .set({ planData })
      .where(eq(leads.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
