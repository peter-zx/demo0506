# 个人服务器项目整合计划

## 可行性判断

服务器 `123.56.100.146` 为 2 核 2 GiB，承载个人主页和 4-6 个轻量 Web 工具是可行的。建议采用：

- Nginx 统一对外提供 `80/443`
- 每个项目独立目录、独立端口、独立 systemd 服务
- 只开放公网 `80/443`，工具端口仅监听 `127.0.0.1`
- 后续加域名后接入 HTTPS

## 推荐端口

| 服务 | 仓库 | 内部端口 | 对外路径 |
| --- | --- | ---: | --- |
| 个人门户 / 航行计时入口 | `bamboox2023_hangxing` 或当前门户 | 5062 | `/` |
| 记账工具 | `jizhang_codexAa001` | 5063 | `/tools/accounting/` |
| Vault Note | `data_VaultNote_codex002` | 5064 | `/tools/vault-note/` |
| Excel 发票工具 | `excel_fapiao` | 5065 | `/tools/excel-fapiao/` |
| Work Data | `workdata_codex0002` | 5066 | `/tools/workdata/` |
| 贾维斯工作汇报 | 当前项目内置页面 | 5062 | `/tools/work-report.html` |

## 部署目录

```text
/opt/
├── personal-portal/
├── tools-accounting/
├── tools-vault-note/
├── tools-excel-fapiao/
└── tools-workdata/
```

## 服务器初始化

```bash
apt update
apt install -y git nginx nodejs npm
systemctl enable nginx
systemctl start nginx
```

## 部署当前门户

```bash
mkdir -p /opt
cd /opt
git clone <当前门户仓库地址> personal-portal
cd /opt/personal-portal
cp config/app.config.production.json public/app.config.json
cp deploy/personal-portal.service /etc/systemd/system/personal-portal.service
systemctl daemon-reload
systemctl enable personal-portal
systemctl restart personal-portal
```

## 配置 Nginx

```bash
cp /opt/personal-portal/deploy/nginx-personal-portal.conf /etc/nginx/sites-available/personal-portal
ln -s /etc/nginx/sites-available/personal-portal /etc/nginx/sites-enabled/personal-portal
nginx -t
systemctl reload nginx
```

## 后续集成步骤

1. 拉取每个 Codeup 仓库到 `/opt` 对应目录。
2. 分析每个项目的启动方式，是静态站、Node、Python 还是其他服务。
3. 为每个项目补齐 `.env.production`、systemd service、日志策略。
4. 确认项目能支持子路径部署；不支持时用独立二级域名或 Nginx rewrite。
5. 统一更新门户卡片，把仓库链接替换为真实服务入口。

## 风险点

- Codeup 仓库可能需要登录或访问令牌，服务器 `git clone` 可能失败。
- 每个工具的前端路由如果写死 `/`，挂到 `/tools/.../` 下可能需要改 base path。
- 2 GiB 内存不适合同时跑多个重型构建服务，建议构建完成后只运行轻量静态服务或 API。
- root 密码不应长期使用，建议部署后改成 SSH key 登录。

