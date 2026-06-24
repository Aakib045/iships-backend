const AdminUser = require('../models/AdminUser');

async function seedAdmin() {
  const count = await AdminUser.countDocuments();
  if (count > 0) return;

  const { ADMIN_USERNAME, ADMIN_PASSWORD_HASH } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH) {
    console.warn('No AdminUser in DB and ADMIN_USERNAME/ADMIN_PASSWORD_HASH env vars are missing — admin login will fail');
    return;
  }

  await AdminUser.create({ username: ADMIN_USERNAME, passwordHash: ADMIN_PASSWORD_HASH });
  console.log('AdminUser seeded from env vars');
}

module.exports = seedAdmin;
