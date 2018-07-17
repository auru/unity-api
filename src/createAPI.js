import callAPIMethod from './callAPIMethod';

import applyMiddleware from './applyMiddleware';

const createAPI = (
    resources = {},
    middleware = [],
    APINamespace,
    fetchOptions,
    cancelNamespace = 'CANCEL'
) => Object.keys(resources).reduce( (api, resourceId) => {
    api[resourceId] = Object.keys(resources[resourceId].methods)
        .reduce( (resource, method) => {
            resource[method] = (params, methodOptions, responseOptions) => {
                const apiParams = resources[resourceId].methods[method](params);
                const boundCallAPIMethod = callAPIMethod.bind(
                    null,
                    APINamespace,
                    fetchOptions,
                    (resources[resourceId].namespace || resources[resourceId].prefix),
                    responseOptions
                );
                return applyMiddleware(
                    boundCallAPIMethod,
                    middleware,
                    methodOptions,
                    apiParams,
                    resourceId,
                    method,
                    cancelNamespace
                );
            };
            return resource;
        }, {});
    return api;
}, {});

export default createAPI;
