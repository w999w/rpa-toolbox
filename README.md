# RPA 工具箱

按 RPA 平台整理的轻量工具箱，首期支持金智维 SQL 语句转换：中文脚本、向导脚本、单引号处理与 #变量# 拼接。纯前端运行，支持本地部署。

[项目仓库](https://github.com/w999w/rpa-toolbox) · [MIT 许可证](LICENSE)

现有 [Sites 站点](https://rpa-toolbox.catmoon99.chatgpt.site) 当前仅向站点所有者开放；其他使用者可以下载源码并自行部署。

## 已实现

- 首页：项目介绍与 RPA 平台选择。
- 金智维平台页：按工具进入独立页面。
- SQL 转换：中文脚本、向导脚本、英文单引号处理、`#变量#` 拼接、实时转换、复制结果、错误提示。
- 浅色玻璃材质界面，适配桌面与手机，支持键盘操作和减少动画偏好。
- 纯浏览器处理，不执行 SQL，不发送或持久化输入。

## 使用规则

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

## 本地使用与验证

无第三方运行依赖，无安装或编译步骤。用任意静态 HTTP 服务将 `dist` 作为网站根目录；ES Modules 需要通过 HTTP/HTTPS 加载，不建议直接双击 HTML。

例如，有 Python 3 时：

```bash
python -m http.server 8000 --directory dist
```

然后访问 `http://localhost:8000`。

转换测试使用 Node.js 内置测试运行器（Node.js 18 或更新版本）：

```bash
node --test tests/converter.test.mjs
```

## 文件结构

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

## 获取源码与部署

```bash
git clone https://github.com/w999w/rpa-toolbox.git
cd rpa-toolbox
python -m http.server 8000 --directory dist
```

`dist` 中的文件就是完整的可运行网站源码，并非需要重新构建的产物。部署到静态托管服务时，将 `dist` 作为发布目录；无需构建命令。部署时保留子目录和文件的相对路径。

GitHub 项目链接集中配置在 `dist/assets/config.mjs`。

Sites 环境中的 `.openai/hosting.json` 仅记录当前站点身份，不包含在本开源代码包中；本地运行和其他静态托管服务不需要此文件。

## 扩展与贡献

欢迎通过 Issue 提交问题或新工具需求，也欢迎提交 Pull Request。报告 SQL 转换问题时，请提供去除敏感信息后的原始 SQL、所选脚本类型和期望结果。

新增平台或工具时，可参考现有页面入口，并同步更新 `dist/assets/site.mjs` 的平台资料、页面渲染与路由入口；转换逻辑可像 `converter.mjs` 一样独立实现。涉及 SQL 转换的修改，请运行上述测试。

## 开源许可

本项目采用 [MIT License](LICENSE)，版权归 w999w 所有。

任何人均可免费使用、复制、修改、分发本项目，允许商业使用、再许可和销售副本，也可以用于闭源项目。分发软件或其重要部分时，需要保留版权声明及许可声明。软件按原样提供，不作担保。完整条款以 `LICENSE` 为准。

## 设计参考

参考 Apple 的 [Liquid Glass 材质说明](https://developer.apple.com/documentation/technologyoverviews/liquid-glass) 与 [iOS 27 设计资源更新](https://developer.apple.com/news/?id=e2lxw9l1)，使用网页技术呈现半透明表面、圆角控件与清晰层次。
