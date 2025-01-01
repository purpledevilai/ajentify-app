import ChatBox from '@/app/components/chatbox/ChatBox';
import { Box, Button, Heading, HStack, Text } from '@chakra-ui/react';
import { ChatPageData } from '@/types/chatpagedata';
import { Context } from '@/types/context';

interface ChatPageProps {
    chatPageData: ChatPageData;
    context: Context;
}

export default function ChatPage({chatPageData, context}: ChatPageProps) {

  return (
    <Box
      bg={chatPageData.chat_page_style.background_color}
      color={chatPageData.chat_page_style.heading_color}
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
        color={chatPageData.chat_page_style.heading_color}
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
          color={chatPageData.chat_page_style.description_color}
        >
          {chatPageData.description}
        </Text>
      )}

      {/* ChatBox Section */}
      <Box
        width={['100%', '80%', '60%']}
        h="70vh"
        mb={6}
        boxShadow="lg"
        borderRadius="md"
        overflow="hidden"
      >
        <ChatBox context={context} style={chatPageData.chat_box_style} />
      </Box>

      {/* Buttons Section */}
      {(chatPageData.buttons && chatPageData.buttons.length > 0) && (
        <HStack spacing={4}>
          {chatPageData.buttons.map((button, index) => (
            <Button
              key={index}
              bg={chatPageData.chat_page_style.button_background_color}
              color={chatPageData.chat_page_style.button_text_color}
              _hover={{
                bg: chatPageData.chat_page_style.button_hover_background_color,
                color: chatPageData.chat_page_style.button_hover_text_color,
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