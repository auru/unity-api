const state = {};

const create = uuid => {
    const controller = new AbortController();
    const signal = controller.signal;
    const abort = () => controller.abort();

    state[uuid] = {
        controller,
        signal,
        abort
    };
};

const destroy = uuid => {
    delete state[uuid];
};

const getController = uuid => {
    if (!state[uuid]) {
        create(uuid);
    }

    return state[uuid].controller;
};

const getSignal = uuid => {
    if (!state[uuid]) {
        create(uuid);
    }

    return state[uuid].signal;
};

const getAbort = uuid => {
    if (!state[uuid]) {
        create(uuid);
    }

    return state[uuid].abort;
};

export default {
    getController,
    getSignal,
    getAbort,
    destroy
};
