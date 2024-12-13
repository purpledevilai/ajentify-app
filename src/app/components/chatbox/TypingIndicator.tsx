import { Box, Flex } from "@chakra-ui/react"
import { keyframes } from "@emotion/react";
import { ChatBoxStyle } from "./ChatBox";


interface TypingIndicatorProps {
    style: ChatBoxStyle
}

export const TypingIndicator = ({style}: TypingIndicatorProps) => {

    const bounce = keyframes`
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
    `;
    return (
        <Flex
            align="center"
            mt={4}
            ml={2} // Align to the left
            bg={style.typingIndicatorBackgroundColor}
            p={2}
            borderRadius="md"
            maxWidth="50px"
        >
            {/* Typing dots */}
            <Box
                as="span"
                display="inline-block"
                width="8px"
                height="8px"
                bg={style.typingIndicatorDotColor}
                borderRadius="full"
                css={{
                    animation: `${bounce} 1.4s infinite`,
                    animationDelay: "0s",
                }}
                mr="2px"
            ></Box>
            <Box
                as="span"
                display="inline-block"
                width="8px"
                height="8px"
                bg={style.typingIndicatorDotColor}
                borderRadius="full"
                css={{
                    animation: `${bounce} 1.4s infinite`,
                    animationDelay: "0.2s",
                }}
                mr="2px"
            ></Box>
            <Box
                as="span"
                display="inline-block"
                width="8px"
                height="8px"
                bg={style.typingIndicatorDotColor}
                borderRadius="full"
                css={{
                    animation: `${bounce} 1.4s infinite`,
                    animationDelay: "0.4s",
                }}
            ></Box>
        </Flex>
    )
}