'use client';

import { Flex, Heading } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import ChatBox from '@/app/components/chatbox/ChatBox';
import { Context } from '@/app/components/chatbox/ChatBox';

const ChatPage = observer(() => {

    const context: Context = {
        messages: [
            {
                from: "ai",
                message: "Hello there how can I help you today?"
            },
            {
                from: "user",
                message: "I was wondering if you could teach me a bit about programing"
            },
            {
                from: "ai",
                message: "Of course! I'd love to. So the first thing to know about programing is that it's just like a recipe. When you use the same recipe you get the same result. If you use a different recipe you get a different result. Does that make sence?"
            },
            {
                from: "user",
                message: "Yeah that totally makes sence"
            },
            {
                from: "ai",
                message: "Nice! So when we make recipies its important that we be percice and give exact instructions. The more unclear we are the more likely you are to make a mistake"
            }, 
            {
                from: "user",
                message: "Of course, so the code is like the instructions to the recipie?"
            },
            {
                from: "ai",
                message: "Yes! That is exactly correct. Every line of code is an instruction that you tell the computer to do. So initially you have to have something that you want the computer to do. Then you have to figure out all the steps that a computer can do to make what you want happen."
            }
        ]
    }

    return (
        <Flex direction="column" height="100%" p={2}>
            {/* Page Heading */}
            <Heading as="h1" size="xl" mb={2}>
                Chat
            </Heading>
            <Flex flex="1" direction="row" gap={2}>
                <Flex height="100%" bg="gray.800">
                    Chat History
                </Flex>
                <Flex height="100%" flex="1">
                    <ChatBox context={context}/>
                </Flex>
            </Flex>
        </Flex>
    )
});

export default ChatPage;