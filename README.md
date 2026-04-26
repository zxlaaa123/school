# 本地学校学生管理网页仿真系统

## 1. 项目简介

本项目是一个**本科毕业设计**项目——本地学校学生管理网页仿真系统。

- **运行方式**：仅本地运行，不部署公网
- **数据来源**：模拟数据，不接入真实学校系统
- **用户角色**：管理员、教师、学生三类角色
- **核心功能**：学生管理、教师管理、专业管理、班级管理、课程管理、成绩管理、考勤管理、奖惩管理、通知公告、首页数据看板

---

## 2. 技术栈

| 层 | 技术 | 用途 |
|---|---|---|
| 前端框架 | Vue 3 + Vite | 基础框架 |
| UI 组件 | Element Plus | 表格、表单、弹窗、菜单等 |
| 路由 | Vue Router | 页面路由 + 登录/角色守卫 |
| 状态管理 | Pinia | token、用户信息、角色 |
| HTTP 请求 | Axios | 封装接口请求 |
| 图表 | ECharts | 首页统计图表 |
| 后端框架 | Node.js + Express | HTTP 服务 |
| ORM | Prisma 5 | 数据库建模和操作 |
| 数据库 | SQLite | 本地文件数据库 |
| 认证 | JWT + bcrypt | Token 认证 + 密码加密 |

---

## 3. 项目目录结构

```
schoolnet/
├── frontend/                       # 前端项目
│   ├── src/
│   │   ├── api/                    # 接口封装
│   │   │   └── request.js          # Axios 封装（拦截器、token、错误处理）
│   │   ├── assets/
│   │   │   └── styles/
│   │   │       └── global.css      # 全局样式
│   │   ├── router/
│   │   │   └── index.js            # 路由配置（/login、/dashboard）
│   │   ├── stores/
│   │   │   ├── user.js             # 用户状态（token、userInfo、logout）
│   │   │   └── app.js              # 应用状态（侧边栏折叠）
│   │   ├── utils/
│   │   │   └── enums.js            # 枚举定义（角色、状态、成绩等级等）
│   │   ├── views/
│   │   │   ├── login/
│   │   │   │   └── Login.vue       # 登录页（含演示账号表格）
│   │   │   └── dashboard/
│   │   │       └── Dashboard.vue   # 首页看板（统计卡片 + 图表占位）
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js              # Vite 配置 + /api 代理
│
├── backend/                        # 后端项目
│   ├── prisma/
│   │   ├── schema.prisma           # 数据模型定义（12 个模型）
│   │   ├── seed.js                 # 种子数据导入脚本
│   │   ├── dev.db                  # SQLite 数据库文件
│   │   └── migrations/             # 迁移历史
│   ├── src/
│   │   ├── routes/                 # 路由（待开发）
│   │   ├── controllers/            # 控制器（待开发）
│   │   ├── middlewares/            # 中间件（待开发）
│   │   ├── services/               # 业务逻辑（待开发）
│   │   ├── utils/                  # 工具函数（待开发）
│   │   └── app.js                  # 入口文件 + 健康检查接口
│   ├── package.json
│   └── .env
│
├── docs/                           # 设计文档
│   ├── 01_项目需求说明.md
│   ├── 02_功能模块设计.md
│   ├── 03_数据库设计.md
│   ├── 04_API接口设计.md
│   ├── 05_前端页面规划.md
│   ├── 06_开发阶段任务.md
│   ├── 07_测试用例.md
│   ├── 08_运行部署说明.md
│   └── generate_fake_school_data.py
│
├── mock_school_data/               # 模拟数据
│   ├── seed_data.json              # 完整 JSON 数据
│   ├── csv/                        # 按表拆分的 CSV
│   └── README_数据说明.md
│
├── AI开发规则.md
└── README.md                       # 本文件
```

---

## 4. 核心模块

### 必做模块

