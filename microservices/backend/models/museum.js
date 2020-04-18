const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const museumSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is missing"],
    },
    imageUrl: String,
    location: {
        address: String,
        lat: Number,
        lon: Number,
    },
    exhibitions: [
        {
            type: Schema.Types.ObjectId,
            ref: "Exhibition",
        },
    ],
});

museumSchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model("Museum", museumSchema);
