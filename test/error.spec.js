import test from 'ava';
import APIError from '../src/error';

test.beforeEach(t => {
    t.context.error = new APIError(404, 'Not Found');
    t.context.errorNoMessage = new APIError(404);
});

test('instance of Error', t => {
    t.true(t.context.error instanceof Error)
});

test('instance of APIError', t => {
    t.true(t.context.error instanceof APIError)
});

test('to string', t => {
    t.is(t.context.error.toString(), '404 - Not Found', 'has message');
    t.is(t.context.errorNoMessage.toString(), '404', 'No message');
});