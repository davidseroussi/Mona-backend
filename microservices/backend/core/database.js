const mongoose = require('mongoose');
const config = require('config-yml');

const connect = () => {
	mongoose.connect(config.db_local.uri, {
		useNewUrlParser: true
		// UseUnifiedTopology: true,
	});
};

module.exports = {connect};
