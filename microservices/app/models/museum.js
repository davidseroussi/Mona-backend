const mongoose = require('mongoose');

const {Schema} = mongoose;

const museumSchema = new Schema({
	title: {
		type: String,
		required: [true, 'Title is missing']
	},
	imageUrl: String,
	location: {
		address: String,
		lat: Number,
		lon: Number
	},
	exhibitions: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Exhibition'
		}
	],
	artworks: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Artwork'
		}
	]
});

museumSchema.methods.toJSON = function () {
	const object = this.toObject();
	delete object.__v;
	return object;
};

module.exports = mongoose.model('Museum', museumSchema);
