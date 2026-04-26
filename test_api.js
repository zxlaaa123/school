const axios = require('axios');

const BASE = 'http://localhost:3000/api';

async function test() {
  try {
    // 测试登录
    const loginResp = await axios.post(`${BASE}/auth/login`, {
      username: 'teacher001',
      password: '123456'
    });
    console.log('登录状态码:', loginResp.status);
    const token = loginResp.data.token;
    console.log('Token:', token.substring(0, 30) + '...');

    // 测试获取成绩列表
    const scoresResp = await axios.get(`${BASE}/scores`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('\n成绩列表状态码:', scoresResp.status);
    console.log('成绩数据:', JSON.stringify(scoresResp.data).substring(0, 300));
  } catch (err) {
    console.error('错误:', err.response?.status, err.response?.data || err.message);
  }
}

test();