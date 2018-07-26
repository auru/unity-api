import test from 'ava';
import sinon from 'sinon';
import applyMiddleware from '../src/applyMiddleware';

const noop = _ => _;

test('no middleware returns fetch promise', t => {
    let fetchPromise;

    t.notThrows(() => {
        fetchPromise = applyMiddleware();
    });
    t.true(fetchPromise instanceof Promise);
    t.true(typeof fetchPromise.cancel === 'function');
});

test('no functional middleware return fetch promise', t => {
    let fetchPromise;
    const middleware = ['test', undefined, {}, [], 123, null, NaN, /^/];

    t.notThrows(() => {
        fetchPromise = applyMiddleware(middleware);
    });
    t.true(fetchPromise instanceof Promise);
    t.true(typeof fetchPromise.cancel === 'function');
});

test('one middleware', t => {
    const middleware = sinon.spy(noop);

    const options = { options: 'options' };
    const api = 'api';
    const resource = 'resource';
    const cancel = 'cancel';
    const params = { params: 'params' };
    const resourceId = 'resourceId';
    const method = 'method';

    const promise = applyMiddleware(
        [ middleware ],
        options,
        api,
        resource,
        cancel,
        params,
        resourceId,
        method
    );

    t.true(typeof promise.cancel === 'function');

    const middlewareSpyCall = middleware.getCall(0);
    t.true(middlewareSpyCall.args.length === 1);
    t.true(middlewareSpyCall.args[0] instanceof Function);
    t.falsy(middlewareSpyCall.thisValue);
    t.true(middlewareSpyCall.args[0].prototype === undefined);
});

test('multiple middleware', t => {
    const middleware1 = sinon.spy(noop);
    const middleware2 = sinon.spy(noop);

    const options = { options: 'options' };
    const api = 'api';
    const resource = 'resource';
    const cancel = 'cancel';
    const params = { params: 'params' };
    const resourceId = 'resourceId';
    const method = 'method';

    const promise = applyMiddleware(
        [ middleware1, middleware2 ],
        options,
        api,
        resource,
        cancel,
        params,
        resourceId,
        method
    );

    t.true(typeof promise.cancel === 'function');

    const middleware1SpyCall = middleware1.getCall(0);
    t.true(middleware1SpyCall.args.length === 1);
    t.true(middleware1SpyCall.args[0] instanceof Function);
    t.falsy(middleware1SpyCall.thisValue);
    t.true(middleware1SpyCall.args[0].prototype === undefined);

    const middleware2SpyCall = middleware2.getCall(0);
    t.true(middleware2SpyCall.args.length === 1);
    t.true(middleware2SpyCall.args[0] instanceof Function);
    t.falsy(middleware2SpyCall.thisValue);
    t.true(middleware2SpyCall.args[0].prototype === undefined);
});