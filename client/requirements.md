## Packages
framer-motion | Page transitions and complex animations
recharts | Charts for the plan timeline
lucide-react | Icons (already in stack, but good to confirm)
clsx | Utility for conditional classes
tailwind-merge | Utility for merging tailwind classes

## Notes
- Frontend must handle the linear quiz flow state locally before submitting.
- Submits lead data to POST /api/leads at the end of the quiz (step 26).
- Fetches plan from POST /api/generate-plan using the collected answers.
- Paywall simulation on the result page.
- Using Google Fonts: Inter (Body) and Outfit (Headings) via index.css.
