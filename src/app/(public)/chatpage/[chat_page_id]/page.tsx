import ChatBox from '@/app/components/chatbox/ChatBox';
import { Box, Button, Flex, Heading, HStack, Text } from '@chakra-ui/react';
import { getChatPageData } from '@/api/chatpage/getChatPageData';
import { ChatPageData } from '@/types/chatpagedata';

export default async function ChatPage({ params }: { params: { chat_page_id: string } }) {
  let chatPageData: ChatPageData | undefined = undefined;
  const chatPageId = params.chat_page_id;
  try {
    if (!chatPageId) {
      throw Error('Chat page ID is required');
    }
    console.log('chatPageId:', chatPageId);
    if (typeof chatPageId !== 'string') {
      throw Error('Chat page ID must be a string');
    }
    chatPageData = await getChatPageData(chatPageId);
  } catch (error) {
    return (
      <Flex
        bg="gray.50"
        color="gray.800"
        minH="100vh"
        p={6}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Text fontSize="lg" textAlign="center">
          {(error as Error).message}
        </Text>
      </Flex>
    )
  }

  if (!chatPageData) {
    return (
      <Flex
        bg="gray.50"
        color="gray.800"
        minH="100vh"
        p={6}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Text fontSize="lg" textAlign="center">
          Chat page data not found
        </Text>
      </Flex>
    );
  }


  return (
    <Box
      bg={chatPageData.chatPageStyle.backgroundColor}
      color={chatPageData.chatPageStyle.textColor}
      minH="100vh"
      p={6}
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      {/* Page Heading */}
      <Heading
        as="h1"
        size="2xl"
        mb={4}
        textAlign="center"
        color={chatPageData.chatPageStyle.headingColor}
      >
        {chatPageData.heading}
      </Heading>

      {/* Optional Description */}
      {chatPageData.description && (
        <Text
          fontSize="lg"
          textAlign="center"
          maxW={['100%', '80%', '60%']}
          mb={6}
          color={chatPageData.chatPageStyle.descriptionColor}
        >
          {chatPageData.description}
        </Text>
      )}

      {/* ChatBox Section */}
      <Box
        width={['100%', '80%', '60%']}
        h="50vh"
        mb={6}
        boxShadow="lg"
        borderRadius="md"
        overflow="hidden"
      >
        <ChatBox context={chatPageData.context} style={chatPageData.chatBoxStyle} />
      </Box>

      {/* Buttons Section */}
      {(chatPageData.buttons && chatPageData.buttons.length > 0) && (
        <HStack spacing={4}>
          {chatPageData.buttons.map((button, index) => (
            <Button
              key={index}
              bg={chatPageData.chatPageStyle.buttonBackgroundColor}
              color={chatPageData.chatPageStyle.buttonTextColor}
              _hover={{
                bg: chatPageData.chatPageStyle.buttonHoverBackgroundColor,
                color: chatPageData.chatPageStyle.buttonHoverTextColor,
              }}
            >
              {button.label}
            </Button>
          ))}
        </HStack>
      )}
    </Box>
  );
}