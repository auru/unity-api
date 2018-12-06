function APIError(code, message, body) {
    this.code = code;
    this.message = (message || '');

    if (body) {
        try {
            this.body = JSON.parse(body);
        } catch (e) {
            this.body = body;
        }
    }
}

Object.setPrototypeOf(APIError.prototype, Error.prototype);
APIError.prototype.name = 'APIError';
APIError.prototype.toString = function toString() {
    return this.message ? this.code + ' - ' + this.message : String(this.code);
};

export default APIError;