import { abort } from './callAPIMethod';

export default function applyMiddleware(
    applyTo,
    middlewares = [],
    options = {},
    params = {},
    resourceId = '',
    type = '',
    cancelNamespace
) {

    middlewares = [].concat(middlewares).filter(func => typeof func === 'function');

    if (!middlewares.length) {
        return applyTo(params);
    }

    return middlewares.reduceRight((prev, middleware, index) => {

        const next = index === middlewares.length - 1
            ? prev.bind(null, params, cancelNamespace)
            : prev.bind(null, options, params, resourceId, type);

        const mw = middleware(next);

        if (index === 0) {
            const newMw = mw(options, params, resourceId, type);

            newMw[cancelNamespace] = abort;

            return newMw;
        }

        return mw;
    }, applyTo);

}
