const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

/**
 * 计算总评成绩
 * totalScore = usualScore * 0.4 + finalScore * 0.6
 */
function calculateTotalScore(usualScore, finalScore) {
  const total = Number((usualScore * 0.4 + finalScore * 0.6).toFixed(1))
  return total
}

/**
 * 根据总评获取等级
 */
function getLevel(totalScore) {
  if (totalScore >= 90) return 'excellent'
  if (totalScore >= 80) return 'good'
  if (totalScore >= 70) return 'medium'
  if (totalScore >= 60) return 'pass'
  return 'fail'
}

/**
 * 验证分数范围
 */
function validateScore(score) {
  const num = Number(score)
  return !isNaN(num) && num >= 0 && num <= 100
}

/**
 * 获取成绩列表（带分页和筛选）
 */
async function getScores(req, res) {
  try {
    const { page, pageSize, skip, take } = require('../utils/pagination').getPagination(req.query)
    const { studentId, courseId, classId, semester, level, keyword } = req.query

    const where = {}

    // 关键词搜索（学生姓名/学号 或 课程名称/编号）
    if (keyword) {
      where.OR = [
        { student: { name: { contains: keyword } } },
        { student: { studentNo: { contains: keyword } } },
        { course: { name: { contains: keyword } } },
        { course: { courseNo: { contains: keyword } } }
      ]
    }

    if (studentId) where.studentId = parseInt(studentId)
    if (courseId) where.courseId = parseInt(courseId)
    if (classId) where.student = { classId: parseInt(classId) }
    if (semester) where.semester = { contains: semester }
    if (level) where.level = level

    // 权限控制：教师只能看自己课程的成绩
    if (req.user.role === 'teacher') {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { teacherId: true }
      })
      if (user && user.teacherId) {
        where.course = { teacherId: user.teacherId }
      } else {
        where.id = -1 // 无数据
      }
    }

    // 权限控制：学生只能看自己的成绩
    if (req.user.role === 'student') {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { studentId: true }
      })
      if (user && user.studentId) {
        where.studentId = user.studentId
      } else {
        where.id = -1
      }
    }

    const [list, total] = await Promise.all([
      prisma.score.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            select: { id: true, studentNo: true, name: true, grade: true,
              class: { select: { id: true, name: true } }
            }
          },
          course: {
            select: { id: true, courseNo: true, name: true, semester: true }
          },
          recorder: {
            select: { id: true, name: true, teacherNo: true }
          }
        }
      }),
      prisma.score.count({ where })
    ])

    const result = list.map(item => ({
      id: item.id,
      studentId: item.studentId,
      studentNo: item.student.studentNo,
      studentName: item.student.name,
      studentGrade: item.student.grade,
      className: item.student.class?.name || '',
      courseId: item.courseId,
      courseName: item.course.name,
      courseSemester: item.course.semester,
      semester: item.semester,
      usualScore: item.usualScore,
      finalScore: item.finalScore,
      totalScore: item.totalScore,
      level: item.level,
      recorderId: item.recorderId,
      recorderName: item.recorder?.name || '',
      remark: item.remark,
      createdAt: item.createdAt
    }))

    return require('../utils/response').success(res, {
      list: result,
      pagination: { page, pageSize, total }
    }, '查询成功')
  } catch (error) {
    console.error('获取成绩列表失败:', error)
    return require('../utils/response').fail(res, 500, '服务器错误: ' + error.message)
  }
}

/**
 * 获取成绩详情
 */
