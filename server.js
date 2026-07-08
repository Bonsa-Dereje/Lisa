require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Connection
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE';
const supabase = createClient(supabaseUrl, supabaseKey);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Test connection
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// ==================== AUTH ENDPOINTS ====================

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role = 'user' } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, email, and password are required' 
            });
        }

        // Check if user exists
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'User already exists with this email' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert user
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([
                { 
                    id: uuidv4(),
                    name, 
                    email, 
                    password_hash, 
                    role 
                }
            ])
            .select('id, name, email, role, created_at')
            .single();

        if (insertError) {
            console.error('Insert error:', insertError);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to create user' 
            });
        }

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: newUser
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }

        // Find user
        const { data: user, error: findError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Create token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Remove password from response
        delete user.password_hash;

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Get current user (with token)
app.get('/api/auth/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, role, created_at')
            .eq('id', decoded.id)
            .single();

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({ success: true, user });

    } catch (error) {
        console.error('Auth me error:', error);
        res.status(401).json({ 
            success: false, 
            message: 'Invalid token' 
        });
    }
});

// ==================== ARTWORKS ENDPOINTS ====================

// Get all artworks
app.get('/api/artworks', async (req, res) => {
    try {
        const { data: artworks, error } = await supabase
            .from('artworks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, data: artworks });

    } catch (error) {
        console.error('Get artworks error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch artworks' 
        });
    }
});

// Get single artwork
app.get('/api/artworks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const { data: artwork, error } = await supabase
            .from('artworks')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !artwork) {
            return res.status(404).json({ 
                success: false, 
                message: 'Artwork not found' 
            });
        }

        res.json({ success: true, data: artwork });

    } catch (error) {
        console.error('Get artwork error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch artwork' 
        });
    }
});

// Create artwork (authenticated)
app.post('/api/artworks', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const { title, description, artist_name, image_url } = req.body;

        if (!title) {
            return res.status(400).json({ 
                success: false, 
                message: 'Title is required' 
            });
        }

        const { data: artwork, error } = await supabase
            .from('artworks')
            .insert([
                { 
                    id: uuidv4(),
                    user_id: decoded.id,
                    title,
                    description,
                    artist_name: artist_name || decoded.name,
                    image_url: image_url || null
                }
            ])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ 
            success: true, 
            message: 'Artwork created successfully',
            data: artwork 
        });

    } catch (error) {
        console.error('Create artwork error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create artwork' 
        });
    }
});

// Update artwork (authenticated)
app.put('/api/artworks/:id', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const { id } = req.params;
        const { title, description, artist_name, image_url } = req.body;

        // Check ownership
        const { data: existing, error: checkError } = await supabase
            .from('artworks')
            .select('user_id')
            .eq('id', id)
            .single();

        if (checkError || !existing) {
            return res.status(404).json({ 
                success: false, 
                message: 'Artwork not found' 
            });
        }

        if (existing.user_id !== decoded.id && decoded.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to update this artwork' 
            });
        }

        const updates = {};
        if (title) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (artist_name) updates.artist_name = artist_name;
        if (image_url !== undefined) updates.image_url = image_url;
        updates.updated_at = new Date();

        const { data: artwork, error } = await supabase
            .from('artworks')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({ 
            success: true, 
            message: 'Artwork updated successfully',
            data: artwork 
        });

    } catch (error) {
        console.error('Update artwork error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update artwork' 
        });
    }
});

// Delete artwork (authenticated)
app.delete('/api/artworks/:id', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const { id } = req.params;

        // Check ownership
        const { data: existing, error: checkError } = await supabase
            .from('artworks')
            .select('user_id')
            .eq('id', id)
            .single();

        if (checkError || !existing) {
            return res.status(404).json({ 
                success: false, 
                message: 'Artwork not found' 
            });
        }

        if (existing.user_id !== decoded.id && decoded.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to delete this artwork' 
            });
        }

        const { error } = await supabase
            .from('artworks')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ 
            success: true, 
            message: 'Artwork deleted successfully' 
        });

    } catch (error) {
        console.error('Delete artwork error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete artwork' 
        });
    }
});

// ==================== ADMIN ENDPOINTS ====================

// Get all users (admin only)
app.get('/api/admin/users', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Admin access required' 
            });
        }

        const { data: users, error } = await supabase
            .from('users')
            .select('id, name, email, role, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, data: users });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch users' 
        });
    }
});

// Update user role (admin only)
app.put('/api/admin/users/:id/role', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Admin access required' 
            });
        }

        const { id } = req.params;
        const { role } = req.body;

        if (!role || !['user', 'presenter', 'admin'].includes(role)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid role' 
            });
        }

        // Prevent changing admin role
        const { data: user, error: checkError } = await supabase
            .from('users')
            .select('role')
            .eq('id', id)
            .single();

        if (checkError || !user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        if (user.role === 'admin' && role !== 'admin') {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot change admin role' 
            });
        }

        const { data: updated, error } = await supabase
            .from('users')
            .update({ role })
            .eq('id', id)
            .select('id, name, email, role, created_at')
            .single();

        if (error) throw error;

        res.json({ 
            success: true, 
            message: 'User role updated successfully',
            user: updated 
        });

    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update user role' 
        });
    }
});

// Delete user (admin only)
app.delete('/api/admin/users/:id', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Admin access required' 
            });
        }

        const { id } = req.params;

        // Prevent deleting yourself
        if (decoded.id === id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete your own account' 
            });
        }

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ 
            success: true, 
            message: 'User deleted successfully' 
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete user' 
        });
    }
});

// Get presenter's artworks
app.get('/api/presenter/artworks', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded.role !== 'presenter' && decoded.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Presenter access required' 
            });
        }

        const { data: artworks, error } = await supabase
            .from('artworks')
            .select('*')
            .eq('user_id', decoded.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, data: artworks });

    } catch (error) {
        console.error('Get presenter artworks error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch artworks' 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Supabase connected: ${supabaseUrl ? 'Yes' : 'No'}`);
});