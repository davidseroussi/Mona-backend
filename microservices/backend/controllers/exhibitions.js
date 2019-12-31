const mongoose = require('mongoose');
const R = require('ramda');
const requestHandler = require('../requestHandler');
const Museum = require('../models/museum');
const Exhibition = require('../models/exhibition');
const U = require('../utils');

let db_uri = 'mongodb://127.0.0.1:27017/db-mona'

mongoose.connect(db_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const findMuseum = async condition => Museum.findOne(condition).exec();
const insertExhibition = async exhibition => exhibition.save();
const attachExhibitionToMuseum = async (museum, exhibition) => {
    museum.exhibitions.push(exhibition._id);
    return museum.save();
};


const updateExhibitionOfMuseum = async data => {
    const museum = await findMuseum({ _id: data.museumId }).catch(() => null);
    if (museum === null) return U.error(404, "Museum not found");

    return Exhibition
        .findByIdAndUpdate(data.exhibition.id, data.exhibition, { new: true })
        .exec()
        .then(e => U.response(200, e))
        .catch(U.dbError);
}

const getExhbitionsOfMuseum = async data => {
    return Museum.findById(data.museumId)
        .populate('exhibitions')
        .exec()
        .then(m => U.response(200, m.exhibitions))
        .catch(err => U.error(404, "Museum not found"));
}

const createExhibitionOfMuseum = async data => {

    const museum = await findMuseum({ _id: data.museumId }).catch(() => null);
    if (museum === null) return U.error(404, "Museum not found");

    const exhibition = await insertExhibition(new Exhibition({ title: data.title })).catch(U.dbError);
    if (U.hasError(exhibition)) return exhibition;

    const updatedMuseum = await attachExhibitionToMuseum(museum, exhibition).catch(U.dbError);
    if (U.hasError(updatedMuseum)) return updatedMuseum;

    return U.response(201, updatedMuseum);
};

const createExhibition = R.pipeWith(U.hasNoError, [
    U.fieldCheck(['museumId']),
    U.fieldCheck(['title']),
    createExhibitionOfMuseum
]);

const getExhibitions = R.pipeWith(U.hasNoError, [
    U.fieldCheck(['museumId']),
    getExhbitionsOfMuseum
]);

const updateExhibition = R.pipeWith(U.hasNoError, [
    U.fieldCheck(['museumId']),
    U.fieldCheck(['exhibition']),
    U.fieldCheck(['exhibition', 'id']),
    updateExhibitionOfMuseum
]);

const create = async event => requestHandler(createExhibition)(event);
const get = async event => requestHandler(getExhibitions)(event);
const update = async event => requestHandler(updateExhibition)(event)

module.exports = {
    create,
    get,
    update
};