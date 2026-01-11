import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
  // Hero Section
  heroTitle: {
    type: String,
    default: "3D'S SAWMILL"
  },
  heroSubtitle: {
    type: String,
    default: 'Premium Structural & Industrial Timber'
  },
  heroDescription: {
    type: String,
    default: 'Delivering superior timber solutions with sustainable practices and cutting-edge technology. Trusted by industry leaders for quality, reliability, and exceptional service.'
  },
  heroBadgeText: {
    type: String,
    default: 'Nationwide Delivery Available'
  },
  heroFeatures: [{
    text: String,
    icon: String
  }],
  
  // About Section
  aboutTitle: {
    type: String,
    default: 'About 3D\'S SAWMILL'
  },
  aboutSubtitle: {
    type: String,
    default: 'For all structural and industrial timber'
  },
  aboutDescription: {
    type: String,
    default: 'We\'re here to help you find the perfect timber solution for your project. Whether you need custom cuts, bulk orders, or expert advice, our team is ready to assist.'
  },
  aboutMission: {
    type: String,
    default: 'Our mission is to provide high-quality timber products while maintaining sustainable practices and exceptional customer service.'
  },
  aboutVision: {
    type: String,
    default: 'To be South Africa\'s leading timber supplier, known for quality, reliability, and innovation.'
  },
  
  // Contact Information
  contactPhone: {
    type: String,
    default: '072 504 9184'
  },
  contactEmail: {
    type: String,
    default: 'bruwer.danie@gmail.com'
  },
  contactAddress: {
    type: String,
    default: 'Bergvliet, Cape Town, South Africa'
  },
  whatsappNumber: {
    type: String,
    default: '27725049184'
  },
  
  // Business Hours
  businessHours: {
    type: String,
    default: 'Monday - Friday: 7:00 AM - 5:00 PM\nSaturday: 8:00 AM - 1:00 PM\nSunday: Closed'
  },
  
  // Social Media
  facebookUrl: String,
  instagramUrl: String,
  linkedinUrl: String,
  
  // SEO
  metaTitle: {
    type: String,
    default: '3D\'S SAWMILL - Premium Timber Solutions'
  },
  metaDescription: {
    type: String,
    default: 'South Africa\'s trusted timber supplier for structural and industrial wood products. Sustainable sourcing, custom cutting, nationwide delivery.'
  },
  
  // Only one settings document should exist
  singletonKey: {
    type: String,
    unique: true,
    default: 'site_settings'
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
siteSettingsSchema.statics.getSiteSettings = async function() {
  let settings = await this.findOne({ singletonKey: 'site_settings' });
  if (!settings) {
    settings = await this.create({ singletonKey: 'site_settings' });
  }
  return settings;
};

export default mongoose.model('SiteSettings', siteSettingsSchema);
