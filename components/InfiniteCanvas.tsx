import React, { useState, useEffect, useRef } from 'react';
import { useProjects } from '../context/ProjectContext';
import { UNIT_WIDTH, UNIT_HEIGHT } from '../constants';
import { ProjectCard } from './ProjectCard';

interface InfiniteCanvasProps {
  onNavigate: (view: 'work' | 'contact' | 'cms') => void;
}

export const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({ onNavigate }) => {
  const { projects } = useProjects();
  
  // Current scroll offset
  const [offset, setOffset] = useState({ x: -UNIT_WIDTH, y: -UNIT_HEIGHT });
  
  // Viewport dimensions to calculate visible tiles
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  
  // Velocity reference for scroll inertia
  const velocity = useRef({ x: 0, y: 0 });
  
  // Physics constants
  const friction = 0.96; 

  // Navbar state
  const [activeTab, setActiveTab] = useState<'work' | 'about'>('work');

  // Liquid Filter Animation Refs
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    
    // Initial size
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation loop for Liquid Effect
  useEffect(() => {
    const animate = (time: number) => {
      // 1. Animate Liquid Filter
      if (turbulenceRef.current) {
         const freqX = 0.01 + Math.sin(time * 0.0002) * 0.005;
         const freqY = 0.05 + Math.cos(time * 0.0002) * 0.01; 
         
         turbulenceRef.current.setAttribute('baseFrequency', `${freqX} ${freqY}`);
      }

      // 2. Decay Velocity (Inertia)
      velocity.current.x *= friction;
      velocity.current.y *= friction;
      
      if (Math.abs(velocity.current.x) < 0.01) velocity.current.x = 0;
      if (Math.abs(velocity.current.y) < 0.01) velocity.current.y = 0;

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      velocity.current.x = e.deltaX;
      velocity.current.y = e.deltaY;

      // Update offset based on wheel delta
      setOffset(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Calculate which grid units are currently visible
  const startCol = Math.floor(-offset.x / UNIT_WIDTH);
  const endCol = Math.floor((-offset.x + viewport.width) / UNIT_WIDTH) + 1;
  const startRow = Math.floor(-offset.y / UNIT_HEIGHT);
  const endRow = Math.floor((-offset.y + viewport.height) / UNIT_HEIGHT) + 1;

  const visibleTiles = [];
  
  // Add a buffer of 1 unit around the visible area to prevent pop-in
  for (let col = startCol - 1; col <= endCol + 1; col++) {
    for (let row = startRow - 1; row <= endRow + 1; row++) {
      
      const unitOffsetX = offset.x + (col * UNIT_WIDTH);
      const unitOffsetY = offset.y + (row * UNIT_HEIGHT);

      projects.forEach((project) => {
        visibleTiles.push({
          ...project,
          instanceId: `${project.id}-${col}-${row}`,
          renderX: unitOffsetX + project.x,
          renderY: unitOffsetY + project.y
        });
      });
    }
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-950 cursor-auto">
       {/* SVG Filter Definition for Liquid Effect */}
       <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
        <defs>
          <filter id="liquid-nav">
            <feTurbulence 
              ref={turbulenceRef}
              type="fractalNoise" 
              baseFrequency="0.01 0.05" 
              numOctaves="3" 
              result="noise" 
            />
            <feDisplacementMap 
              in="SourceGraphic" 
              in2="noise" 
              scale="30" 
              xChannelSelector="R" 
              yChannelSelector="G" 
            />
          </filter>
        </defs>
      </svg>

      {/* Pattern Background */}
      <div className="absolute inset-0 opacity-[0.1] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
      />

      {/* Render Visible Tiles */}
      <div className="absolute inset-0 w-full h-full">
        {visibleTiles.map(tile => (
            <ProjectCard
            key={tile.instanceId}
            project={tile}
            style={{
                width: tile.width,
                height: tile.height,
                transform: `translate3d(${tile.renderX}px, ${tile.renderY}px, 0)`,
            }}
            onHoverChange={() => {}}
            />
        ))}
      </div>

      {/* Floating Liquid Navbar */}
      <div 
        className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[40%] min-w-[320px] max-w-[600px] h-16 rounded-[24px] flex items-center justify-between px-4 transition-all duration-500"
        style={{
            // The url(#liquid-nav) creates the wavy distortion
            backdropFilter: 'blur(24px) saturate(180%) contrast(110%) brightness(110%) url(#liquid-nav)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%) contrast(110%) brightness(110%) url(#liquid-nav)',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            boxShadow: 'inset 0 0 20px rgba(255,255,255,0.5), 0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        
        {/* Logo Placeholder */}
        <div className="flex items-center justify-center w-12 h-12 group cursor-pointer" onClick={() => window.location.reload()}>
           <div className="w-8 h-8 rounded-full bg-black/5 border border-black/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,0,0,0.1)]">
             <div className="w-2 h-2 bg-black rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
           </div>
        </div>

        {/* Centered Toggle */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative flex items-center bg-black/5 rounded-full p-1 border border-black/5 h-10 shadow-inner">
              {/* Sliding Pill */}
              <div 
                className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
                  activeTab === 'about' ? 'translate-x-full' : 'translate-x-0'
                }`}
              />
              
              <button 
                onClick={() => setActiveTab('work')}
                className={`relative z-10 w-20 py-1.5 text-xs font-medium transition-colors duration-300 ${
                  activeTab === 'work' ? 'text-black' : 'text-black/40 hover:text-black'
                }`}
              >
                Work
              </button>
              <button 
                onClick={() => setActiveTab('about')}
                className={`relative z-10 w-20 py-1.5 text-xs font-medium transition-colors duration-300 ${
                  activeTab === 'about' ? 'text-black' : 'text-black/40 hover:text-black'
                }`}
              >
                About
              </button>
          </div>
        </div>

        {/* Contact Button */}
        <button 
            onClick={() => onNavigate('contact')}
            className="px-5 py-2.5 text-xs font-medium text-black/60 hover:text-black transition-all rounded-full hover:bg-black/5 border border-transparent hover:border-black/10"
        >
          Contact
        </button>
      </div>
      
      {/* UI Overlay - Login Button */}
      <div className="fixed top-8 right-8 z-50">
        <button 
          onClick={() => onNavigate('cms')}
          className="bg-white/60 hover:bg-black hover:text-white text-black/70 backdrop-blur-md border border-black/5 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm"
        >
          Log in
        </button>
      </div>

      <div className="fixed bottom-8 right-8 pointer-events-none z-40 opacity-30 text-white/40 text-xs font-mono uppercase tracking-widest">
        Scroll to Navigate
      </div>
    </div>
  );
};