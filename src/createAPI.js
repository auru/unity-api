import applyMiddleware from './applyMiddleware';

import { DEFAULTS } from './constants';

function createAPI(
    resources = {},
    middleware = [],
    APINamespace = DEFAULTS.APINamespace,
    cancelNamespace = DEFAULTS.cancelNamespace
) {
    return Object.keys(resources).reduce((api, resourceId) => {
        api[resourceId] = Object.keys(resources[resourceId].methods)
            .reduce((resource, method) => {
                resource[method] = (params, middlewareOptions) => {
                    const resourceNamespace = (resources[resourceId].namespace || resources[resourceId].prefix);
                    const requestParams = resources[resourceId].methods[method](params);

                    return applyMiddleware(
                        middleware,
                        middlewareOptions,
                        APINamespace,
                        resourceNamespace,
                        cancelNamespace,
                        requestParams,
                        resourceId,
                        method
                    );
                };

                return resource;
            }, {});

        return api;
    }, {});
}

export default createAPI;
