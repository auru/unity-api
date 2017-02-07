import { uri } from 'unity-utils';
import { format } from 'url';

export function getAPIPrefix(APINamespace) {
    const reAbsolute = /^(\/|https?:\/\/)/ig;
    return reAbsolute.test(APINamespace) ? APINamespace : '/' + APINamespace;
}

export function getFullPath(APINamespace, namespace, path=[]) {
    path = [].concat(path);
    return uri.join(getAPIPrefix(APINamespace), namespace, ...path).replace(':/', '://');
}

export function formatURL(APINamespace = '', namespace = '', path=[], query={}) {
    return format({
        pathname: getFullPath(APINamespace, namespace, path),
        query: uri.query(query)
    });
}