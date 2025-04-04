'use client';

import Card from "@/app/components/Card";
import { Flex, Text, Heading, Spacer, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, useDisclosure } from "@chakra-ui/react";
import React from "react";
import { CodeSnippet } from "@/app/components/CodeSnippet";
import { StructuredResponseEndpoint } from "@/types/structuredresponseendpoint";
import { generateSRESnippet } from "@/utils/codesnippets/StructuredResponseEndpoint";


interface SRECardProps {
    sre: StructuredResponseEndpoint;
    handleClick: (sre: StructuredResponseEndpoint) => void;
}

export const SRECard = ({ sre, handleClick }: SRECardProps) => {

    const { isOpen: isCodeModalOpen, onOpen: onCodeModalOpen, onClose: onCodeModalClose } = useDisclosure();
    const [selectedCodeView, setSelectedCodeView] = React.useState('link');

    const handleOpenCodeView = (e: React.MouseEvent) => {
        e.stopPropagation();
        onCodeModalOpen();
    };

    const getCodeSnippet = () => {
        if (selectedCodeView === "link") {
            return `https://api.ajentify.com/run-sre/${sre.sre_id}`;
        }
        if (selectedCodeView === "id") {
            return `${sre.sre_id}`;
        }
        return generateSRESnippet(sre.sre_id, selectedCodeView);
    }


    return (
        <>
            <Card
                shadow="md"
                _hover={{ shadow: 'lg' }}
                cursor="pointer"
                onClick={() => handleClick(sre)}
                minHeight="150px" // Uniform height for all cards
                p={4}
            >
                <Flex h="100%" direction="column">
                    <Heading as="h3" size="md" mb={2} isTruncated>
                        {sre.name}
                    </Heading>
                    <Text fontSize="sm" color="gray.500" isTruncated>
                        {sre.description}
                    </Text>
                    <Spacer />
                    <Button
                        size="sm"
                        onClick={(e) => handleOpenCodeView(e)}
                    >
                        Show Code
                    </Button>
                </Flex>
            </Card>
            {/* Code Modal */}
            <Modal isOpen={isCodeModalOpen} onClose={onCodeModalClose} size="2xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Code</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex gap={4} mb={4}>
                            <Button
                                size="sm"
                                variant={selectedCodeView === 'link' ? 'solid' : 'outline'}
                                onClick={() => setSelectedCodeView('link')}
                            >
                                link
                            </Button>
                            <Button
                                size="sm"
                                variant={selectedCodeView === 'javascript' ? 'solid' : 'outline'}
                                onClick={() => setSelectedCodeView('javascript')}
                            >
                                JavaScript
                            </Button>
                            <Button
                                size="sm"
                                variant={selectedCodeView === 'python' ? 'solid' : 'outline'}
                                onClick={() => setSelectedCodeView('python')}
                            >
                                Python
                            </Button>
                            <Button
                                size="sm"
                                variant={selectedCodeView === 'id' ? 'solid' : 'outline'}
                                onClick={() => setSelectedCodeView('id')}
                            >
                                ID
                            </Button>
                        </Flex>
                        {<CodeSnippet code={getCodeSnippet()} language={selectedCodeView} />}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )
};