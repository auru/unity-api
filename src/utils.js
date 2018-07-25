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

export function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const rand = Math.random() * 16 | 0;
        const sign = c === 'x' ? rand : ((rand & 0x3) | 0x8);

        return sign.toString(16);
    });
}
