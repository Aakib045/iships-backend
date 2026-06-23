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

  const waPhone = (inquiry.phone || '').replace(/[^0-9]/g, '');
  const phoneCell = inquiry.phone
    ? `<a href="tel:${esc(inquiry.phone)}" style="color:#C85E1E;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;">${esc(inquiry.phone)}</a>`
    : `<span style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#888877;">&#8212;</span>`;
  const waButton = waPhone
    ? `<td><a href="https://wa.me/${waPhone}" style="display:inline-block;background:#1a1a1a;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:12px 24px;">WHATSAPP</a></td>`
    : '';

  await resend.emails.send({
    from: process.env.FROM_ADDRESS,
    to: process.env.OWNER_EMAIL,
    subject: `New IShips Inquiry — ${inquiry.division}`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F4F1EA;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F1EA;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:600px;background:#F4F1EA;">

          <!-- HEADER -->
          <tr>
            <td style="background:#1a1a1a;padding:32px 40px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:34px;font-weight:bold;letter-spacing:6px;color:#E8732A;text-transform:uppercase;line-height:1;">ISHIPS</div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:bold;letter-spacing:3px;color:#9a9a8a;text-transform:uppercase;margin-top:8px;">NEW WEBSITE ENQUIRY</div>
            </td>
          </tr>

          <!-- FIELDS -->
          <tr>
            <td style="padding:32px 40px 0 40px;">

              <!-- Name -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:14px;border-bottom:1px solid #ddd8cc;">
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:bold;letter-spacing:2px;color:#888877;text-transform:uppercase;margin-bottom:5px;">Name</div>
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#1a1a1a;">${esc(inquiry.name)}</div>
                  </td>
                </tr>
                <tr><td style="height:14px;"></td></tr>

                <!-- Email -->
                <tr>
                  <td style="padding-bottom:14px;border-bottom:1px solid #ddd8cc;">
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:bold;letter-spacing:2px;color:#888877;text-transform:uppercase;margin-bottom:5px;">Email</div>
                    <div><a href="mailto:${esc(inquiry.email)}" style="color:#C85E1E;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;">${esc(inquiry.email)}</a></div>
                  </td>
                </tr>
                <tr><td style="height:14px;"></td></tr>

                <!-- Phone -->
                <tr>
                  <td style="padding-bottom:14px;border-bottom:1px solid #ddd8cc;">
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:bold;letter-spacing:2px;color:#888877;text-transform:uppercase;margin-bottom:5px;">Phone</div>
                    <div>${phoneCell}</div>
                  </td>
                </tr>
                <tr><td style="height:14px;"></td></tr>

                <!-- Division -->
                <tr>
                  <td style="padding-bottom:14px;border-bottom:1px solid #ddd8cc;">
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:bold;letter-spacing:2px;color:#888877;text-transform:uppercase;margin-bottom:5px;">Division</div>
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#1a1a1a;">${esc(inquiry.division)}</div>
                  </td>
                </tr>
                <tr><td style="height:14px;"></td></tr>

                <!-- Message -->
                <tr>
                  <td style="padding-bottom:28px;">
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:bold;letter-spacing:2px;color:#888877;text-transform:uppercase;margin-bottom:8px;">Message</div>
                    <div style="background:#EDE9DF;border-left:4px solid #E8732A;padding:16px 20px;">
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a1a;line-height:1.6;white-space:pre-wrap;">${esc(inquiry.message)}</div>
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- BUTTONS -->
          <tr>
            <td style="padding:0 40px 40px 40px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:12px;">
                    <a href="mailto:${esc(inquiry.email)}" style="display:inline-block;background:#E8732A;color:#1a1a1a;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:12px 24px;">REPLY BY EMAIL</a>
                  </td>
                  ${waButton}
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = { createInquiry, listInquiries, markRead };
