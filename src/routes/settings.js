const { Router } = require('express');
const requireAuth = require('../middleware/auth');
const { getSettings, updateSettings } = require('../controllers/settingsController');

const router = Router();

router.get('/', getSettings);
router.put('/', requireAuth, updateSettings);

module.exports = router;
