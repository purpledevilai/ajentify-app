import { Flex} from "@chakra-ui/react";
import { NewConversationSection } from "./NewConversationSection";
import { ConversationHistorySection } from "./ConversationHistorySection";

export const ChatSideBar = () => {

    return (
        <Flex direction="column" height="100%" bg="transparent" width="100%" borderRadius="md">
            <NewConversationSection />
            <ConversationHistorySection />
        </Flex>
    )
};