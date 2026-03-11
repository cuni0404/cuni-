import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { SiteSettings } from '../types';

export default function About() {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});

  useEffect(() => {
    const loadData = () => {
      const savedSettings = localStorage.getItem('cuni_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      } else {
        fetchSettings();
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
  }, []);

  const tools = [
    "After Effects", "Cinema 4D", "Photoshop", "Illustrator", "Premiere Pro"
  ];

  const clients = settings.clients ? settings.clients.split(',').map(c => c.trim()) : [];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black">
      {/* Top Hero Section with Background */}
      <section className="relative pt-32 pb-16 px-6 md:px-12 overflow-hidden min-h-[60vh] flex items-center">
        {settings.aboutBackgroundImage && (
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black z-10" />
            <img 
              src={settings.aboutBackgroundImage} 
              alt="" 
              className="w-full h-full object-cover grayscale opacity-50 scale-105"
            />
          </div>
        )}

        <div className="relative z-20 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
            <div className="md:w-1/4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <h1 className="text-xs font-bold tracking-[0.5em] uppercase text-brand opacity-80">
                  ABOUT
                </h1>
                
                {settings.aboutProfileImage && settings.aboutProfileImage.trim() !== "" && (
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-brand/20 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border border-white/10 shadow-2xl">
                      <img src={settings.aboutProfileImage} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            <div className="md:w-3/4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-10"
              >
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-sans leading-[1.1] tracking-tighter font-bold text-white max-w-4xl">
                  {settings.aboutTitle || "Motion Designer based in Korea."}
                </h2>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="relative"
                >
                  <div 
                    className="relative z-10 leading-relaxed whitespace-pre-wrap glass p-6 md:p-8 rounded-2xl border border-white/5 bg-black/40 backdrop-blur-md"
                    style={{ 
                      fontSize: `${settings.aboutDescFontSize || 18}px`,
                      fontWeight: settings.aboutDescFontWeight || 400,
                      color: 'rgba(255, 255, 255, 0.9)',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {settings.aboutDescription || `웹툰 트레일러 등 2d 일러스트를 기반으로 하는 \n애니메이션을 제작하는 프리랜서 애니메이터 cuni 입니다\n\n2D 일러스트와 모션그래픽을 기반으로 캐릭터와 장면에 생동감을 불어넣고, \n작품이 가진 분위기와 감정을 영상으로 확장하는 작업을 하고 있습니다\n\n각 프로젝트가 하나의 작품으로 남을 수 있도록 \n연출, 애니메이션, 이펙트, 편집까지 전체 과정을 직접 설계하며 작업합니다`}
                  </div>
                </motion.div>
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
