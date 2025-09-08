import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Upload as UploadIcon, FileText, Image, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UploadResponse {
  message: string;
  reportId: string;
  status: string;
}

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

const Upload: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });
  const [error, setError] = useState<string>('');
  const [reportId, setReportId] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);

  const acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return '仅支持 JPG、PNG、PDF 格式的文件';
    }
    if (file.size > maxFileSize) {
      return '文件大小不能超过 10MB';
    }
    return null;
  };

  const handleFileSelect = useCallback((selectedFile: File) => {
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setFile(selectedFile);
    setError('');
    setUploadStatus('idle');
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileSelect(selectedFiles[0]);
    }
  };

  const uploadFile = async () => {
    if (!file || !token) return;

    setUploadStatus('uploading');
    setError('');

    const formData = new FormData();
    formData.append('report', file);

    try {
      const xhr = new XMLHttpRequest();
      
      // 监听上传进度
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentage = Math.round((e.loaded / e.total) * 100);
          setUploadProgress({
            loaded: e.loaded,
            total: e.total,
            percentage
          });
        }
      });

      // 处理响应
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response: UploadResponse = JSON.parse(xhr.responseText);
          setReportId(response.reportId);
          setUploadStatus('processing');
          toast.success('文件上传成功，正在分析中...');
          
          // 轮询检查分析状态
          checkAnalysisStatus(response.reportId);
        } else {
          const errorData = JSON.parse(xhr.responseText);
          throw new Error(errorData.error || '上传失败');
        }
      });

      xhr.addEventListener('error', () => {
        throw new Error('网络错误，请检查网络连接');
      });

      xhr.open('POST', '/api/analysis/upload-report');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);

    } catch (error: any) {
      console.error('上传错误:', error);
      setUploadStatus('error');
      setError(error.message || '上传失败，请重试');
      toast.error(error.message || '上传失败，请重试');
    }
  };

  const checkAnalysisStatus = async (reportId: string) => {
    try {
      const response = await fetch(`/api/analysis/result/${reportId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.status === 'completed') {
        setUploadStatus('success');
        toast.success('分析完成！');
        setTimeout(() => {
          navigate(`/result/${reportId}`);
        }, 1500);
      } else if (data.status === 'failed') {
        setUploadStatus('error');
        setError('分析失败，请重试');
        toast.error('分析失败，请重试');
      } else {
        // 继续轮询
        setTimeout(() => checkAnalysisStatus(reportId), 2000);
      }
    } catch (error) {
      console.error('检查分析状态错误:', error);
      setUploadStatus('error');
      setError('检查分析状态失败');
      toast.error('检查分析状态失败');
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadStatus('idle');
    setUploadProgress({ loaded: 0, total: 0, percentage: 0 });
    setError('');
    setReportId('');
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-8 h-8 text-blue-500" />;
    }
    return <FileText className="w-8 h-8 text-red-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">上传体检报告</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            上传您的体检报告，AI将为您提供专业的健康分析和建议
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {uploadStatus === 'idle' || uploadStatus === 'error' ? (
            <>
              {/* 文件上传区域 */}
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50'
                    : file
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      {getFileIcon(file.type)}
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={uploadFile}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >开始分析</button>
                      <button
                        onClick={resetUpload}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        重新选择
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <UploadIcon className="w-16 h-16 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xl font-medium text-gray-900 mb-2">
                        拖拽文件到此处或点击选择文件
                      </p>
                      <p className="text-gray-500">
                        支持 JPG、PNG、PDF 格式，文件大小不超过 10MB
                      </p>
                    </div>
                    <div>
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileInputChange}
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                      >
                        <UploadIcon className="w-5 h-5 mr-2" />
                        选择文件
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}
            </>
          ) : (
            /* 上传进度和状态 */
            <div className="text-center space-y-6">
              {uploadStatus === 'uploading' && (
                <>
                  <div className="flex justify-center">
                    <Loader className="w-16 h-16 text-blue-500 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">正在上传文件...</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {uploadProgress.percentage}% ({formatFileSize(uploadProgress.loaded)} / {formatFileSize(uploadProgress.total)})
                    </p>
                  </div>
                </>
              )}

              {uploadStatus === 'processing' && (
                <>
                  <div className="flex justify-center">
                    <Loader className="w-16 h-16 text-green-500 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">AI正在分析您的报告...</h3>
                    <p className="text-gray-600">这可能需要几分钟时间，请耐心等待</p>
                  </div>
                </>
              )}

              {uploadStatus === 'success' && (
                <>
                  <div className="flex justify-center">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">分析完成！</h3>
                    <p className="text-gray-600">正在跳转到结果页面...</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 使用说明 */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">使用说明</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>支持常见的体检报告格式：JPG、PNG、PDF</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>AI将自动识别报告中的关键健康指标</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>分析结果包含健康总结和个性化建议</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>所有数据严格加密，保护您的隐私安全</span>
              </div>
            </div>
          </div>

          {/* 免责声明 */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>免责声明：</strong>
              本平台提供的分析结果仅供参考，不能替代专业医疗诊断。如有健康问题，请及时咨询专业医生。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;