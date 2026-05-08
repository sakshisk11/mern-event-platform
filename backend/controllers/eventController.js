const User = require('../models/User');
const Event = require('../models/Event');

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

        // Add ticket to user
        user.bookedEvents.push(event._id);
        user.bookedTickets.push({
            event: event._id,
            attendeeName: attendeeName || user.name,
            attendeeId: attendeeId || 'N/A'
        });

        await user.save();

        res.status(200).json({ 
            message: 'Ticket booked successfully!', 
            event,
            spotsRemaining: event.spots 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify a ticket by its subdocument ID (for QR scanning)
// @route   GET /api/events/verify/:ticketId
const verifyTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;

        const user = await User.findOne({ 'bookedTickets._id': ticketId }).populate('bookedTickets.event');

        if (!user) {
            return res.status(404).json({ valid: false, message: 'Ticket not found' });
        }

        const ticket = user.bookedTickets.id(ticketId);

        res.status(200).json({
            valid: true,
            user: ticket.attendeeName,
            attendeeId: ticket.attendeeId,
            event: ticket.event?.title || 'Unknown Event',
            category: ticket.event?.category || '',
            date: ticket.event?.date || '',
            location: ticket.event?.location || '',
            buyerName: user.name
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
    verifyTicket
};
