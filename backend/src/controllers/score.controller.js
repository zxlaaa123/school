const scoreService = require('../services/score.service')

/**
 * GET /api/scores - 获取成绩列表
 */
async function getScores(req, res) {
  return scoreService.getScores(req, res)
}

/**
 * GET /api/scores/:id - 获取成绩详情
 */
async function getScoreById(req, res) {
  return scoreService.getScoreById(req, res)
}

/**
 * POST /api/scores - 新增成绩
 */
async function createScore(req, res) {
  return scoreService.createScore(req, res)
}

/**
 * PUT /api/scores/:id - 更新成绩
 */
async function updateScore(req, res) {
  return scoreService.updateScore(req, res)
}

/**
 * DELETE /api/scores/:id - 删除成绩
 */
async function deleteScore(req, res) {
  return scoreService.deleteScore(req, res)
}

/**
 * GET /api/scores/statistics - 获取成绩统计
 */
async function getScoreStatistics(req, res) {
  return scoreService.getScoreStatistics(req, res)
}

module.exports = {
  getScores,
  getScoreById,
  createScore,
  updateScore,
  deleteScore,
  getScoreStatistics
}