# Design Spec: German Fitness & Sports Rebuild

**Date:** 2026-04-24
**Status:** Draft
**Author:** Antigravity

## 1. Problem Statement
The current website for German Fitness & Sports is basic and lack engagement. The goal is to rebuild it into a premium, high-engagement landing page that not only showcases the gym's services (Gym, Physiotherapy, Personal Training) but also provides a seamless registration and shopping experience. Key objectives include a dynamic membership form with bill calculation, WhatsApp integration for payment verification, a product store, and a comprehensive admin dashboard for member and order management.

## 2. Context
- **Color Scheme:** Black and Neon Lime (Premium Dark Mode).
- **Technology Stack:** HTML, CSS, JavaScript (Vanilla for maximum control), Supabase for backend/database.
- **Old Website Info:** [german-fitness-sports.localo.site](https://german-fitness-sports.localo.site/)
- **Target Audience:** Fitness enthusiasts in Sahiwal, Pakistan.

## 3. Proposed Approaches
### Approach 1: Single Page Application (SPA) with Vanilla JS & Supabase
- **Pros:** Fast, fluid transitions, easy to maintain state across sections.
- **Cons:** Slightly more complex initial setup for routing if needed.
### Approach 2: Multi-Page Site with Supabase
- **Pros:** Better SEO for specific pages (Store, Blog), simpler structure.
- **Cons:** Page reloads can break the "premium" feel unless handled with transitions.

**Recommendation:** Approach 1 (SPA-like) for the Landing Page and Dashboard, with a separate Store page to handle complex product listings. This ensures a "wow" factor on the home page while maintaining scalability.

## 4. Technical Architecture
- **Frontend:** Vanilla HTML/CSS/JS.
- **Design System:** Custom CSS tokens for Black/Neon Lime theme.
- **Backend/Database:** Supabase for Member management, Order tracking, and Product inventory.
- **Integrations:** 
    - **WhatsApp API:** For sending screenshots and details.
    - **Dynamic Form:** Real-time bill calculation based on package selection.

## 5. UI/UX
- **Hero Section:** High-impact video or image with bold typography ("NO PAIN NO GAIN").
- **Packages Section:** Interactive cards for Gym, Physio, and Personal Training.
- **Registration Form:** Step-by-step or dynamic form with package toggles.
- **Store Section:** Carousel of 4 hot-selling products with a "View All" button.
- **Admin Dashboard:** Sidebar navigation with tabs for Members, Orders, Revenue, and History.

## 6. Open Questions
- **Pricing:** What are the exact rates for Gym Membership (Monthly/Yearly), Physiotherapy, and Personal Training?
- **Store Inventory:** Are there more products besides the ones found in the gallery?
- **Payment Verification:** Should the admin dashboard have an automated payment check or just manual "Verify" button as requested?
- **Hosting:** Where will the new site be hosted? (Assume Vercel/Netlify for now).
