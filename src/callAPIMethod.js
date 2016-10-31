import { format as formatURL } from 'url';
import { uri } from 'unity-utils';
import 'isomorphic-fetch';
import APIError from './error';

const defaults = {
    APIPrefix: 'api',
    // https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch#Parameters
    fetchOptions: {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        credentials: 'include'
    }
};

function getFullPath(APIPrefix, prefix, path=[]) {
    path = [].concat(path);
    return uri.join('/', APIPrefix, prefix, ...path);
}

function callAPI(APIPrefix, fetchOptions, prefix = '', { path=[], query={}, options={}, method='json' }) {

    APIPrefix = APIPrefix || defaults.APIPrefix;

    query = uri.query(query);

    const url = formatURL({ query, pathname: getFullPath(APIPrefix, prefix, path) });

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