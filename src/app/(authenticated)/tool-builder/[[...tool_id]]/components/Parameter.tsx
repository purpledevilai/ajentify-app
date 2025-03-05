import { toolBuilderStore } from "@/store/ToolBuilderStore"
import { CloseIcon } from "@chakra-ui/icons";

import { Flex, FormControl, IconButton, Select, Input, Heading, Button } from "@chakra-ui/react"
import { observer } from "mobx-react-lite";

interface ParameterProps {
    indexArray: number[];
    param: any;
    isEnumOption?: boolean;
}

export const Parameter: React.FC<ParameterProps> = observer(({ indexArray, param, isEnumOption = false }) => {
    return (
        <Flex
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            p={4}
            gap={4}
            direction="column"
        >
            {/* Parameter Name */}
            <Flex direction="row" align="space-between">
                <FormControl>
                    <Input
                        placeholder={isEnumOption ? "Option..." : "Param Name..."}
                        value={param.name}
                        onChange={(e) => toolBuilderStore.setParameterName(indexArray, e.target.value)}
                    />
                </FormControl>
                <IconButton
                    aria-label="Delete"
                    icon={<CloseIcon />}
                    variant="ghost"
                    color="inherit"
                    _hover={{ bg: 'gray.200', _dark: { bg: 'gray.700' } }}
                    onClick={() => toolBuilderStore.deleteParameter(indexArray)}
                />
            </Flex>

            {!isEnumOption && (
                <>
                    {/* Parameter Description */}
                    <FormControl>
                        <Input
                            placeholder="Description..."
                            value={param.description}
                            onChange={(e) => toolBuilderStore.setParameterDescription(indexArray, e.target.value)}
                        />
                    </FormControl>

                    {/* Parameter Type */}
                    <FormControl>
                        <Select
                            value={param.type}
                            onChange={(e) => toolBuilderStore.setParameterType(indexArray, e.target.value)}
                        >
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="boolean">Boolean</option>
                            <option value="object">Object</option>
                            <option value="array">Array</option>
                            <option value="enum">Enum</option>
                        </Select>
                    </FormControl>

                    {/* If object show sub parameters */}
                    {param.type === "object" ? (
                        <Flex direction="column" w="100%" gap={6} pl={4}>
                            <Heading size="sm">Sub Parameters</Heading>
                            {param.parameters.map((subParam: any, subIndex: number) => (
                                <div key={subIndex}>
                                    <Parameter indexArray={[...indexArray, subIndex]} param={subParam} />
                                </div>
                            ))}
                            {/* Add Sub Parameter Button */}
                            <Button
                                onClick={() => toolBuilderStore.addParameter(indexArray)}
                                size="lg"
                                variant="outline"
                            >Add Sub Parameter</Button>
                        </Flex>

                    ) : null}

                    {/* If array show array type */}
                    {param.type === "array" ? (
                        <Flex direction="column" w="100%" gap={6} pl={4}>
                            <Heading size="sm">Array Type</Heading>
                            <Parameter indexArray={[...indexArray, 0]} param={param.parameters[0]} />
                        </Flex>
                    ) : null}

                    {/* If enum show enum options */}
                    {param.type === "enum" ? (
                        <Flex direction="column" w="100%" gap={6} pl={4}>
                            <Heading size="sm">Enum Options</Heading>
                            {param.parameters.map((enumOption: any, enumIndex: number) => (
                                <div key={enumIndex}>
                                    <Parameter indexArray={[...indexArray, enumIndex]} param={enumOption} isEnumOption={true} />
                                </div>
                            ))}
                            {/* Add Enum Option Button */}
                            <Button
                                onClick={() => toolBuilderStore.addParameter(indexArray)}
                                size="lg"
                                variant="outline"
                            >Add Enum Option</Button>
                        </Flex>
                    ) : null}
                </>
            )}
        </Flex>
    )
});