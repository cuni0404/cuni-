import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Layout } from 'lucide-react';
import { Project } from '../types';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function Work() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('order_index', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(data);
    }, (error) => {
      console.error("Error fetching projects:", error);
    });

    return () => unsubscribe();
  }, []);

  const categories = ['ALL', ...Array.from(new Set(projects.map(p => p.category)))];

  const filteredProjects = filter === 'ALL' 
    ? projects 
    : projects.filter(p => p.category === filter);

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 min-h-screen">
      <header className="mb-16 md:mb-24 max-w-7xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8">
          W<span className="text-brand">O</span>RK
        </h1>
        
        <div className="flex flex-wrap gap-4 md:gap-6 justify-start">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-[10px] tracking-[0.2em] uppercase transition-all relative px-6 py-3 rounded-full border ${
                filter === cat 
                  ? 'bg-brand text-black border-brand font-bold shadow-[0_0_20px_rgba(0,255,0,0.2)]' 
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group"
          >
            <Link to={`/work/${project.id}`} className="block aspect-video overflow-hidden bg-white/5 relative rounded-2xl border border-white/5">
              {project.thumbnailUrl ? (
                <img 
                  src={`${project.thumbnailUrl}?v=${project.id}`} 
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-[400ms] ease-in-out group-hover:scale-105 rounded-2xl"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center rounded-2xl">
                  <Layout size={44} className="opacity-10" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-[400ms] ease-in-out flex flex-col items-center justify-center p-6 text-center rounded-2xl">
                <h4 className="text-lg font-bold tracking-tighter uppercase mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-[400ms] ease-out">
                  {project.title}
                </h4>
                <div className="w-8 h-[1px] bg-brand mb-4 scale-x-0 group-hover:scale-x-100 transition-transform duration-[400ms] delay-100" />
                <span className="text-[9px] tracking-[0.4em] uppercase opacity-60 translate-y-2 group-hover:translate-y-0 transition-transform duration-[400ms] delay-150">
                  {project.category}
                </span>
              </div>
            </Link>
            <div className="mt-6">
              <h4 className="text-base font-medium tracking-tight mb-1">{project.title}</h4>
              <p className="text-[10px] uppercase tracking-widest opacity-40">{project.category} — {project.year}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
