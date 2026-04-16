const Booking = require('../models/Booking');
const Service = require('../models/Service');

/**
 * Parse HH:MM to minutes since midnight
 */
const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Minutes since midnight to HH:MM
 */
const minutesToTime = (totalMin) => {
  const h = Math.floor(totalMin / 60).toString().padStart(2, '0');
  const m = (totalMin % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

/**
 * Parse duration '30 min' or '1 hr' to minutes
 */
const parseDuration = (durationStr) => {
  if (!durationStr) return 60;
  const match = durationStr.match(/(\d+)\s*(min|hr|minutes?|hours?)/i);
  if (!match) return 60;
  const [, num, unit] = match;
  return parseInt(num) * (unit.toLowerCase().includes('hr') ? 60 : 1);
};

/**
 * Generate available slots for service + date
 * @param {Object} service - Service doc with config
 * @param {string} date - 'YYYY-MM-DD'
 * @returns {Array} [{slot_start, slot_end, remaining_capacity, total_capacity}]
 */
const generateAvailableSlots = async (service, date) => {
  const slots = [];
  const startMin   = timeToMinutes(service.start_time || '09:30');
  const endMin     = timeToMinutes(service.end_time   || '19:00');
  const interval   = service.slot_interval || 30;
  const durationMin = parseDuration(service.duration);
  const maxPerSlot  = service.max_bookings_per_slot || 1;

  // ── For today: skip slots that have already started ──────────────────────
  const now        = new Date();
  const todayISO   = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const isToday    = date === todayISO;
  // Add a 30-minute buffer so users can't book a slot that starts in < 30 min
  const nowMinutes = isToday ? now.getHours() * 60 + now.getMinutes() + 30 : 0;

  let currentStart = startMin;
  while (currentStart + durationMin <= endMin) {
    // Skip past slots for today
    if (isToday && currentStart <= nowMinutes) {
      currentStart += interval;
      continue;
    }

    const slotStart = minutesToTime(currentStart);
    const slotEnd   = minutesToTime(currentStart + durationMin);

    // Count existing bookings for this exact slot
    const bookedCount = await Booking.countDocuments({
      service_id: service._id,
      date,
      time: slotStart,
      status: { $ne: 'Cancelled' },
    });

    const remaining = maxPerSlot - bookedCount;
    if (remaining > 0) {
      slots.push({
        slot_start:         slotStart,
        slot_end:           slotEnd,
        remaining_capacity: remaining,
        total_capacity:     maxPerSlot,
      });
    }

    currentStart += interval;
  }

  return slots;
};

module.exports = {
  generateAvailableSlots,
  timeToMinutes,
  minutesToTime,
  parseDuration
};

