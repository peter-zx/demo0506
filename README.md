# 竹行舟 - 个人门户与工具矩阵

一个个人形象站与工具集合入口。首页为“航行计时”风格的个人门户，后续通过工具卡片进入不同项目。

当前项目内置了一个“贾维斯工作汇报”工具，可以逐条填写：

- 做了什么内容
- 什么进展
- 复盘反思

然后一键生成带序号的汇报文本并复制。

## 目录结构

```text
.
├── config/
│   ├── app.config.development.json
│   └── app.config.production.json
├── deploy/
│   ├── INTEGRATION_PLAN.md
│   ├── nginx-personal-portal.conf
│   └── personal-portal.service
├── public/
│   └── app.config.json
├── src/
│   ├── app.js
│   ├── core/
│   │   ├── reportFormatter.js
│   │   └── validation.js
│   ├── infra/
│   │   ├── configLoader.js
│   │   ├── logger.js
│   │   └── storage.js
│   └── ui/
│       └── reportView.js
├── styles/
│   └── main.css
├── tools/
│   └── work-report.html
└── index.html
```

## 本地运行

直接用浏览器打开 `index.html` 即可查看个人门户。

工作汇报工具入口：

```text
tools/work-report.html
```

如需模拟服务器部署，可在项目根目录启动内置静态服务器：

```powershell
npm run dev
```

然后访问：

```text
http://127.0.0.1:8080
```

## 服务器部署

服务器运行时建议使用 systemd 托管进程。门户默认内部端口为 `5062`：

```bash
HOST=127.0.0.1 PORT=5062 npm run start
```

如需安装为系统服务，可参考 `deploy/personal-portal.service`。
多项目整合方案见 `deploy/INTEGRATION_PLAN.md`。

## 部署脚本

服务器初始化：

```bash
bash deploy/server-bootstrap.sh
```

部署门户：

```bash
bash deploy/deploy-portal.sh
```

检查工具仓库技术栈：

```bash
bash deploy/inspect-tool-repos.sh
```

## 配置方式

运行时默认读取 `public/app.config.json`。生产环境部署时可用部署脚本或 CI 将：

- `config/app.config.development.json`
- `config/app.config.production.json`

复制为：

```text
public/app.config.json
```

代码中不写死任何本地绝对路径，所有运行配置均从配置文件读取或使用安全默认值。

## 工业化设计说明

- 接口层：`src/ui/reportView.js` 负责界面渲染与用户交互。
- 业务层：`src/core/reportFormatter.js` 和 `src/core/validation.js` 负责校验与文本生成。
- 基础设施层：`src/infra/configLoader.js`、`src/infra/storage.js`、`src/infra/logger.js` 负责配置、浏览器存储和日志。
- 用户数据只保存在当前浏览器 `localStorage`，不依赖本机绝对路径。
- 不使用危险的全局共享状态，应用状态封装在 `ReportView` 实例内。
- I/O 操作包含异常处理与日志。
- 预留 `src/core` 与 `src/infra` 分层，后续可接后端 API、上传接口、对象存储、任务队列或异步任务。
