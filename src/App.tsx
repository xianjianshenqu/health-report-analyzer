import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, ProtectedRoute, PublicRoute } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import Result from './pages/Result';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route 
                path="/auth" 
                element={
                  <PublicRoute fallback={<Navigate to="/" replace />}>
                    <Auth />
                  </PublicRoute>
                } 
              />
              {/* 临时路由，后续会添加更多页面 */}
              <Route path="/upload" element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/result/:reportId" element={
                <ProtectedRoute>
                  <Result />
                </ProtectedRoute>
              } />
              {/* 404 页面 */}
              <Route 
                path="*" 
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-gray-600 mb-4">页面未找到</p>
                      <a href="/" className="text-blue-600 hover:text-blue-800">返回首页</a>
                    </div>
                  </div>
                } 
              />
            </Routes>
          </main>
          
          {/* Toast 通知组件 */}
          <Toaster 
            position="top-right" 
            richColors 
            closeButton 
            duration={3000}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App