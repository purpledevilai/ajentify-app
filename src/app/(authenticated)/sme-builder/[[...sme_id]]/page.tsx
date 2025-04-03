'use client';

import React, { useEffect, useRef, useState } from "react";
import { useNavigationGuard } from "next-navigation-guard";
import {
  Flex, FormControl, Heading, IconButton, Input, Button, Tooltip, Textarea, Box, Switch,
  Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay,
  useColorMode
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { FormLabelToolTip } from "@/app/components/FormLableToolTip";
import { useAlert } from "@/app/components/AlertProvider";
import { observer } from "mobx-react-lite";
import { smeBuilderStore } from "@/store/SingleMessageEndpointBuilderStore";
import { singleMessageEndpointsStore } from "@/store/SingleMessageEndpointStore";
import { ParameterView } from "./components/Parameter";
import { Parameter } from "@/types/parameterdefinition";

type Params = Promise<{ sme_id?: string[] }>;

interface SMEBuilderPageProps {
  params: Params;
}

const SMEBuilderPage = observer(({ params }: SMEBuilderPageProps) => {

  // Nav Guard to detect page navigation - Really dump NextJS limitiation
  const navGuard = useNavigationGuard({});
  const isShowingNavAlert = useRef(false);

  const { showAlert } = useAlert();
  const [message, setMessage] = useState("");
  const resultBackgroundColor = useColorMode().colorMode === 'dark' ? "#2b2b2b" : "#f7f7f7";

  useEffect(() => {
    setShowAlertOnStore();
    loadSMEId();

    return () => {
      smeBuilderStore.reset();
    };
  }, []);

  // Detect page navigation
  useEffect(() => {
    console.log("Nav Guard");
    if (navGuard.active && !isShowingNavAlert.current) {
      console.log("Nav Guard active");
      isShowingNavAlert.current = true;
      const isNewSME = smeBuilderStore.isNewSme;
      const stayOnPage = () => {
        isShowingNavAlert.current = false;
        navGuard.reject();
      }
      const leavePage = async () => {
        if (isNewSME && smeBuilderStore.sme.sme_id) {
          console.log("Deleting SME");
          await smeBuilderStore.deleteSME();
        }
        navGuard.accept();
      }
      console.log("hasUpdatedParameterDefinition", smeBuilderStore.hasUpdatedParameterDefinition)
      console.log("hasUpdatedSME", smeBuilderStore.hasUpdatedSME)

      if (smeBuilderStore.hasUpdatedParameterDefinition || smeBuilderStore.hasUpdatedSME || (isNewSME && !smeBuilderStore.useClickedSave)) {
        // Unsaved changes alert
        console.log("Unsaved changes alert");
        showAlert({
          title: "Unsaved Changes",
          message: "You have unsaved changes. Are you sure you want to leave?",
          actions: [
            { label: "Cancel", onClick: stayOnPage },
            { label: "Leave", onClick: leavePage }
          ]
        })
      } else {
        console.log("No unsaved changes");
        leavePage();
      }
    }
  }, [navGuard, showAlert]);

  const setShowAlertOnStore = () => {
    smeBuilderStore.setShowAlert(showAlert);
  };

  const loadSMEId = async () => {
    const paramArray = (await params).sme_id ?? undefined;
    const sme_id = paramArray ? paramArray[0] : undefined;
    if (sme_id) {
      if (smeBuilderStore.sme.sme_id !== sme_id) {
        smeBuilderStore.setSMEWithId(sme_id);
      }
    }
  };

  const onSaveSME = async () => {
    smeBuilderStore.useClickedSave = true;
    const success = await smeBuilderStore.saveSME();
    if (!success) return;
    singleMessageEndpointsStore.loadSMEs(true);
    window.history.back();
  };

  const onDeleteSMEClick = async () => {
    showAlert({
      title: "Delete SME",
      message: "Are you sure you want to delete this SME?",
      actions: [
        { label: "Cancel", onClick: () => { } },
        {
          label: "Delete", onClick: async () => {
            await smeBuilderStore.deleteSME();
            singleMessageEndpointsStore.loadSMEs(true);
            window.history.back();
          }
        }
      ]
    });
  };

  const onRunSME = async () => {
    const success = await smeBuilderStore.saveSME();
    if (!success) return;
    await smeBuilderStore.runSME(message);
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
        <Heading flex="1">SME Builder</Heading>
      </Flex>

      <Flex direction="column" w="100%" h="100%" maxW={800} gap={8}>
        {/* SME Name */}
        <FormControl>
          <FormLabelToolTip
            label="SME Name"
            tooltip="What you would like to call this Single Message Endpoint"
          />
          <Input
            mt={2}
            placeholder="Extract Order Info"
            value={smeBuilderStore.sme.name}
            onChange={(e) => smeBuilderStore.setName(e.target.value)}
          />
        </FormControl>

        {/* SME Description */}
        <FormControl>
          <FormLabelToolTip
            label="SME Description"
            tooltip="Describe what this SME does. This helps the AI understand its purpose."
          />
          <Input
            mt={2}
            placeholder="Extract customer details from a support message"
            value={smeBuilderStore.sme.description}
            onChange={(e) => smeBuilderStore.setDescription(e.target.value)}
          />
        </FormControl>

        {/* SME Is Public */}
        <FormControl>
          <FormLabelToolTip
            label="Is Public"
            tooltip="If this SME is public, it will be available to all users. If not, it will only be available to you."
          />
          <Flex alignItems="center">
            <Switch
              mt={2}
              colorScheme="purple"
              size="lg"
              isChecked={smeBuilderStore.sme.is_public}
              onChange={(e) => smeBuilderStore.setIsPublic(e.target.checked)}
            />
          </Flex>
        </FormControl>


        {/* Parameters */}
        <Heading size="md">Parameter Definition</Heading>
        {smeBuilderStore.parameters.map((param: Parameter, index: number) => (
          <div key={index}>
            <ParameterView indexArray={[index]} param={param} />
          </div>
        ))}

        <Button
          onClick={() => smeBuilderStore.addParameter([])}
          colorScheme="purple"
          size="lg"
          variant={'outline'}
        >
          Add Parameter
        </Button>

        {/* Run SME Test */}
        <Heading size="md">Test SME</Heading>
        <FormControl>
          <FormLabelToolTip
            label="Message"
            tooltip="Paste a message here to test what the SME extracts."
          />
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hi, my name is John Doe and I ordered a laptop yesterday..."
            rows={5}
          />
        </FormControl>

        <Button
          onClick={onRunSME}
          variant={"outline"}
          isLoading={smeBuilderStore.isRunningSME || smeBuilderStore.smeSaving}
          size="lg"
        >
          Run SME
        </Button>

        {/* Result Modal */}
        <Modal isOpen={!!smeBuilderStore.runResult} onClose={() => smeBuilderStore.clearRunResult()} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>SME Result</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box>
                <Heading size="sm" mb={4}>Result:</Heading>
                <pre style={{ backgroundColor: resultBackgroundColor, padding: "12px", borderRadius: "6px", whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(smeBuilderStore.runResult, null, 2)}
                </pre>
              </Box>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Save Button */}
        <Tooltip
          isDisabled={!(!smeBuilderStore.sme.name || !smeBuilderStore.sme.description)}
          label="You must enter a name and description to save"
          fontSize="md"
        >
          <Button
            onClick={onSaveSME}
            colorScheme="purple"
            size="lg"
            disabled={!smeBuilderStore.sme.name || !smeBuilderStore.sme.description}
            isLoading={smeBuilderStore.smeSaving || singleMessageEndpointsStore.smesLoading}
          >
            {smeBuilderStore.isNewSme ? "Save" : "Update"}
          </Button>
        </Tooltip>

        {/* Delete Button */}
        {!smeBuilderStore.isNewSme && (
          <Button
            onClick={onDeleteSMEClick}
            variant="outline"
            size="lg"
            isLoading={smeBuilderStore.smeDeleting}
          >
            Delete SME
          </Button>
        )}
      </Flex>
    </Flex>
  );
});

export default SMEBuilderPage;
