const express = require('express');
const router = express.Router();
const crawlerController = require('../controllers/crawler');

router.get('/podbang/:id', crawlerController.getPodBbang);
router.get('/audio-clip/:id', crawlerController.getAutoClip);

module.exports = router;