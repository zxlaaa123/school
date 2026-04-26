# AI开发规则.md

# 本地学校学生管理网页仿真系统：AI 开发规则

## 1. 文件用途

本文件用于约束 Trae、CodeBuddy、Cursor、VS Code Copilot 或其他 AI 编程工具在开发本项目时的行为。

项目开发必须遵循本文档规则，避免 AI 一次性生成大量混乱代码、擅自修改技术栈、破坏已有功能、修改数据库字段或接口路径。

---

## 2. 项目基本信息

| 项目 | 内容 |
|---|---|
| 项目名称 | 本地学校学生管理网页仿真系统 |
| 项目用途 | 本科毕业设计 / 本地 Web 仿真系统 |
| 运行方式 | 仅本地运行 |
| 数据来源 | 模拟数据 |
| 是否部署公网 | 否 |
| 是否接入真实学校系统 | 否 |
| 是否使用真实学生数据 | 否 |

---

## 3. 固定技术栈

本项目技术栈固定，不允许 AI 擅自更换。

### 3.1 前端技术栈

```text
Vue 3
Vite
Element Plus
Vue Router
Pinia
Axios
ECharts
```

### 3.2 后端技术栈

```text
Node.js
Express
Prisma
SQLite
JWT
bcrypt
cors
dotenv
```

### 3.3 数据库

```text
SQLite
```

---

## 4. 禁止事项

AI 在开发过程中严禁执行以下行为。

## 4.1 禁止擅自更换技术栈

不允许改成：

```text
React
Next.js
Nuxt
NestJS
MongoDB
MySQL
PostgreSQL
Spring Boot
Django
Flask
Docker 微服务架构
```

除非用户明确要求，否则一律不要更换技术栈。

---

## 4.2 禁止一次性开发完整系统

不要一次性生成完整项目。

必须按阶段开发：

```text
项目骨架
数据库
登录权限
基础数据管理
成绩管理
考勤管理
公告奖惩
首页看板
个人中心
测试修复
毕设包装
```

每次只允许完成一个阶段或一个模块。

---

## 4.3 禁止随意修改数据库字段

数据库字段必须优先遵循：

```text
docs/03_数据库设计.md
```

尤其不要随意改这些字段：

```text
studentNo
teacherNo
majorNo
classNo
courseNo
classId
majorId
teacherId
studentId
courseId
usualScore
finalScore
totalScore
attendanceDate
```

如果确实需要调整字段，必须先说明原因，并等待用户确认。

---

## 4.4 禁止随意修改 API 路径

API 路径必须优先遵循：

```text
docs/04_API接口设计.md
```

例如：

```text
POST /api/auth/login
GET /api/students
POST /api/students
PUT /api/students/:id
DELETE /api/students/:id
GET /api/scores
POST /api/scores
GET /api/attendance
POST /api/attendance
```

不允许随意改成其他路径风格。

---

## 4.5 禁止删除已有功能

AI 修改代码时，不允许删除已经实现并可运行的功能。

如果必须重构，需要先说明：

1. 为什么要重构。
2. 会影响哪些文件。
3. 是否会破坏现有功能。
4. 如何回滚。
5. 如何测试。

---

## 4.6 禁止使用真实学生数据

本项目只能使用模拟数据。

不允许出现：

1. 真实学生姓名。
2. 真实身份证号。
3. 真实手机号。
4. 真实家庭住址。
5. 真实成绩。
6. 真实学校内部数据。

可以使用：

```text
模拟姓名
模拟手机号
模拟地址
模拟成绩
模拟考勤
模拟公告
```

---

## 4.7 禁止引入复杂无关功能

本项目不实现以下功能：

```text
公网部署
人脸识别
短信验证码
真实邮件发送
在线支付
复杂排课算法
微信小程序
手机 App
微服务
Docker 集群
真实教务系统对接
大型权限平台
```

这些功能可以作为论文“未来展望”，不要实际开发。

---

## 5. 必须遵循的文档

AI 开发前必须阅读并遵循以下文档：

