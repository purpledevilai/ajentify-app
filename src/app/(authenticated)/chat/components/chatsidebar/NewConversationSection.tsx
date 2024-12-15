import { chatPageStore } from "@/store/ChatPageStore";
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Box, Flex, Spinner, Menu, MenuButton, MenuList, MenuItem, Text, useColorModeValue, useDisclosure } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";

export const NewConversationSection = observer(() => {

    const {
        isOpen: isAgentMenuOpen,
        onOpen: onOpenAgentMenu,
        onClose: onCloseAgentMenu
    } = useDisclosure();

    const bgColor = useColorModeValue("gray.100", "gray.800");
    const hoverBgColor = useColorModeValue("gray.200", "gray.700");
    const dividerColor = useColorModeValue("gray.300", "gray.600");
    const textColor = useColorModeValue("gray.800", "whiteAlpha.900");

    return (
        <Box
            bg={bgColor}
            p={2}
            borderRadius="md"
            mb={2}
            boxShadow="md"
            borderWidth="1px"
            borderColor={dividerColor}
        >
            <Text fontSize="sm" fontWeight="bold" mb={3} color={textColor}>
                Start a New Conversation
            </Text>
            {chatPageStore.currentContextLoading || !chatPageStore.currentAgentName || chatPageStore.agents === undefined ? (
                <Flex justify="center" align="center" height="40px">
                    <Spinner size="sm" />
                </Flex>
            ) : (
                <Menu isOpen={isAgentMenuOpen} onClose={onCloseAgentMenu}>
                    <MenuButton
                        width="100%"
                        p={3}
                        _hover={{ bg: hoverBgColor }}
                        borderRadius="md"
                        bg={bgColor}
                        onClick={onOpenAgentMenu}
                    >
                        <Flex justify="space-between" align="center">
                            <Text fontWeight="semibold" fontSize="sm" color={textColor}>
                                {chatPageStore.currentAgentName}
                            </Text>
                            {isAgentMenuOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        </Flex>
                    </MenuButton>
                    <MenuList>
                        {chatPageStore.agents.map((agent) => (
                            <MenuItem
                                key={agent.agent_id}
                                onClick={() => chatPageStore.startNewConversation(agent)}
                            >
                                {agent.agent_name}
                            </MenuItem>
                        ))}
                    </MenuList>
                </Menu>
            )}
        </Box>
    )
});