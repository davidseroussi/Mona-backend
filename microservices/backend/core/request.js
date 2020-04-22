const R = require('ramda');

const isType = type => R.pathEq(['data', 'type'], type);

const typeCheck = type => R.unless(isType(type), R.always(error(400, [`Data type must be ${type}`])));

const pathDescription = path => path.reduce((acc, curr) => `${acc}.${curr}`);

const fieldCheck = path => R.unless(
	R.hasPath(path),
	R.always(error(400, [`${pathDescription(path)} is missing`]))
);

const error = (code, errors) => {
	if (!Array.isArray(errors)) {
		errors = [errors];
	}

	return response(code, {
		errors
	});
};

const hasNoError = R.unless(R.hasPath(['body', 'errors']));
const hasError = R.hasPath(['body', 'errors']);

const dbError = err => {
	try {
		const errors = [];

		R.forEachObjIndexed(
			(value, _) => errors.push(value),
			R.map(
				R.prop('message'),
				err.errors
			)
		);

		return error(400, R.when(R.isEmpty, ['Unknown error'])(errors));
	} catch (error_) {
		console.log(err);
		console.log(error_);
		return error(500, ['Unknown error']);
	}
};

const response = (code, body) => ({
	statusCode: code,
	body,
	headers: {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Credentials': true,
	}
});

module.exports = {
	error,
	dbError,
	hasNoError,
	hasError,
	typeCheck,
	fieldCheck,
	response
};
