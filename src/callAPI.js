import 'isomorphic-fetch';
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only';

import { formatURL } from './utils';
import APIError from './error';

import { DEFAULTS } from './constants';

function AbortAPI() {
    if (AbortAPI.instance) {
        return AbortAPI.instance;
    }

    const state = {};

    const createInstance = uuid => {
        const controller = new AbortController();
        const signal = controller.signal;
        const abort = () => controller.abort();

        state[uuid] = {
            controller,
            signal,
            abort
        };
    };

    const destroyInstance = uuid => {
        delete state[uuid];
    };

    this.getController = uuid => {
        if (state[uuid]) {
            createInstance(uuid);
        }

        return state[uuid].controller;
    };

    this.getSignal = uuid => {
        if (state[uuid]) {
            createInstance(uuid);
        }

        return state[uuid].signal;
    };

    this.getAbort = uuid => {
        if (state[uuid]) {
            createInstance(uuid);
        }

        return state[uuid].abort;
    };

    this.destroy = uuid => {
        destroyInstance(uuid);
    };

    AbortAPI.instance = this;

    return this;
}

function callAPI(
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

    const abortAPI = new AbortAPI();
    const signal = abortAPI.getSignal(uuid);
    const abort = abortAPI.getAbort(uuid);

    const accumulatedFetchOptions = { ...DEFAULTS.fetchOptions, ...options, signal };
    if (headers) accumulatedFetchOptions.headers = headers;
    if (body) accumulatedFetchOptions.body = body;

    const fetchPromise = fetch(url, accumulatedFetchOptions)
        .then(response => response[type || method]()
            .catch(() => {
                if (!response.ok) {
                    throw new APIError(response.status, response.statusText, response.body);
                }

                return response.body || null;
            })
            .then(result => {
                abortAPI.destroy(uuid);

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
            }))
        .catch(error => error);

    fetchPromise[cancelNamespace] = abort;

    return fetchPromise;
};

export {
    AbortAPI,
    callAPI
};

export default callAPI;
