const { PrismaClient } = require('@prisma/client')
const { success, fail } = require('../utils/response')

const prisma = new PrismaClient()

/**
 * GET /api/options/majors - 专业下拉选项
 */
async function getMajorOptions(req, res) {
  try {
    const majors = await prisma.major.findMany({
      where: { status: 'enabled' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
    const result = majors.map(m => ({ label: m.name, value: m.id }))
    return success(res, result, '查询成功')
  } catch (error) {
    console.error('获取专业选项失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * GET /api/options/teachers - 教师下拉选项
 */
async function getTeacherOptions(req, res) {
  try {
    const teachers = await prisma.teacher.findMany({
      select: { id: true, name: true, teacherNo: true },
      orderBy: { name: 'asc' }
    })
    const result = teachers.map(t => ({ label: `${t.name} (${t.teacherNo})`, value: t.id }))
    return success(res, result, '查询成功')
  } catch (error) {
    console.error('获取教师选项失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * GET /api/options/classes - 班级下拉选项（支持按专业筛选）
 */
async function getClassOptions(req, res) {
  try {
    const { majorId } = req.query
    const where = { status: 'enabled' }
    if (majorId) where.majorId = parseInt(majorId)

    const classes = await prisma.class.findMany({
      where,
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
    return success(res, classes.map(c => ({ label: c.name, value: c.id })), '查询成功')
  } catch (error) {
    console.error('获取班级选项失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * GET /api/options/courses - 课程下拉选项（按角色过滤）
 */
async function getCourseOptions(req, res) {
  try {
    const where = { status: 'enabled' }

    // 教师只能看自己课程
    if (req.user.role === 'teacher') {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { teacherId: true }
      })
      if (user && user.teacherId) where.teacherId = user.teacherId
      else where.id = -1
    }

    const courses = await prisma.course.findMany({
      where,
      select: { id: true, courseNo: true, name: true, semester: true },
      orderBy: { name: 'asc' }
    })
    return success(res, courses, '查询成功')
  } catch (error) {
    console.error('获取课程选项失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * GET /api/options/students - 学生下拉选项（支持按班级筛选）
 */
async function getStudentOptions(req, res) {
  try {
    const { classId } = req.query
    const where = { status: 'studying' }
    if (classId) where.classId = parseInt(classId)

    const students = await prisma.student.findMany({
      where,
      select: {
        id: true, studentNo: true, name: true,
        class: { select: { name: true } }
      },
      orderBy: { studentNo: 'asc' }
    })
    const result = students.map(s => ({
      id: s.id,
      studentNo: s.studentNo,
      name: s.name,
      className: s.class?.name || ''
    }))
    return success(res, result, '查询成功')
  } catch (error) {
    console.error('获取学生选项失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

module.exports = { getMajorOptions, getTeacherOptions, getClassOptions, getCourseOptions, getStudentOptions }
