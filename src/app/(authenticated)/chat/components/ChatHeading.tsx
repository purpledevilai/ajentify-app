import { HamburgerIcon, CopyIcon, CheckIcon } from "@chakra-ui/icons";
import {
    Flex,
    Heading,
    Button,
    useBreakpointValue,
    Text,
    HStack,
    useClipboard,
} from "@chakra-ui/react";

interface ChatHeadingProps {
    onMobileChatDrawerOpen: () => void;
    context_id?: string;
}

export const ChatHeading = ({ onMobileChatDrawerOpen, context_id }: ChatHeadingProps) => {
    const isMobile = useBreakpointValue({ base: true, lg: false });
    const { hasCopied, onCopy } = useClipboard(context_id || "");

    return (
        <Flex mb={2} align="center" justify="space-between">
            <Heading flex="1" as="h1" size="xl">
                Chat
                {context_id && (
                    <HStack spacing={2} mt={1}>
                        <Text fontSize="xs" color="gray.500">{context_id}</Text>
                        <Button
                            size="xs"
                            onClick={onCopy}
                            leftIcon={hasCopied ? <CheckIcon /> : <CopyIcon />}
                            colorScheme={hasCopied ? 'green' : 'blue'}
                            variant="ghost"
                        >
                            {hasCopied ? 'Copied' : 'Copy'}
                        </Button>
                    </HStack>
                )}
            </Heading>
            {isMobile && (
                <Button
                    aria-label={'Open Chat Menu'}
                    leftIcon={<HamburgerIcon />}
                    variant="ghost"
                    onClick={onMobileChatDrawerOpen}
                />
            )}
        </Flex>
    );
};
