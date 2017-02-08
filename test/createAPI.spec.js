import test from 'ava';
import sinon from 'sinon';
import * as applyMiddleware from '../src/applyMiddleware';
import callAPIMethod from '../src/callAPIMethod';
import createAPI from '../src/createAPI';

let stubApplyMiddleware;
let stubCallAPIMethod;
const boundCallAPIMethod = _ => _;
test.beforeEach(t => {
    stubCallAPIMethod = sinon.stub(callAPIMethod, 'bind');
    stubCallAPIMethod.returns(boundCallAPIMethod);
    stubApplyMiddleware = sinon.stub(applyMiddleware, 'default');
});
test.afterEach.always(t => {
    stubApplyMiddleware.restore();
    stubCallAPIMethod.restore();
});

test('undefined resources', t => {
    const API = createAPI();
    t.deepEqual(API, {}, 'empty API object');
});

test('0 resources', t => {
    const API = createAPI({});
    t.deepEqual(API, {}, 'empty API object');
});

test('supports resource prefix insted of namespace', t => {
    const user = {
        prefix: 'user-endpoint',
        methods: {
            get: ({ id }) => ({ path: ['get', id] })
        }
    };
    const resources = { user };
    const API = createAPI(resources, [], 'https://example.com');

    API.user.get(1);

    t.true(stubCallAPIMethod.calledWithExactly(
        null, 'https://example.com', {}, 'user-endpoint'
    ), 'correct arguments passed to callAPIMethod');
});

test('general behaviour', t => {
    const userResource = {
        namespace: 'user',
        methods: {
            get: ({ id }) => ({ path: ['get', id] }),
            delete: ({ id }) => ({ path: ['delete', id], options: { method: 'DELETE'} })
        }
    };
    const projectResource = {
        namespace: 'project',
        methods: {
            get: ({ id }) => ({ path: ['get', id] }),
            delete: ({ id }) => ({ path: ['delete', id], options: { method: 'DELETE'} })
        }
    };

    const resources = {
        user: userResource,
        project: projectResource
    };

    const middleware = [ _ => _, _ => _];

    const API = createAPI(resources, middleware, 'https://example.com');

    t.deepEqual(Object.keys(API), ['user', 'project'], 'resources');

    Object.keys(API).forEach(resource => {
        t.deepEqual(Object.keys(API[resource]), ['get', 'delete'], 'methods');
        Object.keys(API[resource]).forEach(method => {
            t.true(API[resource][method] instanceof Function, 'methods are functions');
        });
    });

    const methodOptions = { specific: 'option' };
    API.user.delete({ id: 1 }, methodOptions);

    t.true(stubCallAPIMethod.calledOnce);
    t.true(stubApplyMiddleware.calledOnce);
    t.true(stubCallAPIMethod.calledBefore(stubApplyMiddleware));
    t.true(stubCallAPIMethod.calledWithExactly(
        null, 'https://example.com', {}, 'user'
    ));

    t.is(stubApplyMiddleware.lastCall.args[0], boundCallAPIMethod, 'stubApplyMiddleware called with boundCallAPIMethod');
    t.is(stubApplyMiddleware.lastCall.args[1], middleware, 'stubApplyMiddleware called with middleware');
    t.is(stubApplyMiddleware.lastCall.args[2], methodOptions, 'stubApplyMiddleware called with methodOptions');
    t.deepEqual(stubApplyMiddleware.lastCall.args[3], {
        path: ['delete', 1], options: { method: 'DELETE'}
    }, 'stubApplyMiddleware called with correct apiParams');
    t.is(stubApplyMiddleware.lastCall.args[4], 'user', 'stubApplyMiddleware called with correct resourceId');
    t.is(stubApplyMiddleware.lastCall.args[5], 'delete', 'stubApplyMiddleware called with correct method');

    API.user.delete({ id: 1 });

    t.true(stubCallAPIMethod.calledTwice);
    t.true(stubApplyMiddleware.calledTwice);
    t.true(stubCallAPIMethod.calledBefore(stubApplyMiddleware));
});