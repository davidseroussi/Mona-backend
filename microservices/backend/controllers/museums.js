const mongoose = require('mongoose');
const R = require('ramda');
const requestHandler = require('../requestHandler');
const Museum = require('../models/museum');
const U = require('../utils');

let db_uri = 'mongodb://127.0.0.1:27017/db-mona'

mongoose.connect(db_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const insertMuseum = async data => new Museum({ title: data.title })
    .save()
    .then(museum => U.response(201, museum))
    .catch(U.dbError);

const createMuseum = R.pipeWith(U.hasNoError, [
    U.fieldCheck(['title']),
    insertMuseum
]);

const getMuseums = async data => Museum
    .find({})
    .exec()
    .then(museums => U.response(200, museums))
    .catch(U.dbError);

const create = async event => requestHandler(createMuseum)(event);
const get = async event => requestHandler(getMuseums)(event);

module.exports = {
    create,
    get
};