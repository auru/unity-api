const DEFAULTS = {
    APINamespace: 'api',
    cancelNamespace: 'cancel',
    // https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch#Parameters
    fetchOptions: {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        credentials: 'include'
    }
};

export {
    DEFAULTS
};
