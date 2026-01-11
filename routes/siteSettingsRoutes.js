import express from 'express';
import SiteSettings from '../models/SiteSettings.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/site-settings
// @desc    Get site settings (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const settings = await SiteSettings.getSiteSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching site settings:', error);
    res.status(500).json({ message: 'Failed to fetch site settings' });
  }
});

// @route   PUT /api/site-settings
// @desc    Update site settings
// @access  Private/Admin
router.put('/', protect, admin, async (req, res) => {
  try {
    const settings = await SiteSettings.getSiteSettings();
    
    // Update all provided fields
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== '__v' && key !== 'singletonKey' && key !== 'createdAt') {
        settings[key] = req.body[key];
      }
    });
    
    await settings.save();
    
    res.json({
      message: 'Site settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating site settings:', error);
    res.status(500).json({ message: 'Failed to update site settings' });
  }
});

// @route   POST /api/site-settings/reset
// @desc    Reset site settings to defaults
// @access  Private/Admin
router.post('/reset', protect, admin, async (req, res) => {
  try {
    await SiteSettings.deleteMany({});
    const settings = await SiteSettings.getSiteSettings();
    
    res.json({
      message: 'Site settings reset to defaults',
      settings
    });
  } catch (error) {
    console.error('Error resetting site settings:', error);
    res.status(500).json({ message: 'Failed to reset site settings' });
  }
});

export default router;
