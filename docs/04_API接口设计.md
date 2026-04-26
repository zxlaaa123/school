# 04_API接口设计.md

# 本地学校学生管理网页仿真系统：API 接口设计（精简版）

## 1. 基础规范

| 项目 | 说明 |
|---|---|
| 基础路径 | `/api`（或 `/api/v1`） |
| 技术栈 | Node.js + Express + Prisma + SQLite |
| 认证方式 | JWT（Header: `Authorization: Bearer <token>`） |
| 数据格式 | JSON |
| 响应格式 | `{ code, message, data }` |
| 状态码 | 200成功 / 400参数错误 / 401未登录 / 403无权限 / 404不存在 / 409冲突 / 500错误 |

**统一响应**：
- 成功：`{ code: 200, message: '操作成功', data }`
- 列表：`{ code: 200, message: '查询成功', data: { list, pagination: { page, pageSize, total } } }`
- 失败：`{ code: xxx, message: '错误说明', data: null }`

---

## 2. 通用参数规范

### 分页参数
```
?page=1&pageSize=10
```

### 搜索筛选
各模块按需定义，如：
```
?keyword=张三&classId=1&status=studying
```

### 排序（可选）
```
?sortBy=createdAt&order=desc
```

---

## 3. 枚举值（前端可本地维护）

| 枚举 | 值 | 说明 |
|---|---|---|
| 角色 | admin / teacher / student | 管理员 / 教师 / 学生 |
| 状态 | enabled / disabled | 启用 / 禁用 |
| 性别 | male / female / unknown | 男 / 女 / 未知 |
| 学籍状态 | studying / suspended / withdrawn / graduated | 在读 / 休学 / 退学 / 毕业 |
| 课程类型 | required / elective / public / practice | 必修 / 选修 / 公共课 / 实践课 |
| 成绩等级 | excellent / good / medium / pass / fail | 优秀 / 良好 / 中等 / 及格 / 不及格 |
| 考勤状态 | normal / late / leave_early / leave / absent | 正常 / 迟到 / 早退 / 请假 / 缺勤 |
| 奖惩类型 | reward / punishment | 奖励 / 处分 |
| 公告状态 | draft / published / expired | 草稿 / 已发布 / 已过期 |
| 公告分类 | academic / exam / activity / system | 教务 / 考试 / 活动 / 系统 |

---

## 4. 认证模块（auth）

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| POST | `/api/auth/login` | 公开 | 登录 |
| GET | `/api/auth/me` | 已登录 | 获取当前用户信息 |
| PUT | `/api/auth/password` | 已登录 | 修改密码 |
| POST | `/api/auth/logout` | 已登录 | 退出登录（前端删token即可） |

**登录响应**：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "jwt_token",
    "user": { "id", "username", "nickname", "role", "teacherId?", "studentId?" }
  }
}
```

---

## 5. 首页看板（dashboard）

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/dashboard/summary` | 登录 | 获取统计数据（学生/教师/班级/课程数、今日异常考勤、公告数） |
| GET | `/api/dashboard/student-statistics` | 管理员/教师 | 学生人数统计（按年级/专业/班级分组） |
| GET | `/api/dashboard/score-distribution` | 管理员/教师 | 成绩分布统计 |
| GET | `/api/dashboard/recent-notices` | 登录 | 最近公告列表 |

---

## 6. 学生管理（students）

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/students` | 管理员/教师 | 学生列表（分页、搜索、筛选） |
| GET | `/api/students/:id` | 管理员/教师 | 学生详情 |
| POST | `/api/students` | **管理员** | 新增学生 |
| PUT | `/api/students/:id` | **管理员** | 编辑学生 |
| DELETE | `/api/students/:id` | **管理员** | 删除学生 |

**查询参数**：`page`、`pageSize`、`keyword`（学号/姓名）、`grade`、`majorId`、`classId`、`status`

**业务规则**：
- 学号唯一
- 学生必须关联专业和班级
- 有关联成绩/考勤/奖惩时建议停用而非删除
- 教师只能查看相关班级/课程的学生

---

## 7. 教师管理（teachers）

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/teachers` | **管理员** | 教师列表 |
| GET | `/api/teachers/:id` | 管理员/本人 | 教师详情 |
| POST | `/api/teachers` | **管理员** | 新增教师 |
| PUT | `/api/teachers/:id` | **管理员** | 编辑教师 |
| DELETE | `/api/teachers/:id` | **管理员** | 删除教师 |

