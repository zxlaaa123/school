const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// 合法公告状态
const VALID_STATUS = ['draft', 'published', 'expired']

// 合法公告分类
const VALID_CATEGORY = ['academic', 'exam', 'activity', 'system']

/**
 * 获取公告列表（带分页和筛选）
 */
async function getNoticeList(req, res) {
  try {
    const { page, pageSize, skip, take } = require('../utils/pagination').getPagination(req.query)
    const { keyword, category, status, isTop } = req.query

    const where = {}

    // 关键词搜索
    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { content: { contains: keyword } }
      ]
    }

    if (category) where.category = category
    if (status) where.status = status
    if (isTop !== undefined && isTop !== null) where.isTop = isTop === 'true'

    // 权限控制：教师和学生只能查看已发布公告
    if (req.user.role === 'teacher' || req.user.role === 'student') {
      where.status = 'published'
    }

    const [list, total] = await Promise.all([
      prisma.notice.findMany({
        where,
        skip,
        take,
        orderBy: [
          { isTop: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          publisher: {
            select: { id: true, username: true, nickname: true, role: true }
          }
        }
      }),
      prisma.notice.count({ where })
    ])

    const result = list.map(item => ({
      id: item.id,
      title: item.title,
      category: item.category,
      status: item.status,
      isTop: item.isTop,
      viewCount: item.viewCount,
      publisherName: item.publisher?.nickname || item.publisher?.username || '系统管理员',
      publishedAt: item.publishedAt,
      createdAt: item.createdAt
    }))

    return require('../utils/response').success(res, {
      list: result,
      pagination: { page: parseInt(page) || 1, pageSize: parseInt(pageSize) || 10, total }
    }, '查询成功')
  } catch (error) {
    console.error('获取公告列表失败:', error)
    return require('../utils/response').fail(res, 500, '服务器错误: ' + error.message)
  }
}

/**
 * 获取公告详情
 */
async function getNoticeById(req, res) {
  try {
    const id = parseInt(req.params.id)
    const notice = await prisma.notice.findUnique({
      where: { id },
      include: {
        publisher: {
          select: { id: true, username: true, nickname: true, role: true }
        }
      }
    })

    if (!notice) {
      return require('../utils/response').fail(res, 404, '公告不存在')
    }

    // 权限校验：教师和学生不能查看草稿公告
    if ((req.user.role === 'teacher' || req.user.role === 'student') && notice.status === 'draft') {
      return require('../utils/response').fail(res, 403, '无权限访问')
    }

    // 增加浏览次数
    await prisma.notice.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    })

    // 重新获取更新后的数据
    const updatedNotice = await prisma.notice.findUnique({
      where: { id },
      include: {
        publisher: {
          select: { id: true, username: true, nickname: true, role: true }
        }
      }
    })

    return require('../utils/response').success(res, {
      id: updatedNotice.id,
      title: updatedNotice.title,
      content: updatedNotice.content,
      category: updatedNotice.category,
      status: updatedNotice.status,
      isTop: updatedNotice.isTop,
      viewCount: updatedNotice.viewCount,
      publisherName: updatedNotice.publisher?.nickname || updatedNotice.publisher?.username || '系统管理员',
      publishedAt: updatedNotice.publishedAt,
      expiredAt: updatedNotice.expiredAt,
      createdAt: updatedNotice.createdAt,
      updatedAt: updatedNotice.updatedAt
    }, '查询成功')
  } catch (error) {
    console.error('获取公告详情失败:', error)
    return require('../utils/response').fail(res, 500, '服务器错误')
  }
}

/**
 * 新增公告
 */
async function createNotice(req, res) {
  try {
    const { title, content, category, status, isTop, publishedAt, expiredAt } = req.body

    // 参数校验
    if (!title || !content) {
      return require('../utils/response').fail(res, 400, '标题和内容不能为空')
    }

    if (status && !VALID_STATUS.includes(status)) {
      return require('../utils/response').fail(res, 400, '公告状态不合法')
    }

    if (category && !VALID_CATEGORY.includes(category)) {
      return require('../utils/response').fail(res, 400, '公告分类不合法')
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        category: category || 'system',
        status: status || 'draft',
        isTop: isTop || false,
        publisherId: req.user.id,
        publishedAt: publishedAt ? new Date(publishedAt) : status === 'published' ? new Date() : null,
        expiredAt: expiredAt ? new Date(expiredAt) : null
      }
    })

    return require('../utils/response').success(res, { id: notice.id }, '新增公告成功')
  } catch (error) {
    console.error('新增公告失败:', error)
    return require('../utils/response').fail(res, 500, '服务器错误')
  }
}

/**
 * 更新公告
 */
async function updateNotice(req, res) {
  try {
    const id = parseInt(req.params.id)
    const { title, content, category, status, isTop, publishedAt, expiredAt } = req.body

    const notice = await prisma.notice.findUnique({
      where: { id }
    })

    if (!notice) {
      return require('../utils/response').fail(res, 404, '公告不存在')
    }

    // 参数校验
    if (title !== undefined && !title) {
      return require('../utils/response').fail(res, 400, '标题不能为空')
    }

    if (content !== undefined && !content) {
      return require('../utils/response').fail(res, 400, '内容不能为空')
    }

    if (status && !VALID_STATUS.includes(status)) {
      return require('../utils/response').fail(res, 400, '公告状态不合法')
    }

    if (category && !VALID_CATEGORY.includes(category)) {
      return require('../utils/response').fail(res, 400, '公告分类不合法')
    }

    const updated = await prisma.notice.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(category !== undefined && { category }),
        ...(status !== undefined && { status }),
        ...(isTop !== undefined && { isTop }),
        ...(publishedAt !== undefined && { publishedAt: publishedAt ? new Date(publishedAt) : null }),
        ...(expiredAt !== undefined && { expiredAt: expiredAt ? new Date(expiredAt) : null })
      }
    })

    return require('../utils/response').success(res, { id: updated.id }, '修改公告成功')
  } catch (error) {
    console.error('修改公告失败:', error)
    return require('../utils/response').fail(res, 500, '服务器错误')
  }
}

/**
 * 删除公告
 */
async function deleteNotice(req, res) {
  try {
    const id = parseInt(req.params.id)

    const notice = await prisma.notice.findUnique({
      where: { id }
    })

    if (!notice) {
      return require('../utils/response').fail(res, 404, '公告不存在')
    }

    // 只有管理员可以删除公告
    if (req.user.role !== 'admin') {
      return require('../utils/response').fail(res, 403, '无权限删除')
    }

    await prisma.notice.delete({ where: { id } })

    return require('../utils/response').success(res, null, '删除公告成功')
  } catch (error) {
    console.error('删除公告失败:', error)
    return require('../utils/response').fail(res, 500, '服务器错误')
  }
}

module.exports = {
  getNoticeList,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice
}
