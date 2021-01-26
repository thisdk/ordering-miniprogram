import * as util from "./helpers/util";

let DEFAULT_CONTENT_TYPE = {
    "Content-Type": "application/x-www-form-urlencoded"
};

let defaults = {
    method: "get",
    dataType: "json",
    responseType: "text",
    headers: {},
    transformRequest(data) {
        return data;
    },
};

defaults.headers = {
    common: {
        "Accept": "application/json, text/plain, */*"
    }
};

["delete", "get", "head", "post", "put", "patch"].map(e => {
    defaults.headers[e] = util.merge(defaults.headers, DEFAULT_CONTENT_TYPE);
});


export default defaults;
