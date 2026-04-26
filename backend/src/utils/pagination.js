/**
 * 获取分页参数
 */
function getPagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1)
  const pageSize = Math.max(1, Math.min(100, parseInt(query.pageSize) || 10))
  const skip = (page - 1) * pageSize

  return {
    page,
    pageSize,
    skip,
    take: pageSize
  }
}

module.exports = { getPagination }
