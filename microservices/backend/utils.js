const R = require('ramda');

const response = (code, body) => ({
    statusCode: code,
    body: body
});

const error = (code, errors) => response(code, {
    errors: errors
});

const isType = type => R.pathEq(['data', 'type'], type);

const typeCheck = type => R.unless(
    isType(type),
    R.always(error(400, ['Data type must be ' + type]))
);

const pathDescription = (path) => path.reduce((acc, curr) => {
    return acc + "." + curr
});

const fieldCheck = path => R.unless(
    R.hasPath(path),
    R.always(error(400, [pathDescription(path) + ' is missing']))
);

const hasNoError = R.unless(R.hasPath(['body', 'errors']));
const hasError = R.hasPath(['body', 'errors']);


const dbError = (err) => {

    try {
        const errors = [];

        R.forEachObjIndexed(
            (val, key) => errors.push(val),
            R.map(
                R.prop("message"),
                err.errors
            )
        );

        return error(400, R.when(R.isEmpty, ['Unknown error'])(errors));
    } catch(err2)  {
        console.log(err2);
        return error(500, ['Unknown error']);
    }

}

module.exports = {
    dbError,
    hasNoError,
    hasError,
    fieldCheck,
    typeCheck,
    error,
    response
}