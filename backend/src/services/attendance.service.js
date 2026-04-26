const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// 合法考勤状态
const VALID_STATUS = ['normal', 'late', 'leave_early', 'leave', 'absent']

/**
 * 获取考勤列表（带分页和筛选）
 */
async function getAttendanceList(req, res) {
  try {
    const { page, pageSize, skip, take } = require('../utils/pagination').getPagination(req.query)
    const { studentId, courseId, classId, status, startDate, endDate, keyword } = req.query

    const where = {}

    // 关键词搜索
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
    if (status) where.status = status

    // 日期范围筛选
    if (startDate && endDate) {
      where.attendanceDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } else if (startDate) {
      where.attendanceDate = { gte: new Date(startDate) }
    } else if (endDate) {
      where.attendanceDate = { lte: new Date(endDate) }
    }

    // 权限控制：教师只能看自己课程的考勤
    if (req.user.role === 'teacher') {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { teacherId: true }
      })
      if (user && user.teacherId) {
        where.course = { teacherId: user.teacherId }
      } else {
        where.id = -1
      }
    }

    // 权限控制：学生只能看自己的考勤
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
      prisma.attendanceRecord.findMany({
        where,
        skip,
        take,
        orderBy: { attendanceDate: 'desc' },
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
      prisma.attendanceRecord.count({ where })
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
      attendanceDate: item.attendanceDate,
      status: item.status,
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
    console.error('获取考勤列表失败:', error)
    return require('../utils/response').fail(res, 500, '服务器错误: ' + error.message)
  }
}

/**
 * 获取考勤详情
 */
async function getAttendanceById(req, res) {
  try {
    const id = parseInt(req.params.id)
    const record = await prisma.attendanceRecord.findUnique({
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

    if (!record) {
      return require('../utils/response').fail(res, 404, '考勤记录不存在')
    }

    // 权限校验：教师只能查看自己课程的考勤
    if (req.user.role === 'teacher') {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { teacherId: true }
      })
      if (!user || !user.teacherId || record.course.teacherId !== user.teacherId) {
        return require('../utils/response').fail(res, 403, '无权限访问')
      }
    }

    // 权限校验：学生只能查看自己的考勤
    if (req.user.role === 'student') {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { studentId: true }
      })
      if (!user || !user.studentId || record.studentId !== user.studentId) {
        return require('../utils/response').fail(res, 403, '无权限访问')
      }
    }

    return require('../utils/response').success(res, {
      id: record.id,
      studentId: record.studentId,
      studentNo: record.student.studentNo,
      studentName: record.student.name,
      className: record.student.class?.name || '',
      courseId: record.courseId,
      courseName: record.course.name,
      attendanceDate: record.attendanceDate,
      status: record.status,
      recorderId: record.recorderId,
      recorderName: record.recorder?.name || '',
      remark: record.remark,
      createdAt: record.createdAt
    }, '查询成功')
  } catch (error) {
    console.error('获取考勤详情失败:', error)
    return require('../utils/response').fail(res, 500, '服务器错误')
  }
}

/**
 * 新增考勤记录
 */
