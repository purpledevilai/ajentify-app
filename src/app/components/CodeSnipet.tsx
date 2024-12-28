import { Box, Button, Flex, Text, useClipboard, useColorModeValue } from '@chakra-ui/react';
import { CheckIcon, CopyIcon } from '@chakra-ui/icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeSnippetProps {
  code: string;
  language?: string;
}

export const CodeSnippet = ({ code, language = "javascript" }: CodeSnippetProps) => {
  const { hasCopied, onCopy } = useClipboard(code);
  const syntaxStyle = useColorModeValue(oneLight, oneDark);

  return (
    <Box border="1px solid" borderColor="gray.300" borderRadius="md" overflow="hidden">
      <Flex justify="space-between" align="center" bg={useColorModeValue('gray.200', 'gray.700')} px={4} py={2}>
        <Text fontSize="sm" fontWeight="bold">{language.toUpperCase()}</Text>
        <Button
          size="sm"
          onClick={onCopy}
          leftIcon={hasCopied ? <CheckIcon /> : <CopyIcon />}
          colorScheme={hasCopied ? 'green' : 'blue'}
          variant="ghost"
        >
          {hasCopied ? 'Copied' : 'Copy'}
        </Button>
      </Flex>
      <Box overflowX="auto">
        <SyntaxHighlighter language={language} style={syntaxStyle} customStyle={{ padding: '1rem' }}>
          {code}
        </SyntaxHighlighter>
      </Box>
    </Box>
  );
};
