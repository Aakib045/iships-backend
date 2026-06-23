const { Router } = require('express');
const requireAuth = require('../middleware/auth');
const { createInquiry, listInquiries, markRead } = require('../controllers/inquiryController');

const router = Router();

router.post('/', createInquiry);
router.get('/', requireAuth, listInquiries);
router.patch('/:id/read', requireAuth, markRead);

module.exports = router;
