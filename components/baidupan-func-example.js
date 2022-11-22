/*
 * @Author: qwelz
 * @Date: 2022-01-16 00:32:56
 * @LastEditors: qwelz
 * @LastEditTime: 2022-11-20 23:42:44
 */

function open_links(links, interval_s = 13, group_size = 1) {
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
        if (index >= links.length) {
            iid !== undefined ? clearInterval(iid) : null;
        }
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
