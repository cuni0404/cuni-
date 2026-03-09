import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Layout } from 'lucide-react';
import { Project, SiteSettings } from '../types';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const q = query(
          collection(db, 'projects'), 
          where('isFeatured', '==', 1),
          orderBy('order', 'asc'),
          limit(6)
        );
        const querySnapshot = await getDocs(q);
        const projectsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as unknown as Project[];
        setProjects(projectsData);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };

    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data());
        }
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
          mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }
      `}</style>

      {/* Latest Works Slider */}
      <section className="py-24 md:py-40">
        <div className="px-6 md:px-24 flex justify-between items-end mb-16">
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
          className="flex gap-[10px] overflow-x-auto no-scrollbar px-6 md:px-24 snap-x snap-mandatory"
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="min-w-[300px] md:min-w-[450px] snap-start group"
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
                    <Layout size={48} className="opacity-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-[400ms] ease-in-out flex flex-col items-center justify-center p-6 text-center rounded-2xl">
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
            <Link to="/work" className="flex flex-col items-center justify-center aspect-video border border-white/10 hover:bg-white/5 transition-colors group rounded-2xl">
              <span className="text-[10px] tracking-[0.4em] uppercase opacity-40 group-hover:opacity-100 mb-4">View All Projects</span>
              <ArrowRight size={24} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
