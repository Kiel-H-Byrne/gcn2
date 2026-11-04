import React from "react";
import { Box, Button, Heading, Text } from "@chakra-ui/react";
import { ArrowLeft, RotateCcw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.handleReset, this.state.error);
      }
      return (
        <Box
          p="24px 20px"
          m="20px auto"
          maxW="560px"
          bg="var(--surface-1)"
          border="1px solid var(--border-strong)"
          borderRadius="var(--radius-md)"
          textAlign="center"
          boxShadow="var(--shadow-md)"
        >
          <Heading as="h3" fontSize="1.15rem" fontWeight="700" mb="8px" color="var(--text-primary)">
            Unable to display this view
          </Heading>
          <Text fontSize="0.82rem" color="var(--text-muted)" mb="16px" lineHeight="1.5">
            {this.state.error?.message || "An unexpected error occurred while rendering this section."}
          </Text>
          <Button
            size="sm"
            colorScheme="blue"
            leftIcon={<ArrowLeft size={14} />}
            onClick={this.handleReset}
            style={{ fontWeight: 700 }}
          >
            {this.props.resetLabel || "Return to Main View"}
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

