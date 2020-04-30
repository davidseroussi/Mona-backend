const R = require('ramda');
const Request = require('./core/request');
const RequestHandler = require('./core/request-handler');

const _hello = _ => {
    return Request.response(200, "Salut !");
} 

const hello = async event => RequestHandler.handle(_hello)(event);

module.exports = {
    hello
}