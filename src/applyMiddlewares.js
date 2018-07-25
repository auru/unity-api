import APICall from './call';
import APIAbort from './abort';
import uuidGenereator from 'uuid/v4';

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
    const uuid = uuidGenereator();

    const boundAPICall = APICall.bind(
        null,
        uuid,
        APINamespace,
        resourceNamespace,
        cancelNamespace
    );

    if (!middlewares.length) {
        return boundAPICall(requestParams);
    }

    return middlewares.reduceRight((prev, middleware, index) => {
        const next = index === middlewares.length - 1
            ? prev.bind(null, requestParams)
            : prev.bind(null, middlewaresOptions, requestParams, resourceId, method);

        const mw = middleware(next);

        if (index === 0) {
            const newMw = mw(middlewaresOptions, requestParams, resourceId, method);

            newMw[cancelNamespace] = APIAbort.getAbort(uuid);

            return newMw;
        }

        return mw;
    }, boundAPICall);
}

export default applyMiddlewares;
