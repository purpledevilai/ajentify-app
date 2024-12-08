import { Box, SimpleGrid, Heading, Text, Icon } from '@chakra-ui/react';
import { FiCheckCircle } from 'react-icons/fi';
import Card from '@/app/components/Card';

export default function FeaturesSection() {
    const features = [
        {
            title: 'Custom AI Agents',
            description: 'Create agents tailored to your business needs.',
        },
        {
            title: 'Automated Workflows',
            description: 'Streamline repetitive tasks with ease.',
        },
        {
            title: 'Multi-Channel Messaging',
            description: 'Communicate across email, SMS, Slack, and more.',
        },
    ];

    return (
        <Box as="section" py="10" px="6">
            <Heading as="h2" size="xl" textAlign="center" mb="8">
                Why Choose Ajentify?
            </Heading>
            <SimpleGrid columns={[1, 2, 3]} spacing="6">
                {features.map((feature, idx) => (
                    <Card
                        key={idx}
                    >
                        <Icon viewBox="0 0 24 24" w="6" h="6" color="brand.500" mb="2">
                            <FiCheckCircle />
                        </Icon>
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
