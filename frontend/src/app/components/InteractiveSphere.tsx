import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Youtube, Instagram, Twitter, Facebook, Linkedin } from 'lucide-react';


interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export function InteractiveSphere() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [canvasMousePos, setCanvasMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const rotationRef = useRef({ x: 0.3, y: 0.5 });
  const targetRotationRef = useRef({ x: 0.3, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) / 20;
        const deltaY = (e.clientY - centerY) / 20;

        setMousePosition({ x: deltaX, y: deltaY });

        targetRotationRef.current.x = 0.3 + (e.clientY - centerY) / rect.height * 0.5;
        targetRotationRef.current.y = 0.5 + (e.clientX - centerX) / rect.width * 0.5;
      }

      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 700;
    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const sphereRadius = 280;

    // Generate geodesic sphere with hexagonal mesh (outer edges only)
    const generateMeshSphere = () => {
      const vertices: Vector3D[] = [];

      // Golden ratio for icosahedron
      const t = (1.0 + Math.sqrt(5.0)) / 2.0;

      // Create icosahedron vertices (12 vertices)
      const icosahedronVertices: Vector3D[] = [
        { x: -1, y: t, z: 0 },
        { x: 1, y: t, z: 0 },
        { x: -1, y: -t, z: 0 },
        { x: 1, y: -t, z: 0 },
        { x: 0, y: -1, z: t },
        { x: 0, y: 1, z: t },
        { x: 0, y: -1, z: -t },
        { x: 0, y: 1, z: -t },
        { x: t, y: 0, z: -1 },
        { x: t, y: 0, z: 1 },
        { x: -t, y: 0, z: -1 },
        { x: -t, y: 0, z: 1 },
      ];

      // Normalize icosahedron vertices
      icosahedronVertices.forEach(v => {
        const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        v.x /= length;
        v.y /= length;
        v.z /= length;
      });

      // Icosahedron faces (20 triangular faces)
      const icosahedronFaces = [
        [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
        [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
        [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
        [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
      ];

      // Map to store midpoint indices
      const midpointCache = new Map<string, number>();

      const getMidpoint = (v1Idx: number, v2Idx: number, verts: Vector3D[]): number => {
        const key = v1Idx < v2Idx ? `${v1Idx}-${v2Idx}` : `${v2Idx}-${v1Idx}`;

        if (midpointCache.has(key)) {
          return midpointCache.get(key)!;
        }

        const v1 = verts[v1Idx];
        const v2 = verts[v2Idx];

        const mid = {
          x: (v1.x + v2.x) / 2,
          y: (v1.y + v2.y) / 2,
          z: (v1.z + v2.z) / 2
        };

        // Normalize (project to sphere)
        const length = Math.sqrt(mid.x * mid.x + mid.y * mid.y + mid.z * mid.z);
        mid.x /= length;
        mid.y /= length;
        mid.z /= length;

        const idx = verts.length;
        verts.push(mid);
        midpointCache.set(key, idx);

        return idx;
      };

      // Start with icosahedron vertices
      vertices.push(...icosahedronVertices);

      // Subdivide faces
      const subdivisionLevel = 2;
      let currentFaces = icosahedronFaces.map(f => [...f]);

      for (let level = 0; level < subdivisionLevel; level++) {
        const newFaces: number[][] = [];

        currentFaces.forEach(face => {
          const [v1, v2, v3] = face;

          const a = getMidpoint(v1, v2, vertices);
          const b = getMidpoint(v2, v3, vertices);
          const c = getMidpoint(v3, v1, vertices);

          newFaces.push([v1, a, c]);
          newFaces.push([v2, b, a]);
          newFaces.push([v3, c, b]);
          newFaces.push([a, b, c]);
        });

        currentFaces = newFaces;
      }

      // Build adjacency list to find vertex valence and neighbors
      const adjacency = new Map<number, Set<number>>();
      currentFaces.forEach(face => {
        for (let i = 0; i < 3; i++) {
          const v1 = face[i];
          const v2 = face[(i + 1) % 3];

          if (!adjacency.has(v1)) adjacency.set(v1, new Set());
          if (!adjacency.has(v2)) adjacency.set(v2, new Set());

          adjacency.get(v1)!.add(v2);
          adjacency.get(v2)!.add(v1);
        }
      });

      // Find hexagon and pentagon faces
      const hexagonFaces: number[][] = [];
      const processedVertices = new Set<number>();

      vertices.forEach((_, vertexIdx) => {
        if (processedVertices.has(vertexIdx)) return;

        const neighbors = adjacency.get(vertexIdx);
        if (!neighbors || neighbors.size < 5) return;

        // Get ordered neighbors around this vertex (forming a face)
        const orderedNeighbors: number[] = [];
        const neighborsArray = Array.from(neighbors);

        // Start with first neighbor
        let current = neighborsArray[0];
        orderedNeighbors.push(current);

        // Find the ring of neighbors
        for (let i = 0; i < neighbors.size - 1; i++) {
          const currentNeighbors = adjacency.get(current);
          if (!currentNeighbors) break;

          // Find next neighbor that is also neighbor of original vertex
          let found = false;
          for (const next of currentNeighbors) {
            if (neighbors.has(next) && !orderedNeighbors.includes(next)) {
              orderedNeighbors.push(next);
              current = next;
              found = true;
              break;
            }
          }
          if (!found) break;
        }

        // Check if we have a valid hexagon or pentagon (5 or 6 vertices)
        if (orderedNeighbors.length === 5 || orderedNeighbors.length === 6) {
          hexagonFaces.push(orderedNeighbors);
          processedVertices.add(vertexIdx);
        }
      });

      // Extract only edges where both vertices have valence 5 or 6
      const edges: [number, number][] = [];
      const edgeSet = new Set<string>();

      currentFaces.forEach(face => {
        for (let i = 0; i < 3; i++) {
          const v1 = face[i];
          const v2 = face[(i + 1) % 3];

          const valence1 = adjacency.get(v1)?.size || 0;
          const valence2 = adjacency.get(v2)?.size || 0;

          if (valence1 === 6 && valence2 === 6) {
            const edgeKey = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;

            if (!edgeSet.has(edgeKey)) {
              edgeSet.add(edgeKey);
              edges.push([v1, v2]);
            }
          }
        }
      });

      return { vertices, edges, faces: hexagonFaces };
    };

    const structure = generateMeshSphere();

    const rotatePoint = (point: Vector3D, rotX: number, rotY: number): Vector3D => {
      let x = point.x * Math.cos(rotY) - point.z * Math.sin(rotY);
      let z = point.x * Math.sin(rotY) + point.z * Math.cos(rotY);
      let y = point.y;

      const y2 = y * Math.cos(rotX) - z * Math.sin(rotX);
      const z2 = y * Math.sin(rotX) + z * Math.cos(rotX);

      return { x, y: y2, z: z2 };
    };

    const project = (point: Vector3D): { x: number; y: number; z: number } => {
      return {
        x: centerX + point.x * sphereRadius,
        y: centerY + point.y * sphereRadius,
        z: point.z * sphereRadius
      };
    };

    // Draw thin mesh lines
    const drawMeshLine = (
      v1: { x: number; y: number; z: number },
      v2: { x: number; y: number; z: number },
      depthFactor: number
    ) => {
      const baseOpacity = 0.3 + depthFactor * 0.7;

      ctx.save();

      // Draw smooth gradient line
      const gradient = ctx.createLinearGradient(v1.x, v1.y, v2.x, v2.y);
      gradient.addColorStop(0, `rgba(143, 162, 135, ${baseOpacity * 0.9})`);
      gradient.addColorStop(0.5, `rgba(164, 180, 154, ${baseOpacity})`);
      gradient.addColorStop(1, `rgba(143, 162, 135, ${baseOpacity * 0.9})`);

      ctx.beginPath();
      ctx.moveTo(v1.x, v1.y);
      ctx.lineTo(v2.x, v2.y);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Add highlight on top edge
      const highlightGradient = ctx.createLinearGradient(v1.x, v1.y - 0.5, v2.x, v2.y - 0.5);
      highlightGradient.addColorStop(0, `rgba(232, 232, 216, ${baseOpacity * 0.4})`);
      highlightGradient.addColorStop(0.5, `rgba(255, 255, 255, ${baseOpacity * 0.6})`);
      highlightGradient.addColorStop(1, `rgba(232, 232, 216, ${baseOpacity * 0.4})`);

      ctx.beginPath();
      ctx.moveTo(v1.x, v1.y);
      ctx.lineTo(v2.x, v2.y);
      ctx.strokeStyle = highlightGradient;
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, size, size);

      rotationRef.current.x += (targetRotationRef.current.x - rotationRef.current.x) * 0.05;
      rotationRef.current.y += (targetRotationRef.current.y - rotationRef.current.y) * 0.05;

      if (!isHovered) {
        rotationRef.current.y += 0.005;
      }

      const rotX = rotationRef.current.x;
      const rotY = rotationRef.current.y;

      const rotatedVertices = structure.vertices.map(v => {
        const rotated = rotatePoint(v, rotX, rotY);
        return project(rotated);
      });

      // Process faces for rendering
      const processedFaces = structure.faces.map(faceIndices => {
        const faceVertices = faceIndices.map(idx => rotatedVertices[idx]);
        const avgDepth = faceVertices.reduce((sum, v) => sum + v.z, 0) / faceVertices.length;
        return { vertices: faceVertices, depth: avgDepth, indices: faceIndices };
      });

      // Sort faces by depth (back to front)
      processedFaces.sort((a, b) => a.depth - b.depth);

      // Draw filled faces first
      processedFaces.forEach(face => {
        const depthFactor = (face.depth + sphereRadius) / (sphereRadius * 2);
        if (depthFactor < 0.2) return; // Skip back faces

        ctx.save();
        ctx.beginPath();
        face.vertices.forEach((v, i) => {
          if (i === 0) {
            ctx.moveTo(v.x, v.y);
          } else {
            ctx.lineTo(v.x, v.y);
          }
        });
        ctx.closePath();

        // Create gradient fill based on depth
        const centerX = face.vertices.reduce((sum, v) => sum + v.x, 0) / face.vertices.length;
        const centerY = face.vertices.reduce((sum, v) => sum + v.y, 0) / face.vertices.length;

        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, 40
        );

        const baseOpacity = 0.15 + depthFactor * 0.25;
        gradient.addColorStop(0, `rgba(232, 232, 216, ${baseOpacity * 1.2})`);
        gradient.addColorStop(0.5, `rgba(164, 180, 154, ${baseOpacity})`);
        gradient.addColorStop(1, `rgba(143, 162, 135, ${baseOpacity * 0.8})`);

        ctx.fillStyle = gradient;
        ctx.fill();

        // Add subtle inner glow
        const glowGradient = ctx.createRadialGradient(
          centerX - 10, centerY - 10, 0,
          centerX, centerY, 50
        );
        glowGradient.addColorStop(0, `rgba(255, 255, 255, ${baseOpacity * 0.6})`);
        glowGradient.addColorStop(0.6, `rgba(232, 232, 216, ${baseOpacity * 0.3})`);
        glowGradient.addColorStop(1, 'rgba(232, 232, 216, 0)');

        ctx.fillStyle = glowGradient;
        ctx.fill();

        ctx.restore();
      });

      // Sort edges by depth for proper rendering
      const processedEdges = structure.edges.map(([v1Idx, v2Idx]) => {
        const v1 = rotatedVertices[v1Idx];
        const v2 = rotatedVertices[v2Idx];
        const avgDepth = (v1.z + v2.z) / 2;
        return { v1, v2, depth: avgDepth, v1Idx, v2Idx };
      });

      processedEdges.sort((a, b) => a.depth - b.depth);

      // Draw mesh lines
      processedEdges.forEach(edge => {
        const depthFactor = (edge.depth + sphereRadius) / (sphereRadius * 2);
        if (depthFactor < 0.2) return; // Skip back faces

        drawMeshLine(edge.v1, edge.v2, depthFactor);
      });

      // Draw vertices as small dots at intersections
      const processedVertices = rotatedVertices.map((v, idx) => ({
        ...v,
        idx,
        depthFactor: (v.z + sphereRadius) / (sphereRadius * 2)
      }));

      processedVertices.sort((a, b) => a.depthFactor - b.depthFactor);

      processedVertices.forEach(vertex => {
        if (vertex.depthFactor < 0.2) return;

        const baseOpacity = 0.4 + vertex.depthFactor * 0.6;
        const nodeRadius = 3;

        // Small glow
        const glowGradient = ctx.createRadialGradient(
          vertex.x, vertex.y, 0,
          vertex.x, vertex.y, nodeRadius * 2
        );
        glowGradient.addColorStop(0, `rgba(164, 180, 154, ${baseOpacity * 0.6})`);
        glowGradient.addColorStop(0.7, `rgba(143, 162, 135, ${baseOpacity * 0.3})`);
        glowGradient.addColorStop(1, 'rgba(143, 162, 135, 0)');

        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, nodeRadius * 2, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();

        // Main vertex dot
        const dotGradient = ctx.createRadialGradient(
          vertex.x - nodeRadius * 0.3, vertex.y - nodeRadius * 0.3, 0,
          vertex.x, vertex.y, nodeRadius
        );
        dotGradient.addColorStop(0, `rgba(255, 255, 255, ${baseOpacity})`);
        dotGradient.addColorStop(0.3, `rgba(232, 232, 216, ${baseOpacity * 0.95})`);
        dotGradient.addColorStop(0.7, `rgba(164, 180, 154, ${baseOpacity * 0.9})`);
        dotGradient.addColorStop(1, `rgba(143, 162, 135, ${baseOpacity * 0.8})`);

        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = dotGradient;
        ctx.fill();

        // Edge rim
        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, nodeRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(143, 162, 135, ${baseOpacity * 0.7})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isHovered, canvasMousePos]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#E8E8D8] via-[#f5f5e8] to-[#E8E5D5]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsClicked(!isClicked)}
    >
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#8FA287 1px, transparent 1px), linear-gradient(90deg, #8FA287 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Large floating orbs */}
      <motion.div
        className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-[#A4B49A]/30 to-[#8FA287]/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-[#91A789]/30 to-[#5C6F5C]/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-[#8FA287]/40 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            willChange: 'transform, opacity'
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear"
          }}
        />
      ))}

      {/* Floating Social Media Icons */}
      {/* YouTube Icon */}
      <motion.div
        className="hidden lg:block absolute top-24 left-32 bg-white/90 backdrop-blur-sm p-5 rounded-2xl shadow-xl border-2 border-[#FF0000]/20 hover:border-[#FF0000]/50 transition-colors z-10"
        animate={{
          y: [0, -25, 0],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Youtube className="w-12 h-12 text-[#FF0000]" />
      </motion.div>

      {/* Instagram Icon */}
      <motion.div
        className="hidden lg:block absolute top-44 right-32 bg-white/90 backdrop-blur-sm p-5 rounded-2xl shadow-xl border-2 border-[#E4405F]/20 hover:border-[#E4405F]/50 transition-colors z-10"
        animate={{
          y: [0, -30, 0],
          rotate: [0, -12, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      >
        <Instagram className="w-12 h-12 text-[#E4405F]" />
      </motion.div>

      {/* X (Twitter) Icon */}
      <motion.div
        className="hidden lg:block absolute bottom-32 left-24 bg-white/90 backdrop-blur-sm p-5 rounded-2xl shadow-xl border-2 border-[#1DA1F2]/20 hover:border-[#1DA1F2]/50 transition-colors z-10"
        animate={{
          y: [0, 20, 0],
          rotate: [0, -8, 0],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <Twitter className="w-12 h-12 text-[#1DA1F2]" />
      </motion.div>

      {/* Facebook Icon */}
      <motion.div
        className="hidden lg:block absolute bottom-44 right-40 bg-white/90 backdrop-blur-sm p-5 rounded-2xl shadow-xl border-2 border-[#1877F2]/20 hover:border-[#1877F2]/50 transition-colors z-10"
        animate={{
          y: [0, 25, 0],
          rotate: [0, 8, 0],
        }}
        transition={{
          duration: 6.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      >
        <Facebook className="w-12 h-12 text-[#1877F2]" />
      </motion.div>

      {/* LinkedIn Icon */}
      <motion.div
        className="hidden lg:block absolute top-2/3 left-20 bg-white/90 backdrop-blur-sm p-5 rounded-2xl shadow-xl border-2 border-[#0A66C2]/20 hover:border-[#0A66C2]/50 transition-colors z-10"
        animate={{
          y: [0, -18, 0],
          rotate: [0, 12, 0],
        }}
        transition={{
          duration: 5.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      >
        <Linkedin className="w-12 h-12 text-[#0A66C2]" />
      </motion.div>

      {/* Decorative corner elements */}
      <motion.div
        className="absolute top-0 left-0 w-64 h-64 opacity-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute top-8 left-8 w-24 h-24 border-4 border-[#A4B49A] rounded-3xl" />
        <div className="absolute top-16 left-16 w-16 h-16 border-4 border-[#8FA287] rounded-2xl" />
      </motion.div>

      <motion.div
        className="absolute bottom-0 right-0 w-64 h-64 opacity-20"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute bottom-8 right-8 w-24 h-24 border-4 border-[#91A789] rounded-3xl" />
        <div className="absolute bottom-16 right-16 w-16 h-16 border-4 border-[#5C6F5C] rounded-2xl" />
      </motion.div>

      {/* Ambient glow effects */}
      <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-[#8FA287] to-[#91A789] rounded-3xl opacity-20 blur-3xl animate-pulse" />
      <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-[#A4B49A] to-[#8FA287] rounded-3xl opacity-20 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Stats badges floating around */}
      <motion.div
        className="hidden md:block absolute top-32 left-1/4 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-xl border-2 border-[#A4B49A]/30"
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="text-3xl font-bold bg-gradient-to-r from-[#8FA287] to-[#5C6F5C] bg-clip-text text-transparent">10K+</div>
        <div className="text-sm text-[#6B7965] font-semibold">Active Users</div>
      </motion.div>

      <motion.div
        className="hidden md:block absolute bottom-40 right-1/4 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-xl border-2 border-[#A4B49A]/30"
        animate={{
          y: [0, 20, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      >
        <div className="text-3xl font-bold bg-gradient-to-r from-[#91A789] to-[#607060] bg-clip-text text-transparent">500M+</div>
        <div className="text-sm text-[#6B7965] font-semibold">Posts Generated</div>
      </motion.div>

      <motion.div
        className="hidden md:block absolute top-1/3 right-24 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-xl border-2 border-[#A4B49A]/30"
        animate={{
          y: [0, -15, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      >
        <div className="text-3xl font-bold bg-gradient-to-r from-[#A4B49A] to-[#8FA287] bg-clip-text text-transparent">98%</div>
        <div className="text-sm text-[#6B7965] font-semibold">Satisfaction Rate</div>
      </motion.div>

      {/* Sphere Container - Centered */}
      <motion.div
        className="relative z-20"
        animate={{
          scale: isClicked ? 0.7 : (isHovered ? 1.08 : 1),
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 20,
        }}
      >
        <motion.div
          className="absolute rounded-full blur-3xl pointer-events-none"
          animate={{
            scale: isHovered ? 1.3 : 1.2,
            opacity: isHovered ? 0.6 : 0.4
          }}
          style={{
            background: "radial-gradient(circle, rgba(143, 162, 135, 0.6) 0%, rgba(145, 167, 137, 0.3) 40%, transparent 70%)",
            width: '100%',
            height: '100%',
            left: '-5%',
            top: '-5%',
          }}
        />

        <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] lg:w-[700px] lg:h-[700px] rounded-full overflow-visible cursor-pointer">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{
              filter: isHovered ? 'brightness(1.15) contrast(1.1)' : 'brightness(1) contrast(1)',
              transition: 'filter 0.3s ease'
            }}
          />

          <motion.div
            className="absolute top-1/2 left-1/2 w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full pointer-events-none"
            style={{
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(164, 180, 154, 0.3) 0%, rgba(143, 162, 135, 0.15) 50%, transparent 100%)',
              filter: 'blur(40px)',
            }}
            animate={{
              scale: isHovered ? 1.3 : 1,
              opacity: isHovered ? 0.7 : 0.4,
            }}
          />
        </div>

        <motion.div
          className="absolute rounded-full border-2 border-[#8FA287]/50 pointer-events-none"
          style={{
            width: 'calc(100% + 20px)',
            height: 'calc(100% + 20px)',
            left: '-10px',
            top: '-10px',
          }}
          animate={{
            scale: isHovered ? 1.15 : 1,
            opacity: isHovered ? 0.5 : 0,
            rotate: isHovered ? 360 : 0
          }}
          transition={{
            scale: { duration: 0.3 },
            opacity: { duration: 0.3 },
            rotate: { duration: 4, repeat: isHovered ? Infinity : 0, ease: "linear" }
          }}
        />
      </motion.div>

      {/* HACKATHON PROTOTYPE - Slide from CENTER to TOP */}
      <motion.div
        className="absolute top-8 sm:top-16 md:top-32 left-1/2 z-30 pointer-events-none px-4"
        initial={{ x: "-50%", y: "50vh", opacity: 0, scale: 0 }}
        animate={{
          x: "-50%",
          y: isClicked ? 0 : "50vh",
          opacity: isClicked ? 1 : 0,
          scale: isClicked ? 1 : 0
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          delay: isClicked ? 0.2 : 0
        }}
      >
        <div className="bg-gradient-to-r from-[#8FA287] to-[#91A789] px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-full shadow-2xl">
          <p className="text-white font-bold text-xs sm:text-sm md:text-lg tracking-wider whitespace-nowrap">HACKATHON PROTOTYPE</p>
        </div>
      </motion.div>

      {/* PASMI - Slide from CENTER to LEFT */}
      <motion.div
        className="absolute left-4 sm:left-8 md:left-32 top-1/2 z-30 pointer-events-none"
        initial={{ x: "50vw", y: "-50%", opacity: 0, scale: 0 }}
        animate={{
          x: isClicked ? 0 : "50vw",
          y: "-50%",
          opacity: isClicked ? 1 : 0,
          scale: isClicked ? 1 : 0
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          delay: isClicked ? 0.3 : 0
        }}
      >
        <div className="text-left">
          <div style={{ filter: 'drop-shadow(0 12px 40px rgba(92, 111, 92, 0.6))' }}>
            <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight" style={{ fontFamily: 'Georgia, serif', color: '#3d4238', letterSpacing: '-0.02em' }}>PASMI</div>
            <div className="text-lg sm:text-xl md:text-2xl font-light text-[#5C6F5C] tracking-[0.3em] uppercase mt-1">AI Social Media</div>
          </div>
          <div className="h-1 sm:h-2 w-full bg-gradient-to-r from-[#8FA287] to-transparent rounded-full mt-2 sm:mt-3 md:mt-4" />
        </div>
      </motion.div>

      {/* AI RUNS YOUR SOCIAL MEDIA - Slide from CENTER to RIGHT */}
      <motion.div
        className="absolute right-4 sm:right-8 md:right-20 top-1/2 z-30 pointer-events-none"
        initial={{ x: "-50vw", y: "-50%", opacity: 0, scale: 0 }}
        animate={{
          x: isClicked ? 0 : "-50vw",
          y: "-50%",
          opacity: isClicked ? 1 : 0,
          scale: isClicked ? 1 : 0
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          delay: isClicked ? 0.4 : 0
        }}
      >
        <div className="text-right max-w-[140px] sm:max-w-[180px] md:max-w-md">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#3d4238] leading-tight">
            AI RUNS<br />YOUR<br />SOCIAL MEDIA
          </h2>
          <div className="h-1 sm:h-2 w-32 sm:w-48 md:w-64 bg-gradient-to-l from-[#8FA287] to-transparent rounded-full mt-2 sm:mt-3 md:mt-4 ml-auto" />
        </div>
      </motion.div>

      {/* DESCRIPTION - Slide from CENTER to BOTTOM */}
      <motion.div
        className="absolute bottom-8 sm:bottom-12 md:bottom-20 left-1/2 z-30 pointer-events-none px-4"
        initial={{ x: "-50%", y: "-50vh", opacity: 0, scale: 0 }}
        animate={{
          x: "-50%",
          y: isClicked ? 0 : "-50vh",
          opacity: isClicked ? 1 : 0,
          scale: isClicked ? 1 : 0
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          delay: isClicked ? 0.5 : 0
        }}
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl border border-[#A4B49A] max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl">
          <p className="text-[#5C6F5C] text-xs sm:text-sm md:text-base lg:text-lg text-center leading-relaxed">
            Automate your entire social media strategy with AI-powered content generation,
            scheduling, analytics, and growth tools. PASMI integrates seamlessly with
            YouTube, Instagram, X, Facebook, and LinkedIn to maximize your engagement.
          </p>
        </div>
      </motion.div>

      {/* Click instruction */}
      <motion.div
        className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 text-center z-40 pointer-events-none"
        animate={{
          opacity: isClicked ? 0 : 0.6
        }}
      >
        <p className="text-xs sm:text-sm text-[#5C6F5C] font-medium">
          Click the sphere to reveal
        </p>
      </motion.div>
    </div>
  );
}