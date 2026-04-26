const express = require('express')
const router = express.Router()
const noticeController = require('../controllers/notice.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const { authorize } = require('../middlewares/role.middleware')

router.use(authenticate)

// 查看：管理员、教师、学生（教师/学生只能看已发布）
router.get('/', authorize('admin', 'teacher', 'student'), noticeController.getNoticeList)
router.get('/:id', authorize('admin', 'teacher', 'student'), noticeController.getNoticeById)

// 新增/编辑/删除：仅管理员
router.post('/', authorize('admin'), noticeController.createNotice)
router.put('/:id', authorize('admin'), noticeController.updateNotice)
router.delete('/:id', authorize('admin'), noticeController.deleteNotice)

module.exports = router