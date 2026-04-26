# 模拟数据说明

本目录由 `generate_fake_school_data.py` 自动生成。

## 说明

这些数据全部是虚构模拟数据，仅用于本地学校学生管理网页仿真系统、毕业设计展示、接口联调和页面测试。

请不要把这些数据当作真实学校数据使用。

## 默认演示账号

| 角色 | 用户名 | 密码 |
|---|---|---|
| 管理员 | admin | 123456 |
| 教师 | teacher001 | 123456 |
| 教师 | teacher002 | 123456 |
| 学生 | student001 | 123456 |
| 学生 | student002 | 123456 |

## 数据数量

| 数据表 | 数量 |
|---|---:|
| users | 113 |
| majors | 5 |
| teachers | 8 |
| classes | 8 |
| students | 100 |
| courses | 20 |
| courseClasses | 23 |
| scores | 324 |
| attendanceRecords | 776 |
| rewardsPunishments | 20 |
| notices | 8 |
| operationLogs | 30 |

## 文件说明

- `seed_data.json`：完整 JSON 数据，适合 Node.js / Prisma seed 脚本读取。
- `csv/`：按表拆分的 CSV 文件，适合检查数据或导入其他工具。
- `README_数据说明.md`：当前说明文件。

## 接入建议

如果你的后端使用 Node.js + Prisma，推荐在 `backend/prisma/seed.js` 中读取 `seed_data.json`，然后使用 Prisma 逐表写入数据库。

注意：
- `plainPassword` 是明文演示密码。
- 真正写入 users 表时，应该使用 bcrypt 加密后保存到 `password` 字段。
