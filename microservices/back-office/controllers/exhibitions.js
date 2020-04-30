const R = require('ramda');
const Museum = require('../models/museum');
const Artwork = require('../models/artwork');
const Exhibition = require('../models/exhibition');
const Request = require('../core/request');
const RequestHandler = require('../core/request-handler');
const Database = require('../core/database');

Database.connect();

const findMuseum = async condition => Museum.findOne(condition).exec();
const insertExhibition = async exhibition => exhibition.save();
const attachExhibitionToMuseum = async (museum, exhibition) => {
	museum.exhibitions.push(exhibition._id);
	return museum.save();
};

const updateExhibitionOfMuseum = async data => {
	const museum = await findMuseum({ _id: data.museumId }).catch(() => null);
	if (museum === null) {
		return Request.error(404, 'Museum not found');
	}

	const exhibition = await Exhibition.findByIdAndUpdate(
		data.exhibitionId,
		data.exhibition,
		{ new: true }
	).exec().catch(Request.dbError);

	if (exhibition === null) {
		return Request.error(404, 'Exhibition not found');
	}

	if (Request.hasError(exhibition)) {
		return exhibition;
	}

	return Request.response(200, exhibition);
};

const getAllExhibitionsOfMuseum = async data => Museum.findById(data.museumId)
	.populate('exhibitions')
	.exec()
	.then(m => Request.response(200, m.exhibitions))
	.catch(_ => Request.error(404, 'Museum not found'));

const getExhibitionOfMuseum = async data => {
	const museum = await Museum.findById(data.museumId)
		.populate('exhibitions')
		.exec()
		.catch(() => null);

	if (museum === null) {
		return Request.error(404, 'Museum not found');
	}

	const exhibition = await Exhibition.findById(data.exhibitionId)
		.populate('artworks')
		.exec()
		.catch(() => null);

	if (R.isNil(exhibition)) {
		return Request.error(404, 'Exhibition not found');
	}

	return Request.response(200, exhibition);
};

const createExhibitionOfMuseum = async data => {
	const museum = await findMuseum({ _id: data.museumId }).catch(() => null);
	if (museum === null) {
		return Request.error(404, 'Museum not found');
	}

	const exhibition = await insertExhibition(new Exhibition({ title: data.title }))
		.catch(Request.dbError);

	if (Request.hasError(exhibition)) {
		return exhibition;
	}

	const updatedMuseum = await attachExhibitionToMuseum(
		museum,
		exhibition
	).catch(Request.dbError);
	if (Request.hasError(updatedMuseum)) {
		return updatedMuseum;
	}

	return Request.response(201, exhibition);
};

const deleteExhibitionOfMuseum = async data => {
	const museum = await Museum.findById(data.museumId).exec().catch(() => null);
	if (museum === null) {
		return Request.error(404, 'Museum not found');
	}

	const exhibition = await Exhibition.findByIdAndDelete(data.exhibitionId)
		.exec()
		.catch(Request.dbError);

	if (exhibition === null) {
		return Request.error(404, 'Exhibition not found');
	}

	if (Request.hasError(exhibition)) {
		return exhibition;
	}

	// Remove exhibition from museum
	museum.exhibitions.pull({ _id: exhibition._id });
	await museum.save();

	// Remove exhibition from attached artworks
	const res = await Artwork.updateMany(
		{ exhibition: exhibition._id }, { $unset: { exhibition: 1 } }
	).catch(Request.dbError);

	if (Request.hasError(res)) {
		return artwork;
	}

	return Request.response(200, undefined);
}

const createExhibition = R.pipeWith(Request.hasNoError, [
	Request.fieldCheck(['museumId']),
	Request.fieldCheck(['title']),
	createExhibitionOfMuseum
]);

const getAllExhibitions = R.pipeWith(Request.hasNoError, [
	Request.fieldCheck(['museumId']),
	getAllExhibitionsOfMuseum
]);

const getExhibition = R.pipeWith(Request.hasNoError, [
	Request.fieldCheck(['museumId']),
	Request.fieldCheck(['exhibitionId']),
	getExhibitionOfMuseum
]);

const updateExhibition = R.pipeWith(Request.hasNoError, [
	Request.fieldCheck(['museumId']),
	Request.fieldCheck(['exhibitionId']),
	Request.fieldCheck(['exhibition']),
	updateExhibitionOfMuseum
]);

const deleteExhibition = R.pipeWith(Request.hasNoError, [
	Request.fieldCheck(['museumId']),
	Request.fieldCheck(['exhibitionId']),
	deleteExhibitionOfMuseum
]);

const create = async event => RequestHandler.handle(createExhibition, ['queryStringParameters'])(event);
const get = async event => RequestHandler.handle(getExhibition, ['pathParameters'])(event);
const getAll = async event => RequestHandler.handle(getAllExhibitions)(event);
const update = async event => RequestHandler.handle(updateExhibition, ['pathParameters', 'queryStringParameters'])(event);
const deleteOne = async event => RequestHandler.handle(deleteExhibition, ['pathParameters', 'queryStringParameters'])(event);

module.exports = {
	create,
	get,
	getAll,
	update,
	deleteOne
};