async function getScoreById(req, res) {
  try {
    const id = parseInt(req.params.id)
    const score = await prisma.score.findUnique({
      where: { id },
      include: {
        student: {
          select: { id: true, studentNo: true, name: true, grade: true,
            class: { select: { id: true, name: true } }
          }
        },
        course: {
          select: { id: true, courseNo: true, name: true, semester: true, teacherId: true }
        },
        recorder: {
          select: { id: true, name: true, teacherNo: true }
        }
      }
    })

    if (!score) {
      return require('../utils/response').fail(res, 404, '成绩记录不存在')
    }

    // 权限校验
    if (req.user.role === 'teacher') {
      // 教师只能查看自己课程的成绩
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { teacherId: true }
      })
      if (!user || !user.teacherId || score.course.teacherId !== user.teacherId) {
        return require('../utils/response').fail(res, 403, '无权限访问')
      }
    }

    if (req.user.role === 'student') {
      // 学生只能查看自己的成绩
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { studentId: true }
      })
      if (!user || !user.studentId || score.studentId !== user.studentId) {
        return require('../utils/response').fail(res, 403, '无权限访问')
      }
    }

    return require('../utils/response').success(res, {
      id: score.id,
      studentId: score.studentId,
      studentNo: score.student.studentNo,
      studentName: score.student.name,
      className: score.student.class?.name || '',
      courseId: score.courseId,
      courseName: score.course.name,
      semester: score.semester,
      usualScore: score.usualScore,
      finalScore: score.finalScore,
      totalScore: score.totalScore,
      level: score.level,
      recorderId: score.recorderId,
      recorderName: score.recorder?.name || '',
      remark: score.remark,
      createdAt: score.createdAt
    }, '查询成功')
  } catch (error) {
    console.error('获取成绩详情失败:', error)
    return require('../utils/response').fail(res, 500, '服务器错误')
  }
}

/**
 * 新增成绩
 */
async function createScore(req, res) {
  try {
    const { studentId, courseId, semester, usualScore, finalScore, remark } = req.body

    // 参数校验
    if (!studentId || !courseId || !semester) {
      return require('../utils/response').fail(res, 400, '学生、课程、学期不能为空')
    }
    if (!validateScore(usualScore)) {
      return require('../utils/response').fail(res, 400, '平时成绩必须在 0 到 100 之间')
    }
    if (!validateScore(finalScore)) {
      return require('../utils/response').fail(res, 400, '期末成绩必须在 0 到 100 之间')
    }

    // 检查学生和课程是否存在
    const [student, course] = await Promise.all([
      prisma.student.findUnique({ where: { id: studentId } }),
      prisma.course.findUnique({ where: { id: courseId } })
    ])

    if (!student) return require('../utils/response').fail(res, 400, '学生不存在')
    if (!course) return require('../utils/response').fail(res, 400, '课程不存在')

    // 教师权限：只能录入自己课程的成绩
    let teacherRecord = null
    if (req.user.role === 'teacher') {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { teacherId: true }
      })
      if (!user || !user.teacherId || course.teacherId !== user.teacherId) {
        return require('../utils/response').fail(res, 403, '只能录入自己课程的成绩')
      }
      teacherRecord = user
    }

    // 检查重复成绩
    const existing = await prisma.score.findFirst({
      where: { studentId, courseId, semester }
    })
    if (existing) {
      return require('../utils/response').fail(res, 409, '该学生在该学期该课程已有成绩记录')
    }

    // 自动计算总评和等级
    const totalScore = calculateTotalScore(usualScore, finalScore)
    const level = getLevel(totalScore)

    const score = await prisma.score.create({
      data: {
        studentId,
        courseId,
        semester,
        usualScore: Number(usualScore),
        finalScore: Number(finalScore),
        totalScore,
        level,
        recorderId: req.user.role === 'teacher' ? teacherRecord.teacherId : null,
        remark: remark || null
      }
    })

    return require('../utils/response').success(res, { id: score.id }, '新增成绩成功')
  } catch (error) {
    console.error('新增成绩失败:', error)
    return require('../utils/response').fail(res, 500, '服务器错误')
  }
}

/**
 * 更新成绩
 */
