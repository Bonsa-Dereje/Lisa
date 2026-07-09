// routes/artworkRoutes.js
const express = require('express');
const artworkController = require('../controllers/artworkController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// public
router.get('/', artworkController.list);
router.get('/:id', artworkController.getOne);

// only logged-in presenters/admins can create artwork
router.post('/', requireAuth, requireRole('presenter', 'admin'), artworkController.create);
router.delete('/:id', requireAuth, requireRole('presenter', 'admin'), artworkController.remove);

module.exports = router;
