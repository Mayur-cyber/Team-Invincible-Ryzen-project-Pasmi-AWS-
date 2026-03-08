import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

// Social Media Icon Component
function FloatingSocialIcon({ icon, delay, duration, startX, startY }: { 
  icon: React.ReactNode; 
  delay: number; 
  duration: number;
  startX: string;
  startY: string;
}) {
  return (
    <div
      className="absolute opacity-20"
      style={{
        left: startX,
        top: startY,
        animation: `float ${duration}s ease-in-out ${delay}s infinite`,
      }}
    >
      {icon}
    </div>
  );
}

// 3D Wireframe Sphere Component
function WireframeSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 171;

    const vertices: { x: number; y: number; z: number }[] = [];
    const latitudes = 12;
    const longitudes = 16;

    for (let lat = 0; lat <= latitudes; lat++) {
      const theta = (lat * Math.PI) / latitudes;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let lon = 0; lon <= longitudes; lon++) {
        const phi = (lon * 2 * Math.PI) / longitudes;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const x = radius * cosPhi * sinTheta;
        const y = radius * cosTheta;
        const z = radius * sinPhi * sinTheta;

        vertices.push({ x, y, z });
      }
    }

    let animationId: number;
    let rotX = 0;
    let rotY = 0;

    const animate = () => {
      rotY += 0.005;
      rotX += 0.002;
      setRotation({ x: rotX, y: rotY });

      ctx.clearRect(0, 0, width, height);

      const projected: { x: number; y: number; z: number }[] = [];
      
      vertices.forEach(vertex => {
        let x = vertex.x * Math.cos(rotY) - vertex.z * Math.sin(rotY);
        let z = vertex.x * Math.sin(rotY) + vertex.z * Math.cos(rotY);
        let y = vertex.y;

        const y2 = y * Math.cos(rotX) - z * Math.sin(rotX);
        const z2 = y * Math.sin(rotX) + z * Math.cos(rotX);

        projected.push({ x: x + centerX, y: y2 + centerY, z: z2 });
      });

      const faces: { indices: number[]; avgZ: number }[] = [];
      
      for (let lat = 0; lat < latitudes; lat++) {
        for (let lon = 0; lon < longitudes; lon++) {
          const current = lat * (longitudes + 1) + lon;
          const next = current + 1;
          const below = current + (longitudes + 1);
          const belowNext = below + 1;

          const avgZ1 = (projected[current].z + projected[next].z + projected[below].z) / 3;
          faces.push({ indices: [current, next, below], avgZ: avgZ1 });
          
          const avgZ2 = (projected[next].z + projected[belowNext].z + projected[below].z) / 3;
          faces.push({ indices: [next, belowNext, below], avgZ: avgZ2 });
        }
      }

      faces.sort((a, b) => a.avgZ - b.avgZ);

      faces.forEach(face => {
        const [i1, i2, i3] = face.indices;
        const p1 = projected[i1];
        const p2 = projected[i2];
        const p3 = projected[i3];

        const brightness = Math.max(0.15, Math.min(0.4, (face.avgZ + 200) / 600));
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        
        ctx.fillStyle = `rgba(146, 166, 138, ${brightness})`;
        ctx.fill();
      });

      ctx.strokeStyle = 'rgba(146, 166, 138, 0.5)';
      ctx.lineWidth = 1.5;

      for (let lat = 0; lat < latitudes; lat++) {
        for (let lon = 0; lon < longitudes; lon++) {
          const current = lat * (longitudes + 1) + lon;
          const next = current + 1;
          const below = current + (longitudes + 1);

          if (lon < longitudes) {
            ctx.beginPath();
            ctx.moveTo(projected[current].x, projected[current].y);
            ctx.lineTo(projected[next].x, projected[next].y);
            ctx.stroke();
          }

          if (lat < latitudes) {
            ctx.beginPath();
            ctx.moveTo(projected[current].x, projected[current].y);
            ctx.lineTo(projected[below].x, projected[below].y);
            ctx.stroke();
          }
        }
      }

      projected.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(146, 166, 138, 0.6)';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(146, 166, 138, 0.2)';
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="relative z-10"
      />
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[80px] rounded-full blur-[60px]"
        style={{ background: '#5F7563', opacity: 0.15 }}
      />
    </div>
  );
}

