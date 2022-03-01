/*
 * @Author: qwelz
 * @Date: 2022-01-16 00:32:56
 * @LastEditors: qwelz
 * @LastEditTime: 2022-01-16 22:55:04
 */

function open_links(links, interval_s) {
    interval_s = interval_s === undefined ? 13 : interval_s;
    links = "string" === typeof links ? links.split("\n") : links;
    let index = 0;
    const open_func = () => {
        const link = links[index];
        console.log(`[iterate] index=${index}, link=${link}`);
        if (!link) {
            iid !== undefined ? clearInterval(iid) : null;
            return null;
        }
        window.open(link);
        index += 1;
    };
    open_func();
    const iid = setInterval(open_func, 1000 * interval_s);
}

function touch_share_link(share_code, share_pwd) {
    // share_code = "Aox1mpAm8fo0fny8EV6LoQ";
    // share_pwd = "1234";
    jQuery.post(
        "/share/verify" + "?surl=" + share_code + "&t=" + new Date().getTime(),
        {
            pwd: share_pwd,
            vcode: null,
            vcode_str: window.locals.get("vcodeStr") || "",
        },
        function (data) {
            console.log(data);
        },
        "json"
    );
}