```text
docs/01_项目需求说明.md
docs/02_功能模块设计.md
docs/03_数据库设计.md
docs/04_API接口设计.md
docs/05_前端页面规划.md
docs/06_开发阶段任务.md
docs/07_测试用例.md
docs/08_运行部署说明.md
```

如果文档之间存在冲突，优先级如下：

```text
01_项目需求说明.md
02_功能模块设计.md
03_数据库设计.md
04_API接口设计.md
05_前端页面规划.md
06_开发阶段任务.md
07_测试用例.md
08_运行部署说明.md
```

---

## 6. 项目目录要求

项目目录建议保持如下结构：

```text
student-management-system/
  frontend/
  backend/
  docs/
  mock_school_data/
  generate_fake_school_data.py
  README.md
  AI开发规则.md
  阶段提示词.md
```

前端目录：

```text
frontend/
  src/
    api/
    assets/
    components/
    layout/
    router/
    stores/
    utils/
    views/
```

后端目录：

```text
backend/
  prisma/
    schema.prisma
    seed.js
  src/
    routes/
    controllers/
    services/
    middlewares/
    utils/
    app.js
```

---

## 7. 开发顺序规则

必须按以下顺序开发：

```text
第 1 步：项目骨架
第 2 步：数据库 Prisma + SQLite
第 3 步：模拟数据 seed
第 4 步：登录 JWT + 角色权限
第 5 步：后台布局 + 菜单权限
第 6 步：专业管理
第 7 步：教师管理
第 8 步：班级管理
第 9 步：学生管理
第 10 步：课程管理
第 11 步：成绩管理
第 12 步：考勤管理
第 13 步：公告管理
第 14 步：奖惩管理
第 15 步：首页看板
第 16 步：个人中心
第 17 步：用户管理
第 18 步：操作日志，可选
第 19 步：测试修复
第 20 步：README 和毕设包装
```

不要跳阶段。

---

## 8. 每次开发前必须确认

AI 每次开始写代码前，必须先明确当前任务：

```text
当前阶段：
当前模块：
本次要修改的文件：
本次不修改的文件：
预计实现的功能：
可能影响的已有功能：
```

如果任务不明确，应先输出开发计划，不要直接写代码。

---

## 9. 每次开发后必须说明

每次完成后必须输出以下内容：

```text
1. 本次完成了什么功能
2. 新增了哪些文件
3. 修改了哪些文件
4. 删除了哪些文件
5. 如何安装依赖
6. 如何启动前端
7. 如何启动后端
8. 如何测试本次功能
9. 是否影响已有功能
10. 是否有未完成事项
```

其中“是否有未完成事项”必须明确写：

```text
未完成事项：无
```

或：

```text
未完成事项：
1. xxx
2. xxx
```

不允许含糊其辞。

---

## 10. 数据库开发规则

1. 使用 Prisma + SQLite。
2. 数据库文件建议为 `backend/prisma/dev.db`。
3. 数据模型优先参考 `docs/03_数据库设计.md`。
4. 字段命名优先使用 camelCase。
5. 编号类字段必须唯一，例如 studentNo、teacherNo、courseNo。
6. 成绩表必须防止同一学生、同一课程、同一学期重复录入。
7. 考勤表必须防止同一学生、同一课程、同一天重复登记。
8. 不要在数据库中保存真实隐私数据。
9. 密码不能明文保存。
10. `plainPassword` 只允许出现在模拟数据文件中，写入数据库时必须用 bcrypt 加密。

---

## 11. 后端开发规则

1. 后端使用 Node.js + Express。
2. 所有接口统一以 `/api` 开头。
3. 所有响应统一格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

