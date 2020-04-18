const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ratingSubSchema = require("./sub_rating");

const exhibitionSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: {
        type: String,
        required: [true, "Title is missing"],
    },
    description: String,
    imageUrl: String,
    rates: [
        {
            price: {
                type: Number,
                min: [0, "Price cannot be negative"],
            },
            category: {
                type: String,
                //TODO Remplacer par un objet à part entière
                enum: [
                    "Baby",
                    "Child",
                    "Teen",
                    "Student",
                    "Adult",
                    "PriorityPerson",
                    "Standard",
                ],
            },
        },
    ],
    opening: {
        isOpen: Boolean,
        startDate: Date,
        endDate: Date,
        openingDays: [Number],
    },
    artworks: [
        {
            type: Schema.Types.ObjectId,
            ref: "Artwork",
        },
    ],
    rating: ratingSubSchema,
    visits: {
        visitsCount: {
            type: Number,
            min: [0, "Number of visits cannot be negative"],
        },
        ticketsCount: {
            type: Number,
            min: [0, "Number of tickets sold cannot be negative"],
        },
        sales: {
            type: Number,
            min: [0, "Sales cannot be negative"],
        },
    },
});

exhibitionSchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model("Exhibition", exhibitionSchema);
