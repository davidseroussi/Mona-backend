const R = require("ramda");

const bodyStringifyer = R.over(R.lensProp("body"), JSON.stringify);

const emptyWhenNull = R.when(R.isNil, (_) => '""');

const parseBody = R.pipe(R.prop("body"), JSON.parse);

const queriedParams = (event, props) => {

    return R.merge(
        R.cond([
            [R.propEq("httpMethod", "POST"), parseBody],
            [R.propEq("httpMethod", "PATCH"), parseBody],
            [R.propEq("httpMethod", "GET"), R.prop("queryStringParameters")],
            [R.T, R.always(null)],
        ])(event),
        R.unless(R.isNil, (x) => R.reduce(R.merge, {}, R.props(x)(event)))(props)
    )
}

const handle = (fn, params) =>
    R.tryCatch(
        R.pipe(
            (event) => queriedParams(event, params),
            R.tap(console.log),
            emptyWhenNull,
            fn,
            (x) => Promise.resolve(x),
            R.then(R.tap(console.log)),
            R.then(bodyStringifyer),
            R.then(R.identity),
            R.otherwise((err) => {
                console.log(err);
                return {
                    statusCode: 500,
                };
            })
        ),
        (err, val) => {
            console.log(err);
            return R.always({
                statusCode: 500
            })
        }

    )

module.exports = { handle };
