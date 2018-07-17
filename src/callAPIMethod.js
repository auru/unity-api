import 'isomorphic-fetch';
import { AbortController } from 'abortcontroller-polyfill/dist/cjs-ponyfill';
import { formatURL } from './utils';
import APIError from './error';

const defaults = {
    APINamespace: 'api',
    // https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch#Parameters
    fetchOptions: {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        credentials: 'include'
    },
    responseOptions: {
        fullResponse: false
    }
};

const callAPI = function callAPI(
    APINamespace = defaults.APINamespace,
    fetchOptions = defaults.fetchOptions,
    namespace = '',
    responseOptions = defaults.responseOptions,
    methodOptions = {},
    cancelNamespace
) {
    callAPI.controller = new AbortController();
    const signal = callAPI.controller.signal;

    const {
        path=[],
        query={},
        options={},
        type,
        method='json',
        headers,
        body
    } = methodOptions;

    const url = formatURL(APINamespace, namespace, path, query);

    const accumulatedFetchOptions = {
        ...defaults.fetchOptions,
        ...fetchOptions,
        ...options,
        signal
    };
    if (headers) accumulatedFetchOptions.headers = headers;
    if (body) accumulatedFetchOptions.body = body;

    const p = fetch(url, accumulatedFetchOptions)
        .then( response => response[type || method]()
            .catch( () => {
                if (!response.ok) throw new APIError(response.status, response.statusText, response.body);

                return response.body || null;
            })
            .then( result => {
                if (!response.ok) throw new APIError(response.status, response.statusText, result);

                if (responseOptions.fullResponse) {
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
                }

                return result;
            }))
        .catch( error => error);

    p[cancelNamespace] = abort;

    return p;
};

export default callAPI;

export function abort() {
    if (callAPI.controller) {
        callAPI.controller.abort();
    }
};
