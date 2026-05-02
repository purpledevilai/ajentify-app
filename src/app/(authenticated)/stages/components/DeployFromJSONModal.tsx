'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    AlertIcon,
    Badge,
    Box,
    Button,
    Code,
    Divider,
    Flex,
    FormControl,
    FormErrorMessage,
    FormHelperText,
    FormLabel,
    HStack,
    Heading,
    IconButton,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Tag,
    Text,
    Tooltip,
    useColorMode,
    useColorModeValue,
} from '@chakra-ui/react';
import { CheckIcon, CopyIcon } from '@chakra-ui/icons';
import MonacoEditor from '@monaco-editor/react';
import { Manifest, DeployResponse, ResourceOp } from '@/types/manifest';
import { planManifest } from '@/api/deploy/planManifest';
import { deployManifest } from '@/api/deploy/deployManifest';

// The body itself is stage-agnostic now — the target stage rides on the
// /deploy request envelope, not in the manifest. The starter template
// reflects the new shape.
const STARTER_TEMPLATE = (apiBase: string): Manifest => ({
    $schema: `${apiBase}/docs/manifest-schema.json`,
    agents: {},
    tools: {
        get_current_time: {
            name: 'get_current_time',
            description: 'Get the current date and time. No arguments.',
            is_client_side_tool: true,
        },
    },
    sres: {},
});

/**
 * Re-emit a manifest with a stable, human-friendly key order so the editor
 * always shows `$schema → agents → tools → sres`. Logical-name keys nested
 * inside each block keep their incoming order. Used both for the starter
 * template render and for re-deploy / view flows where the manifest is
 * loaded from `GET /stage/{id}/manifest` (which currently returns
 * `tools, sres, agents`).
 */
const orderManifest = (manifest: Manifest): Manifest => {
    const ordered: Manifest = {};
    if (manifest.$schema !== undefined) ordered.$schema = manifest.$schema;
    if (manifest.agents !== undefined) ordered.agents = manifest.agents;
    if (manifest.tools !== undefined) ordered.tools = manifest.tools;
    if (manifest.sres !== undefined) ordered.sres = manifest.sres;
    return ordered;
};

// Mirrors the backend `STAGE_NAME_PATTERN` so we can fail fast in the UI
// instead of round-tripping a 400.
const STAGE_NAME_RE = /^[a-z][a-z0-9-]{0,62}$/;

const OP_COLORS: Record<ResourceOp['op'], string> = {
    create: 'green',
    update: 'blue',
    delete: 'red',
    noop: 'gray',
};

interface DeployFromJSONModalProps {
    isOpen: boolean;
    onClose: () => void;
    /**
     * Optional: pre-fill the editor when invoked from a stage detail page.
     * When set, the modal also locks the stage name input — the caller is
     * importing this manifest *for that stage*, not retargeting it.
     */
    initialManifest?: Manifest | null;
    /**
     * Default stage name to put in the input. When `initialManifest` is also
     * provided the input is locked to this value (typical for "Re-deploy this
     * stage" from the stage detail page). Otherwise it's just a placeholder
     * the user can edit.
     */
    defaultStageName?: string;
    /** Called after a successful deploy with the response from the server. */
    onDeployed?: (response: DeployResponse) => void;
}

