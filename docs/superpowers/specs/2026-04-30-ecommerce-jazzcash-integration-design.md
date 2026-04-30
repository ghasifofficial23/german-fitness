# Design Spec: E-commerce Store & JazzCash Integration

## 1. Objective
Transform the existing single-product "Buy Now" flow into a professional e-commerce experience with a multi-item cart, centralized checkout, and automated JazzCash online payments.

## 2. Current State Analysis
- **Store**: Displays products from Supabase `products` table.
- **Order Flow**: "Buy Now" triggers a modal for name/phone, saves to `orders` table (1 product per order), and redirects to WhatsApp.
- **Database**: `orders` table is limited to one `product_id` per row.

## 3. Proposed Architecture

### 3.1 Data Model (Supabase)
We will transition to a relational Order-Items model:
- **`orders`**: Header table.
  - `id` (UUID, PK)
  - `customer_name` (Text)
  - `customer_phone` (Text)
  - `total_amount` (Numeric)
  - `status` (Text: 'pending', 'paid', 'shipped', 'cancelled')
  - `payment_method` (Text: 'jazzcash', 'cod')
  - `txn_ref` (Text, Unique: JazzCash transaction ID)
- **`order_items`**: Line items.
  - `id` (UUID, PK)
  - `order_id` (FK -> orders.id)
  - `product_id` (FK -> products.id)
  - `quantity` (Int)
  - `price` (Numeric: snapshot at time of purchase)

### 3.2 Frontend Components
- **Cart Management**: `localStorage` based cart system.
- **UI Enhancements**:
  - "Add to Cart" button on every product.
  - Floating Cart Sidebar/Modal showing current items and total.
  - Cart item counter in the Navbar.
- **Checkout Page**:
  - Form for Customer Details (Name, Phone, Address).
  - Order Summary.
  - Payment Method Selection (JazzCash Online vs WhatsApp/Manual).

### 3.3 JazzCash Integration (Secure Flow)
To protect credentials, we will use **Supabase Edge Functions**:
1. **Initiation**: Client calls `jazzcash-payment` Edge Function with Order ID.
2. **Signature**: Function retrieves JazzCash Salt, generates HMAC-SHA256 signature, and returns the POST payload.
3. **Redirection**: Client-side form auto-submits to JazzCash Sandbox/Production URL.
4. **Webhook (IPN)**: JazzCash sends a POST to our `jazzcash-callback` Edge Function upon success/failure.
5. **Status Update**: The callback function verifies the signature and updates the Supabase `orders` table status to 'paid'.

## 4. Visual Concept
- **Cart**: A sleek glassmorphism sidebar sliding from the right.
- **Checkout**: A clean, focused multi-step form with high-contrast accent colors (Neon Lime/Black).

## 5. Security & Verification
- **Digital Signatures**: All JazzCash requests must be signed with HMAC-SHA256 using the Integrity Salt.
- **Server-to-Server Verification**: Order status is ONLY updated via the IPN callback, not the client-side redirect.

## 6. Success Criteria
- Customers can add 5 different supplements to one cart.
- Checkout requires filling details only once.
- Selecting JazzCash leads to a payment screen.
- Successful payment automatically marks the order as "Paid" in the Admin Dashboard.
