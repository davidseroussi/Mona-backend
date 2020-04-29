ratingSubSchema = {
	value: {
		type: Number,
		min: [0, 'Rating cannot be negative'],
		max: [5, 'Rating cannot be over 5']
	},
	votersCount: {
		type: Number,
		min: [0, 'VotersCount cannot be negative']
	}
};

module.exports = ratingSubSchema;
