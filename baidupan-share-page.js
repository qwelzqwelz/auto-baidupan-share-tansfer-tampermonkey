// ==UserScript==
// @name         BaiduPan 分享页面-文件页
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://pan.baidu.com/s/*
// @icon         https://pan.baidu.com/m-static/base/static/images/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    "use strict";

    const CHECKBOX_CLASS = "fydGNC",
        MAX_DIALOG_WAIT_TIMES = 4,
        MAX_SUCCESS_VERIFY_TIMES = 3,
        NAME_DICT = {};

    function append(data) {
        Object.keys(data).forEach((key) => {
            NAME_DICT[decodeURIComponent(key).trim()] = data[key];
        });
    }

    class AutoTransfer {
        constructor() {
            this.uuid = this.__get_uuid();
            this.wait_dialog_times = 0;
        }

        __get_uuid() {
            let result = /\/s\/1([\w%\-]+)/.exec(window.location.pathname)[1];
            result = decodeURIComponent(result).trim();
            console.log(`============= uuid: ${result} =============`);
            return result;
        }

        _open_dialog() {
            let found = false;
            // check
            document.querySelectorAll(`[node-type='${CHECKBOX_CLASS}']`).forEach((checkbox) => {
                if (found || checkbox.textContent !== "全选") {
                    return null;
                }
                found = true;
                checkbox.click();
            });
            // click
            document.querySelector(".g-button.tools-share-save-hb").click();
        }

        _choose_save_path() {
            const expect_name = NAME_DICT[this.uuid];
            console.log(`============= expect_name: ${expect_name} =============`);
            // 无分享信息则跳过
            if (!expect_name || this.wait_dialog_times > MAX_DIALOG_WAIT_TIMES) {
                return null;
            }
            const dialog = document.getElementById("fileTreeDialog"),
                that = this;
            // 等待对话窗口
            if (dialog === null) {
                ++this.wait_dialog_times;
                setTimeout(() => {
                    that._choose_save_path();
                }, 1000);
                return null;
            }
            console.log(`============= [dialog-opened] =============`);
            const target = dialog.querySelector("div.save-path-item"),
                recent_name = target.getAttribute("title").split("/").slice(-1)[0];
            console.log(`============= recent_name: ${recent_name} =============`);
            // 转存
            if (!target.classList.contains("check") && expect_name == recent_name) {
                target.click();
            }
            if (expect_name == recent_name) {
                dialog.querySelector("[node-type='confirm']").click();
            }
        }

        _verify_success() {
            let count = 0;
            const iid = setInterval(() => {
                ++count;
                const info_title = document.querySelector(".info-section-title");
                if (info_title && info_title.textContent === "保存成功") {
                    window.close();
                }
                if (count >= MAX_SUCCESS_VERIFY_TIMES) {
                    clearInterval(iid);
                }
            }, 10 * 1000);
        }

        run() {
            this._open_dialog();
            this._choose_save_path();
            this._verify_success();
        }
    }

    document.addEventListener("readystatechange", () => {
        new AutoTransfer().run();
    });

    // ============================== CODE END ==============================

    append({
        "8a5jy_dcIb8NnT1taGMolA": "ACGzhai1996",
        lFbuJZHC1xK4MUwG8DBz8Q: "ACGzhai1996",
        dcCXDaQI2mPdTnO8UZHVPg: "ACGzhai1996",
        Xha1PlIw_fRVWCEO5BzUmw: "ACGzhai1996",
        "PbK-R-6XA0dOujkiTdq38w": "ACGzhai1996",
        q1kqvpj5zqqFp5XhGR7i9A: "ACGzhai1996",
        joxeoIrFsVdvly_VYvYVFA: "ACGzhai1996",
        "2qhEAoCq9YGki1NsfJsgCw": "ACGzhai1996",
        VpXOwMtTLr1TICPoi339zA: "ACGzhai1997",
        qUyH2fEUgPeZXpGlurc49A: "ACGzhai1997",
        B0VNcxHemWMwH0GNT_QVhw: "ACGzhai996",
        "divVG6zWk-kvaz9FyM0tZg%C2%A0": "adjmr",
        "n2nb9IJHyYJt8Csi-NhX2g%C2%A0": "adjmr",
        O1Gb8qAXTL88A1RolLFObQ: "adjmr",
        "Sk4WXts8dnNA-uKPl0GYjA%C2%A0": "adjmr",
        "bceHPSAotBr1bsnDoVF4_Q%C2%A0": "adjmr",
        "3f7m37yYA_E6o5_9bMnOug%C2%A0": "adjmr",
        "LD8dCsBjiJdzfyLwYmcQEQ%C2%A0": "adjmr",
        "TXNwtCIdCau_MRymct-vzg%C2%A0": "adjmr",
        "GOw8YctYNb_VHoZjNFtwUg%C2%A0": "adjmr",
        "7CkGvMprH9brj5zLu9M3Bg": "adjmr",
        "D0GFQsUIEJlbxiT56Vir2Q%C2%A0": "adjmr",
        "wVCdLakghBUZ619lCANewg%C2%A0": "adjmr",
        "-L2FrcKKfiFAqom-_D1rjg": "adjmr",
        mhIRSoT_GoNYx8kZUGrzlg: "adjmr",
        Ai1_xcR3qqThIY4uS4NPrg: "adjmr",
        "wtsYGySsJ0Y1EeK8ZifS7w%C2%A0": "adjmr",
        SBpNE9BKKNOQIFFuFkCxnw: "adjmr",
        "4Z_92z9SdGMp-sJ8PhKZdQ": "adjmr",
        "z-_Chc_2zaZD1loDOHifiw": "adjmr",
        D_5FzdiJFQMHulBt1QC8Tw: "adjmr",
        "POr5N7Y3pa-ul7SrdWOTWg": "adjmr",
        Sd7fdPWo638_VkSXkEydJg: "adjmr",
        fKi7dBbA3lcrBMTsU11DpQ: "adjmr",
        "P3uf-vQ4lhnBkKv531QLHA": "adjmr",
        "6-DtXf-1p1WsBM586SyDUA": "adjmr",
        "fUWpQ7wt4x-EGpd5D6yeyQ": "aoguojinnian",
        JkckxSoMTJvVzlcwLC2beg: "baiye",
        AG6ioFDAx3Rt4ImMvy7Wrw: "bccy",
        vKcB8LYeT4dMQ7dNGYdv7w: "bccy",
        PpKkYpnzCwqI09mfYQYLTw: "bccy",
        v3zA7Hbu47KnDOe0O2uw1w: "bccy",
        "wKIqDB3luU_RPVm-ktNh6A": "Berserker",
        B3KdMqhXmP46k_L6If2bCg: "Berserker",
        ZKbogQIoscW8BuRjHkvE0A: "Berserker",
        "0Am6zgIhPE4gyJUzZukdEA": "Berserker",
        _wwo0NRhYA3_HzjDkhCjvA: "Berserker",
        suD8S_STMyUqNTKhCA8PSQ: "Berserker",
        o4AXFD8UEbPdo_HjUwjnEg: "Berserker",
        "LuMBGEECZoIA3dW-GqL8mw": "Berserker",
        WuNVRpH1RRulQIlZvuIlow: "chong",
        "pyzjw8jJTIv_TxYs8Dbk-Q ": "chong",
        "wzcYy8dzrJeyz-trCeq3Aw": "FPS007",
        JDk5T4IaT3ubvMiqscjycA: "haoxue",
        gs9_5duKJQBvRoH884zOTA: "haoxue",
        KeJMsbJ9HlSoGrCuK1Vgug: "haoxue",
        wOgfWdhjA5BBApJMi1oRZA: "haoxue",
        "JSEqURXGOXtKNk2CV1-aZQ": "haoxue",
        oXwivDKq9sQXNCdlXvdP0w: "haoxue",
        "5qQP9bXnAS2oHrpVZ8fqsg": "heart",
        xFznuM2mdKPulLVUAzdu4g: "hexero",
        qCyQdlgVZ6Re7bWkcEwAvg: "HGD100ZSF",
        "6gyK19gNLvRq8w4yzr4cMQ": "hmoehmoe",
        xazs8Ar4WqMa6GVtG8aGmQ: "hmoehmoe",
        DROq5akQ4p0qyXLt9tGyow: "ID",
        JkckxSoMTJvVzlcwLC2beg: "ID",
        EuNUMUC5PkESMNn8zlXB6g: "ID",
        OLXTGnGwsXME3YmVQ2SN_w: "izaya",
        "UnkEkY2avVT-47YDYghcFQ": "izaya",
        "Flv-w3Y2OCOuKlbvAA_NZQ": "izaya",
        "71dNPNeBF5g_82GBC4kRmQ": "izaya",
        TKd4zRcqwB9YTNdjzKYDlA: "izaya",
        "20l1f7ALsvCzaA6ZON_ONw": "izaya",
        ExzxQKFcjyXZ3h2Rn2gDJA: "izaya",
        WSItNyHgOhucaHT3QUTvYg: "izaya",
        _LCHjqopWhQLUBXpHkam4g: "izaya",
        ZOCYss9Vy2vndr_HkPD0yg: "izaya",
        TTk1bArnly1lzBZ0ynK9IA: "izaya",
        zBKeDlhlIyZxdC4WXvBHBA: "izaya",
        JWiNqGn_m_Mcj7wZhzYPcQ: "izaya",
        Qts_W9c0nwfiLa2SuV5bjA: "izaya",
        NUtz7m3AVefu2EvamqtVJg: "izaya",
        "58Bk-Q4QFMKbpG6vBey9bA": "izaya",
        "Y-jwG7e6VpuH3SED47cAAg": "izaya",
        MzGeeYsoubuXzDe6dT5X6g: "izaya",
        MH_KHacyTRd_34LGsfmxaQ: "izaya",
        jEFuIz0VsYwb3NW8N0fMYA: "izaya",
        xKtpX4o7Xd4gpi79CZ8mKA: "izaya",
        Ngs8AWl1c4x8E5WltAVYXA: "izaya",
        cTx2zdXZNimFHQBcD2BhZg: "izaya",
        Ue29ULrAnJ5GGbKUhkCUQQ: "izaya",
    });
})();