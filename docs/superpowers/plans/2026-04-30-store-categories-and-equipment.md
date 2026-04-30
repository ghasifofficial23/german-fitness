# Implementation Plan: Store Categories and Equipment

**Parent Spec:** N/A (Direct Request)
**Date:** 2026-04-30

## 1. Overview
This plan outlines the steps to restructure the current "Hot Selling" section into a fully functional "Store". It involves adding a category filtering system to easily navigate between different product types like "Equipment", "Whey Protein", and "Pre Workout". Furthermore, it includes adding placeholder data for treadmills and other gym machinery to the Supabase database.

## 2. File Changes
| File Path | Action | Description |
| :--- | :--- | :--- |
| `store.html` | Modify | Update heading to "Store", add category filter UI, and update JS logic to filter products based on the selected category. |
| `style.css` | Modify | Add premium styling for the category filter buttons to match the Apple-inspired glassmorphism theme. |
| `Supabase Database` | Modify | Execute an SQL insertion to add dummy products for "Treadmills" and "Gym Machinery" under the "Equipment" category. |

## 3. Tasks

### Task 1: Create Category Filters in UI
- **Description:** Update the heading from "Hot Selling" to "Store". Add a stylish category filter bar below the heading containing categories: "All", "Whey Protein", "Pre Workout", "Equipment".
- **Tool Calls:** `multi_replace_file_content` (store.html)
- **Verification:** Verify that the heading is updated and the filter buttons are rendered correctly.

### Task 2: Style Category Filters
- **Description:** Implement CSS styles for the category filter bar in `style.css` so that it seamlessly fits the dark neon and glassmorphic aesthetic of the website.
- **Tool Calls:** `multi_replace_file_content` (style.css)
- **Verification:** Verify that the styles apply and look visually appealing.

### Task 3: Implement Functional Filtering Logic
- **Description:** Update the `loadProducts()` function in `store.html` to either fetch products by category from Supabase or filter the fetched products dynamically on the frontend when a category button is clicked.
- **Tool Calls:** `multi_replace_file_content` (store.html)
- **Verification:** Verify that clicking a category properly filters the displayed product cards.

### Task 4: Seed Database with Equipment Placeholder Data
- **Description:** Insert placeholder entries for "Treadmill" and "Gym Machinery" into the Supabase `products` table under the "Equipment" category. Images will be left blank as requested.
- **Tool Calls:** `mcp_supabase_execute_sql`
- **Verification:** Check the UI after insertion to ensure the new items appear when the "Equipment" category is active.

## 4. Post-Implementation Checklist
- [ ] Category filter visually renders and responds to clicks
- [ ] Products correctly filter by category
- [ ] Equipment placeholder items load accurately without images
