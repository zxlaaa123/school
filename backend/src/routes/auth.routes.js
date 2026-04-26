const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const { authenticate } = require('../middlewares/auth.middleware')

// 登录（无需认证）
router.post('/login', authController.login)

// 以下接口需要认证
router.get('/me', authenticate, authController.getMe)
router.put('/password', authenticate, authController.changePassword)
router.post('/logout', authenticate, authController.logout)

module.exports = router
