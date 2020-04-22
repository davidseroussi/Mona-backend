const R = require('ramda');
const Artwork = require('../models/artwork');
const Exhibition = require('../models/exhibition');
const Museum = require('../models/museum');
const Request = require('../core/request');
const RequestHandler = require('../core/request-handler');
const Database = require('../core/database');

Database.connect();

const updateArtworkOfMuseum = async data => {
	// Check if museum exists
	const museum = await Museum.findById(data.museumId)
		.populate('exhibitions')
		.exec()
		.catch(() => null);
	if (museum === null) {
		return Request.error(404, 'Museum not found');
	}

	// Check if artwork exists
	let artwork = await Artwork.findById(data.artworkId).exec().catch(() => null);
	if (artwork === null) {
		return Request.error(404, 'Artwork not found');
	}

	// If data contains a different exhibition than the one in artwork,
	// send an error
	if (!R.isNil(data.artwork.exhibition) && !R.isNil(artwork.exhibition) &&
        artwork.exhibition.toString() !== data.artwork.exhibition) {
		return Request.error(400, 'Artwork already has an exhibition');
	}

	// If artwork does not have an exhibition yet, and if
	// new exhibition is not null, check if exhibition exists
	if (R.isNil(artwork.exhibition) && !R.isNil(data.artwork.exhibition)) {
		let exhibition = museum.exhibitions.find(x => x._id.toString() === data.artwork.exhibition);
		if (R.isNil(exhibition)) {
			return Request.error(404, 'Exhibition not found');
		}

		// Update exhibition
		exhibition.artworks.push(artwork._id);
		exhibition = await exhibition.save().catch(Request.dbError);
		if (Request.hasError(exhibition)) {
			return exhibition;
		}
	}

	// Update artwork
	artwork = await Artwork.findByIdAndUpdate(
		data.artworkId,
		data.artwork,
		{new: true}
	).populate('exhibition').exec().catch(Request.dbError);
	if (Request.hasError(artwork)) {
		return artwork;
	}

	return Request.response(200, artwork);
};

const getArtworksOfMuseum = async data => Museum.findById(data.museumId)
	.populate('artworks')
	.exec()
	.then(m => Request.response(200, m.artworks))
	.catch(_ => Request.error(404, 'Museum not found'));

const createArtworkOfMuseum = async data => {
	// Check if museum exists
	let museum = await Museum.findById(data.museumId)
		.populate('exhibitions')
		.exec()
		.catch(() => null);
	if (museum === null) {
		return Request.error(404, 'Museum not found');
	}

	// Create Artwork and add its id to the museum without saving it
	let artwork = new Artwork(data.artwork);
	museum.artworks.push(artwork._id);

	// If exhibition is not null, check if it exists
	if (!R.isNil(data.artwork.exhibition)) {
		let exhibition = museum.exhibitions.find(x => x._id.toString() === data.artwork.exhibition);
		if (R.isNil(exhibition)) {
			return Request.error(404, 'Exhibition not found');
		}

		// Update exhibition
		exhibition.artworks.push(artwork._id);
		exhibition = await exhibition.save().catch(Request.dbError);
		if (Request.hasError(exhibition)) {
			return exhibition;
		}
	}

	// Insert artwok
	artwork = await artwork.save()
		.then(x => x.populate('exhibition').execPopulate())
		.catch(Request.dbError);
	if (Request.hasError(artwork)) {
		return artwork;
	}

	// Update Museum
	museum = await museum.save().catch(Request.dbError);
	if (Request.hasError(museum)) {
		return museum;
	}

	return Request.response(201, artwork);
};

const createArtwork = R.pipeWith(Request.hasNoError, [
	Request.fieldCheck(['museumId']),
	Request.fieldCheck(['artwork']),
	createArtworkOfMuseum
]);

const getArtworks = R.pipeWith(Request.hasNoError, [
	Request.fieldCheck(['museumId']),
	getArtworksOfMuseum
]);

const updateArtwork = R.pipeWith(Request.hasNoError, [
	Request.fieldCheck(['museumId']),
	Request.fieldCheck(['artworkId']),
	Request.fieldCheck(['artwork']),
	updateArtworkOfMuseum
]);

const create = async event => RequestHandler.handle(createArtwork)(event);
const get = async event => RequestHandler.handle(getArtworks)(event);
const update = async event => RequestHandler.handle(updateArtwork, ['pathParameters'])(event);

module.exports = {
	create,
	get,
	update
};
