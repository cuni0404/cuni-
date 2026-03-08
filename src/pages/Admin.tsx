import React, { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Save, 
  Settings, 
  Layout, 
  Upload, 
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { Project, ProjectInput, SiteSettings } from '../types';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    logoText: '',
    logoImage: '',
    heroTitle: '',
    heroSubtitle: '',
    heroImage: '',
    heroVideo: '',
    aboutTitle: '',
    aboutDescription: '',
    aboutProfileImage: '',
    aboutDescFontSize: '18',
    aboutDescFontWeight: '400',
    aboutBackgroundImage: '',
    contactEmail: '',
    contactInstagram: '',
    contactX: '',
    contactYoutube: '',
    clients: ''
  });
  const [activeTab, setActiveTab] = useState<'projects' | 'settings'>('projects');
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<ProjectInput>>({
    title: '',
    role: '',
    client: '',
    year: '',
    videoUrl: '',
    videoFile: '',
    thumbnailUrl: '',
    description: '',
    isFeatured: 0,
    category: 'Webtoon PV'
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [uploading, setUploading] = useState(false);

  const categories = [
    'Webtoon PV',
    'Music Video',
    'Motion Graphics',
    'Virtual PV,MV / Etc',
    'Personal Work'
  ];

  useEffect(() => {
    if (isLoggedIn) {
      fetchProjects();
      fetchSettings();
    }
  }, [isLoggedIn]);

  const fetchProjects = async () => {
    const res = await fetch('/api/projects');
    const data = await res.json();
    setProjects(data);
  };

  const fetchSettings = async () => {
    const res = await fetch('/api/settings');
    const data = await res.json();
    // Ensure no null values for inputs
    const sanitizedData = { ...data };
    Object.keys(sanitizedData).forEach(key => {
      if (sanitizedData[key] === null) sanitizedData[key] = '';
    });
    setSettings(prev => ({ ...prev, ...sanitizedData }));
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (password === '0404') {
      setIsLoggedIn(true);
    } else {
      alert('Wrong password');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure?')) {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      fetchProjects();
    }
  };

  const handleEdit = async (project: Project) => {
    setEditingId(project.id);
    // Ensure no null values for inputs
    const sanitizedProject = { ...project };
    (Object.keys(sanitizedProject) as Array<keyof Project>).forEach(key => {
      if (sanitizedProject[key] === null) {
        (sanitizedProject as any)[key] = '';
      }
    });
    setCurrentProject(sanitizedProject);
    setIsEditing(true);
  };

  const handleSaveProject = async (e: FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/projects/${editingId}` : '/api/projects';

    console.log('Saving project:', currentProject);

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentProject)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save project');
      }

      setSaveStatus('success');
      
      // Keep modal open for a moment to show success message
      setTimeout(() => {
        setSaveStatus('idle');
        setIsEditing(false);
        setEditingId(null);
        setCurrentProject({
          title: '',
          role: '',
          client: '',
          year: '',
          videoUrl: '',
          videoFile: '',
          thumbnailUrl: '',
          description: '',
          isFeatured: 0,
          category: 'Webtoon PV'
        });
        fetchProjects();
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('프로젝트 저장 중 오류가 발생했습니다.');
      setSaveStatus('idle');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (100MB limit)
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert(`용량이 너무 커서 업로드가 안됩니다. 최대 용량은 100MB입니다. (현재: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Upload failed with status:', res.status, errorText);
        alert(`업로드 실패: ${res.status} ${res.statusText}`);
        return;
      }

      const data = await res.json();
      if (data.url) {
        if (target === 'thumbnail') {
          setCurrentProject(prev => ({ ...prev, thumbnailUrl: data.url }));
        } else if (target === 'projectVideo') {
          setCurrentProject(prev => ({ ...prev, videoFile: data.url }));
        } else if (target === 'heroImage') {
          setSettings(prev => ({ ...prev, heroImage: data.url }));
        } else if (target === 'heroVideo') {
          setSettings(prev => ({ ...prev, heroVideo: data.url }));
        } else if (target === 'logoImage') {
          setSettings(prev => ({ ...prev, logoImage: data.url }));
        } else if (target === 'aboutProfileImage') {
          setSettings(prev => ({ ...prev, aboutProfileImage: data.url }));
        } else if (target === 'aboutBackgroundImage') {
          setSettings(prev => ({ ...prev, aboutBackgroundImage: data.url }));
        } else if (target === 'clients') {
          const currentClients = settings.clients ? settings.clients.split(',').map(c => c.trim()) : [];
          setSettings(prev => ({ ...prev, clients: [...currentClients, data.url].join(', ') }));
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        alert('업로드 시간이 초과되었습니다. 파일 용량이 너무 크거나 네트워크 상태를 확인해주세요.');
      } else {
        console.error('Upload failed', err);
        alert('업로드 중 오류가 발생했습니다.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      setSaveStatus('success');
      window.dispatchEvent(new CustomEvent('settingsUpdated'));
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('idle');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="h-screen flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
          <h1 className="text-2xl font-bold tracking-tighter text-center">ADMIN ACCESS</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg focus:outline-none focus:border-white/40"
          />
          <button type="submit" className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-white/90 transition-colors">
            LOGIN
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto relative">
      {/* Uploading Overlay */}
      <AnimatePresence>
        {uploading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-brand font-bold tracking-widest uppercase animate-pulse">Uploading Media...</p>
            <p className="text-[10px] opacity-40 mt-2 uppercase tracking-widest">Please do not close this window</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <h1 className="text-4xl font-bold tracking-tighter uppercase">Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'projects' ? 'bg-white text-black' : 'opacity-40 hover:opacity-100'}`}
            >
              <Layout size={14} /> PROJECTS
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'settings' ? 'bg-white text-black' : 'opacity-40 hover:opacity-100'}`}
            >
              <Settings size={14} /> SITE SETTINGS
            </button>
          </div>
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {activeTab === 'projects' ? (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold opacity-40 uppercase tracking-widest">Project List</h2>
            <button 
              onClick={() => {
                setIsEditing(true);
                setEditingId(null);
                setCurrentProject({
                  title: '',
                  role: '',
                  client: '',
                  year: '',
                  videoUrl: '',
                  videoFile: '',
                  thumbnailUrl: '',
                  description: '',
                  isFeatured: 0,
                  category: 'Webtoon PV'
                });
              }}
              className="flex items-center gap-2 bg-brand text-black px-4 py-2 rounded font-bold text-sm"
            >
              <Plus size={16} /> ADD PROJECT
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {projects.map(project => (
              <div key={project.id} className="glass p-6 rounded-xl flex justify-between items-center">
                <div className="flex gap-6 items-center">
                  {project.thumbnailUrl ? (
                    <img src={project.thumbnailUrl} className="w-24 h-16 object-cover rounded" alt="" />
                  ) : (
                    <div className="w-24 h-16 bg-white/5 rounded flex items-center justify-center">
                      <Layout size={16} className="opacity-20" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold">{project.title}</h3>
                    <p className="text-xs opacity-40 uppercase tracking-widest">{project.category} — {project.year}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => handleEdit(project)} className="p-2 hover:bg-white/10 rounded transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(project.id)} className="p-2 hover:bg-red-500/20 text-red-500 rounded transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-12 max-w-3xl">
          <section className="space-y-6">
            <h2 className="text-xl font-bold opacity-40 uppercase tracking-widest">General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest opacity-40">Logo Text</label>
                <input
                  value={settings.logoText}
                  onChange={e => setSettings({...settings, logoText: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded focus:outline-none focus:border-brand"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest opacity-40">Logo Image</label>
                <div className="flex gap-4">
                  <input
                    value={settings.logoImage}
                    onChange={e => setSettings({...settings, logoImage: e.target.value})}
                    className="flex-1 bg-white/5 border border-white/10 p-3 rounded focus:outline-none focus:border-brand"
                  />
                  <label className="cursor-pointer bg-white/10 hover:bg-white/20 px-4 py-3 rounded flex items-center gap-2 transition-colors">
                    <Upload size={14} />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoImage')} />
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-bold opacity-40 uppercase tracking-widest">Hero Section</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest opacity-40">Hero Title</label>
                <input
                  value={settings.heroTitle}
                  onChange={e => setSettings({...settings, heroTitle: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded focus:outline-none focus:border-brand"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest opacity-40">Hero Subtitle</label>
                <input
                  value={settings.heroSubtitle}
                  onChange={e => setSettings({...settings, heroSubtitle: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded focus:outline-none focus:border-brand"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest opacity-40">Hero Image</label>
                <div className="flex gap-4">
                  <input
                    value={settings.heroImage}
                    onChange={e => setSettings({...settings, heroImage: e.target.value})}
                    className="flex-1 bg-white/5 border border-white/10 p-3 rounded focus:outline-none focus:border-brand"
                  />
                  <label className="cursor-pointer bg-white/10 hover:bg-white/20 px-4 py-3 rounded flex items-center gap-2 transition-colors">
                    <Upload size={14} />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'heroImage')} />
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest opacity-40">Hero Video</label>
                <div className="flex gap-4">
                  <input
                    value={settings.heroVideo}
                    onChange={e => setSettings({...settings, heroVideo: e.target.value})}
                    className="flex-1 bg-white/5 border border-white/10 p-3 rounded focus:outline-none focus:border-brand"
                  />
                  <label className="cursor-pointer bg-white/10 hover:bg-white/20 px-4 py-3 rounded flex items-center gap-2 transition-colors">
                    <Upload size={14} />
                    <input type="file" className="hidden" accept="video/mp4,video/webm,video/ogg,video/*" onChange={(e) => handleFileUpload(e, 'heroVideo')} />
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-bold opacity-40 uppercase tracking-widest">About Section</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest opacity-40">Profile Image</label>
                <div className="flex gap-4">
                  <input
                    value={settings.aboutProfileImage}
                    onChange={e => setSettings({...settings, aboutProfileImage: e.target.value})}
                    className="flex-1 bg-white/5 border border-white/10 p-3 rounded focus:outline-none focus:border-brand"
                  />
                  <label className="cursor-pointer bg-white/10 hover:bg-white/20 px-4 py-3 rounded flex items-center gap-2 transition-colors">
                    <Upload size={14} />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'aboutProfileImage')} />
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest opacity-40">About Title</label>
                <input
                  value={settings.aboutTitle}
                  onChange={e => setSettings({...settings, aboutTitle: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded focus:outline-none focus:border-brand"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest opacity-40">About Background Image (Work Process)</label>
                <div className="flex gap-4">
                  <input
                    value={settings.aboutBackgroundImage}
                    onChange={e => setSettings({...settings, aboutBackgroundImage: e.target.value})}
                    className="flex-1 bg-white/5 border border-white/10 p-3 rounded focus:outline-none focus:border-brand"
                  />
                  <label className="cursor-pointer bg-white/10 hover:bg-white/20 px-4 py-3 rounded flex items-center gap-2 transition-colors">
                    <Upload size={14} />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'aboutBackgroundImage')} />
                  </label>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] uppercase tracking-widest opacity-40">About Description</label>
                <textarea
                  rows={6}
                  value={settings.aboutDescription}
                  onChange={e => setSettings({...settings, aboutDescription: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded focus:outline-none focus:border-brand"
                  placeholder="Enter your bio/description here..."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest opacity-40">Description Font Size (px)</label>
                <input
                  type="number"
                  value={settings.aboutDescFontSize}
                  onChange={e => setSettings({...settings, aboutDescFontSize: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded focus:outline-none focus:border-brand"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest opacity-40">Description Font Weight</label>
                <select
                  value={settings.aboutDescFontWeight}
                  onChange={e => setSettings({...settings, aboutDescFontWeight: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded focus:outline-none focus:border-brand"
                >
                  <option value="300">Light (300)</option>
                  <option value="400">Regular (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">Semi-Bold (600)</option>
                  <option value="700">Bold (700)</option>
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-bold opacity-40 uppercase tracking-widest">Contact & Social</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-40">Email</label>
                  <input
                    value={settings.contactEmail}
                    onChange={e => setSettings({...settings, contactEmail: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-3 rounded focus:outline-none focus:border-brand"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-40">Instagram Link</label>
                  <input
                    value={settings.contactInstagram}
                    onChange={e => setSettings({...settings, contactInstagram: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-3 rounded focus:outline-none focus:border-brand"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-40">X (Twitter) Link</label>
                  <input
                    value={settings.contactX}
                    onChange={e => setSettings({...settings, contactX: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-3 rounded focus:outline-none focus:border-brand"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-40">YouTube Link</label>
                  <input
                    value={settings.contactYoutube}
                    onChange={e => setSettings({...settings, contactYoutube: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-3 rounded focus:outline-none focus:border-brand"
                  />
                </div>
              </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-bold opacity-40 uppercase tracking-widest">Clients</h2>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest opacity-40">Client Logos (URLs, comma separated)</label>
              <div className="flex gap-4">
                <textarea
                  rows={3}
                  value={settings.clients || ''}
                  onChange={e => setSettings({...settings, clients: e.target.value})}
                  className="flex-1 bg-white/5 border border-white/10 p-3 rounded focus:outline-none focus:border-brand"
                  placeholder="https://example.com/logo1.png, https://example.com/logo2.png"
                />
                <label className="cursor-pointer bg-white/10 hover:bg-white/20 px-4 py-3 rounded flex items-center gap-2 transition-colors h-fit">
                  <Upload size={14} />
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'clients')} />
                </label>
              </div>
            </div>
          </section>

          <div className="flex items-center gap-6">
            <button type="submit" disabled={saveStatus === 'saving'} className="bg-brand text-black font-bold py-4 px-12 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50">
              {saveStatus === 'saving' ? 'SAVING...' : <><Save size={20} /> SAVE ALL SETTINGS</>}
            </button>
            
            <AnimatePresence>
              {saveStatus === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-brand text-xs font-bold uppercase tracking-widest"
                >
                  <CheckCircle2 size={16} /> Changes Saved Successfully
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      )}

      {isEditing && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-6">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 md:p-10 rounded-2xl relative shadow-2xl custom-scrollbar">
            <button onClick={() => setIsEditing(false)} className="absolute top-6 right-6 opacity-40 hover:opacity-100 z-10">
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold mb-8 uppercase tracking-tighter">{editingId ? 'Edit Project' : 'New Project'}</h2>
            
            <form onSubmit={handleSaveProject} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Title</label>
                  <input
                    required
                    value={currentProject.title || ''}
                    onChange={e => setCurrentProject({...currentProject, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-2.5 rounded focus:outline-none focus:border-brand text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Category</label>
                  <select
                    value={currentProject.category}
                    onChange={e => setCurrentProject({...currentProject, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-2.5 rounded focus:outline-none focus:border-brand text-sm text-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-white text-black">{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Role</label>
                  <input
                    value={currentProject.role || ''}
                    onChange={e => setCurrentProject({...currentProject, role: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-2.5 rounded focus:outline-none focus:border-brand text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Client</label>
                  <input
                    value={currentProject.client || ''}
                    onChange={e => setCurrentProject({...currentProject, client: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-2.5 rounded focus:outline-none focus:border-brand text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Year</label>
                  <input
                    value={currentProject.year || ''}
                    onChange={e => setCurrentProject({...currentProject, year: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-2.5 rounded focus:outline-none focus:border-brand text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Video URL (YouTube/Vimeo)</label>
                  <input
                    value={currentProject.videoUrl || ''}
                    onChange={e => setCurrentProject({...currentProject, videoUrl: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-2.5 rounded focus:outline-none focus:border-brand text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Video File (Upload)</label>
                <div className="flex gap-4">
                  <input
                    value={currentProject.videoFile || ''}
                    onChange={e => setCurrentProject({...currentProject, videoFile: e.target.value})}
                    className="flex-1 bg-white/5 border border-white/10 p-2.5 rounded focus:outline-none focus:border-brand text-sm"
                  />
                  <label className="cursor-pointer bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded flex items-center gap-2 transition-colors">
                    <Upload size={14} />
                    <input type="file" className="hidden" accept="video/*" onChange={(e) => handleFileUpload(e, 'projectVideo')} />
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Thumbnail</label>
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <input
                      required
                      value={currentProject.thumbnailUrl || ''}
                      onChange={e => setCurrentProject({...currentProject, thumbnailUrl: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 p-2.5 rounded focus:outline-none focus:border-brand text-sm"
                    />
                    {currentProject.thumbnailUrl && currentProject.thumbnailUrl.trim() !== "" && (
                      <div className="w-32 aspect-video rounded overflow-hidden border border-white/10">
                        <img src={currentProject.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded flex items-center gap-2 transition-colors h-fit">
                    <Upload size={14} />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'thumbnail')} />
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Description</label>
                <textarea
                  rows={3}
                  value={currentProject.description}
                  onChange={e => setCurrentProject({...currentProject, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-2.5 rounded focus:outline-none focus:border-brand text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={currentProject.isFeatured === 1}
                  onChange={e => setCurrentProject({...currentProject, isFeatured: e.target.checked ? 1 : 0})}
                  className="w-4 h-4 accent-brand"
                />
                <label htmlFor="isFeatured" className="text-[10px] uppercase tracking-widest opacity-60 font-bold">Featured on Home</label>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  type="submit" 
                  disabled={saveStatus === 'saving'}
                  className="flex-1 bg-brand text-black font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-brand/90 transition-colors disabled:opacity-50"
                >
                  {saveStatus === 'saving' ? 'SAVING...' : <><Save size={18} /> SAVE PROJECT</>}
                </button>
                
                <AnimatePresence>
                  {saveStatus === 'success' && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-brand text-xs font-bold uppercase tracking-widest"
                    >
                      <CheckCircle2 size={16} /> Saved!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
