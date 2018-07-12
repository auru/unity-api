import test from 'ava';
import sinon from 'sinon';
import applyMiddleware from '../src/applyMiddleware';

const noop = _ => _;

test('applyTo is required', t => {
    t.throws(() => applyMiddleware());
});

test('applyTo is not a function', t => {
    const applyTo = 'oops';
    t.throws(() => applyMiddleware(applyTo));
});

test('no middleware returns default params', t => {
    const spyApplyTo = sinon.spy(noop);

    t.deepEqual(applyMiddleware(spyApplyTo), {});
    t.true(spyApplyTo.calledOnce);
    t.true(spyApplyTo.calledWithExactly({}));
});

test('no functional middleware returns default params', t => {
    const applyTo = sinon.spy(noop);
    const middlewares = [
        'test', undefined, {}, [], 123, null, NaN, /^/
    ];

    t.deepEqual(applyMiddleware(applyTo, middlewares), {});
    t.true(applyTo.calledOnce);
    t.true(applyTo.calledWithExactly({}));
});

test('one middleware', t => {
    const applyTo = sinon.spy(noop);
    const middleware = sinon.spy(noop);

    const options = { options: 'options' };
    const params = { params: 'params' };
    const resourceId = 'resourceId';
    const method = 'method';

    t.deepEqual(applyMiddleware(applyTo, [ middleware ], options, params, resourceId, method), params);
    t.true(applyTo.calledOnce);
    t.true(applyTo.calledWithExactly(params, options, params, resourceId, method));
    t.true(middleware.calledOnce);

    const middlewareSpyCall = middleware.getCall(0);
    t.true(middlewareSpyCall.args.length === 1);
    t.true(middlewareSpyCall.args[0] instanceof Function);
    t.falsy(middlewareSpyCall.thisValue);
    t.true(middlewareSpyCall.args[0].prototype === undefined);
});

test('multiple middlewares', t => {
    const applyTo = sinon.spy(noop);
    const middleware1 = sinon.spy(noop);
    const middleware2 = sinon.spy(noop);

    const options = { options: 'options' };
    const params = { params: 'params' };
    const resourceId = 'resourceId';
    const method = 'method';

    t.deepEqual(applyMiddleware(applyTo, [ middleware1, middleware2 ], options, params, resourceId, method), params);
    t.true(applyTo.calledOnce);
    t.true(applyTo.calledWithExactly(params, options, params, resourceId, method, options, params, resourceId, method));
    t.true(middleware1.calledOnce);
    t.true(middleware2.calledOnce);

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