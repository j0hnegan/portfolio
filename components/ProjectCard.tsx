import React, { useState, useMemo } from 'react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  style: React.CSSProperties;
  onHoverChange: (isHovering: boolean) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, style, onHoverChange }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverChange(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHoverChange(false);
  };

  // Fixed border radius as requested
  const borderRadius = 24;

  // For Lottie files, we need to create a temporary URL from the JSON string if it exists
  const lottieSrc = useMemo(() => {
    if (project.mediaType === 'lottie' && project.imageUrl) {
      try {
        // If it looks like a URL, return it. Otherwise assume JSON string.
        if (project.imageUrl.startsWith('http')) return project.imageUrl;
        const blob = new Blob([project.imageUrl], { type: 'application/json' });
        return URL.createObjectURL(blob);
      } catch (e) {
        return '';
      }
    }
    return '';
  }, [project.mediaType, project.imageUrl]);

  const renderMedia = () => {
    if (project.mediaType === 'video') {
      return (
        <video
          src={project.imageUrl}
          className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${isHovered ? 'scale-110' : 'scale-100'}`}
          autoPlay
          loop
          muted
          playsInline
        />
      );
    }

    if (project.mediaType === 'lottie') {
      return (
        <div className={`w-full h-full transition-all duration-700 ease-in-out ${isHovered ? 'scale-110' : 'scale-100'}`}>
           {/* @ts-ignore */}
           <lottie-player
            src={lottieSrc}
            background="transparent"
            speed="1"
            style={{ width: '100%', height: '100%' }}
            loop
            autoplay
            preserveAspectRatio="xMidYMid slice"
          ></lottie-player>
        </div>
      );
    }

    // Default to Image
    return (
      <img
        src={project.imageUrl}
        alt={project.title}
        className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${isHovered ? 'scale-110' : 'scale-100'}`}
      />
    );
  };

  const content = (
    <>
      {/* Media Container */}
      <div className="relative w-full h-full overflow-hidden bg-zinc-900">
        {renderMedia()}
        
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-90' : 'opacity-60'}`} />
      </div>

      {/* Content */}
      <div 
        className={`absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end transition-transform duration-500 ${isHovered ? 'translate-y-0' : 'translate-y-4'}`}
      >
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
          {project.category}
        </span>
        <h3 className="text-3xl font-bold text-white mb-2 tracking-tight leading-none">
          {project.title}
        </h3>
        <div 
          className={`overflow-hidden transition-all duration-500 ${isHovered ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <p className="text-sm text-zinc-400 leading-relaxed mt-2">
            {project.description}
          </p>
        </div>
      </div>
      
      {/* Link Indicator */}
      {project.link && isHovered && (
        <div className="absolute top-6 right-6 bg-white text-black rounded-full p-2 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </div>
      )}
    </>
  );

  // Added border-transparent to fix sub-pixel rendering artifacts (thin lines) on corners
  // Removed bg-zinc-900/50 to prevent background bleed at edges since content is opaque
  const cardClasses = `absolute border border-transparent overflow-hidden transition-all duration-500 ease-out cursor-pointer transform-gpu backface-hidden ${isHovered ? 'scale-[0.98] ring-1 ring-white/20' : 'scale-100'}`;

  const dynamicStyle = {
    ...style,
    borderRadius: `${borderRadius}px`,
  };

  if (project.link) {
    return (
      <a
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClasses}
        style={dynamicStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {content}
      </a>
    );
  }

  return (
    <div
      className={cardClasses}
      style={dynamicStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {content}
    </div>
  );
};