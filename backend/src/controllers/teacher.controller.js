const { PrismaClient } = require('@prisma/client')
const { success, fail } = require('../utils/response')
const { getPagination } = require('../utils/pagination')

const prisma = new PrismaClient()

/**
 * GET /api/teachers - 获取教师列表
 */
async function getTeachers(req, res) {
  try {
    const { page, pageSize, skip, take } = getPagination(req.query)
    const { keyword, department, title, isHeadTeacher } = req.query

    const where = {}
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { teacherNo: { contains: keyword } }
      ]
    }
    if (department) where.department = { contains: department }
    if (title) where.title = title
    if (isHeadTeacher !== undefined) where.isHeadTeacher = isHeadTeacher === 'true'

    const [list, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.teacher.count({ where })
    ])

    return success(res, {
      list,
      pagination: { page, pageSize, total }
    }, '查询成功')
  } catch (error) {
    console.error('获取教师列表失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * GET /api/teachers/:id - 获取教师详情
 */
async function getTeacherById(req, res) {
  try {
    const id = parseInt(req.params.id)
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        courses: { select: { id: true, name: true, semester: true } },
        headClasses: { select: { id: true, name: true } }
      }
    })

    if (!teacher) {
      return fail(res, 404, '教师不存在')
    }

    return success(res, teacher, '查询成功')
  } catch (error) {
    console.error('获取教师详情失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * POST /api/teachers - 新增教师
 */
async function createTeacher(req, res) {
  try {
    const { teacherNo, name, gender, department, title, phone, email, isHeadTeacher, remark } = req.body

    if (!teacherNo || !name || !department) {
      return fail(res, 400, '教师编号、姓名和所属院系不能为空')
    }

    const existing = await prisma.teacher.findUnique({ where: { teacherNo } })
    if (existing) {
      return fail(res, 409, '教师编号已存在')
    }

    const teacher = await prisma.teacher.create({
      data: {
        teacherNo,
        name,
        gender: gender || 'unknown',
        department,
        title: title || null,
        phone: phone || null,
        email: email || null,
        isHeadTeacher: isHeadTeacher || false,
        remark: remark || null
      }
    })

    return success(res, { id: teacher.id }, '新增教师成功')
  } catch (error) {
    console.error('新增教师失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * PUT /api/teachers/:id - 编辑教师
 */
async function updateTeacher(req, res) {
  try {
    const id = parseInt(req.params.id)
    const { teacherNo, name, gender, department, title, phone, email, isHeadTeacher, remark } = req.body

    const teacher = await prisma.teacher.findUnique({ where: { id } })
    if (!teacher) {
      return fail(res, 404, '教师不存在')
    }

    if (teacherNo && teacherNo !== teacher.teacherNo) {
      const existing = await prisma.teacher.findUnique({ where: { teacherNo } })
      if (existing) {
        return fail(res, 409, '教师编号已存在')
      }
    }

    const updated = await prisma.teacher.update({
      where: { id },
      data: {
        ...(teacherNo !== undefined && { teacherNo }),
        ...(name !== undefined && { name }),
        ...(gender !== undefined && { gender }),
        ...(department !== undefined && { department }),
        ...(title !== undefined && { title }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(isHeadTeacher !== undefined && { isHeadTeacher }),
        ...(remark !== undefined && { remark })
      }
    })

    return success(res, { id: updated.id }, '编辑教师成功')
  } catch (error) {
    console.error('编辑教师失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * DELETE /api/teachers/:id - 删除教师
 */
async function deleteTeacher(req, res) {
  try {
    const id = parseInt(req.params.id)

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        _count: { select: { courses: true, headClasses: true } }
      }
    })

    if (!teacher) {
      return fail(res, 404, '教师不存在')
    }

    if (teacher._count.courses > 0 || teacher._count.headClasses > 0) {
      return fail(res, 400, `该教师关联了 ${teacher._count.courses} 门课程和 ${teacher._count.headClasses} 个班级，无法删除`)
    }

    await prisma.teacher.delete({ where: { id } })

    return success(res, null, '删除教师成功')
  } catch (error) {
    console.error('删除教师失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

module.exports = { getTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher }
