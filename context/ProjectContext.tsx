import React, { createContext, useContext, useState } from 'react';
import { Project } from '../types';
import { PROJECTS } from '../constants';

interface ProjectContextType {
  projects: Project[];
  updateProject: (id: string, updatedData: Partial<Project>) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(PROJECTS);

  const updateProject = (id: string, updatedData: Partial<Project>) => {
    setProjects(prev => 
      prev.map(p => p.id === id ? { ...p, ...updatedData } : p)
    );
  };

  return (
    <ProjectContext.Provider value={{ projects, updateProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};