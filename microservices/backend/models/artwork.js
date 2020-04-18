const mongoose = require("mongoose");
const ratingSubSchema = require("./sub_rating");

const artworkSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: {
        type: String,
        required: [true, "Artwork title is required"],
    },
    description: String,
    audioFileUrl: String,
    imageUrl: String,
    rating: ratingSubSchema,
    exhibitionId: mongoose.Schema.Types.ObjectId,
});

artworkSchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model("Artwork", artworkSchema);
