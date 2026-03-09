import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Layout } from 'lucide-react';
import { Project, SiteSettings } from '../types';
import { cn } from '../lib/utils';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        setProjects(data.filter((p: Project) => p.isFeatured === 1).slice(0, 6));
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };

    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        setSettings(data);
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };

    fetchProjects();
    fetchSettings();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-screen w-full p-4 md:p-10 flex items-center justify-center">
        {/* Background Container with framing */}
        <div className="relative w-full h-full overflow-hidden rounded-[2.5rem] md:rounded-[4rem] bg-black flex items-center justify-center shadow-2xl border border-white/5">
          {/* Background */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black/60 z-10" />
            {Object.keys(settings).length > 0 ? (
              settings.heroVideo && settings.heroVideo.trim() !== "" ? (
                <video 
                  key={settings.heroVideo}
                  src={settings.heroVideo} 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              ) : (
                <img 
                  src={(settings.heroImage && settings.heroImage.trim() !== "") ? settings.heroImage : "https://picsum.photos/seed/showreel/1920/1080"} 
                  alt="Showreel Background" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )
            ) : null}
          </div>

          <div className="relative z-20 text-center px-6">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-[8vw] md:text-[6vw] font-bold tracking-tighter leading-[0.8] lowercase text-brand text-glow"
            >
              {settings.heroTitle || "cuni"}
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-6 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-[10px] md:text-xs tracking-[0.3em] uppercase opacity-60"
            >
              {settings.heroSubtitle || "Motion Designer / Webtoon PV / Action / Typography"}
            </motion.div>
          </div>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 animate-bounce opacity-40">
            <div className="w-[1px] h-12 bg-brand" />
          </div>
        </div>
      </section>

      {/* Latest Works Slider */}
      <section className="py-24 md:py-32">
        <div className="px-8 md:px-20 flex justify-between items-end mb-12">
          <div>
            <h3 className="text-4xl md:text-6xl font-display font-black tracking-tighter uppercase text-white">
              LATEST <span className="text-brand">WORKS</span>
            </h3>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-brand hover:text-black hover:border-brand transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-brand hover:text-black hover:border-brand transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-[10px] overflow-x-auto no-scrollbar px-8 md:px-20 snap-x snap-mandatory"
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="min-w-[300px] md:min-w-[450px] snap-start group"
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
              <div className="mt-4">
                <h4 className="text-sm font-medium tracking-tight mb-1">{project.title}</h4>
                <p className="text-[9px] uppercase tracking-widest opacity-40">{project.category} — {project.year}</p>
              </div>
            </motion.div>
          ))}
          {/* View All Card */}
          <div className="min-w-[300px] md:min-w-[450px] snap-start">
            <Link to="/work" className="flex flex-col items-center justify-center aspect-video border border-white/10 hover:bg-white/5 transition-colors group">
              <span className="text-[10px] tracking-[0.4em] uppercase opacity-40 group-hover:opacity-100 mb-4">View All Projects</span>
              <ArrowRight size={24} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
