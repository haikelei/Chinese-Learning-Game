import React, { useEffect } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useDiscussBoardUserStore } from '../utils/discussBoardUserStore';

export const DashboardLayout: React.FC = () => {
  const { username, getDisplayUsername } = useDiscussBoardUserStore();

  // 确保进入dashboard时就生成用户名
  useEffect(() => {
    if (!username) {
      // 如果用户名为空，调用getDisplayUsername来生成匿名用户名
      // 这会触发generateAnonymousUsername()的调用
      getDisplayUsername();
    }
  }, [username, getDisplayUsername]);

  return (
    <Flex minH="100vh" bg="gray.950">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <Box flex="1" bg="gray.950">
        <Outlet />
      </Box>
    </Flex>
  );
};