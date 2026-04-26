const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
  console.log('开始导入种子数据...')

  // 读取 JSON 数据文件
  const dataPath = path.join(__dirname, '..', '..', 'mock_school_data', 'seed_data.json')
  if (!fs.existsSync(dataPath)) {
    console.error(`数据文件不存在: ${dataPath}`)
    console.error('请先运行: python docs/generate_fake_school_data.py')
    process.exit(1)
  }

  const raw = fs.readFileSync(dataPath, 'utf-8')
  const data = JSON.parse(raw)

  console.log(`数据统计: ${data.meta.counts.students} 名学生, ${data.meta.counts.teachers} 名教师, ${data.meta.counts.courses} 门课程`)

  // ============================
  // 清空旧数据（逆序删除，避免外键冲突）
  // ============================
  console.log('清空旧数据...')
  await prisma.operationLog.deleteMany()
  await prisma.rewardPunishment.deleteMany()
  await prisma.notice.deleteMany()
  await prisma.attendanceRecord.deleteMany()
  await prisma.score.deleteMany()
  await prisma.courseClass.deleteMany()
  await prisma.course.deleteMany()
  await prisma.student.deleteMany()
  await prisma.class.deleteMany()
  await prisma.teacher.deleteMany()
  await prisma.major.deleteMany()
  await prisma.user.deleteMany()
  console.log('旧数据已清空')

  // ============================
  // 1. 导入专业 (majors)
  // ============================
  console.log('导入专业数据...')
  for (const item of data.majors) {
    await prisma.major.create({
      data: {
        id: item.id,
        majorNo: item.majorNo,
        name: item.name,
        department: item.department,
        duration: item.duration,
        description: item.description || null,
        status: item.status
      }
    })
  }
  console.log(`  ✓ 已导入 ${data.majors.length} 个专业`)

  // ============================
  // 2. 导入教师 (teachers)
  // ============================
  console.log('导入教师数据...')
  for (const item of data.teachers) {
    await prisma.teacher.create({
      data: {
        id: item.id,
        teacherNo: item.teacherNo,
        name: item.name,
        gender: item.gender,
        department: item.department,
        title: item.title || null,
        phone: item.phone || null,
        email: item.email || null,
        isHeadTeacher: item.isHeadTeacher || false,
        remark: item.remark || null
      }
    })
  }
  console.log(`  ✓ 已导入 ${data.teachers.length} 名教师`)

  // ============================
  // 3. 导入班级 (classes)
  // ============================
  console.log('导入班级数据...')
  for (const item of data.classes) {
    await prisma.class.create({
      data: {
        id: item.id,
        classNo: item.classNo,
        name: item.name,
        grade: item.grade,
        majorId: item.majorId,
        headTeacherId: item.headTeacherId || null,
        status: item.status,
        remark: item.remark || null
      }
    })
  }
  console.log(`  ✓ 已导入 ${data.classes.length} 个班级`)

  // ============================
  // 4. 导入学生 (students)
  // ============================
  console.log('导入学生数据...')
  for (const item of data.students) {
    await prisma.student.create({
      data: {
        id: item.id,
        studentNo: item.studentNo,
        name: item.name,
        gender: item.gender,
        birthDate: item.birthDate ? new Date(item.birthDate) : null,
        phone: item.phone || null,
        address: item.address || null,
        grade: item.grade,
        enrollmentDate: item.enrollmentDate ? new Date(item.enrollmentDate) : new Date(),
        status: item.status,
        avatar: item.avatar || null,
        remark: item.remark || null,
        majorId: item.majorId,
        classId: item.classId
      }
    })
  }
  console.log(`  ✓ 已导入 ${data.students.length} 名学生`)

  // ============================
  // 5. 导入课程 (courses)
  // ============================
  console.log('导入课程数据...')
  for (const item of data.courses) {
    await prisma.course.create({
      data: {
        id: item.id,
        courseNo: item.courseNo,
        name: item.name,
        type: item.type,
        credit: item.credit,
        teacherId: item.teacherId,
        majorId: item.majorId || null,
        grade: item.grade,
        semester: item.semester,
        status: item.status,
        remark: item.remark || null
      }
    })
  }
  console.log(`  ✓ 已导入 ${data.courses.length} 门课程`)

  // ============================
  // 6. 导入课程班级关联 (courseClasses)
  // ============================
  console.log('导入课程班级关联...')
  for (const item of data.courseClasses) {
    await prisma.courseClass.create({
      data: {
        id: item.id,
        courseId: item.courseId,
        classId: item.classId
      }
    })
  }
  console.log(`  ✓ 已导入 ${data.courseClasses.length} 条关联`)

  // ============================
  // 7. 导入用户 (users) - 密码必须 bcrypt 加密
  // ============================
  console.log('导入用户数据（密码加密中）...')
  const saltRounds = 10
  for (const item of data.users) {
    // plainPassword 必须用 bcrypt 加密，不能直接写入 password
    const plainPassword = item.plainPassword || '123456'
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds)

    await prisma.user.create({
      data: {
        id: item.id,
        username: item.username,
        password: hashedPassword,
        nickname: item.nickname || null,
        role: item.role,
        status: item.status,
        teacherId: item.teacherId || null,
        studentId: item.studentId || null,
        lastLoginAt: item.lastLoginAt ? new Date(item.lastLoginAt) : null
      }
    })
  }
  console.log(`  ✓ 已导入 ${data.users.length} 个用户（密码已加密）`)

  // ============================
  // 8. 导入成绩 (scores)
  // ============================
  console.log('导入成绩数据...')
  for (const item of data.scores) {
    await prisma.score.create({
      data: {
        id: item.id,
        studentId: item.studentId,
        courseId: item.courseId,
        semester: item.semester,
        usualScore: item.usualScore,
        finalScore: item.finalScore,
        totalScore: item.totalScore,
        level: item.level,
        recorderId: item.recorderId || null,
        remark: item.remark || null
      }
    })
  }
  console.log(`  ✓ 已导入 ${data.scores.length} 条成绩`)

  // ============================
  // 9. 导入考勤 (attendanceRecords)
  // ============================
  console.log('导入考勤数据...')
  for (const item of data.attendanceRecords) {
    await prisma.attendanceRecord.create({
      data: {
        id: item.id,
        studentId: item.studentId,
        courseId: item.courseId,
        attendanceDate: new Date(item.attendanceDate),
        status: item.status,
        recorderId: item.recorderId || null,
        remark: item.remark || null
      }
    })
  }
  console.log(`  ✓ 已导入 ${data.attendanceRecords.length} 条考勤`)

  // ============================
  // 10. 导入公告 (notices)
  // ============================
  console.log('导入公告数据...')
  for (const item of data.notices) {
    await prisma.notice.create({
      data: {
        id: item.id,
        title: item.title,
        content: item.content,
        category: item.category,
        status: item.status,
        isTop: item.isTop || false,
        publisherId: item.publisherId || null,
        publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
        expiredAt: item.expiredAt ? new Date(item.expiredAt) : null,
        viewCount: item.viewCount || 0
      }
    })
  }
  console.log(`  ✓ 已导入 ${data.notices.length} 条公告`)

  // ============================
  // 11. 导入奖惩 (rewardsPunishments)
  // ============================
  console.log('导入奖惩数据...')
  for (const item of data.rewardsPunishments) {
    await prisma.rewardPunishment.create({
      data: {
        id: item.id,
        studentId: item.studentId,
        type: item.type,
        title: item.title,
        level: item.level || null,
        recordDate: new Date(item.recordDate),
        description: item.description || null,
        recorderUserId: item.recorderUserId || null
      }
    })
  }
  console.log(`  ✓ 已导入 ${data.rewardsPunishments.length} 条奖惩`)

  // ============================
  // 12. 导入操作日志 (operationLogs)
  // ============================
  console.log('导入操作日志...')
  for (const item of data.operationLogs) {
    await prisma.operationLog.create({
      data: {
        id: item.id,
        userId: item.userId || null,
        username: item.username || null,
        role: item.role || null,
        module: item.module,
        action: item.action,
        description: item.description || null,
        result: item.result,
        ip: item.ip || null,
        createdAt: new Date(item.createdAt)
      }
    })
  }
  console.log(`  ✓ 已导入 ${data.operationLogs.length} 条日志`)

  console.log('\n种子数据导入完成！')
  console.log('默认演示账号：')
  console.log('  管理员：admin / 123456')
  console.log('  教师：teacher001 / 123456')
  console.log('  学生：student001 / 123456')
}

main()
  .catch((e) => {
    console.error('种子数据导入失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
