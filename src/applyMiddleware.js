import APICall from './call';
import APIAbort from './abort';
import uuidGenereator from 'uuid/v4';

import { DEFAULTS } from './constants';

function applyMiddleware(
    middleware = [],
    middlewareOptions = {},
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

    middleware = [].concat(middleware).filter(func => typeof func === 'function');

    if (!middleware.length) {
        return boundAPICall(requestParams);
    }

    return middleware.reduceRight((prev, item, index) => {
        const next = index === middleware.length - 1
            ? prev.bind(null, requestParams)
            : prev.bind(null, middlewareOptions, requestParams, resourceId, method);

        const mw = item(next);

        if (index === 0) {
            const newMw = mw(middlewareOptions, requestParams, resourceId, method);

            newMw[cancelNamespace] = APIAbort.getAbort(uuid);

            return newMw;
        }

        return mw;
    }, boundAPICall);
}

export default applyMiddleware;
