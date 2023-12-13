// worker.js
const WORKER_JS_TEXT = `self.addEventListener(
    "message",
    function (e) {
        const interval_ms = e.data;
        // 后台定时器
        let count = 0;
        this.setInterval(function () {
            self.postMessage(count);
            ++count;
        }, interval_ms);
    },
    false
);`;
const WORKER_URL = window.URL.createObjectURL(new Blob([WORKER_JS_TEXT]));

// DOM Javascript
function worker_open_links(links, interval_s = 15, group_size = 1) {
    links = "string" === typeof links ? links.split("\n").filter((x) => x.trim()) : links;
    let index = 0;
    const open_func = () => {
        for (let count = 0; count < group_size && index < links.length; ++count) {
            const link = links[index];
            console.log(`[iterate] index=${index}/${links.length}, link=${link}`);
            index += 1;
            if (!!link) {
                window.open(link);
            }
        }
        // 完成全部任务，则终止
        if (index >= links.length && worker !== undefined) {
            worker.terminate();
        }
    };
    open_func();
    const worker = new Worker(WORKER_URL);
    worker.postMessage(interval_s * 1000);
    worker.onmessage = function (e) {
        open_func();
    };
}
