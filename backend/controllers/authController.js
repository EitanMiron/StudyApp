const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserAuth = require('../models/authModel');

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key'; // Change this for production

// Register a new user
const register = async (req, res) => {
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
};

// Login user
const login = async (req, res) => {
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

        res.status(200).json({
            token,
            role: user.role,
            email: user.email
         });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Logout (Handled on frontend)
const logout = (req, res) => {
    res.json({ message: "Logout successful" });
};

// Get current user
const getCurrentUser = async (req, res) => {
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
};

// Refresh token placeholder (implement refresh token logic if needed)
const refreshToken = (req, res) => {
    res.json({ message: "Token refreshed (implement JWT refresh logic here)" });
};

module.exports = { register, login, logout, getCurrentUser, refreshToken };
