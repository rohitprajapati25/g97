const connectDB = require('./config/db');
const mongoose = require('mongoose');
const User = require('./models/User');
const Booking = require('./models/Booking');
const Service = require('./models/Service');

const runTestData = async () => {
  await connectDB();

  // Create test user if not exists
  let testUser = await User.findOne({ email: 'test@example.com' });
  if (!testUser) {
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'test123456',
      role: 'user'
    });
    console.log('✅ Test user created:', testUser._id);
  }

  // Create test booking
  const testBooking = {
    userName: testUser.name,
    phone: '+91 9999999999',
    service: 'Express Wash',
    carType: 'Sedan',
    date: '2024-12-22',
    time: '14:00',
    status: 'Pending',
    user: testUser._id
  };

  // Dynamic service_id
  const serviceDoc = await Service.findOne({ title: 'Express Wash' });
  if (serviceDoc) {
    testBooking.service_id = serviceDoc._id;
    testBooking.slot_end = '15:00'; // 1hr example
  }

  const booking = await Booking.create(testBooking);
  console.log('✅ Test booking created:', booking._id);
  
  mongoose.connection.close();
  console.log('✅ Test data populated successfully!');
};

runTestData().catch(console.error);

