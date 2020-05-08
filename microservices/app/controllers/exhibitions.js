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

const getArtworksOfExhibition = async data => {
	const exhibition = await Exhibition.findById(data.exhibitionId)
		.populate('artworks')
		.exec()
		.catch(() => null);

    if(R.isNil(exhibition)){
        return Request.error(404, "Exhibition not found");
    }

    return Request.response(200, exhibition.artworks);
}

const getArtworks_ = R.pipeWith(Request.hasNoError, [
    Request.fieldCheck(['exhibitionId']),
    getArtworksOfExhibition
]);


const getCategories = async event => RequestHandler.handle(getRelevantCategories)(event);
const getExhibitions = async event => RequestHandler.handle(getExhibitionsOfCategories, ['multiValueQueryStringParameters'])(event);
const getArtworks = async event => RequestHandler.handle(getArtworks_, ['pathParameters'])(event);


module.exports = {
	getCategories,
	getExhibitions,
	getArtworks
}