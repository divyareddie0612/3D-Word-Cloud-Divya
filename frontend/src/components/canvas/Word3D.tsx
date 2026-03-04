import { useState, useRef } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Word3DProps {
  word: string;
  size: number;
  position: [number, number, number];
}

function Word3D({ word, size, position }: Word3DProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<any>(null);
  const targetScale = hovered ? 1.5 : 1;
  const currentScale = useRef(1);

  // Smooth scale animation on hover
  useFrame(() => {
    if (meshRef.current) {
      currentScale.current += (targetScale - currentScale.current) * 0.1;
      meshRef.current.scale.setScalar(currentScale.current);
    }
  });

  // Map size (20-100) to font size (0.3-1.5)
  const fontSize = 0.3 + ((size - 20) / 80) * 1.2;

  // Color based on size (gradient from purple to cyan)
  const getColor = () => {
    if (hovered) return "#00f3ff"; // Cyan on hover
    const ratio = (size - 20) / 80;
    // Interpolate between purple and cyan
    const r = Math.floor(112 * (1 - ratio) + 0 * ratio);
    const g = Math.floor(0 * (1 - ratio) + 243 * ratio);
    const b = Math.floor(255 * (1 - ratio) + 255 * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <Text
      ref={meshRef}
      position={position}
      fontSize={fontSize}
      color={getColor()}
      anchorX="center"
      anchorY="middle"
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {word}
    </Text>
  );
}

export default Word3D;
