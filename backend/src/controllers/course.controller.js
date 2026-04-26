const { PrismaClient } = require('@prisma/client')
const { success, fail } = require('../utils/response')
const { getPagination } = require('../utils/pagination')

const prisma = new PrismaClient()

/**
 * GET /api/courses - 获取课程列表
 */
async function getCourses(req, res) {
  try {
    const { page, pageSize, skip, take } = getPagination(req.query)
    const { keyword, type, teacherId, majorId, grade, semester, status } = req.query

    const where = {}
    if (keyword) {
      where.OR = [{ name: { contains: keyword } }, { courseNo: { contains: keyword } }]
    }
    if (type) where.type = type
    if (teacherId) where.teacherId = parseInt(teacherId)
    if (majorId) where.majorId = parseInt(majorId)
    if (grade) where.grade = grade
    if (semester) where.semester = { contains: semester }
    if (status) where.status = status

    // 教师只能看自己的课程
    if (req.user.role === 'teacher') {
      const teacher = await prisma.teacher.findFirst({ where: { id: req.user.id } })
      if (teacher) where.teacherId = teacher.id
      else where.id = -1
    }

    // 学生只能看相关课程
    if (req.user.role === 'student') {
      const student = await prisma.student.findFirst({ where: { id: req.user.id } })
      if (student) {
        where.courseClasses = { some: { classId: student.classId } }
      } else {
        where.id = -1
      }
    }

    const [list, total] = await Promise.all([
      prisma.course.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        include: {
          teacher: { select: { name: true } },
          major: { select: { name: true } }
        }
      }),
      prisma.course.count({ where })
    ])

    const result = list.map(item => ({
      id: item.id, courseNo: item.courseNo, name: item.name,
      type: item.type, credit: item.credit,
      teacherId: item.teacherId, teacherName: item.teacher?.name || '',
      majorId: item.majorId, majorName: item.major?.name || '',
      grade: item.grade, semester: item.semester, status: item.status
    }))

    return success(res, { list: result, pagination: { page, pageSize, total } }, '查询成功')
  } catch (error) {
    console.error('获取课程列表失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * GET /api/courses/:id - 获取课程详情
 */
async function getCourseById(req, res) {
  try {
    const id = parseInt(req.params.id)
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        teacher: { select: { id: true, name: true, teacherNo: true } },
        major: { select: { id: true, name: true } },
        courseClasses: {
          include: { class: { select: { id: true, name: true, grade: true } } }
        }
      }
    })
    if (!course) return fail(res, 404, '课程不存在')
    return success(res, {
      id: course.id, courseNo: course.courseNo, name: course.name,
      type: course.type, credit: course.credit,
      teacherId: course.teacherId, teacherName: course.teacher?.name,
      majorId: course.majorId, majorName: course.major?.name,
      grade: course.grade, semester: course.semester, status: course.status,
      remark: course.remark,
      classes: course.courseClasses.map(cc => ({
        id: cc.class.id, name: cc.class.name, grade: cc.class.grade
      })),
      createdAt: course.createdAt
    }, '查询成功')
  } catch (error) {
    console.error('获取课程详情失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * POST /api/courses - 新增课程
 */
async function createCourse(req, res) {
  try {
    const { courseNo, name, type, credit, teacherId, majorId, grade, semester, status, remark } = req.body
    if (!courseNo || !name || !teacherId || !grade || !semester) {
      return fail(res, 400, '课程编号、名称、教师、年级和学期不能为空')
    }
    if (credit !== undefined && credit < 0) {
      return fail(res, 400, '学分不能小于 0')
    }

    const existing = await prisma.course.findUnique({ where: { courseNo } })
    if (existing) return fail(res, 409, '课程编号已存在')

    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } })
    if (!teacher) return fail(res, 400, '所选教师不存在')

    const course = await prisma.course.create({
      data: {
        courseNo, name, type: type || 'required', credit: credit || 0,
        teacherId, majorId: majorId || null, grade, semester,
        status: status || 'enabled', remark: remark || null
      }
    })
    return success(res, { id: course.id }, '新增课程成功')
  } catch (error) {
    console.error('新增课程失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * PUT /api/courses/:id - 编辑课程
 */
async function updateCourse(req, res) {
  try {
    const id = parseInt(req.params.id)
    const course = await prisma.course.findUnique({ where: { id } })
    if (!course) return fail(res, 404, '课程不存在')

    const { courseNo, name, type, credit, teacherId, majorId, grade, semester, status, remark } = req.body

    if (courseNo && courseNo !== course.courseNo) {
      const existing = await prisma.course.findUnique({ where: { courseNo } })
      if (existing) return fail(res, 409, '课程编号已存在')
    }
    if (teacherId) {
      const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } })
      if (!teacher) return fail(res, 400, '所选教师不存在')
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...(courseNo !== undefined && { courseNo }),
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(credit !== undefined && { credit }),
        ...(teacherId !== undefined && { teacherId }),
        ...(majorId !== undefined && { majorId }),
        ...(grade !== undefined && { grade }),
        ...(semester !== undefined && { semester }),
        ...(status !== undefined && { status }),
        ...(remark !== undefined && { remark })
      }
    })
    return success(res, { id: updated.id }, '编辑课程成功')
  } catch (error) {
    console.error('编辑课程失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * DELETE /api/courses/:id - 删除课程
 */
async function deleteCourse(req, res) {
  try {
    const id = parseInt(req.params.id)
    const course = await prisma.course.findUnique({
      where: { id },
      include: { _count: { select: { scores: true, attendance: true } } }
    })
    if (!course) return fail(res, 404, '课程不存在')
    if (course._count.scores > 0 || course._count.attendance > 0) {
      return fail(res, 400, `该课程有 ${course._count.scores} 条成绩和 ${course._count.attendance} 条考勤记录，无法删除`)
    }
    await prisma.courseClass.deleteMany({ where: { courseId: id } })
    await prisma.course.delete({ where: { id } })
    return success(res, null, '删除课程成功')
  } catch (error) {
    console.error('删除课程失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * POST /api/courses/:id/classes - 分配班级
 */
async function assignClasses(req, res) {
  try {
    const courseId = parseInt(req.params.id)
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return fail(res, 404, '课程不存在')

    const { classIds } = req.body
    if (!classIds || !Array.isArray(classIds)) {
      return fail(res, 400, '请提供班级 ID 列表')
    }

    // 删除旧关联，写入新关联
    await prisma.courseClass.deleteMany({ where: { courseId } })
    for (const classId of classIds) {
      await prisma.courseClass.create({ data: { courseId, classId } })
    }
    return success(res, null, '分配班级成功')
  } catch (error) {
    console.error('分配班级失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * GET /api/courses/:id/classes - 获取课程关联班级
 */
async function getCourseClasses(req, res) {
  try {
    const courseId = parseInt(req.params.id)
    const courseClasses = await prisma.courseClass.findMany({
      where: { courseId },
      include: { class: { select: { id: true, name: true, grade: true } } }
    })
    return success(res, courseClasses.map(cc => ({
      id: cc.class.id, name: cc.class.name, grade: cc.class.grade
    })), '查询成功')
  } catch (error) {
    console.error('获取课程班级失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

module.exports = { getCourses, getCourseById, createCourse, updateCourse, deleteCourse, assignClasses, getCourseClasses }
