/**
 * One-time migration script: assign ticketCode to all tickets that don't have one.
 * Run with: node scripts/fixTicketCodes.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

// Same character set as the main app (no 0,O,1,I)
const makeCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
};

async function run() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected!\n');

    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();

    let totalFixed = 0;

    for (const user of users) {
        if (!user.bookedTickets || user.bookedTickets.length === 0) continue;

        const setOps = {};
        user.bookedTickets.forEach((ticket, idx) => {
            if (!ticket.ticketCode) {
                setOps[`bookedTickets.${idx}.ticketCode`] = makeCode();
            }
        });

        if (Object.keys(setOps).length > 0) {
            await db.collection('users').updateOne(
                { _id: user._id },
                { $set: setOps }
            );
            console.log(`✅ Fixed ${Object.keys(setOps).length} ticket(s) for user: ${user.name} (${user.email})`);
            Object.entries(setOps).forEach(([key, code]) => {
                console.log(`   ${key} → ${code}`);
            });
            totalFixed += Object.keys(setOps).length;
        } else {
            console.log(`⏭  No fix needed for: ${user.name}`);
        }
    }

    console.log(`\nDone! Fixed ${totalFixed} ticket(s) total.`);
    await mongoose.disconnect();
}

run().catch(err => { console.error('Error:', err); process.exit(1); });
