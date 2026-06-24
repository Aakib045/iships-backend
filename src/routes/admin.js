const { Router } = require('express');
const { login, changePassword } = require('../controllers/adminController');
const requireAuth = require('../middleware/auth');

const router = Router();

router.post('/login', login);
router.post('/change-password', requireAuth, changePassword);

module.exports = router;
