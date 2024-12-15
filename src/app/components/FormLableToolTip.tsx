import { Flex, FormLabel, Tooltip, useColorModeValue } from "@chakra-ui/react";
import { QuestionIcon } from "@chakra-ui/icons";

interface FormLabelToolTipProps {
  label: string;
  tooltip: string;
}

export const FormLabelToolTip = ({ label, tooltip }: FormLabelToolTipProps) => {
  return (
    <Flex align="center" gap={2} width="fit-content">
      <FormLabel m={0}>{label}</FormLabel>
      <Tooltip label={tooltip} fontSize="md">
        <QuestionIcon color={useColorModeValue("gray.500", "gray.300")} />
      </Tooltip>
    </Flex>
  );
};