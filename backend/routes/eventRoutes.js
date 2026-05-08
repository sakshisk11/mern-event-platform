const express = require('express');
const router = express.Router();
const {
    getEvents, getEventById, createEvent,
    updateEvent, deleteEvent, bookEvent,
    verifyTicket, verifyByCode
} = require('../controllers/eventController');
const { protect, admin } = require('../middleware/authMiddleware');


router.get('/',                                    getEvents);
router.post('/verify/:ticketId',                   verifyTicket);    // verify by full MongoDB _id
router.post('/verify-code/:code',                  verifyByCode);    // verify by short code
router.get('/:id',                                 getEventById);
router.post('/',    protect, admin,                createEvent);
router.put('/:id',  protect, admin,                updateEvent);
router.delete('/:id', protect, admin,             deleteEvent);
router.put('/:id/book', protect,                  bookEvent);

module.exports = router;
