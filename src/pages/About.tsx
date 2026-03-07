import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { SiteSettings } from '../types';
import { db, doc, onSnapshot } from '../firebase';

export default function About() {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'site'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as SiteSettings);
      }
    });

    return () => unsubscribe();
  }, []);

  const tools = [
    "After Effects", "Cinema 4D", "Photoshop", "Illustrator", "Premiere Pro"
  ];

  const clients = settings.clients ? settings.clients.split(',').map(c => c.trim()) : [];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black">
      {/* Top Hero Section with Background */}
      <section className="relative pt-40 pb-32 px-6 md:px-12 overflow-hidden">
        {settings.aboutBackgroundImage && (
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black z-10" />
            <img 
              src={settings.aboutBackgroundImage} 
              alt="" 
              className="w-full h-full object-cover grayscale opacity-70"
            />
          </div>
        )}

        <div className="relative z-20 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 md:gap-24">
            <div className="md:w-1/4">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold tracking-tighter uppercase text-brand opacity-60 mb-12"
              >
                ABOUT
              </motion.h1>
              
              {settings.aboutProfileImage && settings.aboutProfileImage.trim() !== "" && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-32 h-32 rounded-full overflow-hidden border-2 border-brand shadow-[0_0_30px_rgba(0,191,255,0.1)]"
                >
                  <img src={settings.aboutProfileImage} alt="Profile" className="w-full h-full object-cover" />
                </motion.div>
              )}
            </div>

            <div className="md:w-3/4 space-y-16">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-sans leading-tight tracking-tight font-bold"
              >
                {settings.aboutTitle || "Motion Designer based in Korea."}
              </motion.h2>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="about-description-container relative ml-0 md:ml-8 p-0 md:p-4 mt-8 md:mt-0"
              >
                <div 
                  className="relative z-10 opacity-90 leading-relaxed whitespace-pre-wrap text-base md:text-lg"
                  style={{ 
                    fontSize: `${settings.aboutDescFontSize || 18}px`,
                    fontWeight: settings.aboutDescFontWeight || 400,
                    textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                  }}
                >
                  {`웹툰 트레일러 등 2d 일러스트를 기반으로 하는 
애니메이션을 제작하는 프리랜서 애니메이터 cuni 입니다

2D 일러스트와 모션그래픽을 기반으로 캐릭터와 장면에 생동감을 불어넣고, 
작품이 가진 분위기와 감정을 영상으로 확장하는 작업을 하고 있습니다

각 프로젝트가 하나의 작품으로 남을 수 있도록 
연출, 애니메이션, 이펙트, 편집까지 전체 과정을 직접 설계하며 작업합니다`}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-24 mb-32">
          <section className="text-center">
            <h3 className="text-[10px] uppercase tracking-[0.5em] text-brand mb-12 opacity-50">Tools & Technologies</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {tools.map(tool => (
                <span key={tool} className="px-8 py-4 bg-white/5 border border-white/10 rounded-full text-[10px] tracking-[0.2em] uppercase hover:border-brand hover:text-brand transition-all cursor-default">
                  {tool}
                </span>
              ))}
            </div>
          </section>
        </div>

        {clients.length > 0 && (
          <section className="mb-32 overflow-hidden">
            <h3 className="text-[10px] uppercase tracking-[0.5em] text-brand mb-12 text-center opacity-50">Clients</h3>
            <div className="border-y border-white/5 py-10 md:py-14 relative overflow-hidden mask-fade">
              <div className="flex whitespace-nowrap animate-marquee w-max">
                {/* Duplicate multiple times to ensure seamless loop */}
                {[...clients, ...clients, ...clients, ...clients].map((client, idx) => (
                  <div 
                    key={idx} 
                    className="inline-flex items-center justify-center w-[140px] md:w-[240px] mx-4 md:mx-8"
                  >
                    {client.startsWith('http') || client.startsWith('/uploads') ? (
                      <div className="h-8 md:h-14 w-full flex items-center justify-center">
                        <img 
                          src={client} 
                          alt="Client" 
                          className="max-h-full max-w-full object-contain filter grayscale brightness-200 hover:grayscale-0 transition-all duration-500" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <span className="text-lg md:text-3xl font-bold tracking-tighter uppercase cursor-default text-center whitespace-nowrap opacity-40 hover:opacity-100 transition-opacity">
                        {client}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <style>{`
        .about-description-container::before {
          content: '';
          position: absolute;
          left: -2rem;
          top: 0;
          width: 2px;
          height: 100%;
          background: linear-gradient(to bottom, var(--color-brand), transparent);
          border-radius: 2px;
        }

        @media (max-width: 768px) {
          .about-description-container::before {
            display: none;
          }
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 100s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        .mask-fade {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
    </div>
  );
}
