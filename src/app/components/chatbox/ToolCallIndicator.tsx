import { motion, AnimatePresence } from "framer-motion";
import { Box } from "@chakra-ui/react";

interface ToolCallIndicatorProps {
    toolCall: { name: string; input: string } | null;
}

export const ToolCallIndicator = ({ toolCall }: ToolCallIndicatorProps) => {
    return (
        <AnimatePresence mode="wait">
            {toolCall && (
                <motion.div
                    key={toolCall.name}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                >
                    <Box
                        mt={2}
                        p={2}
                        borderRadius="md"
                        bg="gray.600"
                        color="white"
                        fontSize="sm"
                        boxShadow="md"
                    >
                        🛠 Calling tool: <strong>{toolCall.name}</strong>
                    </Box>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
