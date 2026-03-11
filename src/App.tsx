/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Mail, ArrowRight, Plus, Trash2, Edit2, ChevronLeft, Youtube, Twitter, Instagram } from 'lucide-react';
import * as React from 'react';
import { useState, useEffect, ErrorInfo, ReactNode } from 'react';
import { db, auth } from './firebase';
import { doc, onSnapshot, getDocFromServer } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import Home from './pages/Home';
import Work from './pages/Work';
import About from './pages/About';
import Contact from './pages/Contact';
import ProjectDetail from './pages/ProjectDetail';
import Admin from './pages/Admin';
import { cn } from './lib/utils';

function Navbar({ settings }: { settings: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'WORK', path: '/work' },
    { name: 'ABOUT', path: '/about' },
    { name: 'CONTACT', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-6 py-8 md:px-12 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm">
      <Link to="/" className="hover:opacity-70 transition-opacity">
        {settings.logoImage && settings.logoImage.trim() !== "" ? (
          <div className="h-10 w-10 rounded-full overflow-hidden border border-white/10">
            <img src={settings.logoImage} alt="Logo" className="h-full w-full object-cover" />
          </div>
        ) : (
          <span className="text-2xl font-bold tracking-tighter uppercase">{settings.logoText || 'CUNI'}</span>
        )}
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex gap-12">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={cn(
              "text-xs font-medium tracking-[0.2em] hover:opacity-50 transition-opacity",
              location.pathname === link.path ? "opacity-100 text-brand" : "opacity-60"
            )}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Mobile Nav Toggle */}
      <button 
        className="md:hidden z-50 p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center gap-10 md:hidden z-40"
          >
            <div className="flex flex-col items-center gap-12 pt-20">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "text-4xl font-bold tracking-tighter uppercase transition-colors",
                    location.pathname === link.path ? "text-brand" : "text-white/60 hover:text-white"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends (React.Component as any) {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const errorObj = this.state.error as any;
        if (errorObj && errorObj.message) {
          const parsed = JSON.parse(errorObj.message);
          if (parsed.error) errorMessage = `Firestore Error: ${parsed.error}`;
        }
      } catch (e) {
        errorMessage = (this.state.error as any)?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold mb-4 uppercase tracking-tighter text-brand">Application Error</h2>
          <p className="opacity-60 max-w-md mb-8">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-white text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-brand transition-colors"
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const [settings, setSettings] = useState<any>({});
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });

    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'global'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSettings(data);
        updateMetadata(data);
      } else {
        // Fallback to localStorage if Firestore is empty
        const savedSettings = localStorage.getItem('cuni_settings');
        if (savedSettings) {
          const data = JSON.parse(savedSettings);
          setSettings(data);
          updateMetadata(data);
        }
      }
    }, (error) => {
      console.error("Error fetching settings:", error);
    });

    const updateMetadata = (data: any) => {
      if (data.logoText) {
        document.title = `${data.logoText} Works`;
      } else {
        document.title = 'Cuni Works';
      }

      if (data.logoImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = data.logoImage;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 32;
          canvas.height = 32;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const radius = 8;
            ctx.beginPath();
            ctx.moveTo(radius, 0);
            ctx.lineTo(32 - radius, 0);
            ctx.quadraticCurveTo(32, 0, 32, radius);
            ctx.lineTo(32, 32 - radius);
            ctx.quadraticCurveTo(32, 32, 32 - radius, 32);
            ctx.lineTo(radius, 32);
            ctx.quadraticCurveTo(0, 32, 0, 32 - radius);
            ctx.lineTo(0, radius);
            ctx.quadraticCurveTo(0, 0, radius, 0);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, 0, 0, 32, 32);
            
            let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = canvas.toDataURL('image/png');
          }
        };
      }
    };

    return () => {
      unsubscribeAuth();
      unsubscribeSettings();
    };
  }, []);

  // Admin access gimmick: Type 'admin' to redirect
  useEffect(() => {
    let keys: string[] = [];
    let timeout: any;
    const target = 'admin';
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      clearTimeout(timeout);
      keys.push(e.key.toLowerCase());
      keys = keys.slice(-target.length);
      
      if (keys.join('') === target) {
        navigate('/admin');
      }

      timeout = setTimeout(() => {
        keys = [];
      }, 2000); // Clear buffer after 2 seconds of inactivity
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-brand selection:text-black">
      <ScrollToTop />
      <Navbar settings={settings} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/work/:id" element={<ProjectDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      
      <footer className="px-6 py-12 md:px-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-end gap-12">
        <div className="flex flex-col gap-8 md:flex-row md:gap-24">
          <div 
            className="space-y-2 cursor-default select-none"
            onDoubleClick={() => navigate('/admin')}
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-brand opacity-60">copyright</p>
            <div className="text-xs font-medium leading-relaxed">
              ©2026 cuni<br />
              Motion Graphics Artist
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-brand opacity-60">contact</p>
            <div className="text-xs font-medium leading-relaxed">
              {settings.contactEmail || "dominic0404@naver.com"}
            </div>
          </div>
        </div>
        
        <div className="flex gap-8 items-center">
          {settings.contactInstagram && (
            <a href={settings.contactInstagram} target="_blank" rel="noreferrer" className="opacity-40 hover:opacity-100 hover:text-brand transition-all">
              <Instagram size={24} />
            </a>
          )}
          {settings.contactX && (
            <a href={settings.contactX} target="_blank" rel="noreferrer" className="opacity-40 hover:opacity-100 hover:text-brand transition-all">
              <Twitter size={24} />
            </a>
          )}
          {settings.contactYoutube && (
            <a href={settings.contactYoutube} target="_blank" rel="noreferrer" className="opacity-40 hover:opacity-100 hover:text-brand transition-all">
              <Youtube size={24} />
            </a>
          )}
          <a href={`mailto:${settings.contactEmail || "dominic0404@naver.com"}`} className="opacity-40 hover:opacity-100 hover:text-brand transition-all">
            <Mail size={24} />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}

