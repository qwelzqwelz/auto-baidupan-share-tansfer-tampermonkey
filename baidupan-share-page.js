// ==UserScript==
// @name         BaiduPan 分享页面-文件页
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  try to take over the world!
// @author       qwelz
// @match        https://pan.baidu.com/s/*
// @icon         https://pan.baidu.com/m-static/base/static/images/favicon.ico
// @grant        none
// ==/UserScript==

"use strict";

const CLOSE_WHEN_SUCCESS = true,
    PATH_DICT = {};

const TRANSFER_ERROR_NO = {
        4: "转存出错了，请稍后重试",
        "-30": "文件已存在",
        "-31": "转存出错了，请稍后重试",
        "-32": "空间不足，转存失败",
        "-33": "所选文件数量超出上限，无法保存",
        111: "当前有其他保存任务正在进行，请稍后重试",
        120: "所选文件数量超出上限，无法保存",
        130: "所选文件数量超出上限，无法保存",
        31061: "文件已存在",
        31069: "转存出错了，请稍后重试",
        31112: "空间不足，转存失败",
        31075: "所选文件数量超出上限，无法保存",
        31171: "当前有其他保存任务正在进行，请稍后重试",
        31174: "所选文件数量超出上限，无法保存",
        31175: "所选文件数量超出上限，无法保存",
        90003: "暂无文件夹管理权限，不支持转存",
    },
    APP_ID = 250528;

function append(data) {
    Object.keys(data).forEach((key) => {
        PATH_DICT[decodeURIComponent(key).trim()] = data[key];
    });
}

class ListAction {
    constructor(folder_path) {
        this.folder_path = folder_path.substr(-1) === "/" ? folder_path : `${folder_path}/`;
        this.response = null;
    }

    __build_url(dir) {
        let app_id = 250528,
            order = "name",
            desc = 0,
            start = 0,
            limit = 1000;
        return `https://pan.baidu.com/api/list?app_id=${app_id}&dir=${dir}&order=${order}&desc=${desc}&start=${start}&limit=${limit}`;
    }

    __dirname(path) {
        if (path === "/") {
            return "/";
        }
        return `/${path
            .split("/")
            .filter((x) => x)
            .slice(0, -1)
            .join("/")}/`;
    }

    __dir_includes(path_list, path) {
        let result = false;
        path = path.substr(-1) === "/" ? path : path + "/";
        path_list.forEach((p) => {
            p = p.substr(-1) === "/" ? p : p + "/";
            result = result || p === path;
        });

        return result;
    }

    run(root_dir = null, raw_data = false) {
        root_dir = root_dir === null ? this.folder_path : root_dir;
        const url = this.__build_url(root_dir),
            that = this;
        return new Promise((resolve, reject) => {
            jQuery
                .get(url)
                .error(function(data) {
                    console.warn(`获取文件夹内容列表失败: ${root_dir}`);
                    reject(data);
                })
                .success(function(data) {
                    that.response = data;
                    // 非法响应
                    if (!data || data.errno !== 0) {
                        console.warn(`获取文件夹内容列表失败: ${root_dir}`);
                        reject(data);
                        return null;
                    }
                    console.log(`获取文件夹内容列表成功: ${root_dir}`);
                    // 原始数据
                    if (raw_data) {
                        return resolve(data);
                    }
                    // 精简数据
                    const result = { files: [], dirs: [] };
                    data.list.forEach((path) => {
                        if (!path.isdir) {
                            result["files"].push(path.path);
                        } else {
                            result["dirs"].push(path.path.substr(-1) === "/" ? path.path : `${path.path}/`);
                        }
                    });
                    resolve(result);
                });
        });
    }

    // 返回 [路径存在，路径的父路径存在，父路径]
    async is_exist(folder_path = null) {
        folder_path = folder_path || this.folder_path;
        if (folder_path === "/") {
            return [true, true, "/"];
        }
        let result = [false, false, this.__dirname(this.folder_path)],
            list = null;
        try {
            list = await this.run(result[2]);
            result[1] = list ? true : false;
            result[0] = list && this.__dir_includes(list["dirs"], this.folder_path);
        } catch (error) {
            if (error && error.errno === -9) {
                console.warn(`[response]文件夹不存在: ${result[2]}`);
            } else {
                console.error(error);
                console.trace();
            }
        }
        return result;
    }

    async max_exist_prefix() {
        let flag = false,
            result = this.folder_path;
        let count = 0;
        while (!flag && count < 10) {
            let [exist, parent_exist, parent] = await this.is_exist(result);
            console.log(result, exist, parent_exist, parent);
            if (exist) {
                flag = true;
            } else if (parent_exist) {
                result = parent;
                flag = true;
            } else {
                result = this.__dirname(this.__dirname(result));
            }
            ++count;
        }
        return result;
    }
}

