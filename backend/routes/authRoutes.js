const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserAuth = require('../models/authModel');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key'; // Change this for production

// Register Account
router.post('/register', async (req, res) => {
    const { name, password, role, email, profilePic } = req.body;

    try {
        // Check if user already exists
        const existingUser = await UserAuth.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use." });
        }

        // Create new user
        const user = await UserAuth.create({ name, password, role, email, profilePic });

        // Generate token
        const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

        res.status(201).json({ user, token });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login Account
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await UserAuth.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

        res.status(200).json({ user, token });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Logout Account (Clears Token on Frontend)
router.post('/logout', (req, res) => {
    res.json({ message: "Logout successful" });
});

// Get Current User
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await UserAuth.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
});

// Refresh Token
router.post('/refresh', (req, res) => {
    res.json({ message: "Token refreshed (implement JWT refresh logic here)" });
});

module.exports = router;
