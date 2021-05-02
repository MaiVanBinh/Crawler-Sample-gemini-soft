const express = require('express');
const router = express.Router();
const crawlerController = require('../controllers/crawler');

router.get('/podbang', crawlerController.getPodBbang);
router.get('/audio-clip', crawlerController.getAutoClip);

module.exports = router;