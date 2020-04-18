const mongoose = require("mongoose");
const config = require("config-yml");

const connect = () => {
    mongoose.connect(config.db.uri, {
        useNewUrlParser: true,
        // useUnifiedTopology: true,
    });
};

module.exports = { connect };
