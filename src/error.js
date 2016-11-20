function APIError(code, message) {
    this.code = code;
    this.message = (message || '');
}

Object.setPrototypeOf(APIError.prototype, Error.prototype);
APIError.prototype.name = 'APIError';
APIError.prototype.toString = function toString() {
    return this.message ? this.code + ' - ' + this.message : String(this.code);
};

export default APIError;