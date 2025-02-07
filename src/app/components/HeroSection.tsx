import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Image,
  useBreakpointValue,
} from '@chakra-ui/react';
import { RiRobot3Fill } from 'react-icons/ri';

const HeroSection = () => {
  const imageSize = useBreakpointValue({ base: '200px', md: '300px', lg: '350px' });

  return (
    <Box
      bg="white"
      boxShadow="md"
      borderRadius="lg"
      p={4}
      display="flex"
      flexDirection={{ base: 'column', md: 'row' }}
      alignItems="center"
      justifyContent="space-between"
      gap={6}
      mb={5}
    >
      {/* Text Content */}
      <Flex flexDirection="column" maxWidth={{ base: '100%', md: '50%' }}>
        <Heading as="h1" size="md" mb={4} color={'#000'}>
          Build AI Agents using Ajentify to level up your Business
        </Heading>
        <Text fontSize="sm" color="gray.600" mb={6}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit
          interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per
          conubia nostra, per inceptos himenaeos.
        </Text>
        <Button
          leftIcon={<RiRobot3Fill />}
          size="md"
          width={'320px'}
          colorScheme="green"
          bg="#10D320"
          color="white"
          _hover={{ bg: 'green.500' }}
        >
          Create Team
        </Button>
      </Flex>

      {/* Image Section */}
      <Image
        src="/Img/appimg.png" 
        alt="AI Agent Illustration"
        borderRadius="md"
        height={'200px'}
        width={'330px'}

      />
    </Box>
  );
};

export default HeroSection;
