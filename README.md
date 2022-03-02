<!--
 * @Author: qwelz
 * @Date: 2022-03-02 11:06:51
 * @LastEditors: qwelz
 * @LastEditTime: 2022-03-02 11:34:01
-->

# Baidu 网盘批量转存相关的油猴脚本

# 一、概述

1. 本仓库包含三个脚本

    | 脚本名称                    | 用途描述                                             | 原作者                                                                          |
    | --------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------- |
    | `baidupan-rapid-links.js`   | 在原脚本基础上，添加功能：批量转存秒传链接到不同路径 | [mengzonefire](https://github.com/mengzonefire/dupan-rapid-extract)             |
    | `baidupan-share-page.js`    | 自动转存分享链接内容到指定路径                       | [qwelz](https://github.com/qwelzqwelz/auto-baidupan-share-tansfer-tampermonkey) |
    | `baidupan-share-secrets.js` | 自动输入提取码                                       | [qwelz](https://github.com/qwelzqwelz/auto-baidupan-share-tansfer-tampermonkey) |

2. 现在的百度网盘链接分享，可以加上 `pwd` 请求参数，跳过输入提取码的步骤，如 `https://pan.baidu.com/s/1xcWtarHD369eXcMGw14rdA?pwd=w22q`。所以脚本 `baidupan-share-secrets.js` 已失去作用。

3. 本项目仍在开发中，没有 UI，但可以浏览器控制台输入数据/调用 🤡。

# 二、`baidupan-rapid-links.js`

1. 仅支持在旧版 baidu 网盘 web 端使用。

2. 使用方法：

    ```javascript
    const data = {
        // rapid_link => dir_path
        "9068EDF1A4D77A2D04BF5E42EEDC5C44#4F02679C9F502020631F97D7D631408E#11494755#test.zip": "/测试/test-folder",
        // ...
    };
    $.M.run(data);
    ```

# 三、`baidupan-share-secrets.js`

使用方法：

1. 在脚本中输入数据

    ```javascript
    append({
        BdaYkCUebRRvWp5D6MLkMw: "/测试",
    });
    ```

2. 用 `components/baidupan-func-example.js` 中的 `open_links` 函数批量打开链接即可

    ```javascript
    open_links(
        [
            // links
        ],
        20
    );
    ```
