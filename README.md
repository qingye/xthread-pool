# xthread-pool

【UMD library】A concurrency network-library for js !

# How to use it?
```
import {ThreadPool} from "xthread-pool";

const pool = new ThreadPool();
pool.submit({
    request: {
        url: 'xxxx',
        type: 'get/post/put/delete',
        dataType: 'json/blob',
        success: (res) => {},
        fail: (res) => {},
        complete: (res) => {},
    },
    requestInterceptor: (res) => {},
    responseInterceptor: (res) => {}
});
```
