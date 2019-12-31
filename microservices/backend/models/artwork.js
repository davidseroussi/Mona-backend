const mongoose = require('mongoose');
const ratingSubSchema = require('./sub_rating');

const artworkSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: {
        type: String,
        required: [true, 'Artwork title is required']
    },
    description: String,
    audioFileUrl: String,
    imageUrl: String,
    rating: ratingSubSchema
});


module.exports = mongoose.model('Artwork', artworkSchema);