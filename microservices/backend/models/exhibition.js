const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ratingSubSchema = require('./sub_rating');

const exhibitionSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is missing"]
    },
    description: String,
    imageUrl: String,
    rates: [
        {
            price: {
                type: Number,
                min: [0, 'Price cannot be negative']
            },
            category: {
                type: String,
                //TODO Remplacer par un objet à part entière
                enum: ['Student', 'Standard', 'Child']
            },
            iconUrl: String
        }
    ],
    openingDate: {
        startDate: Date,
        finishDate: Date,
        openingDays: [Number]
    },
    artworks: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Artwork'
        }
    ],
    rating: ratingSubSchema
});

module.exports = mongoose.model('Exhibition', exhibitionSchema);