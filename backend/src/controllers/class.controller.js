const { PrismaClient } = require('@prisma/client')
const { success, fail } = require('../utils/response')
const { getPagination } = require('../utils/pagination')

const prisma = new PrismaClient()

/**
 * GET /api/classes - 获取班级列表
 */
async function getClasses(req, res) {
  try {
    const { page, pageSize, skip, take } = getPagination(req.query)
    const { keyword, grade, majorId, headTeacherId, status } = req.query

    const where = {}
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { classNo: { contains: keyword } }
      ]
    }
    if (grade) where.grade = grade
    if (majorId) where.majorId = parseInt(majorId)
    if (headTeacherId) where.headTeacherId = parseInt(headTeacherId)
    if (status) where.status = status

    // 教师只能看相关班级
    if (req.user.role === 'teacher') {
      const teacher = await prisma.teacher.findFirst({ where: { id: req.user.id } })
      if (teacher) {
        where.OR = [
          { headTeacherId: teacher.id },
          { courseClasses: { some: { course: { teacherId: teacher.id } } } }
        ]
      } else {
        where.id = -1 // 无关联教师记录则返回空
      }
    }

    const [list, total] = await Promise.all([
      prisma.class.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          major: { select: { name: true } },
          headTeacher: { select: { name: true } },
          _count: { select: { students: true } }
        }
      }),
      prisma.class.count({ where })
    ])

    const result = list.map(item => ({
      id: item.id,
      classNo: item.classNo,
      name: item.name,
      grade: item.grade,
      majorId: item.majorId,
      majorName: item.major?.name || '',
      headTeacherId: item.headTeacherId,
      headTeacherName: item.headTeacher?.name || '',
      studentCount: item._count.students,
      status: item.status,
      remark: item.remark,
      createdAt: item.createdAt
    }))

    return success(res, { list: result, pagination: { page, pageSize, total } }, '查询成功')
  } catch (error) {
    console.error('获取班级列表失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * GET /api/classes/:id - 获取班级详情
 */
async function getClassById(req, res) {
  try {
    const id = parseInt(req.params.id)
    const cls = await prisma.class.findUnique({
      where: { id },
      include: {
        major: { select: { id: true, name: true, department: true } },
        headTeacher: { select: { id: true, name: true, teacherNo: true, title: true } },
        _count: { select: { students: true } }
      }
    })
    if (!cls) return fail(res, 404, '班级不存在')
    return success(res, {
      id: cls.id, classNo: cls.classNo, name: cls.name, grade: cls.grade,
      majorId: cls.majorId, majorName: cls.major?.name, majorDepartment: cls.major?.department,
      headTeacherId: cls.headTeacherId, headTeacherName: cls.headTeacher?.name,
      headTeacherNo: cls.headTeacher?.teacherNo, headTeacherTitle: cls.headTeacher?.title,
      studentCount: cls._count.students, status: cls.status, remark: cls.remark,
      createdAt: cls.createdAt
    }, '查询成功')
  } catch (error) {
    console.error('获取班级详情失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * POST /api/classes - 新增班级
 */
async function createClass(req, res) {
  try {
    const { classNo, name, grade, majorId, headTeacherId, status, remark } = req.body
    if (!classNo || !name || !grade || !majorId) {
      return fail(res, 400, '班级编号、名称、年级和专业不能为空')
    }

    const existing = await prisma.class.findUnique({ where: { classNo } })
    if (existing) return fail(res, 409, '班级编号已存在')

    const major = await prisma.major.findUnique({ where: { id: majorId } })
    if (!major) return fail(res, 400, '所选专业不存在')

    if (headTeacherId) {
      const teacher = await prisma.teacher.findUnique({ where: { id: headTeacherId } })
      if (!teacher) return fail(res, 400, '所选教师不存在')
    }

    const cls = await prisma.class.create({
      data: {
        classNo, name, grade, majorId,
        headTeacherId: headTeacherId || null,
        status: status || 'enabled', remark: remark || null
      }
    })

    // 如果设置了班主任，更新教师的 isHeadTeacher
    if (headTeacherId) {
      await prisma.teacher.update({ where: { id: headTeacherId }, data: { isHeadTeacher: true } })
    }

    return success(res, { id: cls.id }, '新增班级成功')
  } catch (error) {
    console.error('新增班级失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * PUT /api/classes/:id - 编辑班级
 */
async function updateClass(req, res) {
  try {
    const id = parseInt(req.params.id)
    const cls = await prisma.class.findUnique({ where: { id } })
    if (!cls) return fail(res, 404, '班级不存在')

    const { classNo, name, grade, majorId, headTeacherId, status, remark } = req.body

    if (classNo && classNo !== cls.classNo) {
      const existing = await prisma.class.findUnique({ where: { classNo } })
      if (existing) return fail(res, 409, '班级编号已存在')
    }
    if (majorId) {
      const major = await prisma.major.findUnique({ where: { id: majorId } })
      if (!major) return fail(res, 400, '所选专业不存在')
    }
    if (headTeacherId !== undefined) {
      if (headTeacherId) {
        const teacher = await prisma.teacher.findUnique({ where: { id: headTeacherId } })
        if (!teacher) return fail(res, 400, '所选教师不存在')
      }
      // 清除旧班主任标记
      if (cls.headTeacherId && cls.headTeacherId !== headTeacherId) {
        await prisma.teacher.update({ where: { id: cls.headTeacherId }, data: { isHeadTeacher: false } })
      }
      if (headTeacherId) {
        await prisma.teacher.update({ where: { id: headTeacherId }, data: { isHeadTeacher: true } })
      }
    }

    const updated = await prisma.class.update({
      where: { id },
      data: {
        ...(classNo !== undefined && { classNo }),
        ...(name !== undefined && { name }),
        ...(grade !== undefined && { grade }),
        ...(majorId !== undefined && { majorId }),
        ...(headTeacherId !== undefined && { headTeacherId }),
        ...(status !== undefined && { status }),
        ...(remark !== undefined && { remark })
      }
    })

    return success(res, { id: updated.id }, '编辑班级成功')
  } catch (error) {
    console.error('编辑班级失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * DELETE /api/classes/:id - 删除班级
 */
async function deleteClass(req, res) {
  try {
    const id = parseInt(req.params.id)
    const cls = await prisma.class.findUnique({
      where: { id },
      include: { _count: { select: { students: true } } }
    })
    if (!cls) return fail(res, 404, '班级不存在')
    if (cls._count.students > 0) {
      return fail(res, 400, `该班级下有 ${cls._count.students} 名学生，无法删除`)
    }

    // 清除班主任标记
    if (cls.headTeacherId) {
      await prisma.teacher.update({ where: { id: cls.headTeacherId }, data: { isHeadTeacher: false } })
    }

    await prisma.class.delete({ where: { id } })
    return success(res, null, '删除班级成功')
  } catch (error) {
    console.error('删除班级失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * GET /api/classes/:id/students - 获取班级学生列表
 */
async function getClassStudents(req, res) {
  try {
    const id = parseInt(req.params.id)
    const cls = await prisma.class.findUnique({ where: { id } })
    if (!cls) return fail(res, 404, '班级不存在')

    const { page, pageSize, skip, take } = getPagination(req.query)
    const { keyword } = req.query

    const where = { classId: id }
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { studentNo: { contains: keyword } }
      ]
    }

    const [list, total] = await Promise.all([
      prisma.student.findMany({
        where, skip, take,
        select: {
          id: true, studentNo: true, name: true, gender: true,
          phone: true, grade: true, status: true, enrollmentDate: true
        },
        orderBy: { studentNo: 'asc' }
      }),
      prisma.student.count({ where })
    ])

    return success(res, { list, pagination: { page, pageSize, total } }, '查询成功')
  } catch (error) {
    console.error('获取班级学生失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

module.exports = { getClasses, getClassById, createClass, updateClass, deleteClass, getClassStudents }
