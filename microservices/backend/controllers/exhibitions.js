const R = require("ramda");
const Museum = require("../models/museum");
const Exhibition = require("../models/exhibition");
const Request = require("../core/request");
const RequestHandler = require("../core/requestHandler");
const Database = require("../core/database");

Database.connect();

const findMuseum = async (condition) => Museum.findOne(condition).exec();
const insertExhibition = async (exhibition) => exhibition.save();
const attachExhibitionToMuseum = async (museum, exhibition) => {
    museum.exhibitions.push(exhibition._id);
    return museum.save();
};

const updateExhibitionOfMuseum = async (data) => {
    const museum = await findMuseum({ _id: data.museumId }).catch(() => null);
    if (museum === null) return Request.error(404, "Museum not found");

    return Exhibition.findByIdAndUpdate(data.exhibition.id, data.exhibition, {
        new: true,
    })
        .exec()
        .then((e) => response(200, e))
        .catch(Request.dbError);
};

const getExhibitionsOfMuseum = async (data) => {
    return Museum.findById(data.museumId)
        .populate("exhibitions")
        .exec()
        .then((m) => response(200, m.exhibitions))
        .catch((err) => Request.error(404, "Museum not found"));
};

const createExhibitionOfMuseum = async (data) => {
    const museum = await findMuseum({ _id: data.museumId }).catch(() => null);
    if (museum === null) return Request.error(404, "Museum not found");

    const exhibition = await insertExhibition(
        new Exhibition({ title: data.title })
    ).catch(Request.dbError);
    if (Request.hasError(exhibition)) return exhibition;

    const updatedMuseum = await attachExhibitionToMuseum(
        museum,
        exhibition
    ).catch(Request.dbError);
    if (Request.hasError(updatedMuseum)) return updatedMuseum;

    return response(201, updatedMuseum);
};

const createExhibition = R.pipeWith(Request.hasNoError, [
    Request.fieldCheck(["museumId"]),
    Request.fieldCheck(["title"]),
    createExhibitionOfMuseum,
]);

const getExhibitions = R.pipeWith(Request.hasNoError, [
    Request.fieldCheck(["museumId"]),
    getExhibitionsOfMuseum,
]);

const updateExhibition = R.pipeWith(Request.hasNoError, [
    Request.fieldCheck(["museumId"]),
    Request.fieldCheck(["exhibition"]),
    Request.fieldCheck(["exhibition", "id"]),
    updateExhibitionOfMuseum,
]);

const create = async (event) => RequestHandler.handle(createExhibition)(event);
const get = async (event) => RequestHandler.handle(getExhibitions)(event);
const update = async (event) => RequestHandler.handle(updateExhibition)(event);

module.exports = {
    create,
    get,
    update,
};
