// ==UserScript==
// @name         BaiduPan 分享页面-密码校验页
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       qwelz
// @match        https://pan.baidu.com/share/init?surl=*
// @icon         https://pan.baidu.com/m-static/base/static/images/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    "use strict";

    const SECRET_DICT = {};

    function append(data) {
        Object.keys(data).forEach((key) => {
            SECRET_DICT[decodeURIComponent(key).trim()] = data[key];
        });
    }

    class AutoInput {
        constructor() {
            this.uuid = this.__get_uuid();
            this.pass_code = null;
        }

        __get_uuid() {
            let result = /^\?surl=([\w%\-]+)/.exec(window.location.search);
            result = result.length >= 2 ? decodeURIComponent(result[1]).trim() : null;
            console.log(`============= uuid: ${result} =============`);
            return result;
        }

        run() {
            const pass_code = this.uuid ? SECRET_DICT[this.uuid] : null,
                that = this;
            if (!pass_code) {
                console.log(`============= pass_code 不存在 [uuid=${that.uuid}] =============`);
                return null;
            }
            console.log(`============= pass_code: ${pass_code} =============`);
            this.pass_code = pass_code;
            document.getElementById("accessCode").value = pass_code;
            setTimeout(() => {
                document.getElementById("submitBtn").click();
            }, 300);
        }
    }

    document.addEventListener("readystatechange", () => {
        new AutoInput().run();
    });

    // ============================== CODE END ==============================

    append({
        xcWtarHD369eXcMGw14rdA: "w22q",
    });
})();