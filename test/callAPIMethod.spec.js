import test from 'ava';
import { getAPIPrefix } from '../src/callAPIMethod';

test('getAPIPrefix', t => {
    t.is(getAPIPrefix('api'), '/api', 'relative path');
    t.is(getAPIPrefix('/api'), '/api', 'absolute path');
    t.is(getAPIPrefix('http://api.example.com'), 'http://api.example.com', 'http url');
    t.is(getAPIPrefix('https://api.example.com'), 'https://api.example.com', 'http url');
    t.is(getAPIPrefix('//api.example.com'), '//api.example.com', 'protocol-less url');
});