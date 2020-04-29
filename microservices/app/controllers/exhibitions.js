const R = require('ramda');
const Request = require('../core/request');
const RequestHandler = require('../core/request-handler');
const Exhibition = require('../models/exhibition');

const Database = require('../core/database');

Database.connect();

const getAllExhibitions = async _ => Exhibition.find({})
	.exec()
	.then(exhibitions => Request.response(200, exhibitions))
	.catch(Request.dbError);

const getAll = async event => RequestHandler.handle(getAllExhibitions)(event);

module.exports = {
    getAll
}