const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

const makeCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
};


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if this user is the designated organizer
        const role = email === process.env.ORGANIZER_EMAIL ? 'admin' : 'user';

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



const getUserProfile = async (req, res) => {
    try {
        const col = mongoose.connection.db.collection('users');
        const userId = new mongoose.Types.ObjectId(req.user.id.toString());

        // Load plain doc to find tickets missing a code
        const userRaw = await col.findOne({ _id: userId });
        if (!userRaw) return res.status(404).json({ message: 'User not found' });

        // Build $set for any ticket that has no ticketCode
        const setOps = {};
        (userRaw.bookedTickets || []).forEach((ticket, idx) => {
            if (!ticket.ticketCode) {
                setOps[`bookedTickets.${idx}.ticketCode`] = makeCode();
            }
        });

        if (Object.keys(setOps).length > 0) {
            await col.updateOne({ _id: userId }, { $set: setOps });
        }

        // Return populated Mongoose document for the response
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('bookedEvents')
            .populate('bookedTickets.event');

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};






module.exports = {
    registerUser,
    loginUser,
    getUserProfile
};