async function createAttendance(req, res) {
  try {
    const { studentId, courseId, attendanceDate, status, remark } = req.body

    // 参数校验
    if (!studentId || !courseId || !attendanceDate) {
      return require('../utils/response').fail(res, 400, '学生、课程、日期不能为空')
    }

    // 考勤状态校验
    if (!VALID_STATUS.includes(status)) {
      return require('../utils/response').fail(res, 400, '考勤状态只能是：normal、late、leave_early、leave、absent')
    }

    // 检查学生和课程是否存在
    const [student, course] = await Promise.all([
      prisma.student.findUnique({ where: { id: studentId } }),
      prisma.course.findUnique({ where: { id: courseId } })
    ])

    if (!student) return require('../utils/response').fail(res, 400, '学生不存在')
    if (!course) return require('../utils/response').fail(res, 400, '课程不存在')

    // 教师权限：只能登记自己课程的考勤
    let teacherRecord = null
    if (req.user.role === 'teacher') {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { teacherId: true }
      })
      if (!user || !user.teacherId || course.teacherId !== user.teacherId) {
        return require('../utils/response').fail(res, 403, '只能登记自己课程的考勤')
      }
      teacherRecord = user
    }

    // 检查重复考勤：同一学生、同一课程、同一天不能重复登记
    const dateObj = new Date(attendanceDate)
    const existing = await prisma.attendanceRecord.findFirst({
      where: {
        studentId,
        courseId,
        attendanceDate: dateObj
      }
    })
    if (existing) {
      return require('../utils/response').fail(res, 409, '该学生该课程该日期已有考勤记录')
    }

    const record = await prisma.attendanceRecord.create({
      data: {
        studentId,
        courseId,
        attendanceDate: dateObj,
        status,
        recorderId: req.user.role === 'teacher' ? teacherRecord.teacherId : null,
        remark: remark || null
      }
    })

    return require('../utils/response').success(res, { id: record.id }, '新增考勤成功')
  } catch (error) {
    console.error('新增考勤失败:', error)
    return require('../utils/response').fail(res, 500, '服务器错误')
  }
}

/**
 * 批量新增考勤记录
 */
async function batchCreateAttendance(req, res) {
  try {
    const { records } = req.body

    if (!Array.isArray(records) || records.length === 0) {
      return require('../utils/response').fail(res, 400, '考勤记录列表不能为空')
    }

    // 教师权限：获取教师ID
    let teacherId = null
    if (req.user.role === 'teacher') {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { teacherId: true }
      })
      if (!user || !user.teacherId) {
        return require('../utils/response').fail(res, 403, '教师信息不完整')
      }
      teacherId = user.teacherId
    }

    const createdIds = []
    const errors = []

    for (const item of records) {
      const { studentId, courseId, attendanceDate, status, remark } = item

      // 参数校验
      if (!studentId || !courseId || !attendanceDate) {
        errors.push({ studentId, message: '学生、课程、日期不能为空' })
        continue
      }

      if (!VALID_STATUS.includes(status)) {
        errors.push({ studentId, message: '考勤状态不合法' })
        continue
      }

      // 检查课程是否存在及教师权限
      const course = await prisma.course.findUnique({ where: { id: courseId } })
      if (!course) {
        errors.push({ studentId, message: '课程不存在' })
        continue
      }

      if (req.user.role === 'teacher' && course.teacherId !== teacherId) {
        errors.push({ studentId, message: '只能登记自己课程的考勤' })
        continue
      }

      // 检查重复
      const dateObj = new Date(attendanceDate)
      const existing = await prisma.attendanceRecord.findFirst({
        where: { studentId, courseId, attendanceDate: dateObj }
      })
      if (existing) {
        errors.push({ studentId, message: '该日期已有考勤记录' })
        continue
      }

      const record = await prisma.attendanceRecord.create({
        data: {
          studentId,
          courseId,
          attendanceDate: dateObj,
          status,
          recorderId: teacherId,
          remark: remark || null
        }
      })
      createdIds.push(record.id)
    }

    return require('../utils/response').success(res, {
      createdCount: createdIds.length,
      createdIds,
      errorCount: errors.length,
      errors
    }, '批量新增考勤完成')
  } catch (error) {
    console.error('批量新增考勤失败:', error)
    return require('../utils/response').fail(res, 500, '服务器错误')
  }
}

/**
 * 更新考勤记录
 */
