import { Flex, Text } from '@chakra-ui/react';
import { getChatPage } from '@/api/chatpage/getChatPage';
import { getContext } from '@/api/context/getContext';
import { createContext } from '@/api/context/createContext';
import { ChatPageData } from '@/types/chatpagedata';
import { Context } from '@/types/context';
import ChatPage from '@/app/components/chatpage/ChatPage';

interface ChatPageProps {
  params: { chat_page_id: string };
  searchParams: { context_id?: string };
}

export default async function ChatPageWrapper({ params, searchParams }: ChatPageProps) {
  let chatPageData: ChatPageData | undefined = undefined;
  let context: Context | undefined = undefined;
  const chatPageId = params.chat_page_id;
  const contextId = searchParams.context_id;

  try {
    if (!chatPageId) {
      throw Error('Chat page ID is required');
    }

    if (typeof chatPageId !== 'string') {
      throw Error('Chat page ID must be a string');
    }

    // Fetch chat page data
    chatPageData = await getChatPage(chatPageId);

    // If context_id exists, fetch context, otherwise create a new one
    if (contextId) {
      context = await getContext({context_id: contextId});
      if (context.agent_id !== chatPageData.agent_id) {
        throw Error('Context agent_id does not match chat page agent_id');
      }
    } else {
      context = await createContext({
        agent_id: chatPageData.agent_id,
      });
    }
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
    <ChatPage chatPageData={chatPageData} context={context} />
  );
}
