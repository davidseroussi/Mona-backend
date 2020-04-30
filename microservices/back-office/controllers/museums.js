const R = require('ramda');
const Museum = require('../models/museum');
const Request = require('../core/request');
const RequestHandler = require('../core/request-handler');
const Database = require('../core/database');

Database.connect();

const insertMuseum = async data => new Museum({title: data.title})
	.save()
	.then(museum => Request.response(201, museum))
	.catch(Request.dbError);

const createMuseum = R.pipeWith(Request.hasNoError, [
	Request.fieldCheck(['title']),
	insertMuseum
]);

const getOneMuseum = async data => Museum.findById(data.museumId)
	.exec()
	.then(museum => Request.response(200, museum))
	.catch(() => Request.error(404, 'Museum not found'));

const getMuseum = R.pipeWith(Request.hasNoError, [
	Request.fieldCheck(['museumId']),
	getOneMuseum
]);

const getAllMuseums = async _ => Museum.find({})
	.exec()
	.then(museums => Request.response(200, museums))
	.catch(Request.dbError);

const create = async event => RequestHandler.handle(createMuseum)(event);
const getAll = async event => RequestHandler.handle(getAllMuseums)(event);
const get = async event => RequestHandler.handle(getMuseum, ['pathParameters'])(event);

module.exports = {
	create,
	get,
	getAll
};
