import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Layout } from 'lucide-react';
import { Project } from '../types';

export default function Work() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };
    fetchProjects();
  }, []);

  const categories = ['ALL', ...Array.from(new Set(projects.map(p => p.category)))];

  const filteredProjects = filter === 'ALL' 
    ? projects 
    : projects.filter(p => p.category === filter);

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 min-h-screen">
      <header className="mb-16 md:mb-24">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8">
          W<span className="text-brand">O</span>RK
        </h1>
        
        <div className="flex flex-wrap gap-6 md:gap-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-[10px] tracking-[0.3em] uppercase transition-all relative py-2 ${
                filter === cat ? 'opacity-100 text-brand font-bold' : 'opacity-30 hover:opacity-60'
              }`}
            >
              {cat}
              {filter === cat && (
                <motion.div 
                  layoutId="activeFilter"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand"
                />
              )}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-20">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group"
          >
            <Link to={`/work/${project.id}`} className="block aspect-video overflow-hidden bg-white/5 relative">
              {project.thumbnailUrl ? (
                <img 
                  src={`${project.thumbnailUrl}?v=${project.id}`} 
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-[400ms] ease-in-out group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Layout size={48} className="opacity-10" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-[400ms] ease-in-out flex flex-col items-center justify-center p-6 text-center">
                <h4 className="text-xl font-bold tracking-tighter uppercase mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-[400ms] ease-out">
                  {project.title}
                </h4>
                <div className="w-8 h-[1px] bg-brand mb-4 scale-x-0 group-hover:scale-x-100 transition-transform duration-[400ms] delay-100" />
                <span className="text-[9px] tracking-[0.4em] uppercase opacity-60 translate-y-2 group-hover:translate-y-0 transition-transform duration-[400ms] delay-150">
                  {project.category}
                </span>
              </div>
            </Link>
            <div className="mt-6">
              <h4 className="text-lg font-medium tracking-tight mb-1">{project.title}</h4>
              <p className="text-[10px] uppercase tracking-widest opacity-40">{project.category} — {project.year}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
