import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import logoImage from '../../assets/abraxas-logo.png';

export function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationFrame: number;
    let offset = 0;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.35;

    const drawEarthWithGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Earth base sphere with gradient
      const earthGradient = ctx.createRadialGradient(
        centerX - radius * 0.2,
        centerY - radius * 0.2,
        radius * 0.3,
        centerX,
        centerY,
        radius
      );
      earthGradient.addColorStop(0, 'rgba(30, 60, 100, 0.8)');
      earthGradient.addColorStop(0.5, 'rgba(15, 40, 70, 0.6)');
      earthGradient.addColorStop(1, 'rgba(5, 20, 40, 0.3)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = earthGradient;
      ctx.fill();

      // Flowing cyber grid — horizontal latitude lines
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
      ctx.lineWidth = 1;

      for (let i = 0; i < 12; i++) {
        const lat = (i / 11 - 0.5) * Math.PI;
        const y = centerY + radius * Math.sin(lat);
        const visibleRadius = radius * Math.cos(lat);

        ctx.beginPath();
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';

        const pulseIntensity = Math.sin(offset * 0.02 + i * 0.5) * 0.3 + 0.7;
        ctx.globalAlpha = pulseIntensity * 0.6;

        for (let angle = 0; angle < Math.PI * 2; angle += 0.02) {
          const x = centerX + visibleRadius * Math.cos(angle + offset * 0.001);
          const yOffset = y + Math.sin(angle * 3 + offset * 0.003) * 2;

          if (angle === 0) {
            ctx.moveTo(x, yOffset);
          } else {
            ctx.lineTo(x, yOffset);
          }
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Vertical longitude lines
      ctx.globalAlpha = 1;
      for (let i = 0; i < 16; i++) {
        const lng = (i / 16) * Math.PI * 2;

        ctx.beginPath();
        ctx.shadowBlur = 8;

        const pulseIntensity = Math.sin(offset * 0.02 + i * 0.3) * 0.3 + 0.7;
        ctx.globalAlpha = pulseIntensity * 0.5;

        for (let lat = -Math.PI / 2; lat < Math.PI / 2; lat += 0.02) {
          const x = centerX + radius * Math.cos(lat) * Math.cos(lng + offset * 0.001);
          const y = centerY + radius * Math.sin(lat) + Math.sin(lng * 2 + offset * 0.004) * 3;
          const z = radius * Math.cos(lat) * Math.sin(lng + offset * 0.001);

          if (z > -radius * 0.3) {
            if (lat === -Math.PI / 2) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
        }
        ctx.stroke();
      }

      // Glowing network nodes
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 15;
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2 + offset * 0.002;
        const lat = Math.sin(i * 0.7) * 0.7;
        const x = centerX + radius * Math.cos(lat) * Math.cos(angle);
        const y = centerY + radius * Math.sin(lat);

        const pulse = Math.sin(offset * 0.03 + i * 0.5) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(0, 255, 255, ${pulse * 0.8})`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      offset += 1;
      animationFrame = requestAnimationFrame(drawEarthWithGrid);
    };

    drawEarthWithGrid();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // --- AUTH HOOK: Replace this block with real backend auth ---
    // For now, accept any non-empty credentials
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (name.trim() && password.trim()) {
      // Store auth state
      sessionStorage.setItem('s3m_authenticated', 'true');
      sessionStorage.setItem('s3m_user', name.trim());
      navigate('/demo-room', { replace: true });
    } else {
      setError('CREDENTIALS REQUIRED');
      setIsLoading(false);
    }
    // --- END AUTH HOOK ---
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Animated Earth Background with Cyber Grid */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle at center, rgba(10, 20, 40, 1) 0%, rgba(0, 0, 0, 1) 100%)' }}
      />

      {/* Stars background */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-px h-px bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.6 + 0.2,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Scanline effect overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent animate-scan" />
      </div>

      {/* Top-left ABRAXAS S3M text */}
      <div className="absolute top-8 left-8 z-20">
        <h1
          className="tracking-[0.3em] uppercase"
          style={{
            color: '#00ffff',
            textShadow: '0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.5), 0 0 30px rgba(0, 255, 255, 0.3)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '0.3em',
          }}
        >
          ABRAXAS S3M
        </h1>
      </div>

      {/* Main content container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-20">
        {/* Logo */}
        <div className="mb-12">
          <img
            src={logoImage}
            alt="Abraxas Logo"
            className="w-40 h-40 object-contain drop-shadow-[0_0_30px_rgba(192,192,192,0.5)]"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(192, 192, 192, 0.6)) drop-shadow(0 0 60px rgba(192, 192, 192, 0.3))',
            }}
          />
        </div>

        {/* Login Panel */}
        <div
          className="relative w-[270px] p-6 backdrop-blur-md"
          style={{
            background: 'rgba(0, 20, 40, 0.7)',
            border: '1px solid rgba(0, 255, 255, 0.4)',
            boxShadow: '0 0 30px rgba(0, 255, 255, 0.2), inset 0 0 30px rgba(0, 255, 255, 0.05)',
          }}
        >
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 0.6)' }} />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 0.6)' }} />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400" style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 0.6)' }} />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 0.6)' }} />

          {/* Error message */}
          {error && (
            <div
              className="mb-4 py-2 px-3 text-xs text-center uppercase tracking-widest"
              style={{
                color: '#ff4444',
                border: '1px solid rgba(255, 68, 68, 0.4)',
                background: 'rgba(255, 68, 68, 0.1)',
                textShadow: '0 0 10px rgba(255, 68, 68, 0.8)',
              }}
            >
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            {/* NAME field */}
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="block tracking-[0.2em] uppercase text-xs"
                style={{
                  color: '#00ffff',
                  textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
                  letterSpacing: '0.2em',
                }}
              >
                NAME
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="username"
                className="w-full px-3 py-2.5 bg-black/50 outline-none transition-all duration-300 text-sm"
                style={{
                  border: '1px solid rgba(0, 255, 255, 0.4)',
                  boxShadow: 'inset 0 0 10px rgba(0, 255, 255, 0.1)',
                  color: '#00ffff',
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid rgba(0, 255, 255, 0.8)';
                  e.target.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.4), inset 0 0 15px rgba(0, 255, 255, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid rgba(0, 255, 255, 0.4)';
                  e.target.style.boxShadow = 'inset 0 0 10px rgba(0, 255, 255, 0.1)';
                }}
              />
            </div>

            {/* PASSWORD field */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block tracking-[0.2em] uppercase text-xs"
                style={{
                  color: '#00ffff',
                  textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
                  letterSpacing: '0.2em',
                }}
              >
                PASSWORD
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-3 py-2.5 bg-black/50 outline-none transition-all duration-300 text-sm"
                style={{
                  border: '1px solid rgba(0, 255, 255, 0.4)',
                  boxShadow: 'inset 0 0 10px rgba(0, 255, 255, 0.1)',
                  color: '#00ffff',
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid rgba(0, 255, 255, 0.8)';
                  e.target.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.4), inset 0 0 15px rgba(0, 255, 255, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid rgba(0, 255, 255, 0.4)';
                  e.target.style.boxShadow = 'inset 0 0 10px rgba(0, 255, 255, 0.1)';
                }}
              />
            </div>

            {/* LOGIN button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-6 uppercase tracking-[0.25em] transition-all duration-300 cursor-pointer text-sm disabled:opacity-50"
              style={{
                background: 'rgba(0, 255, 255, 0.1)',
                border: '2px solid rgba(0, 255, 255, 0.6)',
                color: '#00ffff',
                textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1)',
                letterSpacing: '0.25em',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
                  e.currentTarget.style.border = '2px solid rgba(0, 255, 255, 1)';
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 255, 255, 0.6), inset 0 0 30px rgba(0, 255, 255, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)';
                e.currentTarget.style.border = '2px solid rgba(0, 255, 255, 0.6)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1)';
              }}
            >
              {isLoading ? 'AUTHENTICATING...' : 'LOGIN'}
            </button>
          </form>
        </div>

        {/* Classification footer */}
        <div className="mt-8">
          <p
            className="text-[10px] uppercase tracking-[0.3em]"
            style={{
              color: 'rgba(0, 255, 255, 0.4)',
              textShadow: '0 0 5px rgba(0, 255, 255, 0.3)',
            }}
          >
            AUTHORIZED PERSONNEL ONLY
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }

        input::placeholder {
          color: rgba(0, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
