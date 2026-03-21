# Dynamic Time-Slot Booking System - Implementation TODO

## Progress Tracker [5/7]

### 1. [✅] Create backend/utils/slots.js
   - generateSlots(service, date): Return [{slot_start, slot_end, remaining_capacity}]

### 2. [✅] Update backend/models/Service.js
   - Add start_time, end_time, slot_interval, max_bookings_per_slot

### 3. [✅] Update backend/models/Booking.js
   - Add slot_end, service_id ref, update indexes

### 4. [✅] Update backend/controllers/bookingController.js
   - Add getAvailableSlots API
   - Update createBooking for capacity validation
   - Deprecate/add to checkSlot

### 5. [✅] Update backend/routes/bookingRoutes.js
   - Add GET /:service_id/slots?date=

### 6. [✅] Update frontend/admin/src/pages/user/UserServices.jsx
   - Fetch slots from API instead of client gen

### 7. [✅] Update tests + defaults
   - backend/test-services.js: Add config defaults
   - Test flow

**Next**: Execute step-by-step, update checklist after each.

**Defaults**: start_time:'09:00', end_time:'18:00', slot_interval:30, max_bookings_per_slot:1

