// ==UserScript==
// @name         BaiduPan 分享页面-密码校验页
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://pan.baidu.com/share/init?surl=*
// @icon         https://pan.baidu.com/m-static/base/static/images/favicon.ico
// @grant        none
// ==/UserScript==

(function () {
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
        BW1zInlvBD9Onfy982soMw: "k7du",
        "yHKu87iqJ2NOR2QxPv-X3w": "3ti3",
        BoOJZoDRc8xWydDWHGmH7g: "hbpk",
        Ksk06Rgx10QJERJScgIvIw: "khst",
        skHMiTonX3X4M1Oo0cTU_A: "r5fx",
        jvYXKGe52OlzkZH4EkhA9A: "g3mu",
        tf4L5202J1geI7leEBRqxQ: "m3kv",
        T_hlHh38250GdMjP3t0fQg: "67wf",
        "8a5jy_dcIb8NnT1taGMolA": "acyg",
        lFbuJZHC1xK4MUwG8DBz8Q: "bp21",
        dcCXDaQI2mPdTnO8UZHVPg: "o318",
        Xha1PlIw_fRVWCEO5BzUmw: "z9m6",
        "PbK-R-6XA0dOujkiTdq38w": "dcxe",
        q1kqvpj5zqqFp5XhGR7i9A: "8lv1",
        joxeoIrFsVdvly_VYvYVFA: "5i41",
        "2qhEAoCq9YGki1NsfJsgCw": "l4rj",
        VpXOwMtTLr1TICPoi339zA: "u1of",
        qUyH2fEUgPeZXpGlurc49A: "wzoo",
        B0VNcxHemWMwH0GNT_QVhw: "80cs",
        "divVG6zWk-kvaz9FyM0tZg%C2%A0": "4c32",
        "n2nb9IJHyYJt8Csi-NhX2g%C2%A0": "1684",
        O1Gb8qAXTL88A1RolLFObQ: "t2q9",
        "Sk4WXts8dnNA-uKPl0GYjA%C2%A0": "78e8",
        "bceHPSAotBr1bsnDoVF4_Q%C2%A0": "ixti",
        "3f7m37yYA_E6o5_9bMnOug%C2%A0": "796d",
        "LD8dCsBjiJdzfyLwYmcQEQ%C2%A0": "23m6",
        "TXNwtCIdCau_MRymct-vzg%C2%A0": "u6i6",
        "GOw8YctYNb_VHoZjNFtwUg%C2%A0": "534u",
        "7CkGvMprH9brj5zLu9M3Bg": "p0i1",
        "D0GFQsUIEJlbxiT56Vir2Q%C2%A0": "2u9u",
        "wVCdLakghBUZ619lCANewg%C2%A0": "njq3",
        "-L2FrcKKfiFAqom-_D1rjg": "7z24",
        mhIRSoT_GoNYx8kZUGrzlg: "27q9",
        Ai1_xcR3qqThIY4uS4NPrg: "26p7",
        "wtsYGySsJ0Y1EeK8ZifS7w%C2%A0": "0v9p",
        SBpNE9BKKNOQIFFuFkCxnw: "udbc",
        "4Z_92z9SdGMp-sJ8PhKZdQ": "j7e0",
        "z-_Chc_2zaZD1loDOHifiw": "4dng",
        D_5FzdiJFQMHulBt1QC8Tw: "3p0v",
        "POr5N7Y3pa-ul7SrdWOTWg": "0ukd",
        Sd7fdPWo638_VkSXkEydJg: "khs6",
        fKi7dBbA3lcrBMTsU11DpQ: "y9eb",
        "P3uf-vQ4lhnBkKv531QLHA": "1skj",
        "6-DtXf-1p1WsBM586SyDUA": "qve6",
        "fUWpQ7wt4x-EGpd5D6yeyQ": "10m8",
        AG6ioFDAx3Rt4ImMvy7Wrw: "bccy",
        vKcB8LYeT4dMQ7dNGYdv7w: "bccy",
        PpKkYpnzCwqI09mfYQYLTw: "bccy",
        v3zA7Hbu47KnDOe0O2uw1w: "bccy",
        "wKIqDB3luU_RPVm-ktNh6A": "deob",
        B3KdMqhXmP46k_L6If2bCg: "ur5v",
        ZKbogQIoscW8BuRjHkvE0A: "8ga5",
        "0Am6zgIhPE4gyJUzZukdEA": "inh7",
        _wwo0NRhYA3_HzjDkhCjvA: "4ju3",
        suD8S_STMyUqNTKhCA8PSQ: "6rmr",
        o4AXFD8UEbPdo_HjUwjnEg: "sp1i",
        "LuMBGEECZoIA3dW-GqL8mw": "pn8f",
        WuNVRpH1RRulQIlZvuIlow: "32jv",
        "pyzjw8jJTIv_TxYs8Dbk-Q ": "v843",
        "wzcYy8dzrJeyz-trCeq3Aw": "3u18",
        JDk5T4IaT3ubvMiqscjycA: "9093",
        gs9_5duKJQBvRoH884zOTA: "6yyk",
        KeJMsbJ9HlSoGrCuK1Vgug: "j7ho",
        wOgfWdhjA5BBApJMi1oRZA: "345v",
        "JSEqURXGOXtKNk2CV1-aZQ": "qjdq",
        oXwivDKq9sQXNCdlXvdP0w: "59ho",
        xFznuM2mdKPulLVUAzdu4g: "1pjx",
        qCyQdlgVZ6Re7bWkcEwAvg: "yyds",
        "6gyK19gNLvRq8w4yzr4cMQ": "hmoe",
        xazs8Ar4WqMa6GVtG8aGmQ: "hmoe",
        DROq5akQ4p0qyXLt9tGyow: "c38b",
        JkckxSoMTJvVzlcwLC2beg: "ad8n",
        EuNUMUC5PkESMNn8zlXB6g: "qjdb",
        OLXTGnGwsXME3YmVQ2SN_w: "tzjp",
        "UnkEkY2avVT-47YDYghcFQ": "saua",
        "Flv-w3Y2OCOuKlbvAA_NZQ": "siyn",
        "71dNPNeBF5g_82GBC4kRmQ": "8wly",
        TKd4zRcqwB9YTNdjzKYDlA: "c6nw",
        "20l1f7ALsvCzaA6ZON_ONw": "t5l5",
        ExzxQKFcjyXZ3h2Rn2gDJA: "pvew",
        WSItNyHgOhucaHT3QUTvYg: "ughq",
        _LCHjqopWhQLUBXpHkam4g: "rfjt",
        ZOCYss9Vy2vndr_HkPD0yg: "rv3n",
        TTk1bArnly1lzBZ0ynK9IA: "s52s",
        zBKeDlhlIyZxdC4WXvBHBA: "eupk",
        JWiNqGn_m_Mcj7wZhzYPcQ: "b27y",
        Qts_W9c0nwfiLa2SuV5bjA: "gtp0",
        NUtz7m3AVefu2EvamqtVJg: "890t",
        "58Bk-Q4QFMKbpG6vBey9bA": "15xp",
        "Y-jwG7e6VpuH3SED47cAAg": "trum",
        MzGeeYsoubuXzDe6dT5X6g: "ayvl",
        MH_KHacyTRd_34LGsfmxaQ: "1tpw",
        jEFuIz0VsYwb3NW8N0fMYA: "pli4",
        xKtpX4o7Xd4gpi79CZ8mKA: "69c3",
        Ngs8AWl1c4x8E5WltAVYXA: "ho4u",
        cTx2zdXZNimFHQBcD2BhZg: "v3wt",
        Ue29ULrAnJ5GGbKUhkCUQQ: "o5al",
    });
})();
