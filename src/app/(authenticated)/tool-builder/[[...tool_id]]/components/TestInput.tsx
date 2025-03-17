import { toolBuilderStore } from "@/store/ToolBuilderStore"
import { TestInput } from "@/types/tools";
import { CloseIcon } from "@chakra-ui/icons";

import { Flex, FormControl, IconButton, Select, Input, Heading, Button, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite";

interface TestInputProps {
    indexArray: number[];
    testInput: TestInput;
    showDelete?: boolean;
}

export const TestInputView: React.FC<TestInputProps> = observer(({ indexArray, testInput, showDelete = false }) => {
    return (
        <Flex
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            p={4}
            gap={4}
            direction="column"
        >
            <FormControl>
                {/* Parameter Name */}
                <Flex direction="row" w="100%" justify="space-between">
                    <Text fontWeight="bold" mb={4}>{testInput.name}</Text>
                    {showDelete && <IconButton
                        aria-label="Delete"
                        icon={<CloseIcon />}
                        variant="ghost"
                        color="inherit"
                        _hover={{ bg: 'gray.200', _dark: { bg: 'gray.700' } }}
                        onClick={() => toolBuilderStore.deleteTestArrayItem(indexArray)}
                    />}
                </Flex>

                {/* String or Number */}
                {(testInput.type === "string" || testInput.type === "number") && <Input
                    placeholder="value..."
                    value={testInput.value as string | number}
                    onChange={(e) => toolBuilderStore.setTestInputValue(indexArray, e.target.value)}
                />}

                {/* Boolean */}
                {testInput.type === "boolean" && <Select
                    value={(testInput.value as boolean) ? "true" : "false"}
                    onChange={(e) => toolBuilderStore.setTestInputValue(indexArray, e.target.value === "true")}
                >
                    <option value={"true"}>True</option>
                    <option value={"false"}>False</option>
                </Select>}

                {/* Enum */}
                {testInput.type === "enum" && <Select
                    value={testInput.value as string}
                    onChange={(e) => toolBuilderStore.setTestInputValue(indexArray, e.target.value)}
                >
                    {testInput.options?.map((option: string, enumIndex: number) => (
                        <option key={enumIndex} value={option}>{option}</option>
                    ))}
                </Select>}

                {/* Object */}
                {testInput.type === "object" && (
                    <Flex direction="column" w="100%" gap={6} pl={4}>
                        <Heading size="sm">Sub Parameters</Heading>
                        {(testInput.value as TestInput[]).map((subTestInput: TestInput, subIndex: number) => (
                            <TestInputView key={subIndex} indexArray={[...indexArray, subIndex]} testInput={subTestInput} />
                        ))}
                    </Flex>
                )}

                {/* Array */}
                {testInput.type === "array" && (
                    <Flex direction="column" w="100%" gap={6} pl={4}>
                        <Heading size="sm">Array Items</Heading>
                        {(testInput.value as TestInput[]).map((arrayTestInput: TestInput, subIndex: number) => (
                            <TestInputView key={subIndex} indexArray={[...indexArray, subIndex]} testInput={arrayTestInput} showDelete={true} />
                        ))}
                        <Button
                            variant={"outline"}
                            onClick={() => toolBuilderStore.addTestArrayItem(indexArray)}
                        >
                            Add {testInput.arrayTypeParameter?.name}
                        </Button>
                    </Flex>
                )}
            </FormControl>
        </Flex>
    )
});