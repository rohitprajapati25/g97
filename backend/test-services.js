const connectDB = require('./config/db');
const Service = require('./models/Service');

const runTestServices = async () => {
  await connectDB();

  const services = [
    { title: 'Express Wash', description: 'Quick exterior wash and dry', price: 999, duration: '30 min', start_time: '09:00', end_time: '18:00', slot_interval: 30, max_bookings_per_slot: 2 },
    { title: 'Premium Ceramic Coating', description: 'Full paint protection', price: 49999, duration: '5 hrs', start_time: '09:00', end_time: '17:00', slot_interval: 60, max_bookings_per_slot: 1 },
    { title: 'PPF Installation', description: 'Self-healing paint protection film', price: 99999, duration: '8 hrs', start_time: '09:00', end_time: '18:00', slot_interval: 480, max_bookings_per_slot: 1 },
    { title: 'Interior Deep Clean', description: 'Complete interior detailing', price: 2999, duration: '2 hrs', start_time: '10:00', end_time: '18:00', slot_interval: 30, max_bookings_per_slot: 3 }
  ];

  for (const serviceData of services) {
    const existing = await Service.findOne({ title: serviceData.title });
    if (!existing) {
      await Service.create(serviceData);
      console.log(`✅ Created: ${serviceData.title}`);
    }
  }

  console.log('✅ Test services populated!');
  process.exit(0);
};

runTestServices().catch(console.error);
