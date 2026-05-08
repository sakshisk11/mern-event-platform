const mongoose = require('mongoose');
require('dotenv').config();

async function migrate() {
    await mongoose.connect(process.env.MONGO_URI);
    const Event = require('./models/Event');

    const events = await Event.find();
    let fixed = 0;

    for (const e of events) {
        if (!e.totalSpots) {
            // For sold-out events, we can't know original totalSpots; skip or set 1 as placeholder
            // Use spots if > 0, otherwise mark as 1 (these will need manual correction)
            e.totalSpots = e.spots > 0 ? e.spots : 1;
            await e.save();
            console.log(`Fixed: "${e.title}" -> totalSpots set to ${e.totalSpots}`);
            fixed++;
        }
    }

    console.log(`\nMigration complete! Fixed ${fixed} events.`);
    process.exit(0);
}

migrate().catch(err => { console.error(err); process.exit(1); });
