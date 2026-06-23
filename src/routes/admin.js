const { Router } = require('express');
const { login } = require('../controllers/adminController');

const router = Router();

router.post('/login', login);

module.exports = router;
