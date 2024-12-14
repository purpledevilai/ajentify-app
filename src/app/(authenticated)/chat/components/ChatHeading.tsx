import { HamburgerIcon } from "@chakra-ui/icons";
import { Flex, Heading, IconButton, useBreakpointValue } from "@chakra-ui/react";

interface ChatHeadingProps {
    onMobileChatDrawerOpen: () => void;
}

export const ChatHeading = ({onMobileChatDrawerOpen}: ChatHeadingProps) => {

    const isMobile = useBreakpointValue({ base: true, lg: false });
    return (
        <Flex mb={2}>
            <Heading flex="1" as="h1" size="xl">
                Chat
            </Heading>
            {isMobile && (
                <IconButton
                    aria-label={'Open Chat Menu'}
                    icon={<HamburgerIcon />}
                    variant="ghost"
                    color="inherit"
                    _hover={{ bg: 'gray.200', _dark: { bg: 'gray.700' } }}
                    onClick={onMobileChatDrawerOpen}
                />
            )}
        </Flex>
    )
};