**查询参数**：`page`、`pageSize`、`keyword`（姓名/编号）、`department`、`title`、`isHeadTeacher`

**业务规则**：
- 教师编号唯一
- 已关联课程/班级时建议停用而非删除

---

## 8. 专业管理（majors）

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/majors` | 登录 | 专业列表 |
| GET | `/api/majors/:id` | 登录 | 专业详情 |
| POST | `/api/majors` | **管理员** | 新增专业 |
| PUT | `/api/majors/:id` | **管理员** | 编辑专业 |
| DELETE | `/api/majors/:id` | **管理员** | 删除专业 |

**查询参数**：`page`、`pageSize`、`keyword`、`department`、`status`

**业务规则**：
- 专业编号唯一
- 有关联班级/学生时建议停用而非删除

---

## 9. 班级管理（classes）

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/classes` | 登录 | 班级列表 |
| GET | `/api/classes/:id` | 相关用户 | 班级详情 |
| POST | `/api/classes` | **管理员** | 新增班级 |
| PUT | `/api/classes/:id` | **管理员** | 编辑班级 |
| DELETE | `/api/classes/:id` | **管理员** | 删除班级 |
| GET | `/api/classes/:id/students` | 管理员/相关教师 | 班级学生列表 |

**查询参数**：`page`、`pageSize`、`keyword`、`grade`、`majorId`、`headTeacherId`、`status`

**业务规则**：
- 班级编号唯一
- 必须关联专业
- 班级人数从学生表统计

---

