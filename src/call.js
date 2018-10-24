import 'isomorphic-fetch';
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only';

import APIAbort from './abort';
import APIError from './error';
import { formatURL } from './utils';

import { DEFAULTS } from './constants';

function call(
    uuid = '',
    APINamespace = DEFAULTS.APINamespace,
    resourceNamespace = '',
    cancelNamespace = DEFAULTS.cancelNamespace,
    methodOptions = {}
) {
    const {
        path=[],
        query={},
        options={},
        type,
        method='json',
        headers,
        body
    } = methodOptions;

    const url = formatURL(APINamespace, resourceNamespace, path, query);

    const signal = APIAbort.getSignal(uuid);
    const abort = APIAbort.getAbort(uuid);

    const accumulatedFetchOptions = { ...DEFAULTS.fetchOptions, ...options, signal };
    if (headers) accumulatedFetchOptions.headers = headers;
    if (body) accumulatedFetchOptions.body = body;

    const fetchPromise = fetch(url, accumulatedFetchOptions)
        .then(response => {
            // Fetch AbortSignal support
            // Note: When abort() is called, the fetch() promise rejects with an AbortError
            // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
            // https://developer.mozilla.org/en-US/docs/Web/API/AbortController
            if (signal.aborted) {
                const abortError = new Error('Fetch abort signal');
                abortError.name = 'AbortError';

                throw abortError;
            }

            // Promise.prototype.finally is proposal
            // https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally
            APIAbort.destroy(uuid);

            return response[type || method]()
                .catch(() => {
                    if (!response.ok) {
                        throw new APIError(response.status, response.statusText, response.body);
                    }

                    return response.body || null;
                })
                .then(result => {
                    if (!response.ok) {
                        throw new APIError(response.status, response.statusText, result);
                    }

                    // https://developer.mozilla.org/en-US/docs/Web/API/Response
                    const writableResponse = [
                        'headers',
                        'ok',
                        'redirected',
                        'status',
                        'statusText',
                        'type',
                        'url',
                        'useFinalURL',
                        'bodyUsed'
                    ].reduce((res, key) => {
                        res[key] = response[key];

                        return res;
                    }, {});

                    return { ...writableResponse, ...{ body: result } };
                });
        })
        .catch(error => {
            APIAbort.destroy(uuid);

            return error;
        });

    fetchPromise[cancelNamespace] = abort;

    return fetchPromise;
};

export default call;
