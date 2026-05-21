# 服务器全量改造执行手册

目标服务器：`123.56.100.146`

## 安全边界

“停止一切项目”仅停止业务服务：

- Nginx/Apache
- Node/npm/PM2
- Python Web 服务
- Docker 容器
- 当前门户、工具、数据处理类 systemd 服务

保留：

- SSH/sshd
- 网络服务
- 防火墙
- systemd 基础服务
- 定时任务基础服务

## 第 1 步：盘点

```bash
bash /tmp/remote-inventory.sh
```

## 第 2 步：停服预演

```bash
DRY_RUN=1 bash /tmp/remote-stop-business-services.sh
```

## 第 3 步：正式停服

```bash
DRY_RUN=0 bash /tmp/remote-stop-business-services.sh
```

## 第 4 步：初始化新架构

```bash
bash deploy/server-bootstrap.sh
bash deploy/deploy-portal.sh
```

## 第 5 步：工具仓库盘点

```bash
bash deploy/inspect-tool-repos.sh
```

拿到每个仓库的技术栈后，再为每个工具生成独立 service 和 Nginx 代理配置。

