const { fail } = require('../utils/response')

/**
 * 角色权限中间件
 * 检查当前用户角色是否在允许列表中
 *
 * @param  {...string} roles 允许的角色列表
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return fail(res, 401, '未登录或登录已过期')
    }

    if (!roles.includes(req.user.role)) {
      return fail(res, 403, '无权限访问')
    }

    next()
  }
}

module.exports = { authorize }
