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
  
  // Why Choose Us Section
  whyChooseTitle: {
    type: String,
    default: 'Why Choose 3D\'S SAWMILL?'
  },
  whyChooseSubtitle: {
    type: String,
    default: 'Our Advantages'
  },
  whyChooseDescription: {
    type: String,
    default: 'We combine traditional craftsmanship with cutting-edge technology to deliver premium timber solutions you can trust.'
  },
  
  // Features
  feature1Title: {
    type: String,
    default: 'Sustainable Sourcing'
  },
  feature1Description: {
    type: String,
    default: 'All our timber comes from certified sustainable forests in South Africa, ensuring environmental responsibility and long-term supply.'
  },
  feature2Title: {
    type: String,
    default: 'Precision Milling'
  },
  feature2Description: {
    type: String,
    default: 'State-of-the-art equipment ensures exact dimensions and superior quality for every timber product, cut to your specifications.'
  },
  feature3Title: {
    type: String,
    default: 'Nationwide Delivery'
  },
  feature3Description: {
    type: String,
    default: 'Reliable logistics network delivering to your construction site, anywhere in South Africa, with tracking and insurance.'
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
  
  // Footer Content
  footerTagline: {
    type: String,
    default: 'For all structural and industrial timber'
  },
  footerDescription: {
    type: String,
    default: 'Your trusted partner for premium timber solutions since 1990. We combine sustainable forestry practices with cutting-edge milling technology to deliver high-quality, reliable products.'
  },
  footerCopyrightText: {
    type: String,
    default: 'Specializing in structural and industrial timber since 1990'
  },
  
  // Company Information
  companyName: {
    type: String,
    default: "3D'S SAWMILL"
  },
  companyLogo: {
    type: String,
    default: '/logo.jpeg'
  },
  companyEstablished: {
    type: String,
    default: '1990'
  },
  
  // CTA Section
  ctaTitle: {
    type: String,
    default: 'Ready to Start Your Project?'
  },
  ctaDescription: {
    type: String,
    default: 'Get a custom quote for your specific timber requirements. Our experts are ready to assist you with the perfect timber solution.'
  },
  ctaButtonText: {
    type: String,
    default: 'Request Custom Quote'
  },
  
  // Stats Section
  stat1Value: {
    type: String,
    default: '30+'
  },
  stat1Label: {
    type: String,
    default: 'Years Experience'
  },
  stat1Suffix: {
    type: String,
    default: 'Since 1990'
  },
  stat2Value: {
    type: String,
    default: '100%'
  },
  stat2Label: {
    type: String,
    default: 'Quality Guarantee'
  },
  stat2Suffix: {
    type: String,
    default: 'Premium Timber'
  },
  stat3Value: {
    type: String,
    default: '24/7'
  },
  stat3Label: {
    type: String,
    default: 'Support'
  },
  stat3Suffix: {
    type: String,
    default: 'Always Available'
  },
  stat4Value: {
    type: String,
    default: '500+'
  },
  stat4Label: {
    type: String,
    default: 'Projects'
  },
  stat4Suffix: {
    type: String,
    default: 'Completed'
  },
  
  // Images
  heroImage: {
    type: String,
    default: '/logo.jpeg'
  },
  aboutImage: String,
  
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
