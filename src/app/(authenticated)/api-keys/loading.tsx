import { Box, Skeleton, SkeletonText } from '@chakra-ui/react';

export default function ApiKeysLoading() {
  return (
    <Box p={6}>
      <Skeleton height="40px" mb={4} />
      <SkeletonText mt={4} noOfLines={6} spacing={4} />
    </Box>
  );
}
