const mongoose = require('mongoose');
const ratingSubSchema = require('./sub-rating');
require('./exhibition');

const artworkSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, 'Artwork title is required']
	},
	description: String,
	audioFileUrl: String,
	imageUrl: String,
	rating: ratingSubSchema,
	exhibition: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Exhibition'
	}
});

artworkSchema.methods.toJSON = function () {
	const object = this.toObject();
	delete object.__v;
	return object;
};

module.exports = mongoose.model('Artwork', artworkSchema);
