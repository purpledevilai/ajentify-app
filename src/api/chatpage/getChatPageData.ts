import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";
import { ChatPageData } from "@/types/chatpagedata";

export async function getChatPageData(chatPageId: string): Promise<ChatPageData> {
  try {
    // Mock response for now
    const data: ChatPageData = {
        heading: 'Chat Page Heading',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        chatPageStyle: {
            backgroundColor: 'gray.50',
            textColor: 'gray.800',
            headingColor: 'gray.800',
            descriptionColor: 'gray.600',
            buttonBackgroundColor: 'gray.500',
            buttonTextColor: 'gray.50',
            buttonHoverBackgroundColor: 'gray.600',
            buttonHoverTextColor: 'gray.50'
        },
        chatBoxStyle: {
            backgroundColor: 'gray.50',
            borderColor: 'gray.300',
            aiMessageBackgroundColor: 'gray.500',
            aiMessageTextColor: 'gray.50',
            userMessageBackgroundColor: 'gray.200',
            userMessageTextColor: 'gray.700',
            userInputBackgroundColor: 'gray.200',
            userInputTextareaBackgroundColor: 'gray.50',
            userInputTextareaTextColor: 'gray.800',
            userInputTextareaFocusColor: 'gray.300',
            userInputTextareaPlaceholderText: 'Type a message...',
            userInputTextareaPlaceholderColor: 'gray.500',
            userInputSendButtonColor: 'gray.500',
            userInputSendButtonHoverColor: 'gray.600',
            userInputSendButtonTextColor: 'gray.50',
            typingIndicatorBackgroundColor: 'gray.600',
            typingIndicatorDotColor: 'gray.50'
        },
        buttons: [
            { label: 'Button 1', link: '/button1' },
            { label: 'Button 2', link: '/button2' }
        ],
        context: {
            context_id: 'context_id',
            agent_id: 'agent_id',
            messages: [
                { message: 'Hello, how can I help you?', sender: 'ai' },
            ]
        }
    }
    return data;
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chatpage/${chatPageId}`, {
        method: 'GET'
    });
    return await checkResponseAndGetJson(response) as unknown as ChatPageData;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting chat page data';
    throw Error(errorMessage);
  }
}