class CreateAction {
    constructor(path) {
        this.path = path;
        this.status = null;
        this.response = null;
    }

    __build_request_url() {
        return `https://pan.baidu.com/api/create?a=commit&app_id=${APP_ID}`;
    }

    __build_request_data(path) {
        return {
            path,
            isdir: 1,
            block_list: "[]",
        };
    }

    async run(verify = false) {
        const that = this,
            is_exist = (await new ListAction(this.path).is_exist())[0];
        return new Promise((resolve, reject) => {
            if (verify && is_exist) {
                this.status = "exist";
                console.log(`文件夹已经存在: ${this.path}`);
                return resolve(null);
            }
            console.log(`尝试创建文件夹: ${this.path}`);
            jQuery
                .post(that.__build_request_url(), that.__build_request_data(that.path))
                .success(function(data) {
                    if (data && data.path && data.path.substr(-1) != "/") {
                        data.path += "/";
                    }
                    that.response = data;
                    if (data && 0 == data.errno) {
                        that.status = "success";
                        console.log(`创建文件夹成功: ${data.path}`);
                        return resolve(data);
                    }
                    that.status = "fail";
                    reject(data);
                })
                .fail(function(error) {
                    that.status = "fail";
                    reject(error);
                });
        });
    }
}

class AutoTransfer {
    constructor() {
        this.uuid = this.__get_uuid();
        this.result = {
            status: null,
            message: null,
            errno: null,
            show_msg: null,
        };
    }

    __get_uuid() {
        let result = /\/s\/1([\w%\-]+)/.exec(window.location.pathname)[1];
        result = decodeURIComponent(result).trim();
        console.log(`============= uuid: ${result} =============`);
        return result;
    }

    __build_request_url() {
        const locals = window.locals;
        let shareid = locals.get("shareid"),
            from = locals.get("share_uk"),
            sekey = encodeURIComponent(window.currentSekey),
            app_id = APP_ID;
        return `https://pan.baidu.com/share/transfer?shareid=${shareid}&from=${from}&sekey=${sekey}&app_id=${app_id}`;
    }

    __build_request_data(path) {
        const fsidlist = window.locals.get("file_list").map((file) => file.fs_id);
        return {
            fsidlist: `[${fsidlist.join(",")}]`,
            path,
        };
    }

    _success_callback(data) {}

    async _save() {
        const that = this,
            expect_path = PATH_DICT[this.uuid];
        console.log(`============= expect_path: ${expect_path} =============`);
        // 无分享信息则跳过
        if (!expect_path) {
            return null;
        }
        // 确保目标存储路径存在
        await new CreateAction(expect_path).run(true);
        // 发送请求
        console.log("开始发送转存请求");
        return new Promise((resolve, reject) => {
            jQuery
                .ajax({
                    type: "post",
                    url: that.__build_request_url(),
                    data: that.__build_request_data(expect_path),
                    dataType: "json",
                    timeout: 1e5,
                })
                .error(function() {
                    that.result.status = "error";
                    reject();
                })
                .success(function(data) {
                    that.result.status = "fail";
                    that.result.errno = data ? data.errno : null;
                    that.result.show_msg = data ? data.show_msg : null;
                    if (null === data) {
                        that.result.message = "网络错误，请稍后重试";
                    } else if (data.errno !== 0) {
                        that.result.message = TRANSFER_ERROR_NO[data.errno];
                    } else {
                        that.result.status = "success";
                        that.result.message = "成功";
                    }
                    that._success_callback(data);
                    resolve(that.result, data);
                })
                .always(() => {
                    // 输出结果
                    console.log("结束发送转发请求");
                    console.table(that.result);
                    window.locals.set("request-result", that.result);
                    // 页面显示结果
                    const page_node = document.querySelector("dd[node-type='header-apps']");
                    page_node.style.minWidth = "200px";
                    page_node.innerText = JSON.stringify(that.result).replace(/",/g, '",\n');
                });
        });
    }

    _close_window() {
        if (!CLOSE_WHEN_SUCCESS) {
            return null;
        }
        // 关闭窗口
        setInterval(() => {
            const response = window.locals.get("request-result");
            if (!response || response.status !== "success") {
                return null;
            }
            console.log(`尝试关闭窗口: ${window.location.url}`);
            window.close();
        }, 10 * 1000);
    }

    async run() {
        await this._save();
        this._close_window();
    }
}

document.addEventListener("readystatechange", () => {
    window.T = new AutoTransfer();
    window.T.run();
});

// ============================== CODE END ==============================

append({
    BdaYkCUebRRvWp5D6MLkMw: "/测试",
});