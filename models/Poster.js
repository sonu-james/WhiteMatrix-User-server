    const mongoose = require('mongoose');

    const posterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    phone: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    image: { type: String, required: true }, // Base64 encoded image
    });

    const Poster = mongoose.model('Poster', posterSchema);
    module.exports = Poster;
