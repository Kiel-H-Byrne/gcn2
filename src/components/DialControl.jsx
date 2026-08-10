import React, { useRef, useState } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

export default function DialControl({ label, value, onChange, min = 0, max = Infinity, step = 1, unitsPerRotation = 1, formatValue }) {
  const dialRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastAngleRef = useRef(0);
  const exactValueRef = useRef(value);

  // Sync ref with external value when not dragging
  if (!isDragging) {
    exactValueRef.current = value;
  }

  const getAngle = (e, rect) => {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
  };

  const handlePointerDown = (e) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    lastAngleRef.current = getAngle(e, rect);
    exactValueRef.current = value;
    setIsDragging(true);
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const currentAngle = getAngle(e, rect);
    
    let deltaAngle = currentAngle - lastAngleRef.current;
    
    // Handle wrap-around (e.g., crossing from 179 to -179)
    if (deltaAngle > 180) deltaAngle -= 360;
    if (deltaAngle < -180) deltaAngle += 360;

    lastAngleRef.current = currentAngle;

    // Calculate value change
    const deltaValue = (deltaAngle / 360) * unitsPerRotation;
    let newValue = exactValueRef.current + deltaValue;

    // Clamp
    if (newValue < min) newValue = min;
    if (newValue > max) newValue = max;

    exactValueRef.current = newValue;

    // Apply step rounding for the onChange
    const steppedValue = Math.round(newValue / step) * step;
    onChange(steppedValue);
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  // Calculate visual rotation based on value
  // If value is 1.5 and unitsPerRotation is 1, rotation is 1.5 * 360 = 540 degrees
  const visualRotation = (value / unitsPerRotation) * 360;

  return (
    <Flex direction="column" align="center" gap="8px" userSelect="none">
      <Text fontSize="0.8rem" color="var(--text-muted)" fontWeight="bold" textTransform="uppercase">{label}</Text>
      <Box
        position="relative"
        width="80px"
        height="80px"
      >
        {/* Static outer ticks */}
        {Array.from({ length: 24 }).map((_, i) => {
          const isCardinal = i % 6 === 0;
          return (
            <Box
              key={i}
              position="absolute"
              top="0"
              left="50%"
              transform={`translateX(-50%) rotate(${(i * 360) / 24}deg)`}
              transformOrigin="50% 40px"
              width="2px"
              height={isCardinal ? "6px" : "3px"}
              bg={isCardinal ? "var(--text-secondary)" : "var(--border-strong)"}
            />
          );
        })}

        {/* The 3D Knob */}
        <Box
          ref={dialRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          width="64px"
          height="64px"
          position="absolute"
          top="8px"
          left="8px"
          borderRadius="50%"
          bg="linear-gradient(145deg, var(--surface-2), var(--surface-1))"
          border="1px solid var(--border)"
          boxShadow="3px 3px 6px rgba(0,0,0,0.4), -2px -2px 5px rgba(255,255,255,0.03), inset 1px 1px 2px rgba(255,255,255,0.1)"
          cursor="grab"
          _active={{ cursor: 'grabbing' }}
          style={{ touchAction: 'none' }}
        >
          {/* Dial indicator mark (the line that rotates) */}
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
              bg={isDragging ? "#60a5fa" : "#3b82f6"} // bright blue that works in light/dark
              boxShadow="0 0 4px rgba(59, 130, 246, 0.8), inset 0 1px 1px rgba(255,255,255,0.5)"
              border="1px solid rgba(0,0,0,0.2)"
            />
          </Box>
          <Flex position="absolute" inset="0" align="center" justify="center">
            <Text fontSize="0.9rem" fontWeight="bold" color="var(--text-primary)" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
              {formatValue ? formatValue(value) : value}
            </Text>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
}
