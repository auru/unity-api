import { format as formatURL } from 'url';
import { uri } from 'unity-utils';
import 'isomorphic-fetch';
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

export function getAPIPrefix(APINamespace) {
    const reAbsolute = /^(\/|https?:\/\/)/ig;
    return reAbsolute.test(APINamespace) ? APINamespace : '/' + APINamespace;
}

function getFullPath(APINamespace, namespace, path=[]) {
    path = [].concat(path);
    return uri.join(getAPIPrefix(APINamespace), namespace, ...path);
}

function callAPI(APINamespace, fetchOptions, namespace = '', { path=[], query={}, options={}, method='json' }) {

    APINamespace = APINamespace || defaults.APINamespace;

    query = uri.query(query);

    const url = formatURL({ query, pathname: getFullPath(APINamespace, namespace, path) });

    return fetch(url, {...defaults.fetchOptions, ...fetchOptions, ...options})
        .then( result => {

            if (!result.ok) {
                throw new APIError(result.status, result.statusText);
            }

            return result[method]();
        })
        .catch( error => (error instanceof Error ? error : new Error(error)));
}

export default callAPI;