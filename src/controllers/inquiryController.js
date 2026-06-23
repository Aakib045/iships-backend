const { Resend } = require('resend');
const Inquiry = require('../models/Inquiry');

const DIVISIONS = ['Scrap', 'Spare Parts', 'Import-Export', 'Other'];

// POST /api/inquiries
async function createInquiry(req, res) {
  const { name, email, phone, division, message } = req.body;

  // --- validation ---
  const errors = [];
  if (!name || typeof name !== 'string' || !name.trim()) errors.push('name is required');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('valid email is required');
  if (!division || !DIVISIONS.includes(division)) errors.push(`division must be one of: ${DIVISIONS.join(', ')}`);
  if (!message || typeof message !== 'string' || !message.trim()) errors.push('message is required');
  if (errors.length) return res.status(422).json({ errors });

  try {
    const inquiry = await Inquiry.create({ name: name.trim(), email, phone, division, message: message.trim() });

    // fire-and-forget email — don't block the response on it
    sendNotification(inquiry).catch((err) => console.error('Email send failed:', err.message));

    res.status(201).json({ success: true, id: inquiry._id });
  } catch (err) {
    console.error('createInquiry error:', err.message);
    res.status(500).json({ error: 'Failed to save inquiry' });
  }
}

// GET /api/inquiries  (admin-protected)
async function listInquiries(req, res) {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 }).lean();
    res.json(inquiries);
  } catch (err) {
    console.error('listInquiries error:', err.message);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
}

// PATCH /api/inquiries/:id/read  (admin-protected)
async function markRead(req, res) {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });
    res.json({ success: true, isRead: inquiry.isRead });
  } catch (err) {
    console.error('markRead error:', err.message);
    res.status(500).json({ error: 'Failed to update inquiry' });
  }
}

async function sendNotification(inquiry) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.FROM_ADDRESS,
    to: process.env.OWNER_EMAIL,
    subject: `New IShips Inquiry — ${inquiry.division}`,
    html: `
      <h2>New Inquiry Received</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        <tr><td><strong>Name</strong></td><td>${esc(inquiry.name)}</td></tr>
        <tr><td><strong>Email</strong></td><td>${esc(inquiry.email)}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${esc(inquiry.phone || '—')}</td></tr>
        <tr><td><strong>Division</strong></td><td>${esc(inquiry.division)}</td></tr>
        <tr><td><strong>Message</strong></td><td style="white-space:pre-wrap">${esc(inquiry.message)}</td></tr>
      </table>
    `,
  });
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = { createInquiry, listInquiries, markRead };
