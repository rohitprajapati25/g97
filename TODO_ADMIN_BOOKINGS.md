# Admin Bookings Enhancement Plan

## Information Gathered
- Bookings.jsx: Basic list/edit, no filter/paginate/payment.
- getBookings: Simple find, no query.
- Model: No payment_status, quantity.

## Progress Tracker [0/5]

### 1. [✅] Update backend/models/Booking.js - payment_status, quantity fields
### 2. [✅] backend/controllers/bookingController.js - getBookings with filters/pagination
### 3. [✅] frontend/admin/src/pages/Bookings.jsx - filter/search/paginate table
### 4. [ ] backend/controllers/bookingController.js - transaction concurrency
### 5. [ ] backend/controllers/dashboardController.js - booking stats/slots

**Next**: Step-by-step, update checklist.


## Dependent Files
- backend/models/Booking.js
- backend/controllers/bookingController.js
- frontend/admin/src/pages/Bookings.jsx
- backend/routes/bookingRoutes.js

## Followup
Test filter, concurrency.

Confirm plan?