## 10. 课程管理（courses）

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/courses` | 登录 | 课程列表 |
| GET | `/api/courses/:id` | 相关用户 | 课程详情 |
| POST | `/api/courses` | **管理员** | 新增课程 |
| PUT | `/api/courses/:id` | **管理员** | 编辑课程 |
| DELETE | `/api/courses/:id` | **管理员** | 删除课程 |
| POST | `/api/courses/:id/classes` | **管理员** | 给课程分配班级 |
| GET | `/api/courses/:id/classes` | 管理员/相关教师 | 获取课程关联班级 |

**查询参数**：`page`、`pageSize`、`keyword`、`type`、`teacherId`、`majorId`、`grade`、`semester`、`status`

**业务规则**：
- 课程编号唯一
- 必须关联任课教师
- 有成绩/考勤记录时建议停用而非删除

---

## 11. 成绩管理（scores）

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/scores` | 登录 | 成绩列表 |
| GET | `/api/scores/:id` | 相关用户 | 成绩详情 |
| POST | `/api/scores` | 管理员/**教师** | 新增成绩 |
| PUT | `/api/scores/:id` | 管理员/**相关教师** | 编辑成绩 |
| DELETE | `/api/scores/:id` | **管理员** | 删除成绩 |
| GET | `/api/scores/statistics` | 管理员/教师 | 成绩统计（平均分/最高/最低/及格率） |

**查询参数**：`page`、`pageSize`、`studentId`、`courseId`、`classId`、`semester`、`level`、`keyword`

**业务规则**：
- 成绩 0-100 分
- 同一学生+同一课程+同一学期唯一
- 总评 = 平时×40% + 期末×60%（自动计算）
- 等级自动生成：90-100优秀 / 80-89良好 / 70-79中等 / 60-69及格 / 0-59不及格
- 教师只能管理自己课程的成绩
- 学生只能查看个人成绩

---

## 12. 考勤管理（attendance）

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/attendance` | 登录 | 考勤列表 |
| GET | `/api/attendance/:id` | 相关用户 | 考勤详情 |
| POST | `/api/attendance` | 管理员/**教师** | 新增考勤记录 |
| PUT | `/api/attendance/:id` | 管理员/**相关教师** | 编辑考勤 |
| DELETE | `/api/attendance/:id` | **管理员** | 删除考勤 |
| POST | `/api/attendance/batch` | 管理员/教师 | 批量新增考勤（可选） |
| GET | `/api/attendance/statistics` | 登录 | 考勤统计 |

**查询参数**：`page`、`pageSize`、`studentId`、`courseId`、`classId`、`status`、`startDate`、`endDate`、`keyword`

**业务规则**：
- 考勤必须关联学生、课程、日期
- 同一学生+同一课程+同一天唯一
- 状态：normal / late / leave_early / leave / absent
- 教师只能登记自己课程的考勤
- 学生只能查看个人考勤

---

## 13. 奖惩管理（rewards-punishments）

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/rewards-punishments` | 登录 | 奖惩列表 |
| GET | `/api/rewards-punishments/:id` | 相关用户 | 奖惩详情 |
| POST | `/api/rewards-punishments` | **管理员** | 新增奖惩 |
| PUT | `/api/rewards-punishments/:id` | **管理员** | 编辑奖惩 |
| DELETE | `/api/rewards-punishments/:id` | **管理员** | 删除奖惩 |

**查询参数**：`page`、`pageSize`、`studentId`、`classId`、`type`（reward/punishment）、`startDate`、`endDate`、`keyword`

**业务规则**：
- 必须关联学生
- 类型固定为 reward 或 punishment
- 学生只能查看个人记录，教师查看相关学生

---

## 14. 通知公告（notices）

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/notices` | 登录 | 公告列表 |
| GET | `/api/notices/:id` | 登录 | 公告详情（教师/学生不能看草稿） |
| POST | `/api/notices` | **管理员** | 新增公告 |
| PUT | `/api/notices/:id` | **管理员** | 编辑公告 |
| DELETE | `/api/notices/:id` | **管理员** | 删除公告 |

**查询参数**：`page`、`pageSize`、`keyword`、`category`、`status`、`isTop`

**业务规则**：
- 草稿仅管理员可见
- 置顶公告优先显示
- 首页展示最近已发布公告

---

## 15. 用户管理（users）

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/users` | **管理员** | 用户列表 |
| GET | `/api/users/:id` | 管理员 | 用户详情 |
| POST | `/api/users` | **管理员** | 新增用户 |
| PUT | `/api/users/:id` | **管理员** | 编辑用户 |
| DELETE | `/api/users/:id` | **管理员** | 删除用户（不能删自己） |
| PUT | `/api/users/:id/reset-password` | **管理员** | 重置密码（默认123456） |
| PUT | `/api/users/:id/status` | **管理员** | 启用/禁用用户 |

**查询参数**：`page`、`pageSize`、`keyword`、`role`、`status`

**业务规则**：
- 用户名唯一
- 密码 bcrypt 加密
- 教师角色建议关联 teacherId，学生角色关联 studentId
- 禁用账号不能登录

---

## 16. 个人中心（profile）

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/profile` | 已登录 | 获取个人中心信息 |
| PUT | `/api/profile/password` | 已登录 | 修改密码（需原密码） |
| GET | `/api/profile/scores` | 学生 | 我的成绩（同 `/api/scores` 学生权限） |
| GET | `/api/profile/attendance` | 学生 | 我的考勤 |
| GET | `/api/profile/rewards-punishments` | 学生 | 我的奖惩 |
| GET | `/api/profile/courses` | 教师/学生 | 我的课程 |

---

## 17. 操作日志（logs）（可选）

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/logs` | **管理员** | 日志列表 |
| DELETE | `/api/logs/:id` | 管理员 | 删除日志（可选） |

**查询参数**：`page`、`pageSize`、`username`、`role`、`module`、`action`、`startDate`、`endDate`

---

## 18. 下拉选项（options）

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/options/majors` | 登录 | 专业下拉选项 |
| GET | `/api/options/classes` | 登录 | 班级下拉选项（可传 `majorId`、`grade` 筛选） |
| GET | `/api/options/teachers` | 管理员/教师 | 教师下拉选项 |
| GET | `/api/options/courses` | 登录 | 课程下拉选项（按角色过滤） |
| GET | `/api/options/students` | 管理员/教师 | 学生下拉选项（可传 `classId`、`courseId` 筛选） |
| GET | `/api/health` | 公开 | 健康检查 |

---

## 19. 导入导出（import/export）（可选）

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/export/students` | **管理员** | 导出学生数据（CSV/Excel） |
| GET | `/api/export/scores` | 管理员/**教师** | 导出成绩数据 |
| POST | `/api/import/students` | **管理员** | 导入学生数据（multipart/form-data） |
| POST | `/api/import/scores` | 管理员（可选教师） | 导入成绩数据 |

---

## 20. 权限矩阵

| 模块 | 管理员 | 教师 | 学生 |
|---|---|---|---|
| auth | ✓ | ✓ | ✓ |
| dashboard | 全量 | 相关 | 个人 |
| students | 全部管理 | 相关查看 | × |
| teachers | 全部管理 | 查看本人 | × |
| majors | 全部管理 | 查看 | 个人相关 |
| classes | 全部管理 | 相关查看 | 个人相关 |
| courses | 全部管理 | 所授课程 | 个人相关 |
| scores | 全部管理 | 所授课程 | 个人 |
| attendance | 全部管理 | 所授课程 | 个人 |
| rewards-punishments | 全部管理 | 相关查看 | 个人 |
| notices | 全部管理 | 已发布查看 | 已发布查看 |
| users | 全部管理 | × | × |
| profile | 个人信息 | 个人信息 | 个人信息 |
| logs | 查看 | × | × |

---

## 21. 核心业务规则速查

| 模块 | 核心规则 |
|---|---|
| 登录 | 密码 bcrypt 校验、登录更新 lastLoginAt、状态 disabled 禁止登录 |
| 学生 | 学号唯一、必填专业/班级、有关联记录时建议停用 |
| 教师 | 教师编号唯一、已关联课程/班级时建议停用 |
| 专业 | 专业编号唯一、有关联班级/学生时建议停用 |
| 班级 | 班级编号唯一、必须关联专业、人数从学生表统计 |
| 课程 | 课程编号唯一、必须关联教师、有成绩/考勤时建议停用 |
| 成绩 | 0-100分、学生+课程+学期唯一、总评自动计算、等级自动生成 |
| 考勤 | 学生+课程+日期唯一、状态固定枚举、教师只能登记自己课程 |
| 奖惩 | 必须关联学生、类型固定、教师仅查看相关 |
| 公告 | 草稿仅管理员可见、置顶优先、首页展示已发布 |
| 用户 | 用户名唯一、密码加密、角色必须关联人员 |

---

## 22. 后端目录结构建议

```
backend/src/
  app.js
  routes/          # 路由
    auth.routes.js
    student.routes.js
    teacher.routes.js
    ...
  controllers/     # 控制器
  middlewares/     # 中间件（auth、role、error、validate）
  services/        # 业务服务（score、attendance、dashboard）
  utils/           # 工具函数（response、pagination、password、token、score计算）
```

---

## 23. 工具函数

**成绩计算**：
```js
totalScore = Number((usualScore * 0.4 + finalScore * 0.6).toFixed(1))

function getLevel(score) {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 70) return 'medium'
  if (score >= 60) return 'pass'
  return 'fail'
}
```

**分页处理**：
```js
const skip = (page - 1) * pageSize
```

---

## 24. 测试建议

**必测场景**：
1. 登录成功/失败
2. 无 token 访问返回 401
3. 无权限访问返回 403
4. 学号/教师编号/课程编号重复
5. 成绩分数范围校验
6. 重复成绩/考勤无法录入
7. 教师只能操作自己课程
8. 学生只能查看个人数据
9. 删除有关联数据时提示
10. 分页、搜索、筛选正常

---

## 25. AI 开发提示词

```
请根据 docs/04_API接口设计.md 开发后端 API。

技术栈：Node.js + Express + Prisma + SQLite + JWT + bcrypt

要求：
1. 接口路径、方法、参数、响应格式与文档一致
2. 统一响应格式 { code, message, data }
3. 列表接口返回 { list, pagination }
4. 除登录和 health 外，接口需 JWT 认证
5. 按 admin/teacher/student 三类角色做权限控制
6. 先完成 auth、students、teachers、majors、classes、courses 模块
7. 再完成 scores、attendance、notices、profile 模块
8. 最后完成 users、logs、options 等辅助模块
9. 不要一次性重构整个项目
10. 每完成一个模块说明修改了哪些文件

优先保证接口可运行、权限正确、数据库读写正常。
```

---

## 26. 验收标准

| 类别 | 验收点 |
|---|---|
| 基础规范 | 统一响应格式、状态码正确、JWT 认证正常 |
| CRUD | 所有必做模块的增删改查正常 |
| 业务规则 | 编号唯一、成绩自动计算、考勤唯一、权限控制 |
| 前后端联调 | 前端页面能正常调用接口、错误提示正确、分页搜索筛选可用 |