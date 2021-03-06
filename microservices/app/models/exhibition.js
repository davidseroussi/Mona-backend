const mongoose = require('mongoose');

const { Schema } = mongoose;
const ratingSubSchema = require('./sub-rating');
require('./artwork')
require('./museum')

const exhibitionSchema = new Schema({
	museum: {
		type: Schema.Types.ObjectId,
		ref: 'Museum'
	},
	title: {
		type: String,
		required: [true, 'Title is missing']
	},
	categories: [
		{
			type: String,
			enum: [
				'Sciences',
				'Cinéma',
				'Arts visuels',
				'Sculpture',
				'musique',
				'Littérature',
				'Arts de la scène',
				'Photographie',
				'Bande dessinée',
				'Jeux Vidéos'
			]
		}
	],
	tags: [
		{
			type: String,
		}
	],
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
				enum: [
					'Baby',
					'Child',
					'Teen',
					'Student',
					'Adult',
					'PriorityPerson',
					'Standard'
				]
			}
		}
	],
	opening: {
		isOpen: Boolean,
		startDate: Date,
		endDate: Date,
		openingDays: [Number]
	},
	artworks: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Artwork'
		}
	],
	rating: ratingSubSchema,
	visits: {
		visitsCount: {
			type: Number,
			min: [0, 'Number of visits cannot be negative']
		},
		ticketsCount: {
			type: Number,
			min: [0, 'Number of tickets sold cannot be negative']
		},
		sales: {
			type: Number,
			min: [0, 'Sales cannot be negative']
		}
	}
});

exhibitionSchema.methods.toJSON = function () {
	const object = this.toObject();
	delete object.__v;
	return object;
};

module.exports = mongoose.model('Exhibition', exhibitionSchema);
