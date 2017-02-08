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

    const { path=[], query={}, options={}, method='json' } = methodOptions;

    const url = formatURL(APINamespace, namespace, path, query);

    return fetch(url, {...defaults.fetchOptions, ...fetchOptions, ...options})
        .then( result => {

            if (!result.ok) {
                throw new APIError(result.status, result.statusText);
            }

            return result[method]();
        })
        .catch( error => error);
}