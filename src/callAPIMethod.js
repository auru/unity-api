import 'isomorphic-fetch';
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
    }
};

export default function callAPI(
    APINamespace = defaults.APINamespace,
    fetchOptions = defaults.fetchOptions,
    namespace = '',
    methodOptions = {}
) {

    const { path=[], query={}, options={}, method='json', headers, body } = methodOptions;

    const url = formatURL(APINamespace, namespace, path, query);

    const accumulatedFetchOptions = {
        ...defaults.fetchOptions,
        ...fetchOptions,
        ...options
    };
    if (headers) accumulatedFetchOptions.headers = headers;
    if (body) accumulatedFetchOptions.body = body;

    return fetch(url, accumulatedFetchOptions)
        .then( response => response[method]()
                .catch( () => {
                    if (!response.ok) throw new APIError(response.status, response.statusText);

                    return response.body || null;
                })
                .then( result => {
                    if (!response.ok) throw new APIError(response.status, response.statusText, result);

                    return result;
                }))
        .catch( error => error);
}