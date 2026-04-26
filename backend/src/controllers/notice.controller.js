const noticeService = require('../services/notice.service')

/**
 * GET /api/notices - 获取公告列表
 */
async function getNoticeList(req, res) {
  return noticeService.getNoticeList(req, res)
}

/**
 * GET /api/notices/:id - 获取公告详情
 */
async function getNoticeById(req, res) {
  return noticeService.getNoticeById(req, res)
}

/**
 * POST /api/notices - 新增公告
 */
async function createNotice(req, res) {
  return noticeService.createNotice(req, res)
}

/**
 * PUT /api/notices/:id - 更新公告
 */
async function updateNotice(req, res) {
  return noticeService.updateNotice(req, res)
}

/**
 * DELETE /api/notices/:id - 删除公告
 */
async function deleteNotice(req, res) {
  return noticeService.deleteNotice(req, res)
}

module.exports = {
  getNoticeList,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice
}