import {getTime, isFunction} from "../utils";

// 默认网络超时最在超时：60s
const NETWORK_MAX_TIME_OUT = 60 * 1000;

export default class Thread {
    _task = null;
    _callback = null;

    constructor(task, callback) {
        this._task = task;
        this._callback = callback;
        this._run();
    }

    _run = async () => {
        if (!this._task || !this._task.request) {
            return;
        }

        // 开始计时
        const start = getTime();
        // 请求开始
        await this._doRequest();
        // 结束计时
        const end = getTime();

        // 打印总耗时
        console.log('[task.id => ' + this._task.id + '] 运行结束.耗时(' + (end - start) + 'ms)');
    };

    /***********************************************************************************************
     * 网络请求
     ***********************************************************************************************/
    _doRequest = async () => {
        const {request: {url}} = this._task;
        if (!url || url === '') {
            this._error(null, -1, '参数错误：缺少url!');
            return;
        }
        await this._request();
    };

    _request = () => {
        return new Promise(resolve => {
            const {request, request: {url, data, dataType, headers, timeout}} = this._task;

            const xhr = new XMLHttpRequest();
            xhr.addEventListener('loadstart', e => this._begin(xhr, e));
            xhr.addEventListener('progress', e => this._progress(e));
            xhr.addEventListener('load', e => this._load(xhr, e));
            xhr.addEventListener('error', e => this._error(xhr, xhr.status, e));
            xhr.addEventListener('abort', e => this._error(xhr, xhr.status, e));
            xhr.addEventListener('timeout', e => this._error(xhr, 408, e));
            xhr.addEventListener('loadend', e => this._complete(resolve));

            // 默认请求类型：GET
            const type = (request.type || 'GET').toUpperCase();
            // 如果是简单类型请求，则拼接URL
            let requestUrl = url;
            if (this._isSimpleRequest(type)) {
                requestUrl += this._getUrlParams(data);
            }

            // 初始化请求（xhr为异步）
            xhr.open(type, requestUrl, true);
            // 设置请求头
            this._setHeaders(xhr, headers);
            if (this._isSimpleRequest(type)) {
                xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
            }
            if (dataType) {
                xhr.responseType = dataType;
            }
            xhr.timeout = timeout || NETWORK_MAX_TIME_OUT;
            // 发送请求
            xhr.send(this._isSimpleRequest(type) ? null : JSON.stringify(data));
        });
    };

    /***********************************************************************************************
     * 构造URL参数
     ***********************************************************************************************/
    _getUrlParams = (data) => {
        if (!data) {
            return '';
        }

        if (typeof data === 'string') {
            return data;
        }
        if (data instanceof FormData) {
            return data;
        }
        if (data instanceof Object) {
            const args = [];
            Object.keys(data).forEach(key => {
                args.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
            });
            return '?' + args.join('&');
        }
        return '';
    };

    /***********************************************************************************************
     * 设置请求头
     ***********************************************************************************************/
    _setHeaders = (xhr, headers = {}) => {
        Object.keys(headers).forEach(key => {
            xhr.setRequestHeader(key, headers[key]);
        });
    };

    /***********************************************************************************************
     * 构造URL参数
     ***********************************************************************************************/
    _isSimpleRequest = (type) => {
        return type === 'GET' || type === 'DELETE';
    };

    /***********************************************************************************************
     * 网络请求开始（接收到第一个字节时触发）
     ***********************************************************************************************/
    _begin = (xhr, e) => {
        const {requestInterceptor} = this._task;
        if (isFunction(requestInterceptor)) {
            requestInterceptor(this._task.id, e);
        }
    };

    /***********************************************************************************************
     * 网络请求中（接收数据期间持续触发）
     ***********************************************************************************************/
    _progress = (e) => {
        const {responseInterceptor} = this._task;
        if (isFunction(responseInterceptor)) {
            if (e.lengthComputable) {
                responseInterceptor(parseInt(e.loaded / e.total * 100));
            }
        }
    };

    /***********************************************************************************************
     * 网络请求成功（接收到完整的数据时触发）
     ***********************************************************************************************/
    _load = (xhr, e) => {
        const {request: {success, dataType}} = this._task;
        if (isFunction(success)) {
            const status = xhr.status;
            if (status >= 200 && status < 300) {
                let response;

                switch (xhr.responseType) {
                    case 'text':
                        response = xhr.responseText;
                        break;

                    case 'document':
                        response = xhr.responseXML;
                        break;

                    case 'blob':
                        response = xhr.response;
                        break;

                    default:
                        if (dataType === 'json' && !e.lengthComputable) {
                            response = JSON.parse(xhr.response);
                        } else {
                            response = xhr.response;
                        }
                        break;
                }
                success(response);
            } else {
                this._error(xhr, status, e);
            }
        }
    };

    /***********************************************************************************************
     * 网络请求结束（error、abort、load后都会触发）
     ***********************************************************************************************/
    _complete = (resolve) => {
        const {request: {complete}} = this._task;
        if (isFunction(complete)) {
            complete();
        }

        if (isFunction(this._callback)) {
            this._callback();
        }

        resolve && resolve();
    };

    /***********************************************************************************************
     * 网络请求错误
     ***********************************************************************************************/
    _error = (xhr, status, e) => {
        const {request: {fail}} = this._task;
        if (isFunction(fail)) {
            const response = {
                status: status,
                message: null
            };

            switch (status) {
                case 404:
                    response.message = 'Not found!';
                    break;

                case 408:
                    response.message = 'Timeout!';
                    break;

                case 500:
                    response.message = 'Internal Server Error!';
                    break;

                default:
                    response.message = e;
                    break;
            }
            fail(response);
        }
    };
}