const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/admin/login
async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const validUser = username === process.env.ADMIN_USERNAME;
  const hash = process.env.ADMIN_PASSWORD_HASH || '';

  // Always run bcrypt.compare to prevent timing-based username enumeration
  const validPass = await bcrypt.compare(password, hash || '$2b$10$invalidhashpadding000000000000000000000000000000000000');

  if (!validUser || !validPass) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ sub: username }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, expiresIn: 28800 });
}

module.exports = { login };
