const Settings = require('../models/Settings');

const ALLOWED_FIELDS = ['phone', 'whatsapp', 'email', 'address', 'tradeHours', 'facebook', 'instagram', 'linkedin'];

// GET /api/settings  — public
async function getSettings(req, res) {
  try {
    const settings = await Settings.findByIdAndUpdate(
      'singleton',
      { $setOnInsert: { _id: 'singleton' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    res.json(settings);
  } catch (err) {
    console.error('getSettings error:', err.message);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
}

// PUT /api/settings  — admin-protected
async function updateSettings(req, res) {
  const patch = {};
  for (const field of ALLOWED_FIELDS) {
    if (field in req.body) patch[field] = String(req.body[field]).trim();
  }

  try {
    const settings = await Settings.findByIdAndUpdate(
      'singleton',
      { $set: patch },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    res.json(settings);
  } catch (err) {
    console.error('updateSettings error:', err.message);
    res.status(500).json({ error: 'Failed to update settings' });
  }
}

module.exports = { getSettings, updateSettings };