| 模块 | 功能 |
|---|---|
| 登录与权限 | JWT 登录、角色菜单、路由守卫、修改密码 |
| 首页数据看板 | 统计卡片 + ECharts 图表（学生人数、成绩分布等） |
| 学生管理 | CRUD + 搜索/筛选/分页 + 学籍状态管理 |
| 教师管理 | CRUD + 搜索/筛选/分页 |
| 专业管理 | CRUD + 院系关联 |
| 班级管理 | CRUD + 分配班主任 + 查看班级学生 + 人数统计 |
| 课程管理 | CRUD + 分配任课教师 + 课程类型/学分/学期 |
| 成绩管理 | 录入/查询/统计 + 自动计算总评和等级 + 角色权限控制 |
| 考勤管理 | 登记/查询/统计 + 五种考勤状态 |
| 个人中心 | 查看个人信息 + 修改密码 + 角色差异化展示 |

### 建议做模块

- 奖惩管理
- 通知公告
- 用户管理

### 可选模块

- 操作日志
- 数据导入导出

---

## 5. 数据库设计

系统使用 SQLite，共 **12 张表**：

| 表名 | 唯一约束 | 说明 |
|---|---|---|
| User | username | 用户登录账号 |
| Student | studentNo | 学生基础信息 |
| Teacher | teacherNo | 教师基础信息 |
| Major | majorNo | 专业信息 |
| Class | classNo | 班级信息 |
| Course | courseNo | 课程信息 |
| CourseClass | courseId + classId | 课程班级多对多关联 |
| Score | studentId + courseId + semester | 学生成绩 |
| AttendanceRecord | studentId + courseId + attendanceDate | 学生考勤 |
| RewardPunishment | — | 奖惩记录 |
| Notice | — | 通知公告 |
| OperationLog | — | 操作日志 |

### 成绩计算规则

```
总评成绩 = 平时成绩 × 40% + 期末成绩 × 60%
```

| 总评成绩 | 等级 |
|---|---|
| 90 - 100 | 优秀 |
| 80 - 89 | 良好 |
| 70 - 79 | 中等 |
| 60 - 69 | 及格 |
| 0 - 59 | 不及格 |

---

## 6. 开发阶段进度

| 阶段 | 名称 | 状态 |
|---|---|---|
| 第 0 阶段 | 准备阶段（文档确认） | ✅ 已完成 |
| 第 1 阶段 | 项目骨架 | ✅ 已完成 |
| 第 2 阶段 | 数据库（Prisma + SQLite） | ✅ 已完成 |
| 第 3 阶段 | 模拟数据导入 | ✅ 已完成 |
| 第 4 阶段 | 登录权限（JWT + 角色菜单） | ✅ 已完成 |
| 第 5 阶段 | 基础数据管理（CRUD） | ✅ 已完成（专业/教师/班级/学生/课程） |
| 第 6 阶段 | 核心业务（成绩/考勤/公告） | ⬜ 成绩管理已完成，考勤/公告待开发 |
| 第 7 阶段 | 看板与个人中心 | ⬜ 待开发 |
| 第 8 阶段 | 测试优化 | ⬜ 待开发 |
| 第 9 阶段 | 毕设包装 | ⬜ 待开发 |

---

## 7. 本地运行步骤

### 环境要求

| 环境 | 版本 |
|---|---|
| Node.js | 18.x 或 20.x |
| npm | 9.x 以上 |
| Python | 3.x（用于生成模拟数据） |
| 浏览器 | Chrome / Edge |

### 首次运行

```bash
# 1. 生成模拟数据
cd schoolnet
python docs/generate_fake_school_data.py

# 2. 安装后端依赖
cd backend
npm install

# 3. 执行数据库迁移
npx prisma migrate dev --name init

# 4. 导入种子数据
npx prisma db seed

# 5. 启动后端（端口 3000）
npm run dev
```

另开一个终端：

```bash
# 6. 安装前端依赖
cd schoolnet/frontend
npm install

# 7. 启动前端（端口 5173）
npm run dev
```

### 访问地址

| 服务 | 地址 |
|---|---|
| 前端页面 | http://localhost:5173 |
| 后端接口 | http://localhost:3000/api |
| 健康检查 | http://localhost:3000/api/health |
| Prisma Studio | http://localhost:5555 |

---

## 8. 演示账号

| 角色 | 账号 | 密码 |
|---|---|---|
| 管理员 | `admin` | `123456` |
| 教师 | `teacher001` | `123456` |
| 教师 | `teacher002` | `123456` |
| 学生 | `student001` | `123456` |
| 学生 | `student002` | `123456` |

