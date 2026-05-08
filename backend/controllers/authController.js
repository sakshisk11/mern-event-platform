const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

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

// Helper: generate a 6-char alphanumeric ticket code
const makeCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
};

const getUserProfile = async (req, res) => {
    try {
        const userRaw = await User.findById(req.user.id).lean();
        if (!userRaw) return res.status(404).json({ message: 'User not found' });

        console.log('--- getUserProfile debug ---');
        console.log('Total tickets:', userRaw.bookedTickets.length);

        const setOps = {};
        userRaw.bookedTickets.forEach((ticket, idx) => {
            console.log(`Ticket ${idx}: ticketCode="${ticket.ticketCode}"`);
            if (!ticket.ticketCode) {
                setOps[`bookedTickets.${idx}.ticketCode`] = makeCode();
            }
        });

        console.log('setOps to apply:', setOps);

        if (Object.keys(setOps).length > 0) {
            const updateResult = await User.updateOne({ _id: req.user.id }, { $set: setOps });
            console.log('updateOne result:', JSON.stringify(updateResult));
        } else {
            console.log('No tickets needed updating.');
        }

        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('bookedEvents')
            .populate('bookedTickets.event');

        res.status(200).json(user);
    } catch (error) {
        console.error('getUserProfile error:', error);
        res.status(500).json({ message: error.message });
    }
};





module.exports = {
    registerUser,
    loginUser,
    getUserProfile
};