export const DeployFromJSONModal = ({
    isOpen,
    onClose,
    initialManifest,
    defaultStageName,
    onDeployed,
}: DeployFromJSONModalProps) => {
    const { colorMode } = useColorMode();
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
    const subtextColor = useColorModeValue('gray.500', 'gray.400');
    const cardBg = useColorModeValue('gray.50', 'gray.700');

    // Lock the stage input when the modal was opened with a pre-filled
    // manifest from a specific stage — re-deploying somewhere else would be
    // surprising in that flow. Free-form edits otherwise.
    const stageLocked = !!initialManifest && !!defaultStageName;

    const startingValue = useMemo(() => {
        const manifest = initialManifest ?? STARTER_TEMPLATE(apiBase);
        return JSON.stringify(orderManifest(manifest), null, 2);
    }, [initialManifest, apiBase]);

    const [text, setText] = useState(startingValue);
    const [stageName, setStageName] = useState<string>(defaultStageName ?? '');
    const [stageTouched, setStageTouched] = useState(false);
    const [parseError, setParseError] = useState<string | null>(null);
    const [planning, setPlanning] = useState(false);
    const [deploying, setDeploying] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [plan, setPlan] = useState<DeployResponse | null>(null);
    const [result, setResult] = useState<DeployResponse | null>(null);
    const [tabIndex, setTabIndex] = useState(0);
    // Drives the inline copy-to-clipboard affordance on the editor: the
    // button swaps to a green check for a couple of seconds after a
    // successful copy, no toast or alert.
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setText(startingValue);
            setStageName(defaultStageName ?? '');
            setStageTouched(false);
            setPlan(null);
            setResult(null);
            setServerError(null);
            setParseError(null);
            setTabIndex(0);
            setCopied(false);
        }
    }, [isOpen, startingValue, defaultStageName]);

    // Reset the green tick after a short delay so the icon goes back to the
    // copy glyph without the user having to interact with anything.
    useEffect(() => {
        if (!copied) return;
        const handle = window.setTimeout(() => setCopied(false), 1500);
        return () => window.clearTimeout(handle);
    }, [copied]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
        } catch {
            // Older browsers / restricted contexts: fall back to a hidden
            // textarea so the affordance still works without a toast.
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
                setCopied(true);
            } catch {
                // Give up silently — the user can still select-all in the editor.
            } finally {
                document.body.removeChild(ta);
            }
        }
    };

    const stageError = useMemo(() => {
        if (!stageTouched) return null;
        if (!stageName) return 'Stage name is required.';
        if (!STAGE_NAME_RE.test(stageName)) {
            return 'Stage names must start with a letter and use only lowercase letters, digits, and hyphens (max 63 chars).';
        }
        return null;
    }, [stageName, stageTouched]);

    const parseManifest = (): Manifest | null => {
        try {
            const parsed = JSON.parse(text) as Manifest;
            setParseError(null);
            return parsed;
        } catch (err) {
            setParseError((err as Error).message);
            return null;
        }
    };

    /** Validate the stage input and the manifest body together. Returns null on failure. */
    const collectRequest = (): { stage: string; manifest: Manifest } | null => {
        setStageTouched(true);
        if (!stageName || !STAGE_NAME_RE.test(stageName)) return null;
        const manifest = parseManifest();
        if (!manifest) return null;
        return { stage: stageName, manifest };
    };

    const handlePlan = async () => {
        const req = collectRequest();
        if (!req) return;
        setPlanning(true);
        setServerError(null);
        setResult(null);
        try {
            const response = await planManifest(req.stage, req.manifest);
            setPlan(response);
            setTabIndex(1);
        } catch (err) {
            setServerError((err as Error).message);
        } finally {
            setPlanning(false);
        }
    };

    const handleDeploy = async () => {
        const req = collectRequest();
        if (!req) return;
        setDeploying(true);
        setServerError(null);
        try {
            const response = await deployManifest(req.stage, req.manifest);
            setResult(response);
            setPlan(response);
            setTabIndex(1);
            onDeployed?.(response);
        } catch (err) {
            setServerError((err as Error).message);
        } finally {
            setDeploying(false);
        }
    };

    const renderPlan = (response: DeployResponse, isApplied: boolean) => (
        <Flex direction="column" gap={4}>
            <Flex gap={2} wrap="wrap" align="center">
                <Tag size="lg" colorScheme={isApplied ? 'green' : 'purple'} variant="solid">
                    {isApplied ? 'Deployed' : 'Plan'}
                </Tag>
                <Text fontWeight="semibold">{response.stage_name}</Text>
                {response.stage_created && (
                    <Badge colorScheme="green" variant="subtle">
                        Stage created
                    </Badge>
                )}
            </Flex>

            <HStack spacing={4}>
                <SummaryStat label="Create" count={response.summary.create} colorScheme="green" />
                <SummaryStat label="Update" count={response.summary.update} colorScheme="blue" />
                <SummaryStat label="Delete" count={response.summary.delete} colorScheme="red" />
                <SummaryStat label="No-op" count={response.summary.noop} colorScheme="gray" />
            </HStack>

            <Divider />

            {response.operations.length === 0 ? (
                <Text color={subtextColor} fontSize="sm">
                    No operations.
                </Text>
            ) : (
                <Flex direction="column" gap={2}>
                    {response.operations.map((op, idx) => (
                        <Box
                            key={`${op.kind}:${op.logical_name}:${idx}`}
                            p={3}
                            borderRadius="md"
                            bg={cardBg}
                        >
                            <Flex align="center" gap={3} wrap="wrap">
                                <Tag colorScheme={OP_COLORS[op.op]} size="sm" textTransform="uppercase">
                                    {op.op}
                                </Tag>
                                <Text fontSize="xs" color={subtextColor} fontFamily="mono">
                                    {op.kind}
                                </Text>
                                <Code fontSize="xs">{op.logical_name}</Code>
                                {op.diff_summary && (
                                    <Text fontSize="xs" color={subtextColor} flex="1" noOfLines={1}>
                                        {op.diff_summary}
                                    </Text>
                                )}
                            </Flex>
                        </Box>
                    ))}
                </Flex>
            )}
        </Flex>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Flex align="center" gap={3} wrap="wrap">
                        <Heading size="md">Manifest JSON</Heading>
                        {stageLocked ? (
                            <Tag colorScheme="brand" size="md" variant="subtle" fontFamily="mono">
                                {stageName}
                            </Tag>
                        ) : (
                            <Text fontSize="sm" color={subtextColor} fontWeight="normal">
                                Paste an <code>ajentify.json</code> manifest, plan it to
                                preview the diff, then deploy.
                            </Text>
                        )}
                    </Flex>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <Tabs index={tabIndex} onChange={setTabIndex} variant="enclosed">
                        <TabList>
                            <Tab>Manifest</Tab>
                            <Tab>{result ? 'Result' : 'Plan'}</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel px={0}>
                                {!stageLocked && (
                                    <FormControl
                                        mb={4}
                                        isRequired
                                        isInvalid={!!stageError}
                                    >
                                        <FormLabel mb={1}>Stage</FormLabel>
                                        <Input
                                            value={stageName}
                                            onChange={(e) => {
                                                setStageName(e.target.value);
                                                setStageTouched(true);
                                            }}
                                            onBlur={() => setStageTouched(true)}
                                            placeholder="e.g. frontend-staging"
                                            fontFamily="mono"
                                            size="sm"
                                            maxLength={63}
                                        />
                                        {stageError ? (
                                            <FormErrorMessage>{stageError}</FormErrorMessage>
                                        ) : (
                                            <FormHelperText>
                                                Target stage to deploy into. Created if it does
                                                not exist. Promote a manifest by deploying it
                                                again with a different stage.
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                                <Box position="relative">
                                    <MonacoEditor
                                        height="48vh"
                                        defaultLanguage="json"
                                        value={text}
                                        onChange={(value) => setText(value ?? '')}
                                        theme={colorMode === 'dark' ? 'vs-dark' : 'vs'}
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 14,
                                            lineNumbersMinChars: 2,
                                            scrollBeyondLastLine: false,
                                            scrollbar: { alwaysConsumeMouseWheel: false },
                                            formatOnPaste: true,
                                        }}
                                    />
                                    <Tooltip
                                        label={copied ? 'Copied' : 'Copy JSON'}
                                        placement="left"
                                        closeOnClick={false}
                                    >
                                        <IconButton
                                            aria-label="Copy manifest JSON"
                                            size="sm"
                                            variant="ghost"
                                            position="absolute"
                                            // Tucked into the top-right, clear of Monaco's own
                                            // scrollbar gutter so it doesn't cover line content.
                                            top={2}
                                            right={4}
                                            zIndex={2}
                                            onClick={handleCopy}
                                            color={copied ? 'green.400' : undefined}
                                            icon={copied ? <CheckIcon /> : <CopyIcon />}
                                        />
                                    </Tooltip>
                                </Box>
                                {parseError && (
                                    <Alert status="error" mt={3} variant="left-accent">
                                        <AlertIcon />
                                        <Text fontSize="sm">{parseError}</Text>
                                    </Alert>
                                )}
                                {serverError && (
                                    <Alert status="error" mt={3} variant="left-accent">
                                        <AlertIcon />
                                        <Text fontSize="sm">{serverError}</Text>
                                    </Alert>
                                )}
                            </TabPanel>
                            <TabPanel px={0}>
                                {plan ? renderPlan(plan, !!result) : (
                                    <Text color={subtextColor} fontSize="sm">
                                        Run a plan to preview operations.
                                    </Text>
                                )}
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </ModalBody>
                <ModalFooter gap={3}>
                    <Button variant="ghost" onClick={onClose}>
                        {result ? 'Close' : 'Cancel'}
                    </Button>
                    {!result && (
                        <>
                            <Button
                                onClick={handlePlan}
                                isLoading={planning}
                                loadingText="Planning…"
                                isDisabled={deploying}
                            >
                                Plan
                            </Button>
                            <Button
                                colorScheme="brand"
                                onClick={handleDeploy}
                                isLoading={deploying}
                                loadingText="Deploying…"
                                isDisabled={planning}
                            >
                                Deploy
                            </Button>
                        </>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

const SummaryStat = ({
    label,
    count,
    colorScheme,
}: {
    label: string;
    count: number;
    colorScheme: string;
}) => {
    const subtextColor = useColorModeValue('gray.600', 'gray.300');
    return (
        <HStack spacing={2}>
            <Tag colorScheme={colorScheme} variant="subtle" size="md">
                {count}
            </Tag>
            <Text fontSize="sm" color={subtextColor}>
                {label}
            </Text>
        </HStack>
    );
};

export default DeployFromJSONModal;
