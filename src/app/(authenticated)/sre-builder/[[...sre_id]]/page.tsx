'use client';

import React, { useEffect, useRef } from "react";
import { useNavigationGuard } from "next-navigation-guard";
import {
  Flex, FormControl, Heading, IconButton, Input, Button, Tooltip, Textarea, Box, Switch,
  Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay,
  useColorMode, Text, FormLabel
} from "@chakra-ui/react";
import { ArrowBackIcon, AddIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { FormLabelToolTip } from "@/app/components/FormLableToolTip";
import { useAlert } from "@/app/components/AlertProvider";
import { observer } from "mobx-react-lite";
import { sreBuilderStore } from "@/store/StructuredResponseEndpointBuilderStore";
import { structuredResponseEndpointsStore } from "@/store/StructuredResponseEndpointStore";
import { ParameterView } from "./components/Parameter";
import { Parameter } from "@/types/parameterdefinition";
import { ModelSelector } from "@/app/components/ModelSelector";

type Params = Promise<{ sre_id?: string[] }>;

interface SREBuilderPageProps {
  params: Params;
}

const SREBuilderPage = observer(({ params }: SREBuilderPageProps) => {

  // Nav Guard to detect page navigation - Really dump NextJS limitiation
  const hasUnsavedChanges = sreBuilderStore.hasUpdatedParameterDefinition || sreBuilderStore.hasUpdatedSRE;
  const isNewButDidNotClickSave = sreBuilderStore.isNewSme && !sreBuilderStore.useClickedSave;
  const shouldGuardNavigation = hasUnsavedChanges || isNewButDidNotClickSave;
  const navGuard = useNavigationGuard({ enabled: shouldGuardNavigation });
  const isShowingNavAlert = useRef(false);

  const { showAlert } = useAlert();
  const resultBackgroundColor = useColorMode().colorMode === 'dark' ? "#2b2b2b" : "#f7f7f7";

  useEffect(() => {
    setShowAlertOnStore();
    loadSREId();

    return () => {
      sreBuilderStore.reset();
    };
  }, []);

  // Detect page navigation
  useEffect(() => {
    
    if (navGuard.active && !isShowingNavAlert.current) {
      isShowingNavAlert.current = true;

      const stayOnPage = () => {
        isShowingNavAlert.current = false;
        navGuard.reject();
      }

      const leavePage = async () => {
        navGuard.accept();
      }

      // Show alert if there are unsaved changes
      // OR if the SRE is new and the user has not clicked save
      const hasUnsavedChanges = sreBuilderStore.hasUpdatedParameterDefinition || sreBuilderStore.hasUpdatedSRE;
      const isNewButDidNotClickSave = sreBuilderStore.isNewSme && !sreBuilderStore.useClickedSave;
      if (hasUnsavedChanges || isNewButDidNotClickSave) {
        showAlert({
          title: "Unsaved Changes",
          message: "You have unsaved changes. Are you sure you want to leave?",
          actions: [
            { label: "Cancel", onClick: stayOnPage },
            { label: "Leave", onClick: leavePage }
          ]
        })
      } else {
        leavePage();
      }
    }
  }, [navGuard, showAlert]);

  const setShowAlertOnStore = () => {
    sreBuilderStore.setShowAlert(showAlert);
  };

  const loadSREId = async () => {
    const paramArray = (await params).sre_id ?? undefined;
    const sre_id = paramArray ? paramArray[0] : undefined;
    if (sre_id) {
      if (sreBuilderStore.sre.sre_id !== sre_id) {
        sreBuilderStore.setSREWithId(sre_id);
      }
    }
  };

  const onSaveSRE = async () => {
    sreBuilderStore.useClickedSave = true;
    const success = await sreBuilderStore.saveSRE();
    if (!success) return;
    structuredResponseEndpointsStore.loadSREs(true);
    window.history.back();
  };

  const onDeleteSREClick = async () => {
    showAlert({
      title: "Delete SRE",
      message: "Are you sure you want to delete this SRE?",
      actions: [
        { label: "Cancel", onClick: () => { } },
        {
          label: "Delete", onClick: async () => {
            await sreBuilderStore.deleteSRE();
            structuredResponseEndpointsStore.loadSREs(true);
            window.history.back();
          }
        }
      ]
    });
  };

  const onRunSRE = async () => {
    const success = await sreBuilderStore.saveSRE();
    if (!success) return;
    await sreBuilderStore.runSRE();
  };


  return (
    <Flex p={4} direction="column" alignItems="center" h="100%" w="100%">
      {/* Header Section */}
      <Flex direction="row" w="100%" mb={8} gap={4} align="center">
        <IconButton
          aria-label="Back"
          icon={<ArrowBackIcon />}
          variant="ghost"
          color="inherit"
          _hover={{ bg: 'gray.200', _dark: { bg: 'gray.700' } }}
          onClick={() => window.history.back()}
        />
        <Heading flex="1">Endpoint Builder</Heading>
      </Flex>

      <Flex direction="column" w="100%" h="100%" maxW={800} gap={8}>
        {/* SRE Name */}
        <FormControl>
          <FormLabelToolTip
            label="Name"
            tooltip="What you would like to call this Structured Response Endpoint"
          />
          <Input
            mt={2}
            placeholder="Extract Order Info"
            value={sreBuilderStore.sre.name}
            onChange={(e) => sreBuilderStore.setName(e.target.value)}
          />
        </FormControl>

        {/* SRE Description */}
        <FormControl>
          <FormLabelToolTip
            label="Description"
            tooltip="Describe what this SRE does. This helps the AI understand its purpose."
          />
          <Input
            mt={2}
            placeholder="Extract customer details from a support message"
            value={sreBuilderStore.sre.description}
            onChange={(e) => sreBuilderStore.setDescription(e.target.value)}
          />
        </FormControl>

        {/* Variable Names — shown for new SREs always, for legacy SREs behind a toggle */}
        {sreBuilderStore.isLegacySRE && (
          <FormControl>
            <FormLabelToolTip
              label="Use Variable Names"
              tooltip="Enable to define explicit variable names for this endpoint's prompt template. This upgrades it to the new variable-based system."
            />
            <Switch
              mt={2}
              colorScheme="purple"
              size="lg"
              isChecked={sreBuilderStore.useVariableNames}
              onChange={(e) => sreBuilderStore.setUseVariableNames(e.target.checked)}
            />
          </FormControl>
        )}

        {sreBuilderStore.showVariableNamesUI && (
          <Flex direction="column" w="100%" gap={4}>
            <FormLabelToolTip
              label="Variable Names"
              tooltip="Define the variable name strings that appear in your prompt template. Each name will be replaced at runtime with the value you supply when calling this endpoint."
            />
            {(sreBuilderStore.sre.variable_names ?? []).map((varName, index) => (
              <Flex key={index} direction="row" align="center" gap={2}>
                <Input
                  placeholder="CUSTOMER_MESSAGE"
                  value={varName}
                  onChange={(e) => sreBuilderStore.updateVariableName(index, e.target.value)}
                />
                <IconButton
                  aria-label="Remove variable"
                  icon={<SmallCloseIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={() => sreBuilderStore.removeVariableName(index)}
                />
              </Flex>
            ))}
            <Button
              size="sm"
              leftIcon={<AddIcon />}
              variant="outline"
              onClick={() => sreBuilderStore.addVariableName()}
              w="fit-content"
            >
              Add Variable
            </Button>
          </Flex>
        )}

        {/* Prompt Template */}
        <FormControl>
          <FormLabelToolTip
            label="Prompt Template"
            tooltip="The prompt sent to the LLM. Include your variable names as plain text strings — they will be replaced with the values you provide when running this endpoint."
          />
          <Textarea
            mt={2}
            placeholder="Extract order details from the following text: CUSTOMER_MESSAGE"
            value={sreBuilderStore.sre.prompt_template}
            onChange={(e) => sreBuilderStore.setPromptTemplate(e.target.value)}
            rows={5}
          />
        </FormControl>

        {/* Model Selection */}
        <FormControl>
          <FormLabelToolTip
            label="Model"
            tooltip="Select the LLM model this endpoint will use. Default is gpt-4.1."
          />
          <ModelSelector
            value={sreBuilderStore.sre.model_id}
            onChange={(modelId) => sreBuilderStore.setModelId(modelId)}
          />
        </FormControl>

        {/* SRE Is Public */}
        <FormControl>
          <FormLabelToolTip
            label="Is Public"
            tooltip="If this SRE is public, it will be available to all users. If not, it will only be available to you."
          />
          <Flex alignItems="center">
            <Switch
              mt={2}
              colorScheme="purple"
              size="lg"
              isChecked={sreBuilderStore.sre.is_public}
              onChange={(e) => sreBuilderStore.setIsPublic(e.target.checked)}
            />
          </Flex>
        </FormControl>


        {/* Parameters */}
        <Heading size="md">Response Structure</Heading>
        {sreBuilderStore.parameters.map((param: Parameter, index: number) => (
          <div key={index}>
            <ParameterView indexArray={[index]} param={param} />
          </div>
        ))}

        <Button
          onClick={() => sreBuilderStore.addParameter([])}
          colorScheme="purple"
          size="lg"
          variant={'outline'}
          isLoading={sreBuilderStore.isLoadingParameterDefinition}
        >
          Add Field
        </Button>

        {/* Run SRE Test */}
        <Heading size="md">Test Structured Response Endpoint</Heading>

        {/* Test inputs for new-style SREs (variable_names) */}
        {sreBuilderStore.showVariableNamesUI && (sreBuilderStore.sre.variable_names ?? []).length > 0 && (
          <Flex direction="column" gap={4} w="100%">
            {(sreBuilderStore.sre.variable_names ?? []).map((varName, idx) => (
              <FormControl key={idx}>
                <FormLabel>{varName || `Variable ${idx + 1}`}</FormLabel>
                <Input
                  placeholder="Value"
                  value={sreBuilderStore.variableNamesInput[varName] ?? ''}
                  onChange={(e) => sreBuilderStore.updateVariableNameInput(varName, e.target.value)}
                />
              </FormControl>
            ))}
          </Flex>
        )}

        {/* Test inputs for legacy SREs ({variable} placeholders) */}
        {!sreBuilderStore.showVariableNamesUI && sreBuilderStore.templateArgs.length > 0 && (
          <Flex direction="column" gap={4} w="100%">
            {sreBuilderStore.templateArgs.map((arg, idx) => (
              <FormControl key={idx}>
                <FormLabel>{arg}</FormLabel>
                <Input
                  placeholder="Value"
                  value={sreBuilderStore.templateArgsInput[arg] ?? ''}
                  onChange={(e) => sreBuilderStore.updateTemplateArg(arg, e.target.value)}
                />
              </FormControl>
            ))}
          </Flex>
        )}

        {/* No variables defined yet (new SRE, no names added) */}
        {sreBuilderStore.showVariableNamesUI && (sreBuilderStore.sre.variable_names ?? []).length === 0 && (
          <Text color="gray.500" fontSize="sm">
            Add at least one variable name above to test this endpoint.
          </Text>
        )}

        <Button
          onClick={onRunSRE}
          variant={"outline"}
          isLoading={sreBuilderStore.isRunningSRE || sreBuilderStore.sreSaving}
          size="lg"
        >
          Test Endpoint
        </Button>

        {/* Result Modal */}
        <Modal isOpen={!!sreBuilderStore.runResult} onClose={() => sreBuilderStore.clearRunResult()} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>SRE Result</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box>
                <Heading size="sm" mb={4}>Result:</Heading>
                <pre style={{ backgroundColor: resultBackgroundColor, padding: "12px", borderRadius: "6px", whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(sreBuilderStore.runResult, null, 2)}
                </pre>
              </Box>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Save Button */}
        <Tooltip
          isDisabled={!(!sreBuilderStore.sre.name || !sreBuilderStore.sre.description)}
          label="You must enter a name and description to save"
          fontSize="md"
        >
          <Button
            onClick={onSaveSRE}
            colorScheme="purple"
            size="lg"
            disabled={!sreBuilderStore.sre.name || !sreBuilderStore.sre.description}
            isLoading={sreBuilderStore.sreSaving || structuredResponseEndpointsStore.sresLoading}
          >
            {sreBuilderStore.isNewSme ? "Save" : "Update"}
          </Button>
        </Tooltip>

        {/* Delete Button */}
        {!sreBuilderStore.isNewSme && (
          <Button
            onClick={onDeleteSREClick}
            variant="outline"
            size="lg"
            isLoading={sreBuilderStore.sreDeleting}
          >
            Delete SRE
          </Button>
        )}
      </Flex>
    </Flex>
  );
});

export default SREBuilderPage;
