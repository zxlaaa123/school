const express = require('express')
const router = express.Router()
const scoreController = require('../controllers/score.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const { authorize } = require('../middlewares/role.middleware')

router.use(authenticate)

// 成绩统计（放在 /:id 前面避免路由冲突）
router.get('/statistics', authorize('admin', 'teacher'), scoreController.getScoreStatistics)

// 查看：管理员、教师、学生（学生只能看个人）
router.get('/', authorize('admin', 'teacher', 'student'), scoreController.getScores)
router.get('/:id', authorize('admin', 'teacher', 'student'), scoreController.getScoreById)

// 新增/编辑：管理员、教师（教师只能管理自己课程）
router.post('/', authorize('admin', 'teacher'), scoreController.createScore)
router.put('/:id', authorize('admin', 'teacher'), scoreController.updateScore)

// 删除：仅管理员
router.delete('/:id', authorize('admin'), scoreController.deleteScore)

module.exports = router