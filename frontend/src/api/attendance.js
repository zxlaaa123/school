import request from './request'

/**
 * 获取考勤列表
 */
export function getAttendanceList(params) {
  return request({ url: '/attendance', method: 'get', params })
}

/**
 * 获取考勤详情
 */
export function getAttendanceDetail(id) {
  return request({ url: `/attendance/${id}`, method: 'get' })
}

/**
 * 新增考勤记录
 */
export function createAttendance(data) {
  return request({ url: '/attendance', method: 'post', data })
}

/**
 * 批量新增考勤记录
 */
export function batchCreateAttendance(data) {
  return request({ url: '/attendance/batch', method: 'post', data })
}

/**
 * 更新考勤记录
 */
export function updateAttendance(id, data) {
  return request({ url: `/attendance/${id}`, method: 'put', data })
}

/**
 * 删除考勤记录
 */
export function deleteAttendance(id) {
  return request({ url: `/attendance/${id}`, method: 'delete' })
}

/**
 * 获取考勤统计
 */
export function getAttendanceStatistics(params) {
  return request({ url: '/attendance/statistics', method: 'get', params })
}