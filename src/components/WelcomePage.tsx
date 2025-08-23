import React from 'react';
import { Box, Button, Heading, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleEnter = () => {
    navigate('/dashboard');
  };

  return (
    <Box
      minH="100vh"
      bg="linear-gradient(135deg, #18181b 0%, #27272a 100%)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflow="hidden"
    >
      {/* Background Pattern */}
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        bg="radial-gradient(circle at 20% 50%, rgba(14, 165, 233, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.03) 0%, transparent 50%)"
        pointerEvents="none"
      />

      <MotionBox
        textAlign="center"
        zIndex="1"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Heading
          size="4xl"
          mb="6"
          bgGradient="linear(to-r, gray.200, blue.400)"
          bgClip="text"
          fontWeight="bold"
        >
          MandarinLoop
        </Heading>
        
        <Text
          fontSize="xl"
          color="gray.400"
          mb="12"
          maxW="600px"
          mx="auto"
          lineHeight="1.6"
        >
          Master Chinese through interactive listening exercises.
          <br />
          Choose your learning mode and start your journey.
        </Text>

        <Button
          size="lg"
          bg="linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)"
          color="white"
          px="12"
          py="6"
          fontSize="lg"
          borderRadius="xl"
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(14, 165, 233, 0.4)',
          }}
          transition="all 0.3s ease"
          onClick={handleEnter}
        >
          进入 MandarinLoop
        </Button>
      </MotionBox>
    </Box>
  );
};