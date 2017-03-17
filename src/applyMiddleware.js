export default function applyMiddleware(
    applyTo,
    middlewares = [],
    options = {},
    params = {},
    resourceId = '',
    type = ''
) {

    middlewares = [].concat(middlewares).filter(func => typeof func === 'function');

    if (!middlewares.length) {
        return applyTo(params);
    }

    return middlewares.reduceRight((prev, middleware, index) => {

        const next = index === middlewares.length - 1
            ? prev.bind(null, params)
            : prev.bind(null, options, params, resourceId, type);

        return index === 0
            ? middleware(next)(options, params, resourceId, type)
            : middleware(next);
    }, applyTo);

}
