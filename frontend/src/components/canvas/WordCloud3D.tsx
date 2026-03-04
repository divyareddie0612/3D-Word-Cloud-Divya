import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, OrbitControls } from "@react-three/drei";
import { Group } from "three";
import Word3D from "./Word3D";

interface WordCloudItem {
  text: string;
  value: number;
}

interface WordCloud3DProps {
  words: WordCloudItem[];
}

// Spherical distribution for words
function sphericalToCartesian(radius: number, theta: number, phi: number) {
  return [
    radius * Math.sin(theta) * Math.cos(phi),
    radius * Math.sin(theta) * Math.sin(phi),
    radius * Math.cos(theta),
  ];
}

function WordCloud3D({ words }: WordCloud3DProps) {
  const groupRef = useRef<Group>(null);

  // Slow auto-rotation
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  // Distribute words in 3D space (spherical arrangement)
  const positions = words.map((_, index) => {
    const phi = Math.acos(-1 + (2 * index) / words.length);
    const theta = Math.sqrt(words.length * Math.PI) * phi;
    const radius = 15 + Math.random() * 5; // Vary radius slightly
    return sphericalToCartesian(radius, theta, phi);
  });

  return (
    <>
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={15}
        maxDistance={50}
        autoRotate={false}
      />

      <group ref={groupRef}>
        {words.map((word, index) => (
          <Word3D
            key={`${word.text}-${index}`}
            word={word.text}
            size={word.value}
            position={positions[index] as [number, number, number]}
          />
        ))}
      </group>
    </>
  );
}

export default WordCloud3D;
