import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useProjects } from '../context/ProjectContext';
import { Project, TileType, MediaType } from '../types';
import { TILE_DIMENSIONS } from '../constants';

interface CMSProps {
  onExit: () => void;
}

// Icons
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

export const CMS: React.FC<CMSProps> = ({ onExit }) => {
  const { projects, updateProject } = useProjects();
  const [view, setView] = useState<'pages' | 'page-details'>('pages');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Toast State
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);

  const showToast = (projectName: string) => {
    setToast({ message: `${projectName} saved`, visible: true });
    
    // Start fade out after 5 seconds
    const fadeTimer = setTimeout(() => {
      setToast(prev => prev ? { ...prev, visible: false } : null);
    }, 5000);

    // Remove from DOM slightly after animation finishes
    const removeTimer = setTimeout(() => {
       setToast(null);
    }, 5500);

    return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
    };
  };

  // --- Views ---

  const PagesTable = () => (
    <div className="max-w-5xl mx-auto p-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Pages</h1>
          <p className="text-zinc-400">Manage the pages on your portfolio site.</p>
        </div>
        <button 
          onClick={onExit}
          className="text-sm bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-md border border-zinc-700 transition-colors"
        >
          Exit CMS
        </button>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50 text-xs uppercase tracking-wider text-zinc-500">
              <th className="p-6 font-medium">Page Name</th>
              <th className="p-6 font-medium">Path</th>
              <th className="p-6 font-medium">Last Updated</th>
              <th className="p-6 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              onClick={() => setView('page-details')}
              className="group cursor-pointer hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50 last:border-0"
            >
              <td className="p-6 text-white font-medium group-hover:text-blue-400 transition-colors">
                Home
              </td>
              <td className="p-6 text-zinc-400 font-mono text-sm">/</td>
              <td className="p-6 text-zinc-400 text-sm font-mono">
                {new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </td>
              <td className="p-6 text-right">
                <span className="text-zinc-500 group-hover:text-white transition-colors text-sm font-medium">Edit Content &rarr;</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const TilesTable = () => (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => setView('pages')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all"
        >
          <BackIcon />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Home Content</h1>
          <p className="text-zinc-500 text-sm">Managing {projects.length} tiles</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50 text-xs uppercase tracking-wider text-zinc-500">
              <th className="p-4 pl-6 font-medium">Preview</th>
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Destination</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {projects.map(project => (
              <tr 
                key={project.id}
                onClick={() => setEditingId(project.id)}
                className="cursor-pointer hover:bg-zinc-800/50 transition-colors"
              >
                <td className="p-4 pl-6">
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-zinc-800 border border-zinc-700 relative">
                    {project.mediaType === 'video' ? (
                      <video src={project.imageUrl} className="w-full h-full object-cover" />
                    ) : project.mediaType === 'lottie' ? (
                       <div className="w-full h-full flex items-center justify-center text-zinc-600 text-[10px] bg-zinc-900 font-mono">LOTTIE</div>
                    ) : (
                      <img src={project.imageUrl} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                </td>
                <td className="p-4 font-medium text-white">{project.title}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${project.tileType === 'mobile' ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50' : 
                      project.tileType === 'desktop' ? 'bg-purple-900/30 text-purple-400 border border-purple-800/50' : 
                      project.tileType === 'largeSquare' ? 'bg-amber-900/30 text-amber-400 border border-amber-800/50' :
                      'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50'}`}>
                    {project.tileType === 'largeSquare' ? 'Lg Square' : project.tileType}
                  </span>
                </td>
                <td className="p-4 text-zinc-400 text-sm">{project.category}</td>
                <td className="p-4 text-zinc-500 text-sm font-mono truncate max-w-[200px]">{project.link || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const EditModal = () => {
    const selectedProject = projects.find(p => p.id === editingId);
    const [formData, setFormData] = useState<Project | null>(selectedProject ? { ...selectedProject } : null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Validate Lottie
    const isLottieValid = useMemo(() => {
      if (formData?.mediaType !== 'lottie' || !formData?.imageUrl) return false;
      try {
        JSON.parse(formData.imageUrl);
        return true;
      } catch (e) {
        return false;
      }
    }, [formData?.imageUrl, formData?.mediaType]);

    if (!formData || !selectedProject) return null;

    const handleChange = (field: keyof Project, value: any) => {
      setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
    };

    const handleTypeChange = (type: TileType) => {
        const dims = TILE_DIMENSIONS[type];
        setFormData(prev => prev ? ({
            ...prev,
            tileType: type,
            width: dims.width,
            height: dims.height
        }) : null);
    };

    const handleMediaTypeChange = (type: MediaType) => {
      // When switching types, clear the current content to prevent mismatches
      setFormData(prev => prev ? ({ ...prev, mediaType: type, imageUrl: '' }) : null);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          handleChange('imageUrl', reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleRemoveMedia = () => {
      handleChange('imageUrl', '');
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSave = () => {
        if (editingId && formData) {
            updateProject(editingId, formData);
            showToast(formData.title);
            setEditingId(null);
        }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl shadow-black">
          
          {/* Modal Body - Scrollable */}
          <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
            
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">Edit Tile</h2>
                <p className="text-zinc-500 text-sm mt-1">Update content and layout settings.</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              
              {/* Tile Layout Selector */}
              <div className="col-span-2">
                 <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Tile Layout</label>
                 <div className="relative">
                    <select 
                        value={formData.tileType}
                        onChange={(e) => handleTypeChange(e.target.value as TileType)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all appearance-none cursor-pointer"
                    >
                        <option value="mobile">Mobile (288 x 600)</option>
                        <option value="desktop">Desktop (600 x 360)</option>
                        <option value="square">Square (288 x 288)</option>
                        <option value="largeSquare">Large Square (360 x 360)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                 </div>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder-zinc-700"
                  placeholder="Project Title"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all appearance-none"
                >
                  <option value="Mobile App">Mobile App</option>
                  <option value="Web App">Web App</option>
                  <option value="Dashboard">Dashboard</option>
                  <option value="Design System">Design System</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Link</label>
                <input
                  type="text"
                  value={formData.link || ''}
                  onChange={(e) => handleChange('link', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder-zinc-700 font-mono text-sm"
                  placeholder="https://"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder-zinc-700 resize-none"
                  placeholder="Brief description of the project..."
                />
              </div>

              {/* MEDIA SECTION */}
              <div className="col-span-2 border-t border-zinc-800 pt-6">
                <div className="flex justify-between items-center mb-4">
                    <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Media Asset</label>
                    {isLottieValid && formData.mediaType === 'lottie' && (
                        <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded-full border border-emerald-500/20">
                            <CheckIcon />
                            Valid Lottie JSON
                        </span>
                    )}
                </div>
                
                <div className="flex gap-4 mb-4">
                  {/* Media Type Dropdown */}
                  <div className="relative w-1/3">
                    <select 
                        value={formData.mediaType}
                        onChange={(e) => handleMediaTypeChange(e.target.value as MediaType)}
                        disabled={formData.mediaType === 'lottie' && isLottieValid}
                        className={`w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all appearance-none cursor-pointer ${formData.mediaType === 'lottie' && isLottieValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                        <option value="lottie">Lottie Code</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                 </div>
                </div>

                {/* Dynamic Content Based on Media Type */}
                {formData.mediaType === 'lottie' ? (
                   <div className="relative">
                       <textarea
                        rows={5}
                        value={formData.imageUrl} // Reusing imageUrl field for Lottie JSON string
                        onChange={(e) => handleChange('imageUrl', e.target.value)}
                        className={`w-full bg-zinc-900 border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder-zinc-700 font-mono text-xs ${isLottieValid ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-zinc-800'}`}
                        placeholder='Paste Lottie JSON code here...'
                        />
                   </div>
                ) : (
                  <div className="bg-zinc-900/50 border border-dashed border-zinc-700 rounded-xl p-6 flex flex-col items-center justify-center">
                    
                    {formData.imageUrl ? (
                      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                        {formData.mediaType === 'video' ? (
                          <video src={formData.imageUrl} className="w-full h-full object-cover" controls />
                        ) : (
                          <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                        )}
                        
                        <button 
                            onClick={handleRemoveMedia}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all hover:scale-110 z-10"
                            title="Delete Asset"
                        >
                            <TrashIcon />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3 text-zinc-400">
                          <UploadIcon />
                        </div>
                        <p className="text-sm text-zinc-300 font-medium mb-1">
                           Upload {formData.mediaType === 'video' ? 'Video' : 'Image'}
                        </p>
                        <p className="text-xs text-zinc-500 mb-4">
                          {formData.mediaType === 'video' ? 'MP4, WebM up to 10MB' : 'PNG, JPG, GIF up to 5MB'}
                        </p>
                        <label className="inline-block cursor-pointer">
                           <span className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors">
                             Select File
                           </span>
                           <input 
                             ref={fileInputRef}
                             type="file" 
                             accept={formData.mediaType === 'video' ? "video/*" : "image/*"}
                             className="hidden" 
                             onChange={handleFileUpload}
                           />
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-3 border-t border-zinc-800 bg-zinc-900/30 flex justify-end gap-3">
             <button 
                onClick={() => setEditingId(null)}
                className="bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-white px-6 py-2 rounded-lg font-medium transition-colors border border-transparent hover:border-zinc-700"
              >
                Cancel
              </button>
             <button 
                onClick={handleSave}
                className="bg-white text-black hover:bg-zinc-200 px-6 py-2 rounded-lg font-medium transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              >
                Save
              </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-zinc-950 text-zinc-200 overflow-y-auto relative">
      {view === 'pages' ? <PagesTable /> : <TilesTable />}
      {editingId && <EditModal />}
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 left-8 z-[100] flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg shadow-2xl backdrop-blur-md transition-all duration-500 ease-out transform ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}>
           <div className="bg-emerald-500 rounded-full p-1">
             <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
               <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
             </svg>
           </div>
           <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  );
};