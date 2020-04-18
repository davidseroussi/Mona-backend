const R = require("ramda");
const Museum = require("../models/museum");
const Request = require("../core/request");
const RequestHandler = require("../core/requestHandler");
const Database = require("../core/database");

Database.connect();

const insertMuseum = async (data) =>
    new Museum({ title: data.title })
        .save()
        .then((museum) => Request.response(201, museum))
        .catch(Request.dbError);

const createMuseum = R.pipeWith(Request.hasNoError, [
    Request.fieldCheck(["title"]),
    insertMuseum,
]);

const getMuseums = async (data) =>
    Museum.find({})
        .exec()
        .then((museums) => Request.response(200, museums))
        .catch(Request.dbError);

const create = async (event) => RequestHandler.handle(createMuseum)(event);
const get = async (event) => RequestHandler.handle(getMuseums)(event);

module.exports = {
    create,
    get,
};
