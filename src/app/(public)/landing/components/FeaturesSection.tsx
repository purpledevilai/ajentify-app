import { Box, SimpleGrid, Heading, Text } from '@chakra-ui/react';
import { FiTool, FiTerminal, FiLink } from 'react-icons/fi';
import Card from '@/app/components/Card';

export default function FeaturesSection() {
    const features = [
        {
            title: 'Build Custom Agents',
            description: 'Create domain-specific AI agents with powerful prompts and tools — no infrastructure setup required.',
            icon: FiTerminal
        },
        {
            title: 'Conversational UI Integration',
            description: 'Easily embed agents into your web or mobile UI. Bridge the gap between AI and your app.',
            icon: FiLink
        },
        {
            title: 'Fully Custom Tools',
            description: 'Bring your own code. Write tools in python and integrate them with your agent’s reasoning engine.',
            icon: FiTool
        },
    ];

    return (
        <Box as="section" py="10" px="6">
            <Heading as="h2" size="xl" textAlign="center" mb="8">
                What Makes Ajentify Different?
            </Heading>
            <SimpleGrid columns={[1, 2, 3]} spacing="6">
                {features.map((feature, idx) => (
                    <Card key={idx}>
                        <Box mb="2" color="brand.500">
                            <feature.icon size="24" />
                        </Box>
                        <Heading as="h3" size="md" mb="2">
                            {feature.title}
                        </Heading>
                        <Text>{feature.description}</Text>
                    </Card>
                ))}
            </SimpleGrid>
        </Box>
    );
}