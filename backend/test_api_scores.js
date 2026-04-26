const http = require('http');

// 先登录获取token
function login(cb) {
  const data = JSON.stringify({ username: 'teacher001', password: '123456' });
  const options = {
    hostname: 'localhost', port: 3000, path: '/api/auth/login',
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
  };
  const req = http.request(options, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      const parsed = JSON.parse(body);
      cb(parsed.data.token);
    });
  });
  req.write(data);
  req.end();
}

login(token => {
  console.log('Token:', token.substring(0, 30));

  // 获取成绩列表
  const options = {
    hostname: 'localhost', port: 3000, path: '/api/scores?page=1&limit=10',
    method: 'GET', headers: { 'Authorization': `Bearer ${token}` }
  };
  const req = http.request(options, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      const parsed = JSON.parse(body);
      console.log('Code:', parsed.code);
      console.log('Data:', JSON.stringify(parsed.data).substring(0, 500));
      if (parsed.data.list) {
        console.log('List length:', parsed.data.list.length);
        console.log('First item:', JSON.stringify(parsed.data.list[0]));
      }
    });
  });
  req.end();
});