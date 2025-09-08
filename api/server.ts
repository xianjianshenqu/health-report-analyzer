import dotenv from 'dotenv';
import path from 'path';

// 配置dotenv，指定.env文件路径
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// 调试：检查环境变量
console.log('Environment variables loaded:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Not set');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('GLM_API_KEY:', process.env.GLM_API_KEY ? 'Set' : 'Not set');
console.log('PORT:', process.env.PORT);
console.log('Attempting to start server...');
console.log('Current working directory:', process.cwd());

import app from './app.js';

const port = process.env.PORT || 3001;

// 固定端口启动
const server = app.listen(port, () => {
  console.log(`服务器运行在端口 ${port}`);
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`端口 ${port} 被占用，请停止占用该端口的进程或使用其他端口`);
    process.exit(1);
  } else {
    console.error('服务器启动失败:', err);
    process.exit(1);
  }
});