async function updateScore(req, res) {
  try {
    const id = parseInt(req.params.id)
    const { usualScore, finalScore, remark } = req.body

    const score = await prisma.score.findUnique({
      where: { id },
      include: { course: true }
    })

    if (!score) {
      return require('../utils/response').fail(res, 404, '成绩记录不存在')
    }

    // 权限校验：教师只能修改自己课程的成绩
    if (req.user.role === 'teacher') {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { teacherId: true }
      })
      if (!user || !user.teacherId || score.course.teacherId !== user.teacherId) {
        return require('../utils/response').fail(res, 403, '只能修改自己课程的成绩')
      }
    }

    // 如果提供了成绩字段，进行校验
    if (usualScore !== undefined) {
      if (!validateScore(usualScore)) {
        return require('../utils/response').fail(res, 400, '平时成绩必须在 0 到 100 之间')
      }
    }
    if (finalScore !== undefined) {
      if (!validateScore(finalScore)) {
        return require('../utils/response').fail(res, 400, '期末成绩必须在 0 到 100 之间')
      }
    }

    // 计算新的总评和等级
    const newUsual = usualScore !== undefined ? Number(usualScore) : score.usualScore
    const newFinal = finalScore !== undefined ? Number(finalScore) : score.finalScore
    const totalScore = calculateTotalScore(newUsual, newFinal)
    const level = getLevel(totalScore)

    const updated = await prisma.score.update({
      where: { id },
      data: {
        ...(usualScore !== undefined && { usualScore: Number(usualScore) }),
        ...(finalScore !== undefined && { finalScore: Number(finalScore) }),
        totalScore,
        level,
        ...(remark !== undefined && { remark: remark || null })
      }
    })

    return require('../utils/response').success(res, { id: updated.id }, '修改成绩成功')
  } catch (error) {
    console.error('修改成绩失败:', error)
    return require('../utils/response').fail(res, 500, '服务器错误')
  }
}

/**
 * 删除成绩
 */
async function deleteScore(req, res) {
  try {
    const id = parseInt(req.params.id)

    const score = await prisma.score.findUnique({
      where: { id },
      include: { course: true }
    })

    if (!score) {
      return require('../utils/response').fail(res, 404, '成绩记录不存在')
    }

    // 只有管理员可以删除成绩
    if (req.user.role !== 'admin') {
      return require('../utils/response').fail(res, 403, '无权限删除')
    }

    await prisma.score.delete({ where: { id } })

    return require('../utils/response').success(res, null, '删除成绩成功')
  } catch (error) {
    console.error('删除成绩失败:', error)
    return require('../utils/response').fail(res, 500, '服务器错误')
  }
}

/**
 * 获取成绩统计
 */
async function getScoreStatistics(req, res) {
  try {
    const { classId, courseId, semester } = req.query

    // 构建查询条件
    const where = {}
    if (classId) where.student = { classId: parseInt(classId) }
    if (courseId) where.courseId = parseInt(courseId)
    if (semester) where.semester = { contains: semester }

    // 教师只能看自己课程的成绩
    if (req.user.role === 'teacher') {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { teacherId: true }
      })
      if (user && user.teacherId) {
        where.course = { teacherId: user.teacherId }
      } else {
        return require('../utils/response').success(res, {
          average: 0, max: 0, min: 0, passRate: 0, count: 0, levelDistribution: {}
        }, '查询成功')
      }
    }

    const scores = await prisma.score.findMany({
      where,
      include: { student: true }
    })

    if (scores.length === 0) {
      return require('../utils/response').success(res, {
        average: 0, max: 0, min: 0, passRate: 0, count: 0, levelDistribution: {}
      }, '查询成功')
    }

    const totalScores = scores.map(s => s.totalScore)
    const sum = totalScores.reduce((a, b) => a + b, 0)
    const average = Number((sum / scores.length).toFixed(1))
    const max = Math.max(...totalScores)
    const min = Math.min(...totalScores)
    const passCount = scores.filter(s => s.totalScore >= 60).length
    const passRate = Number(((passCount / scores.length) * 100).toFixed(1))

    // 等级分布统计
    const levelDistribution = {
      excellent: scores.filter(s => s.level === 'excellent').length,
      good: scores.filter(s => s.level === 'good').length,
      medium: scores.filter(s => s.level === 'medium').length,
      pass: scores.filter(s => s.level === 'pass').length,
      fail: scores.filter(s => s.level === 'fail').length
    }

    return require('../utils/response').success(res, {
      count: scores.length,
      average,
      max,
      min,
      passRate,
      levelDistribution
    }, '查询成功')
  } catch (error) {
    console.error('获取成绩统计失败:', error)
    return require('../utils/response').fail(res, 500, '服务器错误')
  }
}

module.exports = {
  getScores,
  getScoreById,
  createScore,
  updateScore,
  deleteScore,
  getScoreStatistics
}
