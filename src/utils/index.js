// 睡眠：默认1s
const sleep = (miliseconds = 1000) => {
    return new Promise(resolve => setTimeout(resolve, miliseconds));
};

const getTime = () => {
    return new Date().getTime();
};

const random = (rand = 1, floor = true) => {
    const r = Math.random() * rand;
    return floor ? Math.floor(r) : Math.ceil(r);
};

const isFunction = (func) => {
    return func && typeof func === 'function';
};

export {
    sleep,
    getTime,
    random,
    isFunction
}