'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Grid,
  GridItem,
  Flex,
  Text,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Avatar,
  VStack,
  Divider,
} from '@chakra-ui/react';
import { RiArrowUpSFill, RiArrowDownSFill } from 'react-icons/ri';
import HeroSection  from '@/app/components/HeroSection';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardPage = () => {
  // Example data for the chart
  const data = [
    { month: 'Jan', sales: 3000, profit: 2000, growth: 1500 },
    { month: 'Feb', sales: 4000, profit: 2500, growth: 2000 },
    { month: 'Mar', sales: 3500, profit: 3000, growth: 2500 },
    { month: 'Apr', sales: 5000, profit: 4000, growth: 3000 },
    { month: 'May', sales: 6000, profit: 4500, growth: 3500 },
  ];

  const chatList = [
    { name: 'Annette Black', email: 'annette@gmail.com' },
    { name: 'Marvin McKinney', email: 'marvin@gmail.com' },
    { name: 'Bessie Cooper', email: 'cooper@gmail.com' },
    { name: 'Cameron Williamson', email: 'cameron@gmail.com' },
    { name: 'Cody Fisher', email: 'cody@gmail.com' },
  ];

  return (
    <Box p={6} bg="gray.50">
      {/* Hero Section */}
      <HeroSection />
  
      {/* Dashboard Grid */}
      <Grid templateColumns="repeat(12, 1fr)" gap={6} mt={6}>
        {/* Statistic Cards */}
        <GridItem colSpan={{ base: 6, md: 3 }}>
          <Box bg="white" shadow="md" p={4} borderRadius="md">
            <Flex align="center" mb={2}>
              <Box
                bg="purple.100"
                p={2}
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mr={4}
              >
                <Text fontSize="lg" color="purple.500">📈</Text>
              </Box>
              <Stat>
                <StatLabel color="gray.600">My Agents</StatLabel>
                <StatNumber color="black">2</StatNumber>
              </Stat>
            </Flex>
          </Box>
        </GridItem>

  <GridItem colSpan={{ base: 6, md: 3 }}>
    <Box bg="white" shadow="md" p={4} borderRadius="md">
      <Flex align="center" mb={2}>
        <Box
          bg="purple.100"
          p={2}
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mr={4}
        >
          {/* Replace with your desired icon */}
          <Text fontSize="lg" color="purple.500">
            💬
          </Text>
        </Box>
        <Stat>
          <StatLabel color="gray.600">Total Conversation</StatLabel>
          <StatNumber color="black">16K</StatNumber>
        </Stat>
      </Flex>
    </Box>
  </GridItem>

  <GridItem colSpan={{ base: 6, md: 3 }}>
    <Box bg="white" shadow="md" p={4} borderRadius="md">
      <Flex align="center" mb={2}>
        <Box
          bg="purple.100"
          p={2}
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mr={4}
        >
          {/* Replace with your desired icon */}
          <Text fontSize="lg" color="purple.500">
            ✔️
          </Text>
        </Box>
        <Stat>
          <StatLabel color="gray.600">Sanctification</StatLabel>
          <StatNumber color="black">15K</StatNumber>
        </Stat>
      </Flex>
    </Box>
  </GridItem>

  <GridItem colSpan={{ base: 6, md: 3 }}>
    <Box bg="white" shadow="md" p={4} borderRadius="md">
      <Flex align="center" mb={2}>
        <Box
          bg="purple.100"
          p={2}
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mr={4}
        >
          {/* Replace with your desired icon */}
          <Text fontSize="lg" color="purple.500">
            💲
          </Text>
        </Box>
        <Stat>
          <StatLabel color="gray.600">Total Cost</StatLabel>
          <StatNumber color="black">$125</StatNumber>
        </Stat>
      </Flex>
    </Box>
  </GridItem>



        {/* Earnings Chart */}
      <GridItem colSpan={{ base: 12, md: 6 }}>
        <Box bg="white" shadow="md" p={4} borderRadius="md" height="100%">
          <Heading size="sm" color="gray.600" mb={4}>
            Earnings
          </Heading>
          <Stat>
            <StatNumber color="black" fontSize="xl">
              $22,800
            </StatNumber>
          </Stat>
          <Box height="200px" mt={4}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" />
                <Line type="monotone" dataKey="profit" stroke="#82ca9d" />
                <Line type="monotone" dataKey="growth" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </GridItem>

      {/* Chat List */}
      <GridItem colSpan={{ base: 12, md: 4 }}>
        <Box bg="white" shadow="md" p={4} borderRadius="md" height="100%">
          <Heading size="sm" color="gray.600" mb={4}>
            Latest Chat List
          </Heading>
          <VStack spacing={4} align="stretch">
            {chatList.map((chat, index) => (
              <Flex key={index} align="center">
                <Avatar name={chat.name} size="sm" />
                <Box ml={4}>
                  <Text fontWeight="bold" color="black">
                    {chat.name}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {chat.email}
                  </Text>
                </Box>
              </Flex>
            ))}
          </VStack>
        </Box>
      </GridItem>
    </Grid>
  </Box>
  );
};

export default DashboardPage;
