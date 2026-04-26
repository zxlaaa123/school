const attendanceService = require('../services/attendance.service')

/**
 * GET /api/attendance - 获取考勤列表
 */
async function getAttendance(req, res) {
  return attendanceService.getAttendanceList(req, res)
}

/**
 * GET /api/attendance/:id - 获取考勤详情
 */
async function getAttendanceById(req, res) {
  return attendanceService.getAttendanceById(req, res)
}

/**
 * POST /api/attendance - 新增考勤记录
 */
async function createAttendance(req, res) {
  return attendanceService.createAttendance(req, res)
}

/**
 * POST /api/attendance/batch - 批量新增考勤记录
 */
async function batchCreateAttendance(req, res) {
  return attendanceService.batchCreateAttendance(req, res)
}

/**
 * PUT /api/attendance/:id - 更新考勤记录
 */
async function updateAttendance(req, res) {
  return attendanceService.updateAttendance(req, res)
}

/**
 * DELETE /api/attendance/:id - 删除考勤记录
 */
async function deleteAttendance(req, res) {
  return attendanceService.deleteAttendance(req, res)
}

/**
 * GET /api/attendance/statistics - 获取考勤统计
 */
async function getAttendanceStatistics(req, res) {
  return attendanceService.getAttendanceStatistics(req, res)
}

module.exports = {
  getAttendance,
  getAttendanceById,
  createAttendance,
  batchCreateAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceStatistics
}