4. 列表接口统一返回：

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "list": [],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 0
    }
  }
}
```

5. 除登录和健康检查外，接口必须校验 JWT。
6. 管理类接口必须校验角色权限。
7. 教师只能操作自己课程相关数据。
8. 学生只能查看自己的数据。
9. 不允许只做前端权限，不做后端权限。
10. 后端必须有基础错误处理。

---

## 12. 前端开发规则

1. 前端使用 Vue 3 + Vite。
2. UI 使用 Element Plus。
3. 路由使用 Vue Router。
4. 状态管理使用 Pinia。
5. 请求使用 Axios。
6. 图表使用 ECharts。
7. 所有接口请求统一通过 `src/api/request.js`。
8. 登录状态保存在 Pinia 和 localStorage。
9. 路由必须有登录拦截。
10. 菜单必须根据角色动态显示。
11. 页面按钮也要根据权限隐藏。
12. 表格页面必须包含搜索、分页、操作按钮、空状态。
13. 删除操作必须二次确认。
14. 保存成功和失败必须有提示。

---

## 13. 权限规则

系统只有三类角色：

```text
admin
teacher
student
```

权限原则：

```text
管理员：管理全部数据
教师：管理自己课程、班级或相关学生数据
学生：只能查看个人数据
```

必须保证：

1. 学生不能访问学生管理页面。
2. 学生不能访问用户管理页面。
3. 学生不能访问教师管理页面。
4. 学生不能查看他人成绩。
5. 学生不能查看他人考勤。
6. 教师不能访问用户管理页面。
7. 教师不能管理其他教师课程成绩。
8. 教师不能登记其他教师课程考勤。
9. 未登录用户不能访问后台。
10. 无权限访问应返回 403 或跳转 403 页面。

---

## 14. 模拟数据规则

可以使用：

```text
generate_fake_school_data.py
```

生成模拟数据：

```bash
python generate_fake_school_data.py
```

默认输出：

```text
mock_school_data/
  seed_data.json
  csv/
```

后端 seed 脚本可以读取：

```text
mock_school_data/seed_data.json
```

导入顺序建议：

```text
majors
teachers
classes
students
courses
courseClasses
users
scores
attendanceRecords
notices
rewardsPunishments
operationLogs
```

注意：

```text
users 中的 plainPassword 不能直接写入 password 字段，必须 bcrypt 加密。
```

---

## 15. 测试规则

每完成一个模块，至少测试：

1. 页面能打开。
2. 列表能查询。
3. 新增能保存。
4. 编辑能保存。
5. 删除有确认。
6. 搜索可用。
7. 分页可用。
8. 权限正确。
9. 接口返回格式正确。
10. 刷新页面不报错。

测试依据：

```text
docs/07_测试用例.md
```

---

## 16. 错误处理规则

后端常用错误码：

| code | 说明 |
|---|---|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未登录 |
| 403 | 无权限 |
| 404 | 数据不存在 |
| 409 | 数据冲突 |
| 500 | 服务器错误 |

前端必须对错误进行提示，例如：

```text
登录失败
保存失败
删除失败
权限不足
网络异常
```

---

## 17. 代码质量要求

1. 文件命名清晰。
2. 目录结构清晰。
3. 不写无用代码。
4. 不堆积大段重复代码。
5. 不在业务页面中硬编码大量接口地址。
6. 不在前端保存敏感信息。
7. 不把 node_modules 提交到项目中。
8. 不把真实隐私数据写入项目。
9. 重要业务逻辑要有简洁注释。
10. 保证项目每个阶段都能启动运行。

---

## 18. Git / 交付规则

如果使用 Git，建议忽略：

```text
node_modules/
dist/
.env
*.log
```

是否提交 SQLite 数据库：

1. 如果用于演示，可以提交 `backend/prisma/dev.db`。
2. 如果用于开发交付，可以不提交数据库，但必须提供 seed 脚本。

---

## 19. 答辩优先级

如果时间不足，优先保证以下功能：

```text
登录
角色权限
学生管理
教师管理
专业管理
班级管理
课程管理
成绩管理
考勤管理
首页看板
个人中心
通知公告
```

可以暂缓：

```text
操作日志
Excel 导入导出
头像上传
富文本编辑器
主题切换
移动端适配
```

---

## 20. 最终原则

本项目追求的是：

```text
本地可运行
功能完整
结构清晰
演示稳定
文档齐全
适合毕业设计
```

不追求：

```text
商用级复杂度
高级炫技功能
公网真实部署
真实学校数据对接
大型工程架构
```

AI 必须始终围绕这个目标开发。
