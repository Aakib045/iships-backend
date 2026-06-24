const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

// POST /api/admin/login
async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const admin = await AdminUser.findOne({ username });

  // Always run bcrypt compare to prevent timing-based username enumeration
  const hash = admin?.passwordHash || '$2b$10$invalidhashpadding000000000000000000000000000000000000';
  const validPass = await bcrypt.compare(password, hash);

  if (!admin || !validPass) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ sub: username }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, expiresIn: 28800 });
}

// POST /api/admin/change-password (protected)
async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'currentPassword and newPassword are required' });
  }

  if (newPassword.length < 8) {
    return res.status(422).json({ error: 'newPassword must be at least 8 characters' });
  }

  const admin = await AdminUser.findOne({ username: req.admin.sub });
  if (!admin) {
    return res.status(401).json({ error: 'Admin user not found' });
  }

  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  admin.passwordHash = await bcrypt.hash(newPassword, 10);
  await admin.save();

  res.json({ message: 'Password updated successfully' });
}

module.exports = { login, changePassword };
