import Request from "./class";
import * as util from "./helpers/util";
import defaults from "./defaults";

function createInstance(config) {
    let context = new Request(config);
    let instance = util.bind(Request.prototype.request, context);
    util.extend(instance, Request.prototype, context);
    util.extend(instance, context);
    return instance;
}

let request = createInstance(defaults);


request.create = function (config) {
    return createInstance(util.merge(defaults, config));
};

request.spread = function (callback) {
    return function (...arg) {
        return callback.apply(null, [...arg]);
    };
};

export default request;


