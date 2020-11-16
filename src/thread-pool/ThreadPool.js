import Queue from "../model/Queue";
import {getTime, random, sleep} from "../utils";
import Thread from "./Thread";

// 默认最大请求并发数：3
const MAX_CONCURRENCY = 3;

export default class ThreadPool {
    _queue = new Queue();
    _isRunning = false;
    _concurrency = 0;
    _maxConcurrency = MAX_CONCURRENCY;

    /************************************************************************
     * 设置最大请求并发数
     ************************************************************************/
    setMaxConcurrency = (concurrency) => {
        if (concurrency && concurrency > 0) {
            this._maxConcurrency = concurrency;
        }
    };

    /************************************************************************
     * 提交任务至队列
     * @param Object => {
     *     request: {
     *         url: '',
     *         type: 'GET/POST/PUT/DELETE',
     *         dataType: 'json/text/document',
     *         data: Object,
     *         headers: {},
     *         timeout: null,
     *         success: function,
     *         fail: function,
     *         complete: function
     *     },
     *     requestInterceptor,
     *     responseInterceptor
     * }
     ************************************************************************/
    submit = ({request, requestInterceptor, responseInterceptor}) => {
        // 分配任务id
        const id = `${getTime()}-${random(100000)}`;

        // 入队：初始化重试次数、重试延时
        this._queue.enqueue({
            id: id,
            retry: 0,
            delay: 0,
            request: request,
            requestInterceptor: requestInterceptor,
            responseInterceptor: responseInterceptor
        });

        // 如果当前没有运行，则运行
        if (!this._isRunning) {
            this._execute();
        }

        // 返回任务id
        return id;
    };

    /************************************************************************
     * 真正执行的地方：
     * 1. 如果当前已达到最大并发，则休眠1s后继续;
     * 2. 依次从队列中取出任务;
     *    2.1、如果队列已空，则结束执行，反之
     *    2.2、开始执行任务
     ************************************************************************/
    _execute = async () => {
        this._isRunning = true;
        while (true) {
            if (this._concurrency >= MAX_CONCURRENCY) {
                await sleep(5);
                continue;
            }

            const task = this._queue.dequeue();
            if (!task) {
                break;
            }

            this._executeTask(task);
        }
        this._isRunning = false;
    };

    /************************************************************************
     * 开启线程来执行任务
     ************************************************************************/
    _executeTask = async (task) => {
        this._concurrency++;
        new Thread(task, () => {
            this._concurrency--;
        });
    };
}
