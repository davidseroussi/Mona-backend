//pour clean tout docker
//Docker system prune -af --volumes

const R = require("ramda");
const mongoose = require("mongoose");

const Artwork = require("./models/artwork");
const Exhibition = require("./models/exhibition");
const Museum = require("./models/museum");

const db_url = "mongodb://127.0.0.1:27017/db-mona";

mongoose.connect(db_url, {
    useNewUrlParser: true,
    // useUnifiedTopology: true
});

const db = mongoose.connection;

const requestHandler = (fn) =>
    R.pipe(
        R.prop("body"),
        JSON.parse,
        fn,
        (x) => Promise.resolve(x),
        R.then(R.tap(console.log))
    );

const findMuseum = async (condition) => Museum.findOne(condition);
const insertExhibition = async (exhibition) => exhibition.save();
const attachExhibitionToMuseum = async (museum, exhibition) => {
    museum.exhibitions.push(exhibition._id);
    return museum.save();
};

const buildError = (err) => {
    if (err.message != null) return { error: err.message };

    return { error: "Unknown error" };
};

const promiseHandler = async (fn) => await fn.catch(buildError);

const createExhibitionOfMuseum = async (museumMatch, exhibition) => {
    const museum_ = await findMuseum(museumMatch);

    if (museum_ === null) return { error: "No museum found" };

    const exhibition_ = await insertExhibition(exhibition);
    const updatedMuseum = await attachExhibitionToMuseum(museum_, exhibition_);
    return updatedMuseum;
};

const testDb = async () => {
    const exhibition1 = new Exhibition({
        _id: new mongoose.Types.ObjectId(),
        //title: "L'exposition reloue",
        description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    });

    const museumTitle = "Musée des teubs";

    const result = await promiseHandler(
        createExhibitionOfMuseum({ title: museumTitle }, exhibition1)
    );

    console.log(result);
};

const debug_ = (event) => {
    console.log(event.body);
};

const debug = async (event) => requestHandler(testRequestHandler)(event);

module.exports = {
    debug,
};
