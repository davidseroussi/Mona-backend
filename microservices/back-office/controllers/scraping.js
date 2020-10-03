const R = require('ramda');
const Museum = require('../models/museum');
const Artwork = require('../models/artwork');
const Exhibition = require('../models/exhibition');
const Request = require('../core/request');
const RequestHandler = require('../core/request-handler');
const Database = require('../core/database');

Database.connect();


const createMuseumAndExhibitions = async data => {

    const museum = await Museum.findOneAndUpdate(
        { title: data.museum },
        { $set: {'title': data.museum, 'location.address':data.address }},
        { upsert: true, new: true }
    ).exec().catch()



}

const handle = async event => RequestHandler.handle(createMuseumAndExhibitions)(event);

module.exports = {
    handle
}