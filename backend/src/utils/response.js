/**
 * 统一成功响应
 */
function success(res, data = null, message = '操作成功') {
  return res.json({
    code: 200,
    message,
    data
  })
}

/**
 * 统一失败响应
 */
function fail(res, code = 400, message = '操作失败', data = null) {
  return res.status(code).json({
    code,
    message,
    data
  })
}

module.exports = { success, fail }
