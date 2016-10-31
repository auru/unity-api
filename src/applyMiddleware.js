export default function applyMiddleware(applyTo, middlewares = [], options = {}, params = {}, resourceId = '', method = '') {

    middlewares = [].concat(middlewares).filter(func => typeof func === 'function');

    if (!middlewares.length) {
        return applyTo(params);
    }

    return middlewares.reduceRight((prev, middleware, index) => {

        const next = index === middlewares.length - 1
            ? prev.bind(null, params)
            : prev.bind(null, options, params, resourceId, method);

        return index === 0
            ? middleware(next)(options, params, resourceId, method)
            : middleware(next);
    }, applyTo);

}