export function ProfessionalHeroSection() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [smoothPosition, setSmoothPosition] = useState({ x: 0.5, y: 0.5 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    
    const smoothAnimate = () => {
      setSmoothPosition(prev => ({
        x: prev.x + (mousePosition.x - prev.x) * 0.1,
        y: prev.y + (mousePosition.y - prev.y) * 0.1
      }));
      animationFrameId = requestAnimationFrame(smoothAnimate);
    };

    smoothAnimate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePosition]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (headlineRef.current) {
      const rect = headlineRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePosition({ x, y });
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePosition({ x: 0.5, y: 0.5 });
  };

  const socialIcons = [
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="#5F7563">
          <path d="M22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43c-1.14 0-2.06-.93-2.06-2.06 0-1.14.93-2.06 2.06-2.06 1.14 0 2.06.93 2.06 2.06 0 1.14-.92 2.06-2.06 2.06zM20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.95v5.66H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28z"/>
        </svg>
      ),
      delay: 0, duration: 8, startX: '10%', startY: '15%'
    },
    {
      icon: (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="#5F7563">
          <path d="M23.95 4.57c-.88.39-1.83.65-2.83.77 1.02-.61 1.8-1.58 2.17-2.73-.95.56-2.01.97-3.13 1.19-.9-.96-2.18-1.56-3.59-1.56-2.72 0-4.92 2.2-4.92 4.92 0 .39.04.76.13 1.12-4.09-.2-7.71-2.16-10.14-5.14-.42.73-.67 1.58-.67 2.48 0 1.71.87 3.21 2.19 4.09-.81-.03-1.57-.25-2.23-.62v.06c0 2.38 1.7 4.37 3.95 4.82-.41.11-.85.17-1.29.17-.32 0-.63-.03-.93-.09.63 1.95 2.44 3.37 4.6 3.41-1.68 1.32-3.8 2.1-6.11 2.1-.4 0-.79-.02-1.17-.07 2.18 1.4 4.77 2.21 7.55 2.21 9.06 0 14.01-7.5 14.01-14.01 0-.21 0-.42-.02-.63.96-.69 1.8-1.56 2.46-2.55z"/>
        </svg>
      ),
      delay: 1, duration: 10, startX: '85%', startY: '20%'
    },
    {
      icon: (
        <svg width="46" height="46" viewBox="0 0 24 24" fill="#5F7563">
          <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.97.24 2.43.4.61.24 1.04.52 1.5.98.46.46.74.89.98 1.5.16.46.35 1.26.4 2.43.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.97-.4 2.43-.24.61-.52 1.04-.98 1.5-.46.46-.89.74-1.5.98-.46.16-1.26.35-2.43.4-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.97-.24-2.43-.4-.61-.24-1.04-.52-1.5-.98-.46-.46-.74-.89-.98-1.5-.16-.46-.35-1.26-.4-2.43-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.24-1.97.4-2.43.24-.61.52-1.04.98-1.5.46-.46.89-.74 1.5-.98.46-.16 1.26-.35 2.43-.4 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.13 1.39C1.34 2.69.93 3.36.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.39 2.13.67.67 1.34 1.08 2.13 1.39.76.3 1.64.5 2.91.56 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.13-1.39.67-.67 1.08-1.34 1.39-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.31-.79-.72-1.46-1.39-2.13-.67-.67-1.34-1.08-2.13-1.39C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0z"/>
          <path d="M12 5.84c-3.4 0-6.16 2.76-6.16 6.16S8.6 18.16 12 18.16s6.16-2.76 6.16-6.16S15.4 5.84 12 5.84zm0 10.16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
          <circle cx="18.41" cy="5.59" r="1.44"/>
        </svg>
      ),
      delay: 2, duration: 9, startX: '15%', startY: '75%'
    },
    {
      icon: (
        <svg width="50" height="50" viewBox="0 0 24 24" fill="#5F7563">
          <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07"/>
        </svg>
      ),
      delay: 0.5, duration: 11, startX: '75%', startY: '70%'
    },
    {
      icon: (
        <svg width="42" height="42" viewBox="0 0 24 24" fill="#5F7563">
          <path d="M23.5 6.19c-.2-.8-.8-1.4-1.6-1.6C20.4 4 12.5 4 12.5 4s-7.9 0-9.4.5c-.8.2-1.4.8-1.6 1.6C1 7.69 1 12 1 12s0 4.31.5 5.81c.2.8.8 1.4 1.6 1.6 1.5.5 9.4.5 9.4.5s7.9 0 9.4-.5c.8-.2 1.4-.8 1.6-1.6.5-1.5.5-5.81.5-5.81s0-4.31-.5-5.81zM10 15.5v-7l6 3.5-6 3.5z"/>
        </svg>
      ),
      delay: 1.5, duration: 12, startX: '90%', startY: '45%'
    },
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="#5F7563">
          <path d="M20.45 5h3.47L15.5 13.59 24 19H16.9l-5.74-7.52L4.83 19H1.36l8.96-10.24L1 5h7.32l5.18 6.84L20.45 5zm-1.22 12.61h1.92L7.63 6.96H5.57l13.66 10.65z"/>
        </svg>
      ),
      delay: 3, duration: 9, startX: '80%', startY: '85%'
    }
  ];

  return (
    <div 
      className="h-full relative overflow-hidden flex flex-col items-center justify-center px-8"
      style={{
        background: 'linear-gradient(135deg, #E8E9D8 0%, #D4D8C8 100%)',
      }}
    >
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(30px, -20px) rotate(5deg); }
            50% { transform: translate(-20px, 30px) rotate(-5deg); }
            75% { transform: translate(20px, 20px) rotate(3deg); }
          }
        `}
      </style>

      <div>
        {socialIcons.map((social, index) => (
          <FloatingSocialIcon
            key={index}
            icon={social.icon}
            delay={social.delay}
            duration={social.duration}
            startX={social.startX}
            startY={social.startY}
          />
        ))}
      </div>

      <div 
        className="absolute top-20 right-20 w-[300px] h-[300px] rounded-full blur-3xl"
        style={{ background: '#92A68A', opacity: 0.1 }}
      />
      <div 
        className="absolute bottom-32 left-20 w-[250px] h-[250px] rounded-full blur-3xl"
        style={{ background: '#5F7563', opacity: 0.08 }}
      />

      <div className="absolute right-12 top-[38px]">
        <button 
          className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
          style={{
            background: 'rgba(95, 117, 99, 0.15)',
            border: '1px solid rgba(95, 117, 99, 0.25)',
            color: '#3C4650',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(95, 117, 99, 0.25)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(95, 117, 99, 0.15)'}
        >
          <span>English</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <div 
        className="mb-8 text-center z-10 relative"
        style={{ width: '100%', maxWidth: '800px', marginTop: '40px' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={handleMouseLeave}
      >
        <h2 
          ref={headlineRef}
          className="font-bold cursor-pointer"
          style={{ 
            fontSize: '48px',
            lineHeight: '1.15',
            fontFamily: 'Inter, sans-serif',
            background: 'linear-gradient(135deg, #2D3A34 0%, #5F7563 50%, #92A68A 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            transform: isHovering 
              ? `perspective(1000px) rotateX(${(smoothPosition.y - 0.5) * -10}deg) rotateY(${(smoothPosition.x - 0.5) * 10}deg) translateZ(20px)` 
              : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
            transition: 'transform 0.05s ease-out',
            transformStyle: 'preserve-3d',
            margin: '0 auto',
            padding: '0 20px',
            textAlign: 'center',
            whiteSpace: 'normal',
          }}
        >
          PERSONAL ASSISTANCE FOR SOCIAL MEDIA INFLUENCER
        </h2>
      </div>

      <div className="relative z-20 mt-[-104px]">
        <WireframeSphere />
      </div>

      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        }}
      />
    </div>
  );
}
