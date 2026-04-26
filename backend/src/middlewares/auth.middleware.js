const { verifyToken } = require('../utils/token')
const { fail } = require('../utils/response')

/**
 * JWT 认证中间件
 * 从 Authorization 头中提取 token 并验证
 */
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return fail(res, 401, '未登录或登录已过期')
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    // 将用户信息挂载到 req 上
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    }

    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return fail(res, 401, '登录已过期，请重新登录')
    }
    return fail(res, 401, '未登录或登录已过期')
  }
}

module.exports = { authenticate }
