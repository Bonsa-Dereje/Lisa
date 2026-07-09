// routes/presenterRoutes.js
const express = require('express');
const artworkController = require('../controllers/artworkController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/artworks', requireAuth, requireRole('presenter', 'admin'), artworkController.myArtworks);

module.exports = router;
