const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'student_management_secret_key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

/**
 * 生成 JWT Token
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

/**
 * 验证 JWT Token
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}

module.exports = { generateToken, verifyToken, JWT_SECRET }
