const User = require('../models/User');
const Event = require('../models/Event');

// Generate a unique 6-char alphanumeric ticket code (no 0,O,1,I to avoid confusion)
const generateTicketCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
};

// @desc    Get all events
// @route   GET /api/events
const getEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create an event (admin only)
// @route   POST /api/events
const createEvent = async (req, res) => {
    try {
        const { title, category, desc, spots, date, location, organizer } = req.body;

        if (!title || !category || !desc || spots === undefined) {
            return res.status(400).json({ message: 'Please add all required fields (title, category, desc, spots)' });
        }

        const spotsNum = Number(spots);
        if (isNaN(spotsNum) || spotsNum < 1) {
            return res.status(400).json({ message: 'Spots must be a positive number' });
        }

        const event = await Event.create({
            title,
            category,
            desc,
            spots: spotsNum,
            totalSpots: spotsNum,
            date: date || '',
            location: location || '',
            organizer: organizer || 'EventMaster Pro'
        });

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update an event (admin only)
// @route   PUT /api/events/:id
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an event (admin only)
// @route   DELETE /api/events/:id
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        await event.deleteOne();
        res.status(200).json({ message: 'Event removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Book a ticket for an event
// @route   PUT /api/events/:id/book
const bookEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        const user = await User.findById(req.user.id);
        const { attendeeName, attendeeId } = req.body;

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.spots <= 0) {
            return res.status(400).json({ message: 'Sorry, this event is fully booked!' });
        }

        // Backfill totalSpots for events created before this field existed
        if (!event.totalSpots) {
            event.totalSpots = event.spots;
        }

        // Decrement available spots
        event.spots -= 1;
        await event.save();

        const ticketCode = generateTicketCode();

        // Use raw MongoDB driver to push the ticket — Mongoose $push/$save
        // was silently dropping ticketCode; raw driver is guaranteed to work.
        const col = require('mongoose').connection.db.collection('users');
        const userId = new require('mongoose').Types.ObjectId(req.user.id);

        await col.updateOne(
            { _id: userId },
            {
                $push: {
                    bookedEvents: event._id,
                    bookedTickets: {
                        _id:          new (require('mongoose').Types.ObjectId)(),
                        event:        event._id,
                        attendeeName: attendeeName || user.name,
                        attendeeId:   attendeeId   || 'N/A',
                        ticketCode,
                        scanned:      false,
                        scannedAt:    null
                    }
                }
            }
        );

        res.status(200).json({
            message: 'Ticket booked successfully!',
            event,
            spotsRemaining: event.spots
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify a ticket by its ID — marks it as used on first scan
// @route   POST /api/events/verify/:ticketId
const verifyTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;

        // Find the user who owns this ticket
        const user = await User.findOne({ 'bookedTickets._id': ticketId }).populate('bookedTickets.event');

        if (!user) {
            return res.status(404).json({ valid: false, message: 'Ticket not found' });
        }

        const ticket = user.bookedTickets.id(ticketId);

        // ── Check if ticket was already scanned ──────────────────────
        if (ticket.scanned) {
            return res.status(200).json({
                valid: false,
                alreadyUsed: true,
                message: 'Ticket already scanned!',
                attendeeName: ticket.attendeeName,
                attendeeId: ticket.attendeeId,
                scannedAt: ticket.scannedAt,
                event: ticket.event?.title || 'Unknown Event',
            });
        }

        // ── First scan: mark ticket as used ──────────────────────────
        ticket.scanned = true;
        ticket.scannedAt = new Date();
        await user.save();

        res.status(200).json({
            valid: true,
            alreadyUsed: false,
            attendeeName: ticket.attendeeName,
            attendeeId: ticket.attendeeId,
            event: ticket.event?.title || 'Unknown Event',
            category: ticket.event?.category || '',
            date: ticket.event?.date || '',
            location: ticket.event?.location || '',
            scannedAt: ticket.scannedAt,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify ticket by its 8-char code (first 8 chars of ticket _id, shown on Dashboard)
// @route   POST /api/events/verify-code/:code
const verifyByCode = async (req, res) => {
    try {
        const code = req.params.code.toUpperCase().trim();

        // Fetch all users and scan for the matching ticket
        // (linear scan is fine for a small system)
        const users = await User.find({}).populate('bookedTickets.event');

        let matchedUser   = null;
        let matchedTicket = null;

        for (const u of users) {
            for (const t of u.bookedTickets) {
                if (t._id.toString().substring(0, 8).toUpperCase() === code) {
                    matchedUser   = u;
                    matchedTicket = t;
                    break;
                }
            }
            if (matchedUser) break;
        }

        if (!matchedUser || !matchedTicket) {
            return res.status(404).json({ valid: false, message: `No ticket found with code "${code}"` });
        }

        // Already used?
        if (matchedTicket.scanned) {
            return res.status(200).json({
                valid:        false,
                alreadyUsed:  true,
                attendeeName: matchedTicket.attendeeName,
                attendeeId:   matchedTicket.attendeeId,
                event:        matchedTicket.event?.title || 'Unknown Event',
                scannedAt:    matchedTicket.scannedAt,
            });
        }

        // First use — mark as scanned
        matchedTicket.scanned   = true;
        matchedTicket.scannedAt = new Date();
        await matchedUser.save();

        return res.status(200).json({
            valid:        true,
            alreadyUsed:  false,
            attendeeName: matchedTicket.attendeeName,
            attendeeId:   matchedTicket.attendeeId,
            event:        matchedTicket.event?.title || 'Unknown Event',
            category:     matchedTicket.event?.category || '',
            scannedAt:    matchedTicket.scannedAt,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    bookEvent,
    verifyTicket,
    verifyByCode,
};
