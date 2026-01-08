import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Create Lead (Save email/name/answers)
  app.post(api.leads.create.path, async (req, res) => {
    try {
      const input = api.leads.create.input.parse(req.body);
      const lead = await storage.createLead(input);
      res.status(201).json(lead);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Get Lead/Plan
  app.get(api.leads.get.path, async (req, res) => {
    const lead = await storage.getLead(Number(req.params.id));
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json(lead);
  });

  // Generate Plan (AI)
  app.post(api.ai.generatePlan.path, async (req, res) => {
    try {
      const input = api.ai.generatePlan.input.parse(req.body);
      
      // Prompt construction based on user profile logic
      // We map the 6 profiles from the prompt
      const prompt = `
        You are an expert behavioral scientist and habit coach.
        Analyze the following user quiz answers and generate a personalized learning plan.
        
        User Name: ${input.name}
        Quiz Answers: ${JSON.stringify(input.answers)}
        
        Determine the user's "Profile" from these 6 types:
        1. The Distracted Sprinter (phone distracts)
        2. The Overthinker (paralysis by analysis)
        3. The Burnt-Out High-Achiever (low energy, busy)
        4. The Inconsistent Starter (starts and stops)
        5. The Busy Optimizer (wants ROI)
        6. The Creative Drifter (many ideas, no finish)
        
        Also determine:
        - Battery Level (Low/Medium/High)
        - Main Blocker
        - Secondary Blocker
        - Skill Track (e.g. "Focus Mastery", "Deep Work", etc.)
        
        Then create a 4-week summary plan (1 sentence per week) and a Daily Mission example.
        
        Return JSON ONLY in this format:
        {
          "profile": {
            "type": "Profile Name",
            "batteryLevel": "Low",
            "mainBlocker": "...",
            "secondaryBlocker": "...",
            "skillTrack": "..."
          },
          "weeklyPlan": {
            "week1": "...",
            "week2": "...",
            "week3": "...",
            "week4": "..."
          },
          "dailyMission": "..."
        }
      `;

      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4o",
        response_format: { type: "json_object" },
      });

      const plan = JSON.parse(completion.choices[0].message.content || "{}");
      
      res.json(plan);
    } catch (err) {
      console.error("AI Generation Error:", err);
      res.status(500).json({ message: "Failed to generate plan" });
    }
  });

  // Stripe config endpoint
  app.get("/api/stripe/config", async (_req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (err) {
      console.error("Stripe config error:", err);
      res.status(500).json({ message: "Failed to get Stripe config" });
    }
  });

  // Create payment intent
  app.post("/api/stripe/create-payment-intent", async (req, res) => {
    try {
      const { planId } = req.body;
      
      const prices: Record<string, number> = {
        "1week": 1050,
        "4week": 1999,
        "12week": 3499,
      };

      const amount = prices[planId] || 1999;
      
      const stripe = await getUncachableStripeClient();
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "brl",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          planId,
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
      console.error("Payment intent error:", err);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  return httpServer;
}
