import applyMiddlewares from './applyMiddlewares';

import { DEFAULTS } from './constants';

function createAPI(
    resources = {},
    middlewares = [],
    APINamespace = DEFAULTS.APINamespace,
    cancelNamespace = DEFAULTS.cancelNamespace
) {
    return Object.keys(resources).reduce( (api, resourceId) => {
        api[resourceId] = Object.keys(resources[resourceId].methods)
            .reduce((resource, method) => {
                resource[method] = (params, middlewaresOptions) => {
                    const resourceNamespace = (resources[resourceId].namespace || resources[resourceId].prefix);
                    const requestParams = resources[resourceId].methods[method](params);
    
                    return applyMiddlewares(
                        middlewares,
                        middlewaresOptions,
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
