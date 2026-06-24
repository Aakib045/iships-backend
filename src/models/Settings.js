const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    _id:        { type: String, default: 'singleton' },
    phone:      { type: String, trim: true, default: '' },
    whatsapp:   { type: String, trim: true, default: '' },
    email:      { type: String, trim: true, default: '' },
    address:    { type: String, trim: true, default: '' },
    tradeHours: { type: String, trim: true, default: '' },
    facebook:   { type: String, trim: true, default: '' },
    instagram:  { type: String, trim: true, default: '' },
    linkedin:   { type: String, trim: true, default: '' },
  },
  { timestamps: true, _id: false }
);

module.exports = mongoose.model('Settings', settingsSchema);
