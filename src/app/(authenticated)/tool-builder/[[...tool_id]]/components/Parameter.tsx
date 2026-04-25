import { toolBuilderStore } from "@/store/ToolBuilderStore"
import { UIParameterNode } from "@/types/parameterdefinition";
import { CloseIcon } from "@chakra-ui/icons";

import { Checkbox, Flex, FormControl, IconButton, Select, Input, Heading, Button, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite";

interface ParameterProps {
    indexArray: number[];
    param: UIParameterNode;
    isEnumOption?: boolean;
    showDelete?: boolean;
}

const PRIMITIVE_TYPES: ReadonlySet<UIParameterNode['type']> = new Set(['string', 'number', 'integer', 'boolean']);

export const ParameterView: React.FC<ParameterProps> = observer(({ indexArray, param, isEnumOption = false, showDelete = true }) => {
    const isPrimitive = PRIMITIVE_TYPES.has(param.type);
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
                {showDelete && <IconButton
                    aria-label="Delete"
                    icon={<CloseIcon />}
                    variant="ghost"
                    color="inherit"
                    _hover={{ bg: 'gray.200', _dark: { bg: 'gray.700' } }}
                    onClick={() => toolBuilderStore.deleteParameter(indexArray)}
                />}
            </Flex>

            {!isEnumOption && (
                <>
                    {/* Parameter Type */}
                    <FormControl>
                        <Select
                            value={param.type}
                            onChange={(e) => toolBuilderStore.setParameterType(indexArray, e.target.value as UIParameterNode['type'])}
                        >
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="integer">Integer</option>
                            <option value="boolean">Boolean</option>
                            <option value="object">Object</option>
                            <option value="array">Array</option>
                            <option value="enum">Enum</option>
                        </Select>
                    </FormControl>

                    {/* Required toggle */}
                    <FormControl>
                        <Checkbox
                            isChecked={param.required}
                            onChange={(e) => toolBuilderStore.setParameterRequired(indexArray, e.target.checked)}
                        >
                            Required
                        </Checkbox>
                    </FormControl>

                    {/* Parameter Description */}
                    <FormControl>
                        <Input
                            placeholder="Description..."
                            value={param.description}
                            onChange={(e) => toolBuilderStore.setParameterDescription(indexArray, e.target.value)}
                        />
                    </FormControl>

                    {/* Default value (primitives only) */}
                    {isPrimitive && (
                        <FormControl>
                            <Text fontSize="sm" mb={1}>Default value (optional)</Text>
                            <DefaultValueInput
                                param={param}
                                onChange={(value) => toolBuilderStore.setParameterDefaultValue(indexArray, value)}
                            />
                        </FormControl>
                    )}

                    {/* If object show sub parameters */}
                    {param.type === "object" ? (
                        <Flex direction="column" w="100%" gap={6} pl={4}>
                            <Heading size="sm">Sub Parameters</Heading>
                            {param.parameters.map((subParam: UIParameterNode, subIndex: number) => (
                                <div key={subIndex}>
                                    <ParameterView indexArray={[...indexArray, subIndex]} param={subParam} />
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
                            <ParameterView indexArray={[...indexArray, 0]} param={param.parameters[0]} showDelete={false}/>
                        </Flex>
                    ) : null}

                    {/* If enum show enum options */}
                    {param.type === "enum" ? (
                        <Flex direction="column" w="100%" gap={6} pl={4}>
                            <Heading size="sm">Enum Options</Heading>
                            {param.parameters.map((enumOption: UIParameterNode, enumIndex: number) => (
                                <div key={enumIndex}>
                                    <ParameterView indexArray={[...indexArray, enumIndex]} param={enumOption} isEnumOption={true} />
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


interface DefaultValueInputProps {
    param: UIParameterNode;
    onChange: (value: string | number | boolean | undefined) => void;
}

const DefaultValueInput: React.FC<DefaultValueInputProps> = observer(({ param, onChange }) => {
    if (param.type === 'boolean') {
        return (
            <Checkbox
                isChecked={param.defaultValue === true}
                onChange={(e) => onChange(e.target.checked)}
            >
                Default to true
            </Checkbox>
        );
    }
    const value = param.defaultValue !== undefined ? String(param.defaultValue) : '';
    return (
        <Input
            placeholder="Default..."
            type={param.type === 'number' || param.type === 'integer' ? 'number' : 'text'}
            value={value}
            onChange={(e) => {
                const raw = e.target.value;
                if (raw === '') return onChange(undefined);
                if (param.type === 'integer') return onChange(parseInt(raw, 10));
                if (param.type === 'number') return onChange(parseFloat(raw));
                onChange(raw);
            }}
        />
    );
});
