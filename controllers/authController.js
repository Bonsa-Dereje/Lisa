// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UserModel = require('../models/userModel');

function makeId() {
    return crypto.randomUUID();
}

function signToken(user) {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

const authController = {
    async register(req, res) {
        try {
            const { name, email, password, role } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ message: 'Name, email and password are required' });
            }

            const existing = await UserModel.findByEmail(email);
            if (existing) {
                return res.status(409).json({ message: 'Email is already registered' });
            }

            // HASHING - never store plain-text passwords
            const passwordHash = await bcrypt.hash(password, 10);

            const safeRole = ['user', 'presenter'].includes(role) ? role : 'user';

            const user = await UserModel.create({
                id: makeId(),
                name,
                email,
                passwordHash,
                role: safeRole
            });

            res.status(201).json({ user });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Registration failed' });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const match = await bcrypt.compare(password, user.password_hash);
            if (!match) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // JWT - issue a signed token for session/identity management
            const token = signToken(user);

            res.json({
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Login failed' });
        }
    },

    async me(req, res) {
        try {
            const user = await UserModel.findById(req.user.id);
            if (!user) return res.status(404).json({ message: 'User not found' });
            res.json({ user });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Could not load user' });
        }
    }
};

module.exports = authController;
