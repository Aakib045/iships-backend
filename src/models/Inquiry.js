const mongoose = require('mongoose');

const DIVISIONS = ['Scrap', 'Spare Parts', 'Import-Export', 'Other'];

const inquirySchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true, maxlength: 120 },
    email:    { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone:    { type: String, trim: true, maxlength: 30 },
    division: { type: String, required: true, enum: DIVISIONS },
    message:  { type: String, required: true, trim: true, maxlength: 2000 },
    isRead:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inquiry', inquirySchema);
