import callAPIMethod from './callAPIMethod';

import applyMiddleware from './applyMiddleware';

const createAPI = (resources = {}, middleware = [], APIPrefix = '', fetchOptions = {}) =>

    Object.keys(resources).reduce( (api, resourceId) => {
        api[resourceId] = Object.keys(resources[resourceId].methods).reduce( (resource, method) => {
            resource[method] = (params, methodOptions) => {
                const apiParams = resources[resourceId].methods[method](params);
                const bindedCallAPIMethod = callAPIMethod.bind(null, APIPrefix, fetchOptions, resources[resourceId].prefix);
                return applyMiddleware(bindedCallAPIMethod, middleware, methodOptions, apiParams, resourceId, method);
            };
            return resource;
        }, {});
        return api;
    }, {});


export default createAPI;