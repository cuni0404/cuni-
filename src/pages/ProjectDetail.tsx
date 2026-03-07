import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { Project } from '../types';
import { db, doc, onSnapshot } from '../firebase';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(doc(db, 'projects', id), (doc) => {
      if (doc.exists()) {
        setProject({ id: doc.id, ...doc.data() } as any as Project);
      } else {
        setProject(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('vimeo.com')) {
      const id = url.split('/').pop();
      return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let id = '';
      if (url.includes('v=')) {
        id = url.split('v=')[1].split('&')[0];
      } else {
        id = url.split('/').pop() || '';
      }
      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }
    return url;
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!project) return <div className="h-screen flex items-center justify-center">Project not found</div>;

  const embedUrl = getEmbedUrl(project.videoUrl || '');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen"
    >
      <Link to="/work" className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase opacity-40 hover:opacity-100 hover:text-brand transition-all mb-12">
        <ChevronLeft size={14} /> Back to Work
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-24">
        <div className="lg:col-span-2">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 uppercase">{project.title}</h1>
          <div className="aspect-video bg-white/5 mb-12 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
            {project.videoFile ? (
              <video 
                src={project.videoFile} 
                controls 
                className="w-full h-full object-contain"
              />
            ) : embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={project.title}
              />
            ) : project.thumbnailUrl ? (
              <div className="w-full h-full flex items-center justify-center">
                <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-cover opacity-40" />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/5">
                <span className="text-xs opacity-20 uppercase tracking-widest">No Media Available</span>
              </div>
            )}
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-lg opacity-70 leading-relaxed">{project.description}</p>
          </div>
        </div>

        <div className="space-y-12">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-4">Role</h3>
            <p className="text-xl font-medium">{project.role || '—'}</p>
          </div>
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-4">Client</h3>
            <p className="text-xl font-medium">{project.client || '—'}</p>
          </div>
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-4">Year</h3>
            <p className="text-xl font-medium">{project.year || '—'}</p>
          </div>
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-4">Category</h3>
            <p className="text-xl font-medium text-brand">{project.category}</p>
          </div>
        </div>
      </div>

      {project.images && project.images.length > 0 && (
        <div className="space-y-12">
          <h2 className="text-[11px] uppercase tracking-[0.4em] opacity-40 text-center">Stills</h2>
          <div className="grid grid-cols-1 gap-12">
            {project.images.map((img) => (
              <img 
                key={img.id} 
                src={img.imageUrl} 
                alt="Project Still" 
                className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
