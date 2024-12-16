import { Flex, Spinner } from "@chakra-ui/react"

interface ContentOrSpinnerProps {
    showSpinner: boolean;
    children: React.ReactNode;
}
export const ContentOrSpinner = ({showSpinner, children}: ContentOrSpinnerProps) => {
    if (showSpinner) {
        return (
            <Flex justify="center" align="center" width="100%" height="100%">
                <Spinner size="sm" />
            </Flex>
        )
    }
    return children;
}