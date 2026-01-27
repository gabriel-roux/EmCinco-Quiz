import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { sendFacebookEvent, type FacebookEventName } from "./facebookCapi";
import { getInitialPaymentAmount, getStripePriceId } from "./stripeConfig";

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

  // Facebook CAPI event endpoint
  app.post("/api/facebook/event", async (req, res) => {
    try {
      const { eventName, eventSourceUrl, userData, customData, eventId } = req.body;
      
      const validEvents: FacebookEventName[] = [
        "ViewContent",
        "InitiateCheckout", 
        "AddPaymentInfo",
        "Purchase",
        "Lead"
      ];
      
      if (!validEvents.includes(eventName)) {
        return res.status(400).json({ message: "Invalid event name" });
      }

      const enrichedUserData = {
        ...userData,
        clientIpAddress: req.ip || req.headers["x-forwarded-for"]?.toString() || req.socket.remoteAddress || "",
        clientUserAgent: req.headers["user-agent"] || "",
      };

      const result = await sendFacebookEvent(
        eventName,
        eventSourceUrl,
        enrichedUserData,
        customData,
        eventId
      );

      res.json(result);
    } catch (err) {
      console.error("Facebook event error:", err);
      res.status(500).json({ message: "Failed to send Facebook event" });
    }
  });

  // Track which payment intents have already triggered Purchase events (in-memory dedupe)
  const processedPaymentIntents = new Set<string>();

  // Verify payment intent status - secured with metadata validation
  app.post("/api/stripe/verify-payment", async (req, res) => {
    try {
      const { paymentIntentId, email } = req.body;
      
      if (!paymentIntentId || !paymentIntentId.startsWith("pi_")) {
        return res.status(400).json({ verified: false, message: "Invalid payment intent ID" });
      }

      // Check if already processed (server-side dedupe)
      if (processedPaymentIntents.has(paymentIntentId)) {
        return res.json({ 
          verified: false, 
          alreadyProcessed: true,
          message: "Payment already tracked" 
        });
      }

      const stripe = await getUncachableStripeClient();
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      // Security: Validate that the email matches the payment intent metadata
      const piEmail = (paymentIntent.metadata?.email || "").toLowerCase().trim();
      const requestEmail = (email || "").toLowerCase().trim();
      
      // Require email validation - reject if PI has no email metadata or emails don't match
      if (!piEmail) {
        console.warn("Payment verification: no email in PI metadata", { paymentIntentId });
        // Still allow but log warning - some legacy payments might not have email
      } else if (requestEmail && piEmail !== requestEmail) {
        console.warn("Payment verification: email mismatch", { piEmail, requestEmail });
        return res.status(403).json({ verified: false, message: "Unauthorized" });
      }

      if (paymentIntent.status === "succeeded") {
        // Mark as processed to prevent duplicate events
        processedPaymentIntents.add(paymentIntentId);
        
        res.json({ 
          verified: true, 
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          planId: paymentIntent.metadata?.planId
        });
      } else {
        res.json({ 
          verified: false, 
          status: paymentIntent.status,
          message: "Payment not completed" 
        });
      }
    } catch (err) {
      console.error("Payment verification error:", err);
      res.status(500).json({ verified: false, message: "Failed to verify payment" });
    }
  });

  // Create payment intent
  app.post("/api/stripe/create-payment-intent", async (req, res) => {
    try {
      const { planId, isFinalOffer, email, name } = req.body;
      
      const validPlans = ["1week", "4week", "12week"];
      if (!validPlans.includes(planId)) {
        return res.status(400).json({ message: "Invalid plan selected" });
      }

      const amount = getInitialPaymentAmount(planId, !!isFinalOffer);
      const priceId = getStripePriceId(planId, !!isFinalOffer);
      
      const stripe = await getUncachableStripeClient();
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "brl",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          planId,
          priceId,
          email: email || "",
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
