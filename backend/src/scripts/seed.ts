import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gbp_post_manager';

const sampleLocations = [
  {
    businessName: 'ABC Cafe',
    address: '123 Main Street',
    category: 'Cafe',
    city: 'Pune',
  },
  {
    businessName: 'Fresh Bites Restaurant',
    address: '45 Market Road',
    category: 'Restaurant',
    city: 'Mumbai',
  },
  {
    businessName: 'Urban Fitness',
    address: '78 Station Road',
    category: 'Fitness Center',
    city: 'Bengaluru',
  },
  {
    businessName: 'Apex Tech Solutions',
    address: '502 Innovation Hub',
    category: 'IT Services',
    city: 'Hyderabad',
  },
  {
    businessName: 'Green Leaf Spa & Wellness',
    address: '12 Harmony Way',
    category: 'Spa & Salon',
    city: 'Delhi',
  },
];

const LocationSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },
    address: { type: String, required: true },
    category: { type: String, required: true },
    city: { type: String, required: true },
  },
  { timestamps: true }
);

const Location = mongoose.models.Location || mongoose.model('Location', LocationSchema);

async function seed() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  const existingCount = await Location.countDocuments();
  console.log(`Current locations count in DB: ${existingCount}`);

  if (existingCount === 0) {
    await Location.insertMany(sampleLocations);
    console.log('Successfully seeded 5 mock GBP locations!');
  } else {
    console.log('Locations already exist in database. Skipping seed.');
  }

  await mongoose.disconnect();
  console.log('Database connection closed.');
}

seed().catch((err) => {
  console.error('Seed script error:', err);
  process.exit(1);
});
