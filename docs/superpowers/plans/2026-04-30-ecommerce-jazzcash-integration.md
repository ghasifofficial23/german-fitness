# Implementation Plan: E-commerce & JazzCash Integration

## Phase 1: Preparation & Credentials
- [ ] **Task 1.1**: User guidance for JazzCash Merchant Registration.
  - *Verification*: User provides Merchant ID, Password, and Integrity Salt.
- [ ] **Task 1.2**: Update Supabase Database Schema.
  - Create `order_items` table.
  - Update `orders` table (add status, payment_method, txn_ref).
  - *Verification*: Run `list_tables` and check column definitions.

## Phase 2: Frontend Cart System
- [ ] **Task 2.1**: Implement `cart.js`.
  - Logic for add, remove, update quantity, and clear cart.
  - Save to `localStorage`.
- [ ] **Task 2.2**: Update `store.html` UI.
  - Replace "Buy Now" with "Add to Cart".
  - Add floating cart trigger button with item counter.
  - Add Glassmorphism Cart Sidebar.
  - *Verification*: Add 3 items to cart and refresh; verify items persist.

## Phase 3: Checkout Workflow
- [ ] **Task 3.1**: Create `checkout.html`.
  - Responsive form for Name, Phone, and Payment Method.
  - Order summary (list of items + total).
- [ ] **Task 3.2**: Implement Order Placement Logic.
  - Save order to `orders` (header) and `order_items` (details) in a single transaction/batch.
  - *Verification*: Place an order and check Supabase for correct relational data.

## Phase 4: JazzCash Integration (The "Online Paid" logic)
- [ ] **Task 4.1**: Deploy Supabase Edge Function `jazzcash-checkout`.
  - Generates the payload for JazzCash API.
  - Calculates HMAC-SHA256 signature.
- [ ] **Task 4.2**: Deploy Supabase Edge Function `jazzcash-callback`.
  - Handles the POST request from JazzCash.
  - Verifies response signature.
  - Updates order status to 'paid' on success.
- [ ] **Task 4.3**: Connect Checkout to JazzCash.
  - Redirect user to JazzCash portal upon selecting "Online Payment".
  - *Verification*: Simulate a successful payment and check if order status changes to 'paid' in DB.

## Phase 5: Admin & Notifications
- [ ] **Task 5.1**: Update Admin Dashboard.
  - Show "Paid" status clearly.
  - List items for each order.
- [ ] **Task 5.2**: (Optional) Send automated WhatsApp receipt upon payment success.
  - *Verification*: Final walkthrough of the purchase flow.
