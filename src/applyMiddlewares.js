import { callAPI, AbortAPI } from './callAPI';
import { uuid as uuidGenerator } from './utils';

import { DEFAULTS } from './constants';

function applyMiddlewares(
    middlewares = [],
    middlewaresOptions = {},
    APINamespace = DEFAULTS.APINamespace,
    resourceNamespace = '',
    cancelNamespace = DEFAULTS.cancelNamespace,
    requestParams = {},
    resourceId = '',
    method = ''
) {
    const uuid = uuidGenerator();

    const boundCallAPI = callAPI.bind(
        null,
        uuid,
        APINamespace,
        resourceNamespace,
        cancelNamespace
    );

    middlewares = [].concat(middlewares).filter(func => typeof func === 'function');

    if (!middlewares.length) {
        return boundCallAPI(requestParams);
    }

    return middlewares.reduceRight((prev, middleware, index) => {
        const next = index === middlewares.length - 1
            ? prev.bind(null, requestParams)
            : prev.bind(null, middlewaresOptions, requestParams, resourceId, method);

        const mw = middleware(next);

        if (index === 0) {
            const newMw = mw(middlewaresOptions, requestParams, resourceId, method);

            newMw[cancelNamespace] = (new AbortAPI()).getAbort(uuid);

            return newMw;
        }

        return mw;
    }, callAPI);
}

export default applyMiddlewares;
