import request from './request'

/**
 * 获取成绩列表
 */
export function getScoreList(params) {
  return request({ url: '/scores', method: 'get', params })
}

/**
 * 获取成绩详情
 */
export function getScoreDetail(id) {
  return request({ url: `/scores/${id}`, method: 'get' })
}

/**
 * 新增成绩
 */
export function createScore(data) {
  return request({ url: '/scores', method: 'post', data })
}

/**
 * 更新成绩
 */
export function updateScore(id, data) {
  return request({ url: `/scores/${id}`, method: 'put', data })
}

/**
 * 删除成绩
 */
export function deleteScore(id) {
  return request({ url: `/scores/${id}`, method: 'delete' })
}

/**
 * 获取成绩统计
 */
export function getScoreStatistics(params) {
  return request({ url: '/scores/statistics', method: 'get', params })
}