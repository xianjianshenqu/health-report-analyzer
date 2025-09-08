import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { 
  FileText, 
  Download, 
  Share2, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Heart,
  TrendingUp,
  Calendar,
  User,
  ArrowLeft,
  Loader
} from 'lucide-react';

interface AnalysisResult {
  id: string;
  reportId: string;
  healthSummary: string;
  abnormalIndicators: Array<{
    name: string;
    value: string;
    normalRange: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  recommendations: Array<{
    category: string;
    suggestion: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  riskFactors: string[];
  followUpSuggestions: string[];
  createdAt: string;
}

interface Report {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

interface ResultData {
  report: Report;
  analysis: AnalysisResult | null;
}

const Result: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!reportId || !token) {
      navigate('/upload');
      return;
    }

    fetchResult();
  }, [reportId, token]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analysis/result/${reportId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取分析结果失败');
      }

      const resultData = await response.json();
      setData(resultData);
    } catch (error: any) {
      console.error('获取结果错误:', error);
      setError(error.message || '获取分析结果失败');
      toast.error(error.message || '获取分析结果失败');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-5 h-5" />;
      case 'medium':
        return <Info className="w-5 h-5" />;
      case 'low':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">正在加载分析结果...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">加载失败</h2>
          <p className="text-gray-600 mb-4">{error || '未找到分析结果'}</p>
          <Link
            to="/upload"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回上传页面
          </Link>
        </div>
      </div>
    );
  }

  const { report, analysis } = data;

  if (report.status !== 'completed' || !analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">分析进行中</h2>
          <p className="text-gray-600 mb-4">AI正在分析您的体检报告，请稍候...</p>
          <button
            onClick={fetchResult}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            刷新状态
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/profile')}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">体检报告分析结果</h1>
                <p className="text-gray-600 mt-1">基于AI智能分析的健康评估报告</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="w-4 h-4 mr-2" />
                分享
              </button>
              <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                导出
              </button>
            </div>
          </div>
        </div>

        {/* 报告基本信息 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{report.fileName}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(report.createdAt)}
                  </span>
                  <span>{formatFileSize(report.fileSize)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              分析完成
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 主要内容区域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 健康总结 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Heart className="w-6 h-6 text-red-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">健康总结</h2>
              </div>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">{analysis.healthSummary}</p>
              </div>
            </div>

            {/* 异常指标 */}
            {analysis.abnormalIndicators && analysis.abnormalIndicators.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-500 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">异常指标</h2>
                </div>
                <div className="space-y-4">
                  {analysis.abnormalIndicators.map((indicator, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${getSeverityColor(indicator.severity)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          {getSeverityIcon(indicator.severity)}
                          <h4 className="font-medium ml-2">{indicator.name}</h4>
                        </div>
                        <span className="text-sm font-medium">{indicator.value}</span>
                      </div>
                      <p className="text-sm mb-2"><strong>正常范围：</strong>{indicator.normalRange}</p>
                      <p className="text-sm">{indicator.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 健康建议 */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-6 h-6 text-green-500 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">健康建议</h2>
                </div>
                <div className="space-y-4">
                  {analysis.recommendations.map((rec, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${getSeverityColor(rec.priority)}`}>
                      <div className="flex items-center mb-2">
                        {getSeverityIcon(rec.priority)}
                        <h4 className="font-medium ml-2">{rec.category}</h4>
                      </div>
                      <p className="text-sm">{rec.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 风险因素 */}
            {analysis.riskFactors && analysis.riskFactors.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">风险因素</h3>
                <ul className="space-y-2">
                  {analysis.riskFactors.map((risk, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 随访建议 */}
            {analysis.followUpSuggestions && analysis.followUpSuggestions.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">随访建议</h3>
                <ul className="space-y-2">
                  {analysis.followUpSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 免责声明 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">重要提醒</h3>
              <p className="text-sm text-yellow-700">
                本分析结果仅供参考，不能替代专业医疗诊断。如有健康问题，请及时咨询专业医生。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;