**成绩管理测试提示：**
- 教师账号 `teacher001` 负责课程：`course001`（高等数学）
- 教师账号 `teacher002` 负责课程：`course002`（大学英语）
- 学生 `student001` 和 `student002` 已选修对应课程，可测试成绩录入和查看

---

## 9. 常用命令

### 后端

```bash
cd backend
npm run dev              # 启动开发服务器
npm start                # 生产启动
npx prisma studio        # 打开数据库管理界面
npx prisma db seed       # 导入种子数据
npx prisma migrate reset # 重置数据库
```

### 前端

```bash
cd frontend
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览构建结果
```

---

## 10. 系统边界

### 本项目实现

- 本地 Web 后台管理系统
- 登录和角色权限
- 学生、教师、专业、班级、课程基础数据管理
- 成绩录入、查询和统计（**已完成**）
  - 自动计算总评：平时×40% + 期末×60%
  - 自动评定等级：优秀/良好/中等/及格/不及格
  - 重复录入拦截：同一学生+同一课程+同一学期唯一
  - 角色权限：管理员全权限、教师仅自己课程、学生仅个人
- 考勤登记、查询和统计（待开发）
- 奖惩记录管理（待开发）
- 通知公告管理（待开发）
- 首页数据看板
- 本地数据库保存
- 模拟数据初始化

### 本项目不实现

- 公网部署
- 微信小程序 / 手机 App
- 短信验证码 / 邮件发送
- 人脸识别 / 指纹识别
- 在线支付
- 复杂排课算法
- 微服务架构 / Docker 集群
- 对接真实教务系统
- 使用真实学生隐私数据

---

## 11. 后续优化方向（论文展望）

- 支持移动端适配
- 支持真实邮件通知
- 支持复杂排课算法
- 支持数据导入导出
- 支持更细粒度权限管理
- 支持系统备份与恢复
- 支持校园真实教务系统对接

---

## 12. 成绩管理模块说明

### 后端接口

| 接口 | 方法 | 说明 | 权限 |
|---|---|---|---|
| `/api/scores` | GET | 分页查询成绩列表 | 全部角色 |
| `/api/scores/:id` | GET | 查询成绩详情 | 全部角色（受限） |
| `/api/scores` | POST | 新增成绩 | 管理员/教师 |
| `/api/scores/:id` | PUT | 修改成绩 | 管理员/教师（受限） |
| `/api/scores/:id` | DELETE | 删除成绩 | 仅管理员 |
| `/api/scores/statistics` | GET | 成绩统计信息 | 全部角色（受限） |

### 前端页面

| 页面 | 路径 | 说明 | 权限 |
|---|---|---|---|
| 成绩管理 | `/scores` | 搜索/表格/分页/新增/编辑/删除/统计 | 管理员/教师 |
| 我的成绩 | `/my-scores` | 学生查看个人成绩 | 学生 |

### 业务规则

1. **分数范围**：平时成绩、期末成绩必须在 0-100 之间
2. **总评计算**：`totalScore = usualScore × 0.4 + finalScore × 0.6`（保留1位小数）
3. **等级评定**：
   - 90-100：优秀（excellent）
   - 80-89：良好（good）
   - 70-79：中等（medium）
   - 60-69：及格（pass）
   - 0-59：不及格（fail）
4. **重复校验**：同一学生+同一课程+同一学期只能有一条成绩记录
5. **权限控制**：
   - 管理员：可管理全部成绩
   - 教师：只能管理自己教授的课程成绩
   - 学生：只能查看个人成绩（无增删改权限）

### 相关文件

**后端：**
- `backend/src/services/score.service.js` - 成绩业务逻辑
- `backend/src/controllers/score.controller.js` - 成绩控制器
- `backend/src/routes/score.routes.js` - 成绩路由
- `backend/src/controllers/option.controller.js` - 新增课程/学生下拉选项接口
- `backend/src/routes/option.routes.js` - 注册课程/学生下拉选项路由

**前端：**
- `frontend/src/api/scores.js` - 成绩接口封装
- `frontend/src/views/scores/ScoreList.vue` - 成绩管理页面
- `frontend/src/views/scores/MyScores.vue` - 我的成绩页面
- `frontend/src/api/options.js` - 新增课程/学生下拉选项接口
