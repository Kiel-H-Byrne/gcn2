import { Box, Flex } from "@chakra-ui/react";
import ChartOutput from "./ChartOutput";
import ShotCalculator from "./ShotCalculator";

export default function WidgetView({ bag, clubs, settings, setSettings }) {
  return (
    <Box w="100%" mt="10px">
      <Flex
        overflowX="auto"
        scrollSnapType="x mandatory"
        style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
        w="100%"
      >
        <Box minW="100%" w="100%" scrollSnapAlign="center" flex="0 0 100%" p="0 4px" boxSizing="border-box">
          {bag.length > 0 && (
            <ShotCalculator
              bag={bag}
              clubs={clubs}
              settings={settings}
              setSettings={setSettings}
              isWidgetMode={true}
            />
          )}
        </Box>
        <Box minW="100%" w="100%" scrollSnapAlign="center" flex="0 0 100%" p="0 4px" boxSizing="border-box">
          <ChartOutput
            bag={bag}
            clubs={clubs}
            settings={settings}
            isWidgetMode={true}
          />
        </Box>
      </Flex>
    </Box>
  );
}
