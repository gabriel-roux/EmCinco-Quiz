# EmCinco Quiz Application

## Overview

EmCinco is a high-conversion quiz application designed to diagnose users' learning blockers and generate personalized 4-week skill development plans. The app follows a "Ruut/Noom/BetterMe" style quiz flow with gamification elements, progress tracking, and AI-powered plan generation. Users complete approximately 25-30 interactive quiz screens, then receive a personalized profile and weekly learning plan.

## Recent Changes
- **Rebranding**: Changed from "FOCO5" to "EmCinco" throughout the entire application
- **Layout**: Content is now top-aligned below the header instead of centered
- **Navigation**: Added back button functionality to navigate between quiz questions  
- **Container Sizing**: Standardized container width (max-w-xl) across all quiz screens
- **Intro Screen**: Redesigned landing page with gradient background, improved CTAs, and trust indicators

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, local React state for quiz flow
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Build Tool**: Vite with custom plugins for Replit integration

The frontend follows a page-based structure with three main routes:
- `/` - Quiz flow (multi-step form with various question types)
- `/processing` - Loading/processing animation screen
- `/result` - Results page with profile summary and paywall

Quiz components support multiple question types: single choice, multiple choice, Likert scale (1-5), info screens with illustrations, and email capture.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod validation
- **Database ORM**: Drizzle ORM with PostgreSQL
- **AI Integration**: OpenAI API (via Replit AI Integrations) for personalized plan generation

Key API endpoints:
- `POST /api/leads` - Save quiz answers and user email
- `GET /api/leads/:id` - Retrieve lead data
- `POST /api/generate-plan` - Generate AI-powered 4-week learning plan

### Data Flow
1. User completes quiz steps (stored in local state)
2. On completion, answers are saved to PostgreSQL via `/api/leads`
3. Plan generation calls OpenAI to create personalized profile and weekly missions
4. Results displayed with paywall/CTA

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts` - Drizzle table definitions and Zod schemas
- `routes.ts` - API contract definitions with input/output types

## External Dependencies

### Database
- **PostgreSQL** - Primary data store for leads and quiz data
- **Drizzle ORM** - Type-safe database queries and migrations
- Connection via `DATABASE_URL` environment variable

### AI Services
- **OpenAI API** - Plan generation using GPT models
- Configured via Replit AI Integrations (`AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`)

### UI Component Libraries
- **shadcn/ui** - Pre-built accessible components (Radix UI primitives)
- **Lucide React** - Icon library
- **Framer Motion** - Animation library
- **Recharts** - Charts for plan timeline visualization

### Fonts
- **Inter** - Body text (Google Fonts)
- **Outfit** - Headings (Google Fonts)

### Development Tools
- **tsx** - TypeScript execution for development
- **esbuild** - Production server bundling
- **Vite** - Frontend development server and build