import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

type AuthMode = 'login' | 'register';

interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    createdAt?: string;
  };
  token: string;
}

const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '登录失败');
      }

      const authData = data as AuthResponse;
      
      // 使用AuthContext的login方法更新全局状态
      authLogin(authData.token, authData.user);
      
      toast.success('登录成功！');
      
      // 跳转到个人中心
      navigate('/profile');
    } catch (error: any) {
      console.error('登录错误:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string, name: string, phone?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '注册失败');
      }

      const authData = data as AuthResponse;
      
      // 使用AuthContext的login方法更新全局状态
      authLogin(authData.token, authData.user);
      
      toast.success('注册成功！欢迎加入智健解语！');
      
      // 跳转到个人中心
      navigate('/profile');
    } catch (error: any) {
      console.error('注册错误:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">智健解语</h1>
          <p className="text-gray-600">AI驱动的个人体检报告智能解读平台</p>
        </div>

        {/* 认证表单 */}
        {mode === 'login' ? (
          <LoginForm
            onLogin={handleLogin}
            onSwitchToRegister={() => setMode('register')}
            loading={loading}
          />
        ) : (
          <RegisterForm
            onRegister={handleRegister}
            onSwitchToLogin={() => setMode('login')}
            loading={loading}
          />
        )}

        {/* 功能特色 */}
        <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">为什么选择智健解语？</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span>AI智能解读，专业医学知识支持</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span>个性化健康建议，量身定制方案</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              <span>数据安全保护，隐私严格保密</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
              <span>历史记录管理，健康趋势追踪</span>
            </div>
          </div>
        </div>

        {/* 免责声明 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            本平台提供的分析结果仅供参考，不能替代专业医疗诊断。
            <br />
            如有健康问题，请及时咨询专业医生。
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;