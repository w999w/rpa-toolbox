# RPA 工具箱

## 介绍

按 RPA 平台整理的轻量工具箱，首期支持金智维 SQL 语句转换：中文脚本、向导脚本、英文单引号处理与 `#变量#` 拼接。纯前端运行，支持自行部署。

[在线使用](https://rpa.q88p.cc/) · [项目仓库](https://github.com/w999w/rpa-toolbox) · [MIT 许可证](LICENSE)

在线站点现已向所有人开放，无需站点所有者权限。也可以下载源码，自行部署。

## 截图

首页与平台入口：

![RPA 工具箱首页](https://raw.githubusercontent.com/w999w/rpa-toolbox/main/docs/media/home.jpg?v=20260908)

金智维 SQL 转换（中文脚本）：

![SQL 中文脚本转换](https://raw.githubusercontent.com/w999w/rpa-toolbox/main/docs/media/chinese.jpg?v=20260908)

## 视频

[![点击播放 30 秒操作演示](https://img.youtube.com/vi/XGbuz0kYXFA/hqdefault.jpg)](https://youtu.be/XGbuz0kYXFA?feature=shared)

点击上方视频封面即可在 YouTube 在线观看。GitHub README 不支持直接嵌入 YouTube 播放器，因此会跳转到 YouTube 播放。

演示通过自动化操作真实页面、采集关键步骤画面后合成，依次展示平台选择、中文脚本、向导脚本和变量拼接，无配音。

## 项目介绍

### 功能

- 首页介绍项目，并提供 RPA 平台入口；首期支持金智维，后续可增加其他平台与工具。
- SQL 实时转换，支持中文脚本、向导脚本、英文单引号处理、`#变量#` 拼接、复制结果和错误提示。
- 浅色玻璃材质界面，适配桌面与手机，支持键盘操作和减少动画偏好。
- SQL 仅在浏览器内处理，不执行、不上传、不持久化输入。

### 转换规则


输入：

```sql
SELECT *
FROM Database
WHERE name = 'cat';
```

中文脚本：

```text
SQL语句 = 'SELECT *' + 换行符()
SQL语句 = SQL语句 + 'FROM Database' + 换行符()
SQL语句 = SQL语句 + 'WHERE name = ''' + 'cat' + ''';'
```

向导脚本：

```text
'SELECT *' + 换行符() + 'FROM Database' + 换行符() + 'WHERE name = ''' + 'cat' + ''';'
```

变量以英文 `#` 开头、以英文 `#` 结尾；标记本身会保留在结果中：

```text
输入：select name #变量# From table
输出：'select name ' + #变量# + ' From table'

输入：name = '#姓名#'
输出：'name = ''' + #姓名# + ''''
```

`'cat'` 是固定文本，`#cat#` 是变量。保留原文的大小写、表名、缩进、制表符及必要空格；不自动纠正 SQL。

两种模式都将原 SQL 的每个换行转换为 ` + 换行符()` 拼接，函数调用使用英文半角括号，且不放在字符串引号内。CRLF、CR、LF 均视为一个换行。

中文脚本使用固定的结果变量 `SQL语句`，逐行生成赋值语句，在有后续原始行时追加 ` + 换行符()`。向导脚本的完整表达式始终只有一行，在金智维 RPA 中拼接运行后才产生换行。保留原有空格和缩进，不额外插入连接空格；连续空行和末尾换行也按原位置生成函数调用。

支持普通 SQL 单引号字符串（包括 `''` 转义）、双引号/反引号/方括号标识符、`--` 与 `/* ... */` 注释。不对 SQL 语法和特殊数据库方言作完整验证；注释中的变量标记保持为注释文本。

工具按照约定生成表达式，不在金智维客户端内运行脚本，也不对变量运行时的值进行 SQL 转义。应在实际金智维环境中确认脚本兼容性与变量值处理。

### 文件结构


```text
dist/index.html                      首页
dist/tools/jinzhiwei/index.html       金智维平台页
dist/tools/jinzhiwei/sql/index.html   SQL 转换页
dist/assets/site.mjs                  页面与交互
dist/assets/converter.mjs             独立转换逻辑
dist/assets/config.mjs                GitHub 链接配置
dist/assets/styles.css                公共样式
tests/converter.test.mjs              转换规则与文本还原测试
LICENSE                              MIT 开源许可证
```

后续平台与工具可以沿用独立目录和页面入口。平台资料集中于 `site.mjs` 的 `PLATFORMS`，转换函数独立于界面。

### 扩展与贡献


欢迎通过 Issue 提交问题或新工具需求，也欢迎提交 Pull Request。报告 SQL 转换问题时，请提供去除敏感信息后的原始 SQL、所选脚本类型和期望结果。

新增平台或工具时，可参考现有页面入口，并同步更新 `dist/assets/site.mjs` 的平台资料、页面渲染与路由入口；转换逻辑可像 `converter.mjs` 一样独立实现。涉及 SQL 转换的修改，请运行上述测试。

### 开源许可


本项目采用 [MIT License](LICENSE)，版权归 w999w 所有。

任何人均可免费使用、复制、修改、分发本项目，允许商业使用、再许可和销售副本，也可以用于闭源项目。分发软件或其重要部分时，需要保留版权声明及许可声明。软件按原样提供，不作担保。完整条款以 `LICENSE` 为准。

## 布置教程

### 在线使用

打开 [RPA 工具箱](https://rpa.q88p.cc/)，选择「金智维 RPA」→「SQL 语句转换」，粘贴 SQL 并选择脚本类型。

### 获取源码与本地运行

安装 Git 和 Python 3 后执行：

```bash
git clone https://github.com/w999w/rpa-toolbox.git
cd rpa-toolbox
python -m http.server 8000 --directory dist
```

打开 `http://localhost:8000`。`dist` 就是完整可运行的静态网站源码，无需安装前端依赖或编译。ES Modules 需要通过 HTTP/HTTPS 加载，不建议直接双击 HTML。

### 腾讯云 EdgeOne Makers / Pages

1. 导入 `w999w/rpa-toolbox` 仓库，选择 `main` 分支。
2. 项目根目录使用仓库根目录（不要填 `dist`），框架选择「Other / 其他」。
3. 输出目录为 `dist`。根目录的 `edgeone.json` 已指定输出目录，并用提示命令跳过依赖安装和编译。
4. 提交更新后等待自动部署；未开启自动部署时，在控制台重新部署最新提交。
5. 部署成功后，分别打开首页、`/tools/jinzhiwei/`、`/tools/jinzhiwei/sql/`，确认直接访问和刷新均正常。

`edgeone.json` 中包含以下回退规则：

```json
{
  "source": "/*",
  "destination": "/index.html"
}
```

按照 [EdgeOne 官方说明](https://pages.edgeone.ai/document/edgeone-json)，该精确规则先匹配已有页面、静态资源等路由，无匹配时才回退到首页。本项目的三个页面各有自己的 `index.html`；正常工具入口仍由对应页面提供。排查 404 时，请先确认当前部署使用了最新提交，且输出目录确实为 `dist`。

### 其他静态托管

将 `dist` 目录中的全部文件作为网站内容发布，无需构建命令。保留子目录和文件的相对路径，并启用目录首页 `index.html`。

项目 GitHub 链接集中配置在 `dist/assets/config.mjs`。Sites 的 `.openai/hosting.json` 只记录原站点身份，不属于开源仓库；其他托管服务不需要此文件。

### 开发预览与验证（可选）

开发预览使用 Vite，需要 Node.js 20.19+ 或 22.12+：

```bash
npm ci
npm run dev
```

打开终端显示的地址。Vite 仅用于开发预览，部署仍直接使用 `dist`，不要对它执行 `vite build`。自动化演示使用相同页面与转换逻辑。

转换测试无需第三方依赖，使用 Node.js 18+：

```bash
node --test tests/converter.test.mjs
```
