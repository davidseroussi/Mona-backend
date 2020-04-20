const R = require("ramda");
const Exhibition = require("../models/exhibition");
const Request = require("../core/request");
const RequestHandler = require("../core/requestHandler");
const Database = require("../core/database");

Database.connect();

const findExhibition = async (condition) =>
    Exhibition.findOne(condition).exec();
const insertArtwork = async (artwork) => artwork.save();
const attachArtworkToExhibition = async (exhibition, artwork) => {
    exhibition.artworks.push(artwork._id);
    return exhibition.save();
};

const updateArtworkOfExhibition = async (data) => {
    const exhibition = await findArtwork({ _id: data.artworkId }).catch(() => null);
    if (exhibition === null) return Request.error(404, "Exhibition not found");

    return Artwork.findByIdAndUpdate(data.artwork.id, data.artwork, {
        new: true,
    })
        .exec()
        .then((e) => Request.response(200, e))
        .catch(Request.dbError);
};

const getArtworksOfExhibition = async (data) => {
    return Exhibition.findById(data.exhibitionId)
        .populate("artworks")
        .exec()
        .then((m) => Request.response(200, m.artworks))
        .catch((err) => Request.error(404, "Exhibition not found"));
};

const createArtworkOfExhibition = async (data) => {
    const exhibition = await findExhibition({ _id: data.exhibitionId }).catch(
        () => null
    );
    if (exhibition === null) return Request.error(404, "Exhibition not found");

    const artwork = await insertArtwork(
        new Artwork({ title: data.title })
    ).catch(Request.dbError);
    if (Request.hasError(artwork)) return artwork;

    const updatedExhibition = await attachArtworkToExhibition(
        exhibition,
        artwork
    ).catch(Request.dbError);
    if (Request.hasError(updatedExhibition)) return updatedExhibition;

    return Request.response(201, updatedExhibition);
};

const createArtwork = R.pipeWith(Request.hasNoError, [
    Request.fieldCheck(["exhibitionId"]),
    Request.fieldCheck(["title"]),
    createArtworkOfExhibition,
]);

const getArtworks = R.pipeWith(Request.hasNoError, [
    Request.fieldCheck(["exhibitionId"]),
    getArtworksOfExhibition,
]);

const updateArtwork = R.pipeWith(Request.hasNoError, [
    Request.fieldCheck(["exhibitionId"]),
    Request.fieldCheck(["artwork"]),
    Request.fieldCheck(["artwork", "id"]),
    updateArtworkOfExhibition,
]);

const create = async (event) => RequestHandler.handle(createArtwork)(event);
const get = async (event) => RequestHandler.handle(getArtworks)(event);
const update = async (event) => RequestHandler.handle(updateArtwork)(event);

module.exports = {
    create,
    get,
    update,
};
