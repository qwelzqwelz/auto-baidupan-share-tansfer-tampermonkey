// ==UserScript==
// @name            百度网盘秒传链接提取(自用版)
// @namespace       taobao.idey.cn/index
// @version         2.3.2
// @description     用于提取和生成百度网盘秒传链接
// @author          免费王子
// @license         AGPL
// @match           *://pan.baidu.com/disk/main*
// @match           *://yun.baidu.com/disk/main*
// @match           *://pan.baidu.com/disk/home*
// @match           *://yun.baidu.com/disk/home*
// @connect         baidu.com
// @connect         baidupcs.com
// @require         https://cdn.staticfile.org/jquery/1.12.4/jquery.min.js
// @require         https://cdn.bootcdn.net/ajax/libs/jquery.qrcode/1.0/jquery.qrcode.min.js
// @require         https://unpkg.com/sweetalert2@10.16.6/dist/sweetalert2.all.min.js
// @require         https://cdn.staticfile.org/spark-md5/3.0.0/spark-md5.min.js
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_deleteValue
// @grant           GM_setClipboard
// @grant           GM_xmlhttpRequest
// @grant           GM_info
// @grant           GM_getResourceText
// @grant           GM_addStyle
// @run-at          document-end
// @icon            data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABBUlEQVR4AZTTJRBUURTH4TtDwXuPdPrgbhHXiksf3CPucRNScHd3d3d3uO9bKeu7b79+fun8Q17CNHyMMUqaiPE4fEyYVjjGNKnNwQ4lpgV8lManEfwfosLHEGPU1N3ZnAv4qlT+NiQ56uPWSjKBrztUSnIaB66sY1vgxgxoMXB5NbsCB9rxcB5fN2M5/16nCFxeS6YTezpzsB1Pu/C2O7/78/99eYBYHXh+gqdHObGIK4GHgevjVIt1AgAnhvE4cGe8euoHbizgYuD2RGgx8O0RpwIPRmsmJDGqcrANd3pLo/qVr03hUlcpfSwf0/vD3JwkPdPK5/zhkOz+/f1FIDv/RcnOAEjywH/DhgADAAAAAElFTkSuQmCC
// @connect         *
// @antifeature     referral-link 此提示为 GreasyFork 代码规范要求含有查券功能的脚本必须添加, 脚本描述也有说明, 请知悉。
// ==/UserScript==

