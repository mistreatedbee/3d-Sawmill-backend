import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from './models/Product.js';
import { Testimonial } from './models/Testimonial.js';
import { Gallery } from './models/Gallery.js';
import { User } from './models/User.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await Testimonial.deleteMany({});
    await Gallery.deleteMany({});
    await User.deleteMany({});

    // Seed products
    const products = await Product.insertMany([
      {
        name: 'Premium Pine Plywood',
        description: 'High-grade structural pine plywood suitable for construction and furniture.',
        category: 'Plywood',
        productType: 'Standard Panel',
        woodType: 'Pine',
        color: 'Natural',
        price: 450,
        stock: 120,
        dimensions: {
          length: 2440,
          width: 1220,
          height: 18,
          unit: 'mm',
        },
        weight: {
          value: 25,
          unit: 'kg',
        },
        images: [{
          url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=1000',
          alt: 'Premium Pine Plywood',
          isPrimary: true,
        }],
        isAvailable: true,
        featured: true,
      },
      {
        name: 'Structural 4x4 Timber Beam',
        description: 'Pressure treated structural timber for heavy load bearing applications.',
        category: '4x4 Timber',
        productType: 'Structural',
        woodType: 'Pine',
        color: 'Light Oak',
        price: 180,
        stock: 500,
        dimensions: {
          length: 3000,
          width: 100,
          height: 100,
          unit: 'mm',
        },
        weight: {
          value: 15,
          unit: 'kg',
        },
        images: [{
          url: 'https://images.unsplash.com/photo-1610505466034-46f9d4c06d4e?auto=format&fit=crop&q=80&w=1000',
          alt: 'Structural 4x4 Timber Beam',
          isPrimary: true,
        }],
        isAvailable: true,
        featured: true,
      },
      {
        name: 'Mahogany Door Frame',
        description: 'Elegant solid mahogany door frame, pre-sanded and ready for varnish.',
        category: 'Doors',
        productType: 'Solid Wood',
        woodType: 'Mahogany',
        color: 'Mahogany Red',
        price: 1200,
        stock: 45,
        dimensions: {
          length: 2100,
          width: 900,
          height: 40,
          unit: 'mm',
        },
        weight: {
          value: 35,
          unit: 'kg',
        },
        images: [{
          url: 'https://images.unsplash.com/photo-1504198458649-3128b932f49e?auto=format&fit=crop&q=80&w=1000',
          alt: 'Mahogany Door Frame',
          isPrimary: true,
        }],
        isAvailable: true,
        featured: false,
      },
      {
        name: 'Teak Decking Boards',
        description: 'Weather-resistant teak boards perfect for outdoor patios and decks.',
        category: 'Boards',
        productType: 'Solid Wood',
        woodType: 'Teak',
        color: 'Golden',
        price: 85,
        stock: 2000,
        dimensions: {
          length: 2000,
          width: 140,
          height: 22,
          unit: 'mm',
        },
        weight: {
          value: 8,
          unit: 'kg',
        },
        images: [{
          url: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?auto=format&fit=crop&q=80&w=1000',
          alt: 'Teak Decking Boards',
          isPrimary: true,
        }],
        isAvailable: true,
        featured: true,
      },
      {
        name: 'Custom Turned Pillar',
        description: 'Hand-turned wooden pillar for architectural detailing.',
        category: 'Pillars',
        productType: 'Decorative',
        woodType: 'Oak',
        color: 'Natural',
        price: 850,
        stock: 15,
        dimensions: {
          length: 2400,
          width: 150,
          height: 150,
          unit: 'mm',
        },
        weight: {
          value: 45,
          unit: 'kg',
        },
        images: [{
          url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=1000',
          alt: 'Custom Turned Pillar',
          isPrimary: true,
        }],
        isAvailable: true,
        featured: false,
      },
      {
        name: 'Oak Window Frame Kit',
        description: 'Complete window frame kit made from premium oak wood.',
        category: 'Window Frames',
        productType: 'Solid Wood',
        woodType: 'Oak',
        color: 'Light Oak',
        price: 2500,
        stock: 20,
        dimensions: {
          length: 1200,
          width: 1200,
          height: 50,
          unit: 'mm',
        },
        weight: {
          value: 20,
          unit: 'kg',
        },
        images: [{
          url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1000',
          alt: 'Oak Window Frame Kit',
          isPrimary: true,
        }],
        isAvailable: true,
        featured: false,
      },
      {
        name: 'Custom Cut Service',
        description: 'Professional custom cutting service for all your timber needs.',
        category: 'Custom Cuts',
        productType: 'Custom Cut',
        woodType: 'Other',
        color: 'Custom',
        price: 0,
        stock: 1000,
        dimensions: {
          length: 1,
          width: 1,
          height: 1,
          unit: 'mm',
        },
        weight: {
          value: 1,
          unit: 'kg',
        },
        images: [{
          url: 'https://images.unsplash.com/photo-1517694712202-14819c9cb6e1?auto=format&fit=crop&q=80&w=1000',
          alt: 'Custom Cut Service',
          isPrimary: true,
        }],
        isAvailable: true,
        featured: false,
      },
    ]);

    console.log(`${products.length} products seeded`);

    // Seed testimonials
    const testimonials = await Testimonial.insertMany([
      {
        name: 'Johan Smit',
        role: 'Construction Manager',
        content: "The quality of structural timber from 3D's Sawmill is unmatched. Delivery is always on time.",
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        rating: 5,
        verified: true,
      },
      {
        name: 'Sarah Johnson',
        role: 'Architect',
        content: 'Exceptional craftsmanship and reliable service. They deliver exactly what they promise.',
        avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
        rating: 5,
        verified: true,
      },
      {
        name: 'Michael Chen',
        role: 'Furniture Designer',
        content: 'Premium quality materials at competitive prices. Highly recommend for all projects.',
        avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
        rating: 5,
        verified: true,
      },
    ]);

    console.log(`${testimonials.length} testimonials seeded`);

    // Seed gallery
    const gallery = await Gallery.insertMany([
      {
        url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=1000',
        title: 'Main Sawmill Floor',
        category: 'Factory',
        description: 'Our state-of-the-art sawmill facility with modern equipment.',
      },
      {
        url: 'https://images.unsplash.com/photo-1622368945281-995220387532?auto=format&fit=crop&q=80&w=1000',
        title: 'Custom Roof Trusses',
        category: 'Projects',
        description: 'Custom roof truss project completed for commercial building.',
      },
      {
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1000',
        title: 'Stacked Timber',
        category: 'Products',
        description: 'Premium timber stacked and ready for delivery.',
      },
      {
        url: 'https://images.unsplash.com/photo-1610505466034-46f9d4c06d4e?auto=format&fit=crop&q=80&w=1000',
        title: 'Timber Processing',
        category: 'Factory',
        description: 'Timber processing in progress at our facility.',
      },
    ]);

    console.log(`${gallery.length} gallery images seeded`);

    // Seed users (admin and test customer)
    // Using create() instead of insertMany() to trigger password hashing middleware
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@3dsawmill.com',
      password: 'admin123',
      role: 'admin',
      phone: '072 504 9184',
      address: {
        street: 'Main Office',
        city: 'Lothair',
        province: 'Mpumalanga',
        postalCode: '2370',
        country: 'South Africa',
      },
    });

    const customerUser = await User.create({
      name: 'Test Customer',
      email: 'customer@test.com',
      password: 'customer123',
      role: 'customer',
      phone: '082 123 4567',
      address: {
        street: '123 Test Street',
        city: 'Johannesburg',
        province: 'Gauteng',
        postalCode: '2000',
        country: 'South Africa',
      },
    });

    const users = [adminUser, customerUser];

    console.log(`${users.length} users seeded`);
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Admin Account:');
    console.log('  Email: admin@3dsawmill.com');
    console.log('  Password: admin123');
    console.log('\nCustomer Account:');
    console.log('  Email: customer@test.com');
    console.log('  Password: customer123');
    console.log('========================\n');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
