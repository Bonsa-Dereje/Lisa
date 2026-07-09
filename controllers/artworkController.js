// controllers/artworkController.js
const crypto = require('crypto');
const ArtworkModel = require('../models/artworkModel');
const UserModel = require('../models/userModel');

function makeId() {
    return crypto.randomUUID();
}

// keep the base64 payload we accept in SQL reasonable (roughly 8MB of image data)
const MAX_IMAGE_BASE64_LENGTH = 8 * 1024 * 1024 * 1.4;

const artworkController = {
    async list(req, res) {
        try {
            const artworks = await ArtworkModel.findAll();
            res.json({ artworks });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Could not load artworks' });
        }
    },

    async getOne(req, res) {
        try {
            const artwork = await ArtworkModel.findById(req.params.id);
            if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
            res.json({ artwork });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Could not load artwork' });
        }
    },

    // AUTHORIZATION already applied in the route (presenter/admin only)
    // Presenter gives their work a name + an image; the item number is
    // assigned automatically by the item manager, and the creator name is
    // pulled from the logged-in presenter's account.
    async create(req, res) {
        try {
            const { title, imageData, imageMimetype } = req.body;

            if (!title || !title.trim()) {
                return res.status(400).json({ message: 'Please give your work a name' });
            }

            if (!imageData) {
                return res.status(400).json({ message: 'Please attach an image' });
            }

            if (imageData.length > MAX_IMAGE_BASE64_LENGTH) {
                return res.status(413).json({ message: 'That image is too large' });
            }

            const presenter = await UserModel.findById(req.user.id);

            const artwork = await ArtworkModel.create({
                id: makeId(),
                userId: req.user.id,
                title: title.trim(),
                creatorName: presenter ? presenter.name : 'Unknown presenter',
                imageData,
                imageMimetype: imageMimetype || 'image/png'
            });

            res.status(201).json({ artwork });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Could not post your work' });
        }
    },

    async myArtworks(req, res) {
        try {
            const artworks = await ArtworkModel.findByUserId(req.user.id);
            res.json({ artworks });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Could not load your artworks' });
        }
    },

    async remove(req, res) {
        try {
            const deleted = await ArtworkModel.deleteById(req.params.id);
            if (!deleted) return res.status(404).json({ message: 'Artwork not found' });
            res.json({ message: 'Artwork deleted' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Could not delete artwork' });
        }
    }
};

module.exports = artworkController;
