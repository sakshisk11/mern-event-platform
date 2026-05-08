const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const events = [
  { title: 'Annual Tech Hackathon', category: 'Tech', desc: 'A 48-hour coding marathon. Build amazing things with your college peers!', spots: 5 },
  { title: 'Inter-College Badminton', category: 'Sports', desc: 'Show off your smashes and win the gold medal this Friday!', spots: 20 },
  { title: 'Campus Music Fest', category: 'Cultural', desc: 'Live bands all night. Bring your student ID.', spots: 150 },
  { title: 'AI & Machine Learning Workshop', category: 'Tech', desc: 'Learn the basics of Neural Networks from industry experts.', spots: 0 }
];

const importData = async () => {
    try {
        await Event.deleteMany();
        await Event.insertMany(events);
        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

importData();
