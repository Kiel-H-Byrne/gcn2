import React, { useRef, useState } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

export default function HalfDialControl({ label, value, onChange, min, max, step = 1, formatValue, tickLabels }) {
  const dialRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const getAngle = (e, rect) => {
    const centerX = rect.left + rect.width / 2;
    // For a half dial (semi-circle), the rotational center is at the bottom edge.
    const centerY = rect.top + rect.height; 
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // If user drags below the horizontal line, snap to min/max
    if (clientY > centerY) {
      return clientX < centerX ? -90 : 90;
    }

    // atan2 gives angle from X axis. 
    // left: -180, top: -90, right: 0 (if Y is down).
    let angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
    
    // normalize so left horizontal is -90, top vertical is 0, right horizontal is +90.
    angle = angle + 90;
    
    // clamp between -90 and 90
    if (angle < -90) angle = -90;
    if (angle > 90) angle = 90;
    
    return angle;
  };

  const updateFromPointer = (e) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const angle = getAngle(e, rect);
    
    // Map -90..90 to min..max
    // (angle + 90) / 180 goes from 0 to 1
    const percent = (angle + 90) / 180;
    let newValue = min + percent * (max - min);
    
    const steppedValue = Math.round(newValue / step) * step;
    let clampedValue = steppedValue;
    if (clampedValue < min) clampedValue = min;
    if (clampedValue > max) clampedValue = max;
    
    onChange(clampedValue);
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    e.target.setPointerCapture(e.pointerId);
    updateFromPointer(e);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    updateFromPointer(e);
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  // Map value to visual rotation (-90 to 90)
  const percent = (value - min) / (max - min);
  const visualRotation = -90 + (percent * 180);

  return (
    <Flex direction="column" align="center" gap="4px" userSelect="none">
      <Text fontSize="0.75rem" color="var(--text-muted)" fontWeight="bold" textTransform="uppercase">
        {label}: <Text as="span" color="var(--text-primary)">{formatValue ? formatValue(value) : value}</Text>
      </Text>
      
      {/* Outer container: height is half the width for a semi-circle */}
      <Box
        position="relative"
        width="100px"
        height="50px"
        overflow="hidden"
      >
        {/* Ticks */}
        {Array.from({ length: 11 }).map((_, i) => {
          const angle = -90 + (i * 180) / 10;
          const isCardinal = i === 0 || i === 5 || i === 10;
          return (
            <Box
              key={i}
              position="absolute"
              bottom="0"
              left="50%"
              transform={`translateX(-50%) rotate(${angle}deg)`}
              transformOrigin="50% 100%"
              width="2px"
              height={isCardinal ? "50px" : "44px"}
            >
              <Box width="2px" height={isCardinal ? "6px" : "3px"} bg={isCardinal ? "var(--text-secondary)" : "var(--border-strong)"} />
            </Box>
          );
        })}

        {/* The 3D Half Knob */}
        <Box
          ref={dialRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          width="84px"
          height="84px"
          position="absolute"
          bottom="-42px" // center exactly on the bottom edge
          left="8px"
          borderRadius="50%"
          bg="linear-gradient(180deg, var(--surface-2), var(--surface-1))"
          border="1px solid var(--border)"
          boxShadow="3px -3px 6px rgba(0,0,0,0.3), inset 1px 1px 2px rgba(255,255,255,0.1)"
          cursor="grab"
          _active={{ cursor: 'grabbing' }}
          style={{ touchAction: 'none' }}
        >
          {/* Dial indicator mark */}
          <Box
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            style={{ transform: `rotate(${visualRotation}deg)` }}
          >
            <Box
              position="absolute"
              top="2px"
              left="50%"
              transform="translateX(-50%)"
              width="4px"
              height="14px"
              borderRadius="4px"
              bg={isDragging ? "#60a5fa" : "#3b82f6"}
              boxShadow="0 0 4px rgba(59, 130, 246, 0.8), inset 0 1px 1px rgba(255,255,255,0.5)"
              border="1px solid rgba(0,0,0,0.2)"
            />
          </Box>
        </Box>
      </Box>
      <Flex width="100px" justify="space-between" mt="2px">
        <Text fontSize="0.65rem" color="var(--text-muted)">{tickLabels[0]}</Text>
        <Text fontSize="0.65rem" color="var(--text-muted)">{tickLabels[1]}</Text>
        <Text fontSize="0.65rem" color="var(--text-muted)">{tickLabels[2]}</Text>
      </Flex>
    </Flex>
  );
}
