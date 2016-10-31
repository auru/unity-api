function APIError(code, message) {
    this.code = code;
    this.message = (message || '');
}

Object.setPrototypeOf(APIError.prototype, Error.prototype);
APIError.prototype.name = 'APIError';
APIError.prototype.toString = function toString() {
    return this.code + ' - ' + this.message;
};

export default APIError;