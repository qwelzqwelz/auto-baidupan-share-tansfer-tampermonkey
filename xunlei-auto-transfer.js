// ==UserScript==
// @name         迅雷-文件页转存 V2
// @namespace    http://tampermonkey.net/
// @version      2025-09-20
// @description  try to take over the world!
// @author       You
// @match        https://pan.xunlei.com/s/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=xunlei.com
// @grant        none
// ==/UserScript==

window.log_list = [];
console.log = function () {
    window.log_list.push(JSON.stringify(Array.from(arguments)));
};

class TokenManager {
    _search_ls_key(prefix) {
        let result = null;
        Object.keys(localStorage).forEach((key) => {
            if (key.indexOf(prefix) !== 0) {
                return null;
            }
            result = key;
        });
        return result;
    }

    get access_token() {
        const data_key = this._search_ls_key("credentials_");
        let result = "<access-token>";
        if (data_key) {
            result = JSON.parse(localStorage.getItem(data_key))["access_token"];
        }
        return result;
    }

    get captcha_token() {
        const data_key = this._search_ls_key("captcha_");
        let result = "<captcha-token>";
        if (data_key) {
            result = JSON.parse(localStorage.getItem(data_key))["token"];
        }
        return result;
    }

    get client_id() {
        const data_key = this._search_ls_key("credentials_");
        let result = "<client-id>";
        if (data_key) {
            result = data_key.split("_", 2)[1];
        }
        return result;
    }

    get device_id() {
        return localStorage.getItem("deviceid").split(".", 2)[1].slice(0, 32);
    }

    build_headers() {
        return {
            accept: "*/*",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
            authorization: `Bearer ${this.access_token}`,
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "x-captcha-token": this.captcha_token,
            "x-client-id": this.client_id,
            "x-device-id": this.device_id,
        };
    }
}

class FolderCreateManager {
    constructor(folder) {
        if (folder.indexOf("/") !== 0) {
            console.error(`无效的保存路径: ${folder}`);
        }
        this.folder = folder;
        this.tm = new TokenManager();
    }

    async listFolder(parent_id) {
        const response = await fetch(
            `https://api-pan.xunlei.com/drive/v1/files?limit=${
                parent_id === "" ? 1000 : 200
            }&parent_id=${parent_id}&filters=%7B%22kind%22%3A%7B%22eq%22%3A%22drive%23folder%22%7D%2C%22trashed%22%3A%7B%22eq%22%3Afalse%7D%7D`,
            {
                headers: this.tm.build_headers(),
                referrer: "https://pan.xunlei.com/",
                body: null,
                method: "GET",
                mode: "cors",
                credentials: "include",
            }
        );
        const result = {};
        (await response.json())["files"].forEach((row) => {
            result[row.name] = row.id;
        });
        return result;
    }

    async createFolder(parent_id, path_parts) {
        // 无需创建
        if (path_parts.length <= 0) {
            return parent_id;
        }
        // 创建子文件夹
        const response = await fetch("https://api-pan.xunlei.com/drive/v1/files", {
            headers: {
                ...this.tm.build_headers(),
                "x-request-from": "undefined",
            },
            referrer: "https://pan.xunlei.com/",
            body: `{"parent_id":"${parent_id}","name":"${path_parts[0]}","kind":"drive#folder","space":""}`,
            method: "POST",
            mode: "cors",
            credentials: "include",
        });
        const folder_id = (await response.json()).file.id;
        // 递归
        const result = await this.createFolder(folder_id, path_parts.slice(1));
        return result;
    }

    async run() {
        const that = this,
            path_parts = this.folder.split("/").filter((x) => x.length > 0);
        let parent_id = "",
            abs_path = "/";
        for (let offset = 0; offset < path_parts.length; ++offset) {
            abs_path += path_parts[offset] + "/";
            const next_parent_id = (await this.listFolder(parent_id))[path_parts[offset]];
            console.log(abs_path, next_parent_id);
            // 文件夹不存在，则递归创建
            if (!next_parent_id) {
                parent_id = await that.createFolder(parent_id, path_parts.slice(offset));
                break;
            }
            parent_id = next_parent_id;
        }
        return parent_id;
    }
}

const taskDict = {};
function append(upDict) {
    Object.keys(upDict).forEach((x) => {
        taskDict[x] = upDict[x];
    });
}

(function () {
    "use strict";
    window.transferResult = {};

    const SUCCESS_CODES = ["RESTORE_COMPLETE"],
        FAIL_CODES = ["SENSITIVE_RESOURCE", "DELETED"];

    class XunleiTransfer {
        constructor() {
            this.tm = new TokenManager();
        }

        async getFileIds(uuid) {
            const response = await fetch(
                `https://api-pan.xunlei.com/drive/v1/share?share_id=${uuid}&pass_code=${localStorage.getItem(
                    "xlpan_pass_code"
                )}&limit=100&pass_code_token=${encodeURIComponent(
                    localStorage.getItem("xlpan_pass_token")
                )}&page_token=&thumbnail_size=SIZE_SMALL`,
                {
                    headers: this.tm.build_headers(),
                    referrer: "https://pan.xunlei.com/",
                    body: null,
                    method: "GET",
                    mode: "cors",
                    credentials: "include",
                }
            );
            const result = (await response.json())["files"].map((x) => x.id);
            return result;
        }

        async transfer(uuid, parent_id, file_ids) {
            const response = await fetch("https://api-pan.xunlei.com/drive/v1/share/restore", {
                headers: this.tm.build_headers(),
                referrer: "https://pan.xunlei.com/",
                body: JSON.stringify({
                    parent_id,
                    share_id: uuid,
                    pass_code_token: localStorage.getItem("xlpan_pass_token"),
                    ancestor_ids: [],
                    file_ids,
                    specify_parent_id: true,
                }),
                method: "POST",
                mode: "cors",
                credentials: "include",
            });
            const result = await response.json();
            window.transferResult = result;
            return result;
        }

        _try_close_window() {
            const status = window.transferResult.restore_status,
                error = window.transferResult.error;
            if (SUCCESS_CODES.includes(status) || FAIL_CODES.includes(status) || error === "share_status_prohibited") {
                setTimeout(() => {
                    window.close();
                }, 10 * 1000);
            }
            document.querySelector(".web-header-content").innerHTML = JSON.stringify(window.transferResult);
        }

        async main() {
            const uuid = window.location.pathname.split("/").slice(-1)[0],
                save_folder = taskDict[uuid];
            if (!save_folder) {
                console.warn(`无匹配保存路径，跳过。uuid=${uuid}`);
                return null;
            }

            const file_ids = await this.getFileIds(uuid);
            if (file_ids.length <= 0) {
                setTimeout(() => {
                    window.close();
                }, 5 * 1000);
                return null;
            }
            await this.transfer(uuid, await new FolderCreateManager(save_folder).run(), file_ids);
            this._try_close_window();
        }
    }

    document.addEventListener("readystatechange", async () => {
        await new XunleiTransfer().main();
    });
})();

// ==========================================

append({
    VNyTM0gKtSi1Ofyfyqsgsd0123: "/lw-part0824p2-v1/1365413-fid727",
});
