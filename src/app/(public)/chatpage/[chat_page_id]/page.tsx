import ChatBox from '@/app/components/chatbox/ChatBox';
import { Box, Button, Flex, Heading, HStack, Text } from '@chakra-ui/react';
import { getChatPage } from '@/api/chatpage/getChatPage';
import { createContext } from '@/api/context/createContext';
import { ChatPageData } from '@/types/chatpagedata';
import { Context } from '@/types/context';

export default async function ChatPage({ params }: { params: { chat_page_id: string } }) {
  let chatPageData: ChatPageData | undefined = undefined;
  let context: Context | undefined = undefined;
  const chatPageId = params.chat_page_id;
  try {
    if (!chatPageId) {
      throw Error('Chat page ID is required');
    }
    if (typeof chatPageId !== 'string') {
      throw Error('Chat page ID must be a string');
    }
    chatPageData = await getChatPage(chatPageId);
    context = await createContext({
      agent_id: chatPageData.agent_id
    })
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting chat page data';
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
          {errorMessage}
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
        <ChatBox context={context} style={chatPageData.chatBoxStyle} />
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