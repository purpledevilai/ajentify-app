'use client';

import {
    Box,
    Container,
    Heading,
    Link as ChakraLink,
    ListItem,
    Stack,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    UnorderedList,
    useColorModeValue,
} from '@chakra-ui/react';
import Header from '../landing/components/Header';
import Footer from '../landing/components/Footer';

const LAST_UPDATED = 'April 27, 2026';

export default function PrivacyPage() {
    const bodyColor = useColorModeValue('gray.700', 'gray.300');
    const mutedColor = useColorModeValue('gray.500', 'gray.500');
    const linkColor = useColorModeValue('brand.600', 'brand.300');
    const linkHoverColor = useColorModeValue('brand.700', 'brand.200');
    const sectionBorder = useColorModeValue('gray.200', 'gray.800');
    const blockquoteBg = useColorModeValue('gray.50', 'gray.900');
    const blockquoteBorder = useColorModeValue('brand.500', 'brand.300');
    const codeBg = useColorModeValue('gray.100', 'gray.800');

    const link = (href: string, label: string) => (
        <ChakraLink
            href={href}
            isExternal
            color={linkColor}
            _hover={{ color: linkHoverColor, textDecoration: 'underline' }}
        >
            {label}
        </ChakraLink>
    );

    const code = (children: React.ReactNode) => (
        <Box
            as="code"
            display="inline"
            bg={codeBg}
            px="1.5"
            py="0.5"
            borderRadius="sm"
            fontFamily="mono"
            fontSize="0.9em"
        >
            {children}
        </Box>
    );

    return (
        <Box>
            <Header />

            <Box as="main" py={{ base: 12, md: 16 }} px="6">
                <Container maxW="3xl">
                    <Stack spacing={{ base: 6, md: 8 }}>
                        <Stack spacing="2">
                            <Heading
                                as="h1"
                                size={{ base: 'xl', md: '2xl' }}
                                fontWeight="extrabold"
                                letterSpacing="-0.02em"
                            >
                                Data Usage Policy
                            </Heading>
                            <Text fontSize="sm" color={mutedColor}>
                                Last updated: {LAST_UPDATED}
                            </Text>
                            <Text color={bodyColor} fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.7">
                                This page describes what Ajentify does with the data you send through it,
                                what the LLM providers we wrap do with it, and what controls you have. It is
                                a plain-English companion to our terms — if anything here conflicts with the
                                terms, the terms win, but we will fix this page first.
                            </Text>
                        </Stack>

                        <Section title="The promise, in three lines" borderColor={sectionBorder}>
                            <UnorderedList spacing="3" color={bodyColor} lineHeight="1.7">
                                <ListItem>
                                    <strong>Ajentify does not train AI models on your data.</strong> We are
                                    not building a model. We have nothing to gain by reading your prompts.
                                </ListItem>
                                <ListItem>
                                    <strong>The LLM providers we wrap (OpenAI, Anthropic) do not train on
                                    API traffic by default</strong> — that is published policy on their
                                    side, with citations below.
                                </ListItem>
                                <ListItem>
                                    <strong>You can delete your data.</strong> Contexts can carry a TTL and
                                    be cleaned up automatically; everything else has a {code('DELETE')} endpoint.
                                </ListItem>
                            </UnorderedList>
                        </Section>

                        <Section title="What Ajentify stores" borderColor={sectionBorder}>
                            <Text color={bodyColor} lineHeight="1.7">
                                When you use Ajentify, the following resources are written to our database,
                                scoped to your organization:
                            </Text>
                            <UnorderedList spacing="2" color={bodyColor} lineHeight="1.7">
                                <ListItem><strong>Agents</strong> — prompt, model, tool list, voice config.</ListItem>
                                <ListItem><strong>Tools</strong> — name, description, schema, and any tool body you author.</ListItem>
                                <ListItem><strong>Contexts</strong> — the message history of a conversation: human messages, AI messages, tool calls, and tool responses.</ListItem>
                                <ListItem><strong>Documents and Data Windows</strong> — the structured memory you write to from outside the agent.</ListItem>
                                <ListItem><strong>Structured Outputs</strong> — schemas and the JSON outputs your endpoints return.</ListItem>
                                <ListItem><strong>Usage records</strong> — token counts and timestamps, for billing and rate limiting.</ListItem>
                            </UnorderedList>
                            <Text color={bodyColor} lineHeight="1.7">
                                This data is stored only to make your agent work — to replay conversation
                                history on the next turn, to authorize tool calls, to bill you for usage.{' '}
                                <strong>
                                    It is never used to train a model, ours or anyone else&apos;s. We do not
                                    sell it. We do not share it with third parties for advertising or
                                    analytics.
                                </strong>
                            </Text>
                            <Text color={bodyColor} lineHeight="1.7">
                                You can delete contexts, agents, tools, documents, and data windows at any
                                time via their respective {code('DELETE')} endpoints. Deleting your account
                                removes all of the above.
                            </Text>

                            <Heading as="h3" size="md" mt="4" mb="2" letterSpacing="-0.01em">
                                Context TTL — automatic cleanup
                            </Heading>
                            <Text color={bodyColor} lineHeight="1.7">
                                The {code('POST /context')} endpoint accepts an optional {code('ttl_days')}{' '}
                                parameter. When set, the context (and all its messages) is automatically
                                deleted after that many days. See{' '}
                                {link(
                                    'https://api.ajentify.com/docs/POST/context',
                                    'Create Context',
                                )}{' '}
                                for the full rules.
                            </Text>
                            <Text color={bodyColor} lineHeight="1.7">
                                For public-agent / unauthenticated flows, contexts carry a default 30-day TTL
                                so anonymous conversations are not retained forever.
                            </Text>
                        </Section>

                        <Section title="What Ajentify sends to LLM providers" borderColor={sectionBorder}>
                            <Text color={bodyColor} lineHeight="1.7">
                                Ajentify is a thin layer over the major LLM APIs. When your agent runs:
                            </Text>
                            <UnorderedList spacing="2" color={bodyColor} lineHeight="1.7">
                                <ListItem>
                                    The active <strong>system prompt</strong>, the{' '}
                                    <strong>conversation messages</strong>, and the{' '}
                                    <strong>tool schemas</strong> are sent over HTTPS to whichever provider
                                    hosts the model you selected (OpenAI or Anthropic, today).
                                </ListItem>
                                <ListItem>
                                    The provider returns a completion (text or tool call), which we save to
                                    the context and stream back to your client.
                                </ListItem>
                                <ListItem>
                                    We do not add an intermediate &quot;Ajentify training pipeline&quot; or
                                    any analytics provider in this path. The bytes go from our servers to
                                    the provider&apos;s servers and back.
                                </ListItem>
                            </UnorderedList>

                            <Heading as="h3" size="md" mt="6" mb="2" letterSpacing="-0.01em">
                                OpenAI
                            </Heading>
                            <Text color={bodyColor} lineHeight="1.7">
                                OpenAI&apos;s published policy for the API platform:
                            </Text>
                            <Box
                                borderLeftWidth="3px"
                                borderLeftColor={blockquoteBorder}
                                bg={blockquoteBg}
                                p="4"
                                my="3"
                                borderRadius="md"
                            >
                                <Text color={bodyColor} fontStyle="italic" lineHeight="1.7">
                                    &quot;As of March 1, 2023, data sent to the OpenAI API is not used to
                                    train or improve OpenAI models (unless you explicitly opt in to share
                                    data with us).&quot;
                                </Text>
                                <Text fontSize="sm" color={mutedColor} mt="2">
                                    —{' '}
                                    {link(
                                        'https://platform.openai.com/docs/models/how-we-use-your-data',
                                        'platform.openai.com → Data controls',
                                    )}
                                </Text>
                            </Box>
                            <Text color={bodyColor} lineHeight="1.7">
                                OpenAI also publishes their{' '}
                                {link(
                                    'https://openai.com/enterprise-privacy/',
                                    'Enterprise privacy commitments',
                                )}
                                , which restate that &quot;we do not train our models on your data by
                                default&quot; for the API platform, and document their abuse-monitoring
                                retention (30 days for most endpoints, with Zero Data Retention available
                                for qualifying customers).
                            </Text>
                            <Text color={bodyColor} lineHeight="1.7">
                                Ajentify has not opted in to any data sharing with OpenAI, and never will on
                                your behalf.
                            </Text>

                            <Heading as="h3" size="md" mt="6" mb="2" letterSpacing="-0.01em">
                                Anthropic
                            </Heading>
                            <Text color={bodyColor} lineHeight="1.7">
                                Anthropic&apos;s{' '}
                                {link(
                                    'https://www.anthropic.com/legal/commercial-terms',
                                    'Commercial Terms of Service',
                                )}{' '}
                                state, verbatim:
                            </Text>
                            <Box
                                borderLeftWidth="3px"
                                borderLeftColor={blockquoteBorder}
                                bg={blockquoteBg}
                                p="4"
                                my="3"
                                borderRadius="md"
                            >
                                <Text color={bodyColor} fontStyle="italic" lineHeight="1.7">
                                    &quot;Anthropic may not train models on Customer Content from
                                    Services.&quot;
                                </Text>
                            </Box>
                            <Text color={bodyColor} lineHeight="1.7">
                                Anthropic&apos;s API additionally retains inputs and outputs for{' '}
                                <strong>7 days by default</strong> (as of September 14, 2025) for
                                safety/abuse review, then deletes them. Zero Data Retention is available to
                                qualifying enterprise customers. See Anthropic&apos;s{' '}
                                {link(
                                    'https://www.anthropic.com/legal/service-specific-terms',
                                    'Service Specific Terms',
                                )}{' '}
                                for the full picture.
                            </Text>
                            <Text color={bodyColor} lineHeight="1.7">
                                Ajentify uses Anthropic only under these commercial terms. We have not
                                enabled the Development Partner Program or any other opt-in that would
                                allow training on Customer Content.
                            </Text>

                            <Heading as="h3" size="md" mt="6" mb="2" letterSpacing="-0.01em">
                                LangChain
                            </Heading>
                            <Text color={bodyColor} lineHeight="1.7">
                                Ajentify uses the open-source {code('langchain_openai')} and{' '}
                                {code('langchain_anthropic')} Python packages as model client libraries.{' '}
                                <strong>
                                    These are SDKs that run inside our servers and call the provider APIs
                                    directly.
                                </strong>{' '}
                                They do not phone home to LangChain Inc.
                            </Text>
                            <Text color={bodyColor} lineHeight="1.7">
                                We do <strong>not</strong> use LangSmith (LangChain&apos;s hosted tracing
                                service), so no prompts, completions, or trace data are sent to LangChain
                                Inc.
                            </Text>
                            <Text color={bodyColor} lineHeight="1.7">
                                Reference:{' '}
                                {link(
                                    'https://docs.langchain.com/langsmith/data-storage-and-privacy',
                                    'LangChain — Data storage and privacy',
                                )}
                                .
                            </Text>
                        </Section>

                        <Section title="What Ajentify does NOT do" borderColor={sectionBorder}>
                            <UnorderedList spacing="2" color={bodyColor} lineHeight="1.7">
                                <ListItem>We do not train AI models. Full stop. We are infrastructure, not a model lab.</ListItem>
                                <ListItem>We do not sell or rent your data.</ListItem>
                                <ListItem>We do not embed third-party advertising trackers in the API surface.</ListItem>
                                <ListItem>
                                    We do not read your conversations except in the rare case of an
                                    explicit, authorized debugging session at your request.
                                </ListItem>
                                <ListItem>
                                    We do not silently turn on training opt-ins on your behalf with any
                                    upstream provider.
                                </ListItem>
                            </UnorderedList>
                        </Section>

                        <Section title="Encryption and transport" borderColor={sectionBorder}>
                            <UnorderedList spacing="2" color={bodyColor} lineHeight="1.7">
                                <ListItem>All API traffic is TLS 1.2+.</ListItem>
                                <ListItem>Data at rest is encrypted by AWS-managed keys.</ListItem>
                                <ListItem>Authentication keys are JWTs signed with rotating server-side secrets.</ListItem>
                            </UnorderedList>
                        </Section>

                        <Section title="Subprocessors" borderColor={sectionBorder}>
                            <Text color={bodyColor} lineHeight="1.7">
                                The infrastructure providers we use to operate the service:
                            </Text>
                            <UnorderedList spacing="2" color={bodyColor} lineHeight="1.7">
                                <ListItem>
                                    <strong>AWS</strong> — compute, database, object storage, and
                                    authentication.
                                </ListItem>
                                <ListItem>
                                    <strong>OpenAI</strong> — LLM inference, when an OpenAI model is
                                    selected for an agent.
                                </ListItem>
                                <ListItem>
                                    <strong>Anthropic</strong> — LLM inference, when an Anthropic model is
                                    selected for an agent.
                                </ListItem>
                            </UnorderedList>
                            <Text color={bodyColor} lineHeight="1.7">
                                Each of these is bound by their own published terms, linked above. We do
                                not introduce any other subprocessors that touch agent traffic.
                            </Text>
                        </Section>

                        <Section title="Your controls" borderColor={sectionBorder}>
                            <Box overflowX="auto">
                                <Table size="sm" variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>You want to</Th>
                                            <Th>How</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        <Tr>
                                            <Td>Delete a single conversation</Td>
                                            <Td>{code('DELETE /context/{context_id}')}</Td>
                                        </Tr>
                                        <Tr>
                                            <Td>Auto-expire ephemeral conversations</Td>
                                            <Td>
                                                Pass {code('ttl_days')} on {code('POST /context')} — the
                                                context is automatically deleted at that time
                                            </Td>
                                        </Tr>
                                        <Tr>
                                            <Td>Delete an agent and all its contexts</Td>
                                            <Td>{code('DELETE /agent/{agent_id}')} (cascades)</Td>
                                        </Tr>
                                        <Tr>
                                            <Td>Choose which LLM provider sees your data</Td>
                                            <Td>
                                                Set the agent&apos;s {code('model_id')} — pick an OpenAI
                                                model or an Anthropic model
                                            </Td>
                                        </Tr>
                                        <Tr>
                                            <Td>Stop using us entirely</Td>
                                            <Td>
                                                Email us; we will delete your organization and all
                                                associated data
                                            </Td>
                                        </Tr>
                                    </Tbody>
                                </Table>
                            </Box>
                        </Section>

                        <Section title="Changes to this policy" borderColor={sectionBorder}>
                            <Text color={bodyColor} lineHeight="1.7">
                                We will update this page as the product and the provider landscape change.
                                The &quot;Last updated&quot; date at the top will always reflect the latest
                                version. Material changes will be announced to active customers via email.
                            </Text>
                        </Section>

                        <Section title="Questions" borderColor={sectionBorder}>
                            <Text color={bodyColor} lineHeight="1.7">
                                Email{' '}
                                <ChakraLink
                                    href="mailto:keanu@ajentify.com"
                                    color={linkColor}
                                    _hover={{ color: linkHoverColor, textDecoration: 'underline' }}
                                >
                                    keanu@ajentify.com
                                </ChakraLink>
                                . We answer.
                            </Text>
                        </Section>
                    </Stack>
                </Container>
            </Box>

            <Footer />
        </Box>
    );
}

function Section({
    title,
    borderColor,
    children,
}: {
    title: string;
    borderColor: string;
    children: React.ReactNode;
}) {
    return (
        <Box pt="6" borderTop="1px solid" borderColor={borderColor}>
            <Heading
                as="h2"
                size={{ base: 'lg', md: 'xl' }}
                fontWeight="bold"
                letterSpacing="-0.01em"
                mb="4"
            >
                {title}
            </Heading>
            <Stack spacing="3">{children}</Stack>
        </Box>
    );
}