async function updateAttendance(req, res) {
  try {
    const id = parseInt(req.params.id)
    const { status, remark } = req.body

    const record = await prisma.attendanceRecord.findUnique({
      where: { id },
      include: { course: true }
    })

    if (!record) {
      return require('../utils/response').fail(res, 404, '考勤记录不存在')
    }

    // 权限校验：教师只能修改自己课程的考勤
    if (req.user.role === 'teacher') {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { teacherId: true }
      })
      if (!user || !user.teacherId || record.course.teacherId !== user.teacherId) {
        return require('../utils/response').fail(res, 403, '只能修改自己课程的考勤')
      }
    }

    // 考勤状态校验
    if (status !== undefined && !VALID_STATUS.includes(status)) {
      return require('../utils/response').fail(res, 400, '考勤状态只能是：normal、late、leave_early、leave、absent')
    }

    const updated = await prisma.attendanceRecord.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(remark !== undefined && { remark: remark || null })
      }
    })

    return require('../utils/response').success(res, { id: updated.id }, '修改考勤成功')
  } catch (error) {
    console.error('修改考勤失败:', error)
    return require('../utils/response').fail(res, 500, '服务器错误')
  }
}

/**
 * 删除考勤记录
 */
async function deleteAttendance(req, res) {
  try {
    const id = parseInt(req.params.id)

    const record = await prisma.attendanceRecord.findUnique({
      where: { id }
    })

    if (!record) {
      return require('../utils/response').fail(res, 404, '考勤记录不存在')
    }

    // 只有管理员可以删除考勤
    if (req.user.role !== 'admin') {
      return require('../utils/response').fail(res, 403, '无权限删除')
    }

    await prisma.attendanceRecord.delete({ where: { id } })

    return require('../utils/response').success(res, null, '删除考勤成功')
  } catch (error) {
    console.error('删除考勤失败:', error)
    return require('../utils/response').fail(res, 500, '服务器错误')
  }
}

/**
 * 获取考勤统计
 */
async function getAttendanceStatistics(req, res) {
  try {
    const { classId, courseId, startDate, endDate } = req.query

    const where = {}
    if (classId) where.student = { classId: parseInt(classId) }
    if (courseId) where.courseId = parseInt(courseId)

    // 日期范围
    if (startDate && endDate) {
      where.attendanceDate = { gte: new Date(startDate), lte: new Date(endDate) }
    } else if (startDate) {
      where.attendanceDate = { gte: new Date(startDate) }
    } else if (endDate) {
      where.attendanceDate = { lte: new Date(endDate) }
    }

    // 教师只能看自己课程的考勤统计
    if (req.user.role === 'teacher') {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { teacherId: true }
      })
      if (user && user.teacherId) {
        where.course = { teacherId: user.teacherId }
      } else {
        return require('../utils/response').success(res, {
          total: 0, normal: 0, late: 0, leaveEarly: 0, leave: 0, absent: 0,
          normalRate: 0, abnormalRate: 0
        }, '查询成功')
      }
    }

    // 学生只能看自己的考勤统计
    if (req.user.role === 'student') {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { studentId: true }
      })
      if (user && user.studentId) {
        where.studentId = user.studentId
      } else {
        return require('../utils/response').success(res, {
          total: 0, normal: 0, late: 0, leaveEarly: 0, leave: 0, absent: 0,
          normalRate: 0, abnormalRate: 0
        }, '查询成功')
      }
    }

    const records = await prisma.attendanceRecord.findMany({ where })

    const total = records.length
    const normal = records.filter(r => r.status === 'normal').length
    const late = records.filter(r => r.status === 'late').length
    const leaveEarly = records.filter(r => r.status === 'leave_early').length
    const leave = records.filter(r => r.status === 'leave').length
    const absent = records.filter(r => r.status === 'absent').length

    const normalRate = total > 0 ? Number(((normal / total) * 100).toFixed(1)) : 0
    const abnormalRate = total > 0 ? Number(((total - normal) / total * 100).toFixed(1)) : 0

    return require('../utils/response').success(res, {
      total, normal, late, leaveEarly, leave, absent,
      normalRate, abnormalRate
    }, '查询成功')
  } catch (error) {
    console.error('获取考勤统计失败:', error)
    return require('../utils/response').fail(res, 500, '服务器错误')
  }
}

module.exports = {
  getAttendanceList,
  getAttendanceById,
  createAttendance,
  batchCreateAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceStatistics
}