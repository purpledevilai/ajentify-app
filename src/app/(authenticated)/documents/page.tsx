'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { jsonDocumentsStore } from '@/store/JsonDocumentsStore';
import { jsonDocumentBuilderStore } from '@/store/JsonDocumentBuilderStore';
import { JsonDocument } from '@/types/jsondocument';
import {
  Box,
  Heading,
  Grid,
  GridItem,
  Flex,
  Text,
  Spinner,
} from '@chakra-ui/react';
import Card from '@/app/components/Card';
import { useAlert } from '@/app/components/AlertProvider';
import { authStore } from '@/store/AuthStore';

const DocumentsPage = observer(() => {
  const router = useRouter();
  const { showAlert } = useAlert();

  useEffect(() => {
    if (!authStore.signedIn) return;
    jsonDocumentsStore.setShowAlert(showAlert);
    jsonDocumentsStore.loadDocuments();
  });

  const handleAddDocumentClick = () => {
    jsonDocumentBuilderStore.reset();
    jsonDocumentBuilderStore.setIsNewDocument(true);
    router.push('/json-document-builder');
  };

  const handleDocumentClick = (doc: JsonDocument) => {
    jsonDocumentBuilderStore.setDocument({ ...doc });
    router.push(`/json-document-builder/${doc.document_id}`);
  };

  return (
    <Box p={6}>
      <Heading as="h1" size="xl" mb={6}>
        Documents
      </Heading>
      {jsonDocumentsStore.documentsLoading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Box>
          <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={6}>
            <GridItem>
              <Flex
                align="center"
                justify="center"
                bg="gray.100"
                _dark={{ bg: 'gray.700', borderColor: 'gray.600' }}
                p={6}
                borderRadius="md"
                border="1px dashed"
                borderColor="gray.300"
                cursor="pointer"
                _hover={{ bg: 'gray.200', _dark: { bg: 'gray.600' } }}
                onClick={handleAddDocumentClick}
                minHeight="150px"
              >
                <Text fontWeight="bold" color="brand.500">
                  + Add Document
                </Text>
              </Flex>
            </GridItem>
            {jsonDocumentsStore.documents ? (
              jsonDocumentsStore.documents.map((doc) => (
                <GridItem key={doc.document_id}>
                  <Card
                    shadow="md"
                    _hover={{ shadow: 'lg' }}
                    cursor="pointer"
                    onClick={() => handleDocumentClick(doc)}
                    minHeight="150px"
                  >
                    <Flex h="100%" direction="column">
                      <Heading as="h3" size="md" mb={2} isTruncated>
                        {doc.name}
                      </Heading>
                    </Flex>
                  </Card>
                </GridItem>
              ))
            ) : (
              <Text>No documents found</Text>
            )}
          </Grid>
        </Box>
      )}
    </Box>
  );
});

export default DocumentsPage;
