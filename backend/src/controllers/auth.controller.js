const { PrismaClient } = require('@prisma/client')
const { success, fail } = require('../utils/response')
const { generateToken } = require('../utils/token')
const { comparePassword, hashPassword } = require('../utils/password')

const prisma = new PrismaClient()

/**
 * POST /api/auth/login - 用户登录
 */
async function login(req, res) {
  try {
    const { username, password } = req.body

    // 参数校验
    if (!username || !password) {
      return fail(res, 400, '账号和密码不能为空')
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      return fail(res, 401, '账号或密码错误')
    }

    // 检查用户状态
    if (user.status === 'disabled') {
      return fail(res, 401, '账号已被禁用，请联系管理员')
    }

    // 校验密码
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      return fail(res, 401, '账号或密码错误')
    }

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // 生成 token
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role
    })

    return success(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        role: user.role,
        teacherId: user.teacherId,
        studentId: user.studentId
      }
    }, '登录成功')
  } catch (error) {
    console.error('登录失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * GET /api/auth/me - 获取当前用户信息
 */
async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        nickname: true,
        role: true,
        status: true,
        teacherId: true,
        studentId: true,
        lastLoginAt: true,
        createdAt: true
      }
    })

    if (!user) {
      return fail(res, 404, '用户不存在')
    }

    return success(res, user, '查询成功')
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * PUT /api/auth/password - 修改当前用户密码
 */
async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body

    // 参数校验
    if (!oldPassword || !newPassword || !confirmPassword) {
      return fail(res, 400, '请填写完整信息')
    }

    if (newPassword.length < 6) {
      return fail(res, 400, '新密码长度不能少于 6 位')
    }

    if (newPassword !== confirmPassword) {
      return fail(res, 400, '两次输入的密码不一致')
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    })

    if (!user) {
      return fail(res, 404, '用户不存在')
    }

    // 校验原密码
    const isOldPasswordValid = await comparePassword(oldPassword, user.password)
    if (!isOldPasswordValid) {
      return fail(res, 400, '原密码错误')
    }

    // 加密新密码并保存
    const hashedPassword = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    return success(res, null, '密码修改成功')
  } catch (error) {
    console.error('修改密码失败:', error)
    return fail(res, 500, '服务器错误')
  }
}

/**
 * POST /api/auth/logout - 退出登录
 */
async function logout(req, res) {
  return success(res, null, '退出成功')
}

module.exports = { login, getMe, changePassword, logout }
