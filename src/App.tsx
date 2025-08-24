import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Theme } from '@chakra-ui/react';
import { system } from './theme';
import { WelcomePage } from './components/WelcomePage';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardHome } from './components/DashboardHome';
import { MyCourses } from './components/MyCourses';
import { CourseStore } from './components/CourseStore';
import { PinyinMode } from './components/PinyinMode';
import { ChineseMode } from './components/ChineseMode';
import { FloatingDiscussion } from './components/FloatingDiscussion';
import { setupGlobalErrorHandling } from './utils/apiExamples';
import { useUserStore } from './utils/userStore';
import './App.css';

function App() {
  const { initializeUser } = useUserStore();
  
  // 初始化全局错误处理和用户
  useEffect(() => {
    setupGlobalErrorHandling();
    initializeUser();
  }, [initializeUser]);

  return (
    <ChakraProvider value={system}>
      <Theme appearance="dark">
        <Router>
          <div className="App">
            <Routes>
              {/* Welcome Page */}
              <Route path="/" element={<WelcomePage />} />
              
              {/* Dashboard with Sidebar Layout */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<CourseStore />} />
                <Route path="my-courses" element={<MyCourses />} />
                <Route path="store" element={<CourseStore />} />
                <Route path="store/:packageId" element={<CourseStore />} />
              </Route>
              
              {/* Game Routes (keep existing routes) */}
              <Route path="/game/pinyin" element={<PinyinMode />} />
              <Route path="/game/chinese" element={<ChineseMode />} />
            </Routes>
            
            {/* Global floating discussion board */}
            <FloatingDiscussion />
          </div>
        </Router>
      </Theme>
    </ChakraProvider>
  );
}

export default App;