!(function () {
    "use strict";
    var index_num = 0;
    var $ = $ || window.$;
    var item = [];
    var urls = [];
    var selectorList = [];
    var obj = {};
    var failed = 0;
    var bdstoken;
    var checkFileList;
    var fileList = [];
    var dirList = [];
    var hosturl = "https://wk.idey.cn/red.html?url=";
    var inputSavePathHTML =
        '<input id="inputSavePathId" class="swal2-input" placeholder="保存路径, 示例: /LIST/, 默认保存在根目录" style="display: flex;margin-top: 10px;">';
    var inputSavePath = "";
    var linkList = [];
    var errList = "";
    var requestData = {};
    var reqstr = "/api/create";
    var reqfile = "/rest/2.0/xpan/multimedia?method=listall&order=name&limit=10000&path=";
    var reqmetas = "/api/filemetas?dlink=1&fsids=";
    var upresponse = "";
    var btnRespConf = {
        id: "btn-resp",
        text: "秒传",
        html: function (type) {
            if (type == "main") {
                return `<button><span>${this.text}</span></button>`;
            } else if (type == "home") {
                return `<button><span>${this.text}</span></button>`;
            }
        },
    };
    var btnCreateConf = {
        id: "btn-create",
        text: "生成秒传",
        html: function (type) {
            if (type == "main") {
                return `<button><span>${this.text}</span></button>`;
            } else if (type == "home") {
                return `<button><span>${this.text}</span></button>`;
            }
        },
    };

    var tool = {
        sleep: (time) => {
            return new Promise((resolve) => setTimeout(resolve, time));
        },
        get: async (url, headers, type, extra) => {
            return new Promise((resolve, reject) => {
                let req = GM_xmlhttpRequest({
                    method: "GET",
                    url,
                    headers,
                    responseType: type || "json",
                    onload: (res) => {
                        if (res.status === 204) {
                            req.abort();
                        }
                        if (type === "arraybuffer") {
                            resolve(res);
                        } else {
                            resolve(res.response || res.responseText);
                        }
                    },
                    onerror: (err) => {
                        reject(err);
                    },
                });
            });
        },
        post: async (url, data, headers) => {
            return new Promise((resolve, reject) => {
                let query = "";
                for (var key in data) query += "&" + key + "=" + encodeURIComponent(data[key]);
                data = query;
                let req = GM_xmlhttpRequest({
                    method: "POST",
                    url,
                    headers: headers,
                    responseType: "json",
                    data: data,
                    onload: (res) => {
                        resolve(res.response || res.responseText);
                    },
                    onerror: (err) => {
                        reject(err);
                    },
                });
            });
        },
        request: (obj) => {
            var method = obj.method || "GET",
                headers = obj.headers || {},
                data = obj.data || {},
                url = obj.url || "";
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if ((xhr.status >= 200 && xhr.readyState < 300) || xhr.status == 304) {
                        obj.callback && obj.callback(xhr.responseText);
                    }
                }
            };
            if (obj.method.toUpperCase() == "GET") {
                for (var key in data) {
                    url += url.indexOf("?") == -1 ? "?" : "&";
                    url += encodeURIComponent(key) + "=" + encodeURIComponent(data["key"]);
                }
            }
            xhr.open(method, url, true);
            if (obj.method.toUpperCase() == "GET") {
                xhr.send(null);
            } else {
                xhr.send(JSON.stringify(data));
            }
        },
        timeStamp: () => {
            let time = new Date().getTime();
            return time;
        },
        parse: (link) => {
            try {
                let arrays = link
                    .split("\n")
                    .map(function (list) {
                        return list.trim().match(/([\dA-Fa-f]{32})#([\dA-Fa-f]{32})#([\d]{1,20})#([\s\S]+)/);
                    })
                    .map(function (info) {
                        return { md5: info[1], md5s: info[2], size: info[3], path: info[4] };
                    });
                return arrays;
            } catch (e) {
                return false;
            }
        },
        parse1: (link) => {
            try {
                let arrays = link
                    .split("\n")
                    .map(function (list) {
                        return list.trim().match(/([\dA-Fa-f]{32})#([\d]{1,20})#([\s\S]+)/);
                    })
                    .map(function (info) {
                        return { md5: info[1], size: info[2], path: info[3] };
                    });
                return arrays;
            } catch (e) {
                return false;
            }
        },
        baiduClass: () => {
            if (location.href.indexOf("//pan.baidu.com/disk/main") > 0) {
                return "main";
            } else if (location.href.indexOf("//pan.baidu.com/s/") > 0) {
                return "share";
            } else if (location.href.indexOf("//pan.baidu.com/disk/synchronization") > 0) {
                return "synch";
            } else if (location.href.indexOf("//pan.baidu.com/disk/home") > 0) {
                return "home";
            }
        },
        inputUserValue: (row = "") => {
            Swal.fire({
                input: "textarea",
                title: "请输入秒传",
                inputValue: row,
                allowOutsideClick: false,
                showCancelButton: true,
                inputPlaceholder: "格式：MD5#MD5s#大小#文件名\nMD5#大小#文件名格式 无法转存",
                cancelButtonText: "取消",
                confirmButtonText: "确定",
                onBeforeOpen: function onBeforeOpen() {
                    let d = document.createElement("div");
                    d.innerHTML += inputSavePathHTML;
                    Swal.getContent().appendChild(d);
                },
                inputValidator: function inputValidator(inputRow) {
                    if (!inputRow) {
                        return "不能为空";
                    }
                    linkList = tool.parse(inputRow);

                    if (!linkList.length) {
                        linkList = tool.parse1(inputRow);
                        if (linkList.length) {
                            return "抱歉，MD5#大小#文件名格式由于百度接口问题无法转存!其它所有脚本都是无法转存的!!!";
                        }
                    }

                    if (!linkList.length) {
                        return "抱歉，链接无法识别哦";
                    }

                    inputSavePath = document.getElementById("inputSavePathId").value;
                },
            }).then(function (res) {
                if (!res.dismiss) {
                    Swal.fire({
                        title: "文件转存中",
                        html: "正在转存文件<index>0</index>",
                        allowOutsideClick: false,
                        showCloseButton: false,
                        showConfirmButton: false,
                        onBeforeOpen: function () {
                            Swal.showLoading();
                            savePathList(0, 0);
                        },
                    });
                }
            });
        },
        cookie: (n) => {
            let arrays = unsafeWindow.document.cookie.replace(/\s/g, "").split(";");
            for (var i = 0, l = arrays.length; i < l; i++) {
                var t = arrays[i].split("=");
                if (t[0] === n) {
                    return decodeURIComponent(t[1]);
                }
            }
            return "";
        },
        getCheckFile: (type) => {
            if (type == "home") {
                return require("system-core:context/context.js").instanceForSystem.list.getSelected();
            } else {
                return document.querySelector(".nd-main-list, .nd-new-main-list").__vue__.selectedList;
            }
        },
        reqAjax: (f, n, num) => {
            if (num >= 4) {
                f.errno = 2;
                tool.signMd5(n + 1, 0);
                return;
            }
            $.ajax({
                url: `${reqstr}&bdstoken=${bdstoken}`,
                type: "POST",
                dataType: "json",
                data: {
                    block_list: JSON.stringify([f.md5.toLowerCase()]),
                    path: f.path,
                    size: f.size,
                    isdir: 0,
                    rtype: 3,
                    is_revision: 1,
                },
                success: function (res) {
                    if (res.errno === 2) {
                        tool.reqAjax(f, n, ++num);
                    } else if (res.errno === 0) {
                        tool.signMd5(n + 1, 0);
                    } else if (res.errno === 31190) {
                        tool.getOtherMd5Step1(f, n, 0);
                    } else {
                        tool.getOtherMd5Step1(f, n, 0);
                    }
                },
                error: function (code) {
                    f.errno = code;
                    tool.signMd5(n + 1);
                },
            });
        },
        getOtherMd5Step1: (f, n, flag) => {
            let fsid = JSON.stringify([String(f.fs_id)]);
            tool.get(`${reqmetas}${fsid}`, { "User-Agent": "netdisk;" }, "json")
                .then((res) => {
                    tool.getOtherMd5Step2(f, n, flag, res.info[0].dlink);
                })
                .catch((err) => {
                    f.errno = err;
                    tool.signMd5(n + 1, 0);
                });
        },
        getOtherMd5Step2: (f, n, flag, downfile) => {
            let bufferSize = f.size < 262144 ? 1 : 262143;
            tool.get(downfile, { Range: "bytes=0-" + bufferSize, "User-Agent": "netdisk;" }, "arraybuffer")
                .then((res) => {
                    if (res.finalUrl.includes("issuecdn.baidupcs.com")) {
                        f.errno = 1919;
                        tool.signMd5(n + 1, 0);
                        return;
                    }
                    let newMd5 = res.responseHeaders.match(/content-md5: ([\da-f]{32})/i);
                    if (newMd5) {
                        f.md5 = newMd5[1].toLowerCase();
                        if (bufferSize == 1) {
                            f.md5s = f.md5;
                        } else {
                            let sparkmd5 = new SparkMD5.ArrayBuffer();
                            sparkmd5.append(res.response);
                            f.md5s = sparkmd5.end();
                        }
                        tool.signMd5(n + 1, 0);
                    } else {
                        f.errno = 996;
                        tool.signMd5(n + 1, 0);
                    }
                })
                .catch((err) => {
                    f.errno = err;
                    tool.signMd5(n + 1, 0);
                });
        },
        encodeMd5: (md5) => {
            if (!((parseInt(md5[9]) >= 0 && parseInt(md5[9]) <= 9) || (md5[9] >= "a" && md5[9] <= "f")))
                return decrypt(md5);
            else return md5;
            function decrypt(encryptMd5) {
                var key = (encryptMd5[9].charCodeAt(0) - "g".charCodeAt(0)).toString(16);
                var key2 = encryptMd5.slice(0, 9) + key + encryptMd5.slice(10);
                var key3 = "";
                for (var a = 0; a < key2.length; a++) key3 += (parseInt(key2[a], 16) ^ (15 & a)).toString(16);
                var md5 = key3.slice(8, 16) + key3.slice(0, 8) + key3.slice(24, 32) + key3.slice(16, 24);
                return md5;
            }
        },
        signMd5: (n, flag) => {
            if (n >= fileList.length) {
                tool.showOverSwal();
                return;
            }
            let f = fileList[n];
            if (f.errno && f.isdir == 1) {
                tool.signMd5(n + 1);
                return;
            }
            Swal.getHtmlContainer().querySelector("index").textContent = n + 1 + "/" + fileList.length;
            tool.reqAjax(f, n, 0);
        },
        forEachListFile: (n, flag) => {
            if (n >= dirList.length) {
                tool.signMd5(0, 0);
                return;
            }
            let dirItem = encodeURIComponent(dirList[n]);
            $.ajax({
                url: `${reqfile}${dirItem}&recursion=1&start=${flag}`,
                type: "GET",
                dataType: "json",
                success: function (res) {
                    if (!res.errno) {
                        if (!res.list.length) {
                            tool.forEachListFile(n + 1, 0);
                        } else {
                            res.list.forEach(function (i) {
                                if (i.isdir) {
                                } else {
                                    fileList.push({
                                        path: i.path,
                                        size: i.size,
                                        fs_id: i.fs_id,
                                        md5: tool.encodeMd5(i.md5.toLowerCase()),
                                    });
                                }
                            });
                            tool.forEachListFile(n, flag + 10000);
                        }
                    } else {
                        fileList.push({
                            path: dirList[n],
                            isdir: 1,
                            errno: res.errno,
                        });
                        tool.forEachListFile(n + 1, 0);
                    }
                },
                error: function (code) {
                    fileList.push({
                        path: dirList[n],
                        isdir: 1,
                        errno: res.errno,
                    });
                    tool.forEachListFile(n + 1, 0);
                },
            });
        },
        showSwalCreate: () => {
            Swal.fire({
                title: "秒传生成中",
                html: "<p>正在生成第 <index>0</index> 个</p>",
                showCloseButton: false,
                allowOutsideClick: false,
                showConfirmButton: false,
                onBeforeOpen: function () {
                    Swal.showLoading();
                },
            });
        },
        responseErrnoInfo: (err) => {
            switch (err) {
                case 31045:
                case -6:
                    return "身份验证失败,退出帐户,重新登陆";
                case -7:
                    return "转存路径含有非法字符";
                case -8:
                    return "路径下存在同名文件";
                case -9:
                    return "验证已过期, 请刷新页面";
                case 400:
                    return "请求错误";
                case 9019:
                case 403:
                    return "接口限制访问";
                case 404:
                    return "原始文件不存在秒传未生效";
                case 114:
                    return "秒传失败";
                case 514:
                    return "请求失败";
                case 1919:
                    return "文件已被和谐";
                case 996:
                    return "md5获取失败";
                case 2:
                    return "参数错误";
                case -10:
                    return "网盘容量已满";
                case 500:
                case 502:
                case 503:
                case 31039:
                    return "服务器错误";
                case 31066:
                case 909:
                    return "路径不存在/云端文件已损坏";
                case 900:
                    return "路径为文件夹, 不支持生成秒传";
                case 110:
                    return "请先登录百度账号";
                case 9013:
                    return "账号被限制, 尝试 更换账号 或 等待一段时间再重试";
                default:
                    return "未知错误";
            }
        },
        createErrFileList: (err, flag) => {
            let html =
                '<div class="createBox" style="height:auto; max-height:200px;overflow:auto;background:#FFFFFF;">';
            if (err > 0) {
                if (flag) {
                    html += `<div><summary ><b class="showErrBtn" style="cursor:pointer">失败文件列表(点这里看失败原因):</b><a  class="mCopyList">复制列表</a></summary></div>`;
                    html += `<div style="display:none" class="errBox">`;
                    for (let i = 0; i < fileList.length; i++) {
                        let f = fileList[i];
                        if (f.errno != 0) {
                            errList += `${f.path}(${f.errno})${tool.responseErrnoInfo(f.errno)}\n`;
                            html +=
                                '<p style="font-size:12px;line-height:22px">' +
                                f.path +
                                '<span class="redLink">(' +
                                f.errno +
                                ")" +
                                tool.responseErrnoInfo(f.errno) +
                                "</span></p>";
                        }
                    }
                    html += `</div>`;
                } else {
                    html += `<div><summary ><b class="showErrBtn" style="cursor:pointer">失败文件列表(点这里看失败原因):</b><a  class="mCopyList">复制列表</a></summary></div>`;
                    html += `<div style="display:none" class="errBox">`;
                    for (let i = 0; i < linkList.length; i++) {
                        let f = linkList[i];
                        if (f.errno != 0) {
                            errList += `${f.path}(${f.errno})${tool.responseErrnoInfo(f.errno)}\n`;
                            html +=
                                '<p style="font-size:12px;line-height:22px">' +
                                f.path +
                                '<span class="redLink">(' +
                                f.errno +
                                ")" +
                                tool.responseErrnoInfo(f.errno) +
                                "</span></p>";
                        }
                    }
                    html += `</div>`;
                }
            }
            html += `<br/>`;
            if (upresponse && upresponse.result) {
                html += upresponse.result;
            }
            if (flag) {
                html += `<p>快去复制秒传代码吧!!!</p></div>`;
            } else {
                html += `<p>快去刷新页面查看文件吧!!!</p></div>`;
            }

            return html;
        },
        showOverSwal: () => {
            let err = 0,
                success = "",
                ucode = "";
            for (let i = 0; i < fileList.length; i++) {
                let f = fileList[i];
                if (f.errno || f.isdir == 1) {
                    err++;
                } else {
                    success += "<p>" + f.path + "</p>";
                    if (f.md5s) {
                        ucode += `${f.md5}#${f.md5s}#${f.size}#${f.path}\n`;
                    } else {
                        ucode += `${f.md5}#${f.size}#${f.path}\n`;
                    }
                }
            }
            let title = "生成完成 共" + fileList.length + "个,失败" + err + "个";
            let html = tool.createErrFileList(err, true);
            Swal.fire({
                title: title,
                html: html,
                allowOutsideClick: false,
                showCloseButton: true,
                confirmButtonText: "复制秒传代码",
                preConfirm: function () {
                    GM_setClipboard(ucode.replace(/(#\/.+\/)|(#\/)/g, "#"));
                    Swal.getConfirmButton().innerText = "复制成功";
                    return false;
                },
            });
            fileList = [];
            dirList = [];
            tool.removeBtn();
            //添加事件
            tool.addEventBtn();
        },
        removeBtn: () => {
            let mbtn1 = GM_getValue("MBTN1");
            let mbtn2 = GM_getValue("MBTN2");
            let mbtn3 = GM_getValue("MBTN3");
            try {
                if (mbtn1) $(".mPbox1").remove();
                if (mbtn2) $(".mPbox2").remove();
                if (mbtn3) $(".mPbox3").remove();
            } catch (e) {
                //TODO handle the exception
            }
        },
        addEventBtn: () => {
            try {
                $(".mbtn1").click(function () {
                    GM_setValue("MBTN1", 1);
                    $(".mPbox1").remove();
                });
                $(".mbtn2").click(function () {
                    GM_setValue("MBTN2", 1);
                    $(".mPbox2").remove();
                });
                $(".mbtn3").click(function () {
                    GM_setValue("MBTN3", 1);
                    $(".mPbox3").remove();
                });
                $(".showErrBtn").click(function () {
                    if ($(".errBox").is(":visible")) {
                        $(".errBox").hide();
                    } else {
                        $(".errBox").show();
                    }
                });
                $(".mCopyList").click(function () {
                    GM_setClipboard(errList);
                    $(this).html("已复制");
                });
            } catch (e) {
                //TODO handle the exception
            }
        },
        updateInfo: (data) => {
            Swal.fire({
                title: "百度网盘秒传链接提取 v" + GM_info.script.version,
                showCloseButton: true,
                allowOutsideClick: false,
                confirmButtonText: "知道了",
                html: data,
            }).then(function (res) {
                GM_setValue("BAIDUWPUPDATEINFO", tool.timeStamp());
            });
        },
    };

    function main() {
        GM_addStyle(
            `#btn-resp button,#btn-create button{line-height: 1;white-space: nowrap;cursor: pointer;outline: 0; margin: 0; transition: 0.1s;color: #fff; background-color: #06a7ff;font-weight: 700; padding: 8px 16px;height: 32px;font-size: 14px; border-radius: 16px;margin-left: 8px;    border: none;} .createBox p{line-height: 35px;} .myDidplayBtn{text-align: center;font-size: .85em;color: #09aaff;border: 2px solid #c3eaff;border-radius: 4px;margin-left: 5px;padding: 10px;padding-top: 5px;padding-bottom: 5px;cursor: pointer;} .redLink{color:red}`
        );
        let baiduCla = tool.baiduClass();
        if (baiduCla == "main" || baiduCla == "home") {
            // 创建按钮 START
            let btnResp = document.createElement("a");
            btnResp.id = btnRespConf.id;
            btnResp.title = btnRespConf.text;
            btnResp.innerHTML = btnRespConf.html(baiduCla);
            btnResp.addEventListener("click", function (e) {
                tool.inputUserValue();
                e.preventDefault();
            });
            bdstoken = baiduCla == "home" ? locals.get("bdstoken") : unsafeWindow.locals.userInfo.bdstoken;
            let btnCreate = document.createElement("a");
            btnCreate.id = btnCreateConf.id;
            btnCreate.title = btnCreateConf.text;
            btnCreate.innerHTML = btnCreateConf.html(baiduCla);
            btnCreate.addEventListener("click", function (e) {
                checkFileList = tool.getCheckFile(baiduCla);
                if (checkFileList.length <= 0) {
                    Swal.fire({
                        title: "错误提醒",
                        html: "请勾选要生成秒传的文件/文件夹",
                        confirmButtonText: "确定",
                        showCloseButton: true,
                    });
                    return "";
                }
                for (let i = 0; i < checkFileList.length; i++) {
                    if (checkFileList[i].isdir) {
                        dirList.push(checkFileList[i].path);
                    } else {
                        fileList.push({
                            path: checkFileList[i].path,
                            size: checkFileList[i].size,
                            fs_id: checkFileList[i].fs_id,
                            md5: tool.encodeMd5(checkFileList[i].md5.toLowerCase()),
                        });
                    }
                }
                if (dirList.length > 0) {
                    Swal.fire({
                        icon: "info",
                        title: "包含文件夹, 是否递归生成?",
                        text: "若选是, 将同时生成各级子文件夹下的文件",
                        allowOutsideClick: false,
                        focusCancel: true,
                        showCancelButton: true,
                        reverseButtons: true,
                        showCloseButton: true,
                        confirmButtonText: "是",
                        cancelButtonText: "否",
                    }).then(function (res) {
                        if (!res.dismiss) {
                            tool.forEachListFile(0, 0);
                            tool.showSwalCreate();
                        }
                    });
                } else {
                    tool.showSwalCreate();
                    tool.signMd5(0, 0);
                }

                e.preventDefault();
            });

            if (baiduCla == "home") {
                tool.sleep(800).then(() => {
                    let parent = null;
                    let btnUpload = document.querySelector("[node-type=upload]"); // 管理页面：【上传】
                    btnUpload.style.maxWidth = "80px";
                    btnUpload.style.display = "inline-block";
                    parent = btnUpload.parentNode;
                    parent.insertBefore(btnResp, parent.childNodes[1]);
                    parent.insertBefore(btnCreate, parent.childNodes[1]);
                });
            } else {
                let btnUpload;
                btnUpload = document.querySelector(
                    "[class='nd-file-list-toolbar nd-file-list-toolbar__actions inline-block-v-middle']"
                );
                if (btnUpload) {
                    btnResp.style.cssText = "margin-right: 5px;";
                    btnCreate.style.cssText = "margin-right: 5px;";

                    btnUpload.insertBefore(btnResp, btnUpload.childNodes[0]);
                    btnUpload.insertBefore(btnCreate, btnUpload.childNodes[0]);
                } else {
                    btnUpload = document.querySelector(
                        "[class='wp-s-agile-tool-bar__header  is-default-skin is-header-tool']"
                    );
                    if (!btnUpload) {
                        btnUpload = document.querySelector("[class='wp-s-agile-tool-bar__header  is-header-tool']");
                    }
                    let parentDiv = document.createElement("div");
                    parentDiv.className = "wp-s-agile-tool-bar__h-action is-need-left-sep is-list";
                    parentDiv.style.cssText = "margin-right: 10px;";
                    parentDiv.insertBefore(btnResp, parentDiv.childNodes[0]);
                    parentDiv.insertBefore(btnCreate, parentDiv.childNodes[0]);
                    btnUpload.insertBefore(parentDiv, btnUpload.childNodes[0]);
                }
            }
        }
    }

    function savePathList(i, labFig) {
        if (i >= linkList.length) {
            let html = tool.createErrFileList(failed, false);
            Swal.fire({
                title: "".concat("文件转存").concat(linkList.length, "个,").concat(failed, "个失败!"),
                confirmButtonText: "确定",
                allowOutsideClick: false,
                showCloseButton: true,
                html: html,
            });
            failed = 0;
            linkList = [];
            tool.removeBtn();
            //添加事件
            tool.addEventBtn();
            return;
        }

        var f = linkList[i];
        Swal.getHtmlContainer().querySelector("index").textContent = i + 1 + "/" + linkList.length;
        if (f.md5s) {
            tool.post(
                `https://pan.baidu.com/api/rapidupload?bdstoken=${bdstoken}`,
                {
                    rtype: 0,
                    path: inputSavePath + "/" + f.path,
                    "content-md5": f.md5,
                    "slice-md5": f.md5s.toLowerCase(),
                    "content-length": f.size,
                },
                { "User-Agent": "netdisk;2.2.51.6;netdisk;10.0.63;PC;android-android;QTP/1.0.32.2" }
            )
                .then((res) => {
                    if (res.errno === -8 && labFig < 1) {
                        f.path = "copy_" + f.path;
                        savePathList(i, labFig + 1);
                    } else if (res.errno === 0) {
                        f.errno = res.errno;
                        savePathList(i + 1, 0);
                    } else {
                        failed++;
                        f.errno = res.errno;
                        savePathList(i + 1, 0);
                    }
                })
                .catch((err) => {
                    f.errno = err;
                    savePathList(i + 1, 0);
                });
        } else {
            $.ajax({
                url: `${reqstr}&bdstoken=${bdstoken}`,
                type: "POST",
                data: {
                    block_list: JSON.stringify([f.md5.toLowerCase()]),
                    path: inputSavePath + "/" + f.path,
                    size: f.size,
                    isdir: 0,
                    rtype: 0,
                    is_revision: 0,
                },
            })
                .success(function (r) {
                    f.errno = r.errno;
                })
                .fail(function (r) {
                    linkList[i].errno = 115;
                })
                .always(function () {
                    if (linkList[i].errno === -8 && labFig < 1) {
                        f.path = "copy_" + f.path;
                        savePathList(i, labFig + 1);
                        return;
                    } else if (linkList[i].errno) {
                        failed++;
                    }
                    savePathList(i + 1, 0);
                });
        }
    }

    obj.onclicks = function (link) {
        if (document.getElementById("redirect_form")) {
            var form = document.getElementById("redirect_form");
            form.action = hosturl + encodeURIComponent(link);
        } else {
            var form = document.createElement("form");
            form.action = hosturl + encodeURIComponent(link);
            form.target = "_blank";

            form.method = "POST";
            form.setAttribute("id", "redirect_form");
            document.body.appendChild(form);
        }
        form.submit();
        form.action = "";
        form.parentNode.removeChild(form);
    };
    obj.GetQueryString = function (name) {
        var reg = eval("/" + name + "/g");
        var r = window.location.search.substr(1);
        var flag = reg.test(r);
        if (flag) {
            return true;
        } else {
            return false;
        }
    };
    obj.getUrlParam = function (name) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == name) {
                return pair[1];
            }
        }
        return false;
    };

    function trim(str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    }

    function removeEvent(that, href) {
        that.find("a").attr("target", "");
        that.find("a").unbind("click");
        that.find("a").bind("click", function (e) {
            e.preventDefault();
            if (href != undefined) {
                obj.onclicks(href);
            } else {
                obj.onclicks($(this).attr("href"));
            }
        });
    }
    obj.initStyle = function () {
        var styles = document.createElement("style");
        styles.type = "text/css";
        styles.innerHTML = style;
        document.getElementsByTagName("head").item(0).appendChild(styles);
    };

    main();

    /******/

    // ==================== CODE APPEND ====================

    /**
     * 追加部分代码说明:
     * 1. 依赖于上方代码中的 bdstoken 变量
     * 2. 依赖于 TemperMonkey 内置的 GM_xmlhttpRequest 函数，用于修改 User-Agent 请求头
     */

    function checkErrno(errno) {
        switch (errno) {
            case -7:
                return "保存路径存在非法字符";
            case -8:
                return "路径下存在同名文件";
            case 400:
                return "请求错误(请尝试使用最新版Chrome浏览器)";
            case 403:
                return "文件获取失败(生成过于频繁导致接口被限,请稍后再试)";
            case 404:
                return "文件不存在(秒传无效)";
            case 2:
                return "转存失败(尝试重新登录网盘账号)";
            // 3939: 文件大于20G时访问秒传接口实际会返回#2
            case 3939:
                return "\u79D2\u4F20\u4E0D\u652F\u6301\u5927\u4E8E20G\u7684\u6587\u4EF6,\u6587\u4EF6\u5927\u5C0F:";
            // 2333: 文件路径错误时接口实际也是返回#2
            case 2333:
                return '链接内的文件路径错误(不能含有以下字符"\\:*?<>|)';
            case -10:
                return "网盘容量已满";
            case 114:
                return "接口调用失败(请重试)";
            case 514:
                return '接口调用失败(请重试/弹出跨域访问窗口时,请选择"总是允许"或"总是允许全部域名")';
            case 1919:
                return "文件已被和谐";
            case 810:
                return "文件列表获取失败(请重试)";
            case 996:
                return "md5获取失败(请参考分享教程)";
            case 888:
                return "该文件不支持修复";
            case 999:
                return "uploadid获取失败";
            default:
                return "未知错误";
        }
    }

    /**
     * @description: md5随机大小写
     * @param {string} string
     * @return {string}
     */
    function randomStringTransform(string) {
        var tempString = [];
        for (var _i = 0, string_1 = string; _i < string_1.length; _i++) {
            var i = string_1[_i];
            if (!Math.round(Math.random())) {
                tempString.push(i.toLowerCase());
            } else {
                tempString.push(i.toUpperCase());
            }
        }
        return tempString.join("");
    }

    const SUCCESS_ERRNO = 0;

    // 初始化变量
    const host = location.host,
        create_url = "https://" + host + "/api/create",
        unsafe_pat = /[\\":*?<>|]/g;

    class MultiQuickLinks {
        constructor() {
            this.md5_funcs = this.__init_md5_funcs();
            this.data = [];
            this.cursor = -1;
            //
            this.version = 4;
            this.max_retry = 5;
            this.retry_count_dict = {};
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

        __convert_data(data) {
            let query = "";
            for (const key in data) {
                query += "&" + key + "=" + encodeURIComponent(data[key]);
            }
            return query;
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

        _upload_v1(file_info) {
            const file = file_info["file"],
                that = this;
            let code = 0;
            $.ajax({
                url: "/api/rapidupload",
                type: "POST",
                data: {
                    path: file_info["dir_path"] + file.path,
                    "content-md5": file.md5,
                    "slice-md5": file.md5s.toLowerCase(),
                    "content-length": file.size,
                },
            })
                .success(function (r) {
                    if (file.path.match(/["\\\:*?<>|]/)) {
                        code = 2333;
                    } else {
                        code = r.errno;
                    }
                })
                .fail(function (r) {
                    code = 114;
                })
                .always(function () {
                    // file-info
                    file_info["errno"] = code;
                    file_info["message"] = code === SUCCESS_ERRNO ? "成功" : checkErrno(code);
                    ++file_info["try_count"];
                    // 重试|next
                    if (file_info.errno === 404 && file_info["try_count"] < that.md5_funcs.length) {
                        that._upload_v1(file_info);
                    } else {
                        that._trigger_next();
                    }
                });
        }

        _upload_v2(file_info, upper_md5 = false) {
            const that = this;
            // RapiduploadTask.prototype.saveFileV2
            const file = file_info.file,
                file_md5 = upper_md5 ? file.md5.toUpperCase() : file.md5;
            let err_code = 0;
            // createFileV2
            $.ajax({
                url: create_url,
                method: "POST",
                responseType: "json",
                data: that.__convert_data({
                    block_list: JSON.stringify([file_md5]),
                    path: file_info["dir_path"] + file.path.replace(unsafe_pat, "_"),
                    size: file.size,
                    isdir: 0,
                    // rtype=0: 返回报错, 不覆盖文件
                    // rtype=1: 默认，自动重命名
                    // rtype=3: 覆盖文件
                    rtype: 3,
                }),
            })
                .fail(function (data) {
                    console.log("transfer-fail, response=", data);
                    err_code = data.errno;
                })
                .success(function (data) {
                    // 处理返回结果
                    err_code = data.errno;
                    if (31039 === data.errno) {
                        err_code = 31039;
                    } else if (2 === data.errno) {
                        err_code = 114;
                    }
                })
                .always(function () {
                    file_info.errno = err_code;
                    file_info["message"] = err_code === SUCCESS_ERRNO ? "成功" : checkErrno(err_code);
                    // next
                    that._trigger_next();
                });
        }

        _upload_v3(file_info, upper_md5 = false) {
            const that = this,
                file = file_info.file,
                file_md5 = upper_md5 ? file.md5.toUpperCase() : file.md5;
            // 必须要使用 md5s
            const _always_func = function (err_code) {
                file_info.errno = err_code;
                file_info["message"] = err_code === SUCCESS_ERRNO ? "成功" : checkErrno(err_code);
                // next
                that._trigger_next();
            };
            //
            GM_xmlhttpRequest({
                url: `https://pan.baidu.com/api/rapidupload?bdstoken=${bdstoken}`,
                method: "POST",
                responseType: "json",
                data: that.__convert_data({
                    // rtype=0: 返回报错, 不覆盖文件
                    // rtype=1: 默认，自动重命名
                    // rtype=3: 覆盖文件
                    rtype: 3,
                    //
                    path: file_info["dir_path"] + file.path.replace(unsafe_pat, "_"),
                    "content-md5": file_md5,
                    "slice-md5": file.md5s.toLowerCase(),
                    "content-length": file.size,
                }),
                headers: { "User-Agent": "netdisk;2.2.51.6;netdisk;10.0.63;PC;android-android;QTP/1.0.32.2" },
                onload: function (res) {
                    // 处理返回结果
                    _always_func(res.response.errno);
                },
                onerror: function (data) {
                    console.log("transfer-fail, response=", data);
                    _always_func(data.errno);
                },
            });
        }

        _upload_v4(file_info, upper_md5 = false) {
            const that = this,
                create_url = "https://" + location.host + "/rest/2.0/xpan/file?method=create",
                UA = "netdisk;",
                accessToken = localStorage.getItem("accessToken");
            // tryRapidUploadCreateFile
            const file = file_info.file,
                file_md5 = upper_md5 ? file.md5.toUpperCase() : file.md5,
                _always_func = function (err_code) {
                    file_info.errno = err_code;
                    file_info["message"] = err_code === SUCCESS_ERRNO ? "成功" : checkErrno(err_code);
                    // next
                    that._trigger_next();
                };
            GM_xmlhttpRequest({
                url: create_url + "&access_token=" + encodeURIComponent(accessToken),
                method: "POST",
                responseType: "json",
                data: that.__convert_data({
                    block_list: JSON.stringify([file_md5]),
                    path: file_info["dir_path"] + file.path.replace(unsafe_pat, "_"),
                    size: file.size,
                    isdir: 0,
                    // rtype=0: 返回报错, 不覆盖文件
                    // rtype=1: 默认，自动重命名
                    // rtype=3: 覆盖文件
                    rtype: 3,
                }),
                headers: {
                    "User-Agent": UA,
                    cookie: "",
                },
                anonymous: true,
                onerror: function (data) {
                    console.log("transfer-fail, response=", data);
                    _always_func(data.errno);
                },
                onload: function (data) {
                    // 处理返回结果
                    let err_code = data.response.errno;
                    if (31039 === data.errno) {
                        err_code = 31039;
                    } else if (2 === data.errno) {
                        err_code = 114;
                    }
                    _always_func(err_code);
                },
            });
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
            if (this.cursor < 0) {
                ++this.cursor;
            } else {
                this.retry_count_dict[this.cursor] = (this.retry_count_dict[this.cursor] || 0) + 1;
                if (
                    this.data[this.cursor].errno === SUCCESS_ERRNO ||
                    this.retry_count_dict[this.cursor] > this.max_retry
                ) {
                    this.__console_line(
                        `完成单个，cursor=${this.cursor}/${this.data.length}, errno=${this.data[this.cursor].errno}`
                    );
                    ++this.cursor;
                }
            }
            if (this.version === 1) {
                this._upload_v1(this.data[this.cursor]);
            } else if (this.version === 2) {
                this._upload_v2(this.data[this.cursor]);
            } else if (this.version === 3) {
                this._upload_v3(this.data[this.cursor]);
            } else if (this.version === 4) {
                this._upload_v4(this.data[this.cursor]);
            }
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

        run(data) {
            if (data) {
                this.append_multi(data);
            }
            this._trigger_next();
        }

        export_failed() {
            const result = {};
            this.data.forEach((row) => {
                if (row.errno === SUCCESS_ERRNO) {
                    return null;
                }
                result[row.q_link] = row.dir_path;
            });
            return result;
        }
    }

    document.addEventListener("readystatechange", () => {
        const $ = unsafeWindow.$;
        $.MultiQuickLinks = MultiQuickLinks;
        $.reload_m = () => {
            $.M = new MultiQuickLinks();
            console.log(`
                API 绑定在 $.M 对象上，重新加载方法: $.reolad_m();
                $.M.append(q_link, dir_path);
                $.M.append_multi(data);
                $.M.run(data=null);
            `);
        };
        $.reload_m();
    });
})();
