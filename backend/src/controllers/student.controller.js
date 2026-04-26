const { PrismaClient } = require('@prisma/client')
const { success, fail } = require('../utils/response')
const { getPagination } = require('../utils/pagination')

const prisma = new PrismaClient()

/**
 * GET /api/students - 获取学生列表
 */
async function getStudents(req, res) {
  try {
    const { page, pageSize, skip, take } = getPagination(req.query)
    const { keyword, grade, majorId, classId, status } = req.query

    const where = {}
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { studentNo: { contains: keyword } }
      ]
    }
    if (grade) where.grade = grade
    if (majorId) where.majorId = parseInt(majorId)
    if (classId) where.classId = parseInt(classId)
    if (status) where.status = status

    // 教师只能查看相关学生
    if (req.user.role === 'teacher') {
      const teacher = await prisma.teacher.findFirst({ where: { id: req.user.id } })
      if (teacher) {
        where.OR = [
          { class: { headTeacherId: teacher.id } },
          { class: { courseClasses: { some: { course: { teacherId: teacher.id } } } } }
        ]
      } else {
        where.id = -1
      }
    }

    const [list, total] = await Promise.all([
      prisma.student.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        include: {
          major: { select: { name: true } },
          class: { select: { name: true } }
        }
      }),
      prisma.student.count({ where })
    ])

    const result = list.map(item => ({
      id: item.id, studentNo: item.studentNo, name: item.name,
      gender: item.gender, grade: item.grade,
      majorId: item.majorId, majorName: item.major?.name || '',
      classId: item.classId, className: item.class?.name || '',
      phone: item.phone, status: item.status,
      enrollmentDate: item.enrollmentDate
    }))

    return success(res, { list: result, pagination: { page, pageSize, total } }, '查询成功')
  } catch (error) {
    console.error('获取学生列表失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * GET /api/students/:id - 获取学生详情
 */
async function getStudentById(req, res) {
  try {
    const id = parseInt(req.params.id)
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        major: { select: { id: true, name: true, department: true } },
        class: { select: { id: true, name: true, grade: true } }
      }
    })
    if (!student) return fail(res, 404, '学生不存在')
    return success(res, {
      id: student.id, studentNo: student.studentNo, name: student.name,
      gender: student.gender, birthDate: student.birthDate,
      phone: student.phone, address: student.address, grade: student.grade,
      majorId: student.majorId, majorName: student.major?.name,
      majorDepartment: student.major?.department,
      classId: student.classId, className: student.class?.name,
      enrollmentDate: student.enrollmentDate, status: student.status,
      remark: student.remark, createdAt: student.createdAt
    }, '查询成功')
  } catch (error) {
    console.error('获取学生详情失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * POST /api/students - 新增学生
 */
async function createStudent(req, res) {
  try {
    const { studentNo, name, gender, birthDate, phone, address, grade, majorId, classId, enrollmentDate, status, remark } = req.body

    if (!studentNo || !name || !grade || !majorId || !classId) {
      return fail(res, 400, '学号、姓名、年级、专业和班级不能为空')
    }

    const existing = await prisma.student.findUnique({ where: { studentNo } })
    if (existing) return fail(res, 409, '学号已存在')

    const major = await prisma.major.findUnique({ where: { id: majorId } })
    if (!major) return fail(res, 400, '所选专业不存在')

    const cls = await prisma.class.findUnique({ where: { id: classId } })
    if (!cls) return fail(res, 400, '所选班级不存在')

    const student = await prisma.student.create({
      data: {
        studentNo, name, gender: gender || 'unknown',
        birthDate: birthDate ? new Date(birthDate) : null,
        phone: phone || null, address: address || null, grade,
        majorId, classId,
        enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : new Date(),
        status: status || 'studying', remark: remark || null
      }
    })

    return success(res, { id: student.id }, '新增学生成功')
  } catch (error) {
    console.error('新增学生失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * PUT /api/students/:id - 编辑学生
 */
async function updateStudent(req, res) {
  try {
    const id = parseInt(req.params.id)
    const student = await prisma.student.findUnique({ where: { id } })
    if (!student) return fail(res, 404, '学生不存在')

    const { studentNo, name, gender, birthDate, phone, address, grade, majorId, classId, enrollmentDate, status, remark } = req.body

    if (studentNo && studentNo !== student.studentNo) {
      const existing = await prisma.student.findUnique({ where: { studentNo } })
      if (existing) return fail(res, 409, '学号已存在')
    }
    if (majorId) {
      const major = await prisma.major.findUnique({ where: { id: majorId } })
      if (!major) return fail(res, 400, '所选专业不存在')
    }
    if (classId) {
      const cls = await prisma.class.findUnique({ where: { id: classId } })
      if (!cls) return fail(res, 400, '所选班级不存在')
    }

    const updated = await prisma.student.update({
      where: { id },
      data: {
        ...(studentNo !== undefined && { studentNo }),
        ...(name !== undefined && { name }),
        ...(gender !== undefined && { gender }),
        ...(birthDate !== undefined && { birthDate: birthDate ? new Date(birthDate) : null }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(grade !== undefined && { grade }),
        ...(majorId !== undefined && { majorId }),
        ...(classId !== undefined && { classId }),
        ...(enrollmentDate !== undefined && { enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : null }),
        ...(status !== undefined && { status }),
        ...(remark !== undefined && { remark })
      }
    })

    return success(res, { id: updated.id }, '编辑学生成功')
  } catch (error) {
    console.error('编辑学生失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * DELETE /api/students/:id - 删除学生
 */
async function deleteStudent(req, res) {
  try {
    const id = parseInt(req.params.id)
    const student = await prisma.student.findUnique({
      where: { id },
      include: { _count: { select: { scores: true, attendance: true } } }
    })
    if (!student) return fail(res, 404, '学生不存在')

    if (student._count.scores > 0 || student._count.attendance > 0) {
      return fail(res, 400, `该学生有 ${student._count.scores} 条成绩和 ${student._count.attendance} 条考勤记录，无法删除`)
    }

    await prisma.student.delete({ where: { id } })
    return success(res, null, '删除学生成功')
  } catch (error) {
    console.error('删除学生失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

module.exports = { getStudents, getStudentById, createStudent, updateStudent, deleteStudent }
