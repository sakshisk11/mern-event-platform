const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const makeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOneAndUpdate(
            { email: process.env.ORGANIZER_EMAIL },
            { role: 'admin' },
            { new: true }
        );
        if (user) {
            console.log(`Successfully updated ${user.email} to admin.`);
        } else {
            console.log('User not found. Did you register with ' + process.env.ORGANIZER_EMAIL + '?');
        }
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

makeAdmin();
