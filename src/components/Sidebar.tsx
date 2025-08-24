import React from 'react';
import { Box, VStack, Button, Text, Icon } from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, ShoppingCart, History } from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
}

interface NavItem {
  label: string;
  path: string;
  icon: any;
}

const navItems: NavItem[] = [
  {
    label: '课程包商城',
    path: '/dashboard/store',
    icon: ShoppingCart,
  },
  {
    label: '历史记录',
    path: '/dashboard/my-courses',
    icon: History,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      width={isOpen ? '280px' : '80px'}
      minH="100vh"
      bg="gray.900"
      borderRight="1px solid"
      borderColor="gray.700"
      transition="width 0.3s ease"
      p="6"
    >
      {/* Logo */}
      <Box mb="8" textAlign="center">
        <Text
          fontSize={isOpen ? "xl" : "sm"}
          fontWeight="bold"
          color="white"
          transition="font-size 0.3s ease"
        >
          {isOpen ? 'MandarinLoop' : 'ML'}
        </Text>
      </Box>

      {/* Navigation */}
      <VStack gap="2" align="stretch">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.path}
              onClick={() => navigate(item.path)}
              variant="ghost"
              justifyContent={isOpen ? 'flex-start' : 'center'}
              h="12"
              px={isOpen ? "4" : "3"}
              color={isActive ? 'blue.400' : 'gray.300'}
              bg={isActive ? 'gray.800' : 'transparent'}
              _hover={{
                bg: 'gray.800',
                color: 'blue.400',
              }}
              borderRadius="lg"
              transition="all 0.2s ease"
            >
              <Icon as={item.icon} boxSize="5" />
              {isOpen && (
                <Text ml="3" fontSize="sm">
                  {item.label}
                </Text>
              )}
            </Button>
          );
        })}
      </VStack>
    </Box>
  );
};