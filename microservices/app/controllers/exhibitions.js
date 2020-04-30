const R = require('ramda');
const Request = require('../core/request');
const RequestHandler = require('../core/request-handler');
const Exhibition = require('../models/exhibition');

const Database = require('../core/database');

Database.connect();


const getRelevantCategories = async _ => {
	const categories = ['Sciences', 'Cinéma', 'Arts Visuels', 'Sculpture', 'Musique']
	return Request.response(200, categories);
}

const getExhibitionsOfCategories = async data => {
	let condition = {};

	if (!R.isNil(data.categories) && data.categories.length !== 0) {
		condition = { categories: { $in: data.categories } }
	}

	return Exhibition
		.find(condition)
		.populate('museum')
		.select('-visits')
		.exec()
		.then(exhibitions => Request.response(200, exhibitions))
		.catch(Request.dbError);
}


const getCategories = async event => RequestHandler.handle(getRelevantCategories)(event);
const getExhibitions = async event => RequestHandler.handle(getExhibitionsOfCategories, ['multiValueQueryStringParameters'])(event);

module.exports = {
	getCategories,
	getExhibitions
}