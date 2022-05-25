const SUCCESS_ERRNO = 0,
    ERRNO = {
        [-7]: "保存路径存在非法字符",
        [-8]: "路径下存在同名文件",
        [400]: "请求错误(请尝试使用最新版Chrome浏览器)",
        [403]: "文件获取失败(生成过于频繁导致接口被限,请稍后再试)",
        [404]: "文件不存在(秒传无效)",
        [2]: "转存失败(尝试重新登录网盘账号)",
        [3939]: "文件大于上限 20G",
        [2333]: '链接内的文件路径错误(不能含有以下字符"\\:*?<>|)',
        [-10]: "网盘容量已满",
        [114]: "接口调用失败(请重试)",
        [514]: '接口调用失败(请重试/弹出跨域访问窗口时,请选择"总是允许"或"总是允许全部域名")',
        [1919]: "文件已被和谐",
        [810]: "文件列表获取失败(请重试)",
        [996]: "md5获取失败(请参考分享教程)",
        [888]: "该文件不支持修复",
        [999]: "uploadid获取失败",
        // 自定义
        [-101]: "XMLHttpRequest 请求失败",
    };

class MultiRapidLinks {
    constructor() {
        this.md5_funcs = this.__init_md5_funcs();
        this.data = [];
        this.cursor = -1;
    }

    __init_md5_funcs() {
        return [
            (_md5) => {
                return _md5.toLowerCase();
            },
            (_md5) => {
                return _md5.toUpperCase();
            },
            (_md5) => {
                return randomStringTransform(_md5);
            },
        ];
    }

    __console_line(text) {
        return console.log(`================== ${text} ==================`);
    }

    _parse_link(q_link) {
        // unsigned long long: 0~18446744073709551615
        let result = q_link.trim().match(/([\dA-Fa-f]{32})#([\dA-Fa-f]{32})#([\d]{1,20})#([\s\S]+)/);
        result = {
            md5: result[1],
            md5s: result[2],
            size: result[3],
            path: result[4],
        };
        return result;
    }

    _verify_link(q_link) {
        let result = true;
        try {
            this._parse_link(q_link);
        } catch (err) {
            console.error("非法链接: " + q_link);
            console.error(err);
            result = false;
        }
        return result;
    }

    _upload(file_info) {
        const file = file_info["file"],
            that = this;
        let code = SUCCESS_ERRNO;
        // 创建 post 请求，采用异步
        const xhr = new XMLHttpRequest();
        xhr.responseType = "json";
        xhr.open(
            "POST",
            // 旧版可以从 locals 全局变量获取 bdstoken
            `/api/rapidupload?channel=chunlei&web=1&app_id=250528&bdstoken=${locals.get("bdstoken")}&clienttype=0`,
            true
        );
        xhr.onload = function() {
            const data = this.response;
            code = file.path.match(/["\\\:*?<>|]/) ? 2333 : data.errno;
            // file-info
            file_info["errno"] = code;
            file_info["message"] =
                code === SUCCESS_ERRNO ? "成功" : ERRNO[code] === undefined ? "未知错误" : ERRNO[code];
            ++file_info["try_count"];
            // 重试|next
            if (file_info.errno === 404 && file_info["try_count"] < that.md5_funcs.length) {
                that._upload(file_info);
            } else {
                that._trigger_next();
            }
        };
        // 构建请求数据
        const fd = new FormData();
        fd.append("path", file_info["dir_path"] + file.path);
        fd.append("content-md5", file.md5);
        fd.append("slice-md5", file.md5s.toLowerCase());
        fd.append("content-length", file.size);
        // 发送
        xhr.send(fd);
    }

    _trigger_next() {
        // 无任务
        if (this.data.length === 0) {
            return null;
        }
        // 全部任务完成
        if (this.cursor + 1 >= this.data.length) {
            this.__console_line(`全部完成，cursor=${this.cursor}`);
            this._display_data();
            return null;
        }
        // next
        ++this.cursor;
        this.__console_line(`完成单个，cursor=${this.cursor}/${this.data.length}`);
        this._upload(this.data[this.cursor]);
    }

    _display_data() {
        const DISPLAY_KEYS = ["q_link", "dir_path", "errno", "message"],
            result = this.data.map((info) => {
                const line = {};
                DISPLAY_KEYS.forEach((key) => {
                    line[key] = info[key];
                });
                return line;
            });
        console.table(result);
        return result;
    }

    append(q_link, dir_path) {
        const that = this;
        // verify
        if (!this._verify_link(q_link)) {
            return null;
        }
        // split-qlink
        if (q_link.indexOf("\n") >= 0) {
            q_link
                .split("\n")
                .map((link) => link.trim())
                .filter((link) => link)
                .forEach((link) => that.append(link, dir_path));
            return null;
        }
        // append
        dir_path = dir_path.charAt(dir_path.length - 1) === "/" ? dir_path : dir_path + "/";
        this.data.push({
            q_link: q_link,
            dir_path: dir_path,
            file: this._parse_link(q_link),
            try_count: 0,
            errno: SUCCESS_ERRNO,
            message: "",
        });
    }

    append_multi(data) {
        // data = {q_link: d_path}
        const that = this;
        // verify
        let verify_result = true;
        Object.keys(data).forEach((link) => {
            verify_result = verify_result && that._verify_link(link);
        });
        if (!verify_result) {
            return null;
        }
        // append
        Object.keys(data).forEach((key) => {
            that.append(key, data[key]);
        });
    }

    run(link2path_dict) {
        if (link2path_dict) {
            this.append_multi(link2path_dict);
        }
        this._trigger_next();
    }
}