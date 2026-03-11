import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowRight, Youtube, Twitter } from 'lucide-react';
import { SiteSettings } from '../types';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Contact() {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as SiteSettings);
      } else {
        const savedSettings = localStorage.getItem('cuni_settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      }
    }, (error) => {
      console.error("Error fetching settings:", error);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 min-h-screen flex flex-col justify-center max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-[10vw] md:text-[6vw] font-bold tracking-tighter leading-[0.9] mb-12">
          LET'S WORK <br /> TOGETHER
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
          <div className="space-y-12">
            <a 
              href={`mailto:${settings.contactEmail || "dominic0404@naver.com"}`} 
              className="group block border-b border-white/10 pb-8 hover:border-white transition-colors"
            >
              <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 mb-4">Email</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl md:text-3xl font-medium">{settings.contactEmail || "dominic0404@naver.com"}</span>
                <ArrowRight className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
              </div>
            </a>
          </div>

          <div className="flex flex-col justify-end">
            <p className="text-lg opacity-80 leading-relaxed mb-8">
              새로운 프로젝트 제안이나 협업 문의는 언제나 환영합니다. <br />
              이메일이나 하단 SNS 아이콘을 통해 연락주세요.
            </p>
            <p className="text-[10px] uppercase tracking-[0.4em] opacity-40">
              I am always open to new project proposals or collaboration inquiries. <br />
              Please contact me via email or the social media icons below.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
