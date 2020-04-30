const R = require('ramda');
const Request = require('../core/request');
const RequestHandler = require('../core/request-handler');
const Artwork = require('../models/artwork');
const Exhibition = require('../models/exhibition');

const Database = require('../core/database');

Database.connect();

const getArtworksOfExhibition = async data => {
	const exhibition = await Exhibition.findById(data.exhibition)
		.populate('artworks')
		.exec()
		.catch(() => null);

    if(R.isNil(exhibition)){
        return Request.error(404, "Exhibition not found");
    }

    return Request.response(200, exhibition.artworks);
}

const getArtworks = R.pipeWith(Request.hasNoError, [
    Request.fieldCheck(['exhibition']),
    getArtworksOfExhibition
]);

const get = async event => RequestHandler.handle(getArtworks, ['queryStringParameters'])(event);

module.exports = {
    get
}