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
    const loadData = () => {
      // Load projects from localStorage
      const savedProjects = localStorage.getItem('cuni_projects');
      if (savedProjects) {
        const data = JSON.parse(savedProjects);
        const featured = data.filter((p: Project) => p.isFeatured === 1).slice(0, 6);
        setProjects(featured);
        
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollLeft = 0;
          }
        }, 100);
      } else {
        fetchProjects();
      }

      // Load settings from localStorage
      const savedSettings = localStorage.getItem('cuni_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      } else {
        fetchSettings();
      }
    };

    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const data = await response.json();
          const featured = data.filter((p: Project) => p.isFeatured === 1).slice(0, 6);
          setProjects(featured);
          
          setTimeout(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollLeft = 0;
            }
          }, 100);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };

    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };

    loadData();

    // Listen for settings updates from admin panel
    const handleUpdate = () => loadData();
    window.addEventListener('settingsUpdated', handleUpdate);
    return () => window.removeEventListener('settingsUpdated', handleUpdate);
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

            {/* Home Client List */}
            {settings.clients && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 1, duration: 1 }}
                className="mt-12 max-w-2xl mx-auto overflow-hidden mask-fade"
              >
                <div className="flex whitespace-nowrap animate-marquee w-max py-4">
                  {(settings.clients.split(',').map(c => c.trim())).concat(settings.clients.split(',').map(c => c.trim())).map((client, idx) => (
                    <div key={idx} className="inline-flex items-center justify-center mx-6">
                      {client.startsWith('http') || client.startsWith('/uploads') ? (
                        <img src={client} alt="" className="h-4 md:h-6 object-contain grayscale brightness-200" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-[10px] md:text-xs font-bold tracking-tighter uppercase whitespace-nowrap">{client}</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 animate-bounce opacity-40">
            <div className="w-[1px] h-12 bg-brand" />
          </div>
        </div>
      </section>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 60s linear infinite;
        }
        .mask-fade {
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
      `}</style>

      {/* Latest Works Slider */}
      <section className="py-24 md:py-40 overflow-hidden w-full bg-black">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-12 text-center">
          <h3 className="text-2xl md:text-4xl font-display font-black tracking-tighter uppercase text-white inline-block relative">
            LATEST WORKS
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-brand" />
          </h3>
        </div>

        <div className="relative w-full max-w-[1600px] mx-auto group/slider">
          {/* Navigation Buttons - Subtle Overlay */}
          <button 
            onClick={() => scroll('left')}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/5 flex items-center justify-center hover:bg-brand hover:text-black transition-all opacity-0 group-hover/slider:opacity-100 hidden md:flex"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/5 flex items-center justify-center hover:bg-brand hover:text-black transition-all opacity-0 group-hover/slider:opacity-100 hidden md:flex"
          >
            <ChevronRight size={20} />
          </button>

          <div className="mask-fade px-6 md:px-20">
            <div 
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-10 pt-2 justify-start"
            >
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="min-w-[220px] md:min-w-[280px] lg:min-w-[320px] snap-start group"
                >
                  <Link to={`/work/${project.id}`} className="block aspect-video overflow-hidden bg-white/5 relative rounded-lg border border-white/10 shadow-2xl">
                    {project.thumbnailUrl ? (
                      <img 
                        src={`${project.thumbnailUrl}?v=${project.id}`} 
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Layout size={32} className="opacity-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                      <h4 className="text-sm font-bold tracking-tight uppercase text-white truncate">
                        {project.title}
                      </h4>
                      <p className="text-[7px] tracking-[0.3em] uppercase text-brand mt-0.5">
                        {project.category}
                      </p>
                    </div>
                  </Link>
                  <div className="mt-3 px-1">
                    <h4 className="text-[10px] font-bold tracking-tight uppercase opacity-70 group-hover:text-brand transition-colors truncate">{project.title}</h4>
                    <p className="text-[7px] uppercase tracking-[0.2em] opacity-20 mt-0.5">{project.category}</p>
                  </div>
                </motion.div>
              ))}
              
              {/* View All Card - Always at the end (right side) */}
              <div className="min-w-[220px] md:min-w-[280px] lg:min-w-[320px] snap-start">
                <Link to="/work" className="flex flex-col items-center justify-center aspect-video border border-white/10 bg-white/5 hover:bg-white/[0.08] transition-all group rounded-lg shadow-2xl">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-brand group-hover:text-black transition-all">
                    <ArrowRight size={16} />
                  </div>
                  <span className="text-[8px] tracking-[0.4em] uppercase opacity-30 group-hover:opacity-100">View All</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
