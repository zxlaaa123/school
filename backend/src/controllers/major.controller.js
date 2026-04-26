const { PrismaClient } = require('@prisma/client')
const { success, fail } = require('../utils/response')
const { getPagination } = require('../utils/pagination')

const prisma = new PrismaClient()

/**
 * GET /api/majors - 获取专业列表
 */
async function getMajors(req, res) {
  try {
    const { page, pageSize, skip, take } = getPagination(req.query)
    const { keyword, department, status } = req.query

    const where = {}
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { majorNo: { contains: keyword } }
      ]
    }
    if (department) where.department = { contains: department }
    if (status) where.status = status

    const [list, total] = await Promise.all([
      prisma.major.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { classes: true, students: true } }
        }
      }),
      prisma.major.count({ where })
    ])

    const result = list.map(item => ({
      id: item.id,
      majorNo: item.majorNo,
      name: item.name,
      department: item.department,
      duration: item.duration,
      description: item.description,
      status: item.status,
      classCount: item._count.classes,
      studentCount: item._count.students,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }))

    return success(res, {
      list: result,
      pagination: { page, pageSize, total }
    }, '查询成功')
  } catch (error) {
    console.error('获取专业列表失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * GET /api/majors/:id - 获取专业详情
 */
async function getMajorById(req, res) {
  try {
    const id = parseInt(req.params.id)
    const major = await prisma.major.findUnique({
      where: { id },
      include: {
        _count: { select: { classes: true, students: true } }
      }
    })

    if (!major) {
      return fail(res, 404, '专业不存在')
    }

    return success(res, {
      id: major.id,
      majorNo: major.majorNo,
      name: major.name,
      department: major.department,
      duration: major.duration,
      description: major.description,
      status: major.status,
      classCount: major._count.classes,
      studentCount: major._count.students,
      createdAt: major.createdAt,
      updatedAt: major.updatedAt
    }, '查询成功')
  } catch (error) {
    console.error('获取专业详情失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * POST /api/majors - 新增专业
 */
async function createMajor(req, res) {
  try {
    const { majorNo, name, department, duration, description, status } = req.body

    if (!majorNo || !name || !department) {
      return fail(res, 400, '专业编号、名称和所属院系不能为空')
    }

    if (duration !== undefined && duration <= 0) {
      return fail(res, 400, '学制必须大于 0')
    }

    // 检查编号唯一
    const existing = await prisma.major.findUnique({ where: { majorNo } })
    if (existing) {
      return fail(res, 409, '专业编号已存在')
    }

    const major = await prisma.major.create({
      data: {
        majorNo,
        name,
        department,
        duration: duration || 4,
        description: description || null,
        status: status || 'enabled'
      }
    })

    return success(res, { id: major.id }, '新增专业成功')
  } catch (error) {
    console.error('新增专业失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * PUT /api/majors/:id - 编辑专业
 */
async function updateMajor(req, res) {
  try {
    const id = parseInt(req.params.id)
    const { majorNo, name, department, duration, description, status } = req.body

    const major = await prisma.major.findUnique({ where: { id } })
    if (!major) {
      return fail(res, 404, '专业不存在')
    }

    // 如果修改了编号，检查唯一
    if (majorNo && majorNo !== major.majorNo) {
      const existing = await prisma.major.findUnique({ where: { majorNo } })
      if (existing) {
        return fail(res, 409, '专业编号已存在')
      }
    }

    const updated = await prisma.major.update({
      where: { id },
      data: {
        ...(majorNo !== undefined && { majorNo }),
        ...(name !== undefined && { name }),
        ...(department !== undefined && { department }),
        ...(duration !== undefined && { duration }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status })
      }
    })

    return success(res, { id: updated.id }, '编辑专业成功')
  } catch (error) {
    console.error('编辑专业失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * DELETE /api/majors/:id - 删除专业
 */
async function deleteMajor(req, res) {
  try {
    const id = parseInt(req.params.id)

    const major = await prisma.major.findUnique({
      where: { id },
      include: {
        _count: { select: { classes: true, students: true } }
      }
    })

    if (!major) {
      return fail(res, 404, '专业不存在')
    }

    // 检查是否有关联班级或学生
    if (major._count.classes > 0 || major._count.students > 0) {
      return fail(res, 400, `该专业下存在 ${major._count.classes} 个班级和 ${major._count.students} 名学生，无法删除`)
    }

    await prisma.major.delete({ where: { id } })

    return success(res, null, '删除专业成功')
  } catch (error) {
    console.error('删除专业失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

module.exports = { getMajors, getMajorById, createMajor, updateMajor, deleteMajor }
