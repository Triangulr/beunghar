import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import styles from '../../styles/ModuleOne.module.css';
import Head from 'next/head';
import Script from 'next/script';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Extract YouTube video ID from URL
const getYoutubeVideoId = (url) => {
  if (!url) return null;
  
  // Regular expression to match common YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11) ? match[2] : null;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  const utcDate = new Date(dateString + 'Z');
  return utcDate.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }).replace(' at ', ', ');
};

// Badge variant styles
const difficultyStyles = {
  Beginner: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  Intermediate: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  Advanced: "bg-red-500/10 text-red-500 hover:bg-red-500/20"
};

export default function DynamicModule() {
  const router = useRouter();
  const { id } = router.query;
  const { isLoaded, isSignedIn, user } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sectionProgress, setSectionProgress] = useState({});
  const [sectionLocks, setSectionLocks] = useState({});
  const [modules, setModules] = useState([]);
  const [membershipStatus, setMembershipStatus] = useState(null);
  const ytPlayerRefs = useRef({});

  useEffect(() => {
    if (module?.sections && module.sections.length > 0) {
      console.log('Initializing section locks for', module.sections.length, 'sections');
      const initialLocks = {};
      module.sections.forEach((_, index) => {
        initialLocks[index] = index !== 0; // First section unlocked, rest locked
      });
      console.log('Setting initial locks:', initialLocks);
      setSectionLocks(initialLocks);
    }
  }, [module]); // Only depend on module changes

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/members');
      return;
    } else if (isLoaded && isSignedIn) {
      setIsAuthorized(true);
      if (id) {
        fetchMembershipStatus().then((status) => {
          fetchModule(status);
        });
      }
    }
  }, [id, isLoaded, isSignedIn]);

  const fetchModule = async (currentMembershipStatus) => {
    try {
      const response = await fetch(`https://beunghar-api-92744157839.asia-south1.run.app/api/modules/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch module');
      }
      const data = await response.json();
      
      if (data.isPremium && currentMembershipStatus !== 'premium') {
        router.push('/members');
        return;
      }
      
      setModule(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  // Function to handle when a section is completed
  const handleSectionComplete = (index) => {
    // Update progress for this section
    setSectionProgress(prev => ({
      ...prev,
      [index]: 100
    }));

    // Unlock the next section if there is one
    setSectionLocks(prev => {
      if (module?.sections && index + 1 < module.sections.length) {
        const newLocks = { ...prev };
        newLocks[index + 1] = false;
        return newLocks;
      }
      return prev;
    });
  };

  // Function to load the YouTube IFrame API
  const loadYouTubeAPI = () => {
    return new Promise((resolve) => {
      // If it's already loaded, resolve immediately
      if (window.YT && window.YT.Player) {
        resolve();
        return;
      }
      
      // Create API loading flag if it doesn't exist
      if (!window.isYouTubeIframeAPILoading) {
        window.isYouTubeIframeAPILoading = true;
        
        // Setup callback for when API is ready
        window.onYouTubeIframeAPIReady = () => {
          window.isYouTubeIframeAPIReady = true;
          resolve();
        };
        
        // Load the IFrame API code asynchronously
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        // If already loading, wait for it to be ready
        const checkYT = setInterval(() => {
          if (window.YT && window.YT.Player) {
            clearInterval(checkYT);
            resolve();
          }
        }, 100);
      }
    });
  };

  // Create YouTube player for a section
  const createYouTubePlayer = async (index, videoId) => {
    if (!videoId) return;
    
    try {
      // Ensure API is loaded first
      await loadYouTubeAPI();
      
      // Check if container exists
      const containerId = `youtube-player-${index}`;
      const container = document.getElementById(containerId);
      if (!container) {
        console.error('Container not found:', containerId);
        return;
      }
      
      // Check if there's already an iframe within the container
      if (container.querySelector('iframe')) {
        console.log('Player already exists for section', index);
        return;
      }

      console.log('Creating YouTube player for section', index, 'with video ID', videoId);
      
      const player = new window.YT.Player(containerId, {
        videoId: videoId,
        playerVars: {
          'playsinline': 1,
          'rel': 0,
          'modestbranding': 1,
          'controls': 1,
          'showinfo': 1,
          'fs': 1, // Enable fullscreen button
          'iv_load_policy': 3 // Hide annotations
        },
        events: {
          'onStateChange': (event) => {
            // Video ended (state = 0)
            if (event.data === 0) {
              handleSectionComplete(index);
            }
          }
        }
      });
      
      ytPlayerRefs.current[index] = player;
    } catch (error) {
      console.error('Error creating YouTube player:', error);
    }
  };

  // Initialize YouTube players when the module is loaded
  useEffect(() => {
    if (!module?.sections || typeof window === 'undefined') return;
    
    const initPlayers = async () => {
      await loadYouTubeAPI();
      
      // Add a small delay to ensure DOM is fully rendered
      setTimeout(() => {
        module.sections.forEach((section, index) => {
          const videoId = getYoutubeVideoId(section.youtubeUrl);
          if (videoId && !sectionLocks[index]) {
            createYouTubePlayer(index, videoId);
          }
        });
      }, 500);
    };
    
    initPlayers();
    
    // Cleanup function
    return () => {
      // Clean up player references
      Object.values(ytPlayerRefs.current).forEach(player => {
        try {
          if (player && typeof player.destroy === 'function') {
            player.destroy();
          }
        } catch (e) {
          console.error('Error destroying player:', e);
        }
      });
      ytPlayerRefs.current = {};
    };
  }, [module, sectionLocks]);

  const fetchModules = async () => {
    try {
      const response = await fetch('https://beunghar-api-92744157839.asia-south1.run.app/api/modules');
      if (!response.ok) {
        throw new Error('Failed to fetch modules');
      }
      const data = await response.json();
      setModules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching modules:', error);
      setModules([]);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchModules();
    }
  }, [isSignedIn]);

  const fetchMembershipStatus = async () => {
    try {
      if (!user) {
        setMembershipStatus('free');
        return;
      }

      const response = await fetch('https://beunghar-api-92744157839.asia-south1.run.app/api/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.primaryEmailAddress?.emailAddress || ''
        })
      });
      
      if (!response.ok) throw new Error('Failed to fetch membership status');
      const data = await response.json();
      setMembershipStatus(data.membershipStatus);
      return data.membershipStatus;
    } catch (error) {
      setMembershipStatus('free');
      return 'free';
    }
  };

  useEffect(() => {
    console.log('Section locks updated:', sectionLocks);
  }, [sectionLocks]);

  if (!isAuthorized || loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <h1 className={styles.errorTitle}>Module Not Found</h1>
          <p className={styles.errorDescription}>Could not find the requested module.</p>
          <button 
            onClick={() => router.push('/members')} 
            className={styles.errorButton}
          >
            Return to Members Area
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.moduleContainer}>
      <Head>
        <title>{module.title || 'Course Module'}</title>
        <link 
          href="https://assets.calendly.com/assets/external/widget.css" 
          rel="stylesheet"
        />
        <style jsx global>{`
          .video-container {
            width: 100%;
            max-width: 900px;
            margin: 0 auto;
            margin-bottom: 16px;
          }
          
          .video-container .aspect-video {
            position: relative;
            padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
            height: 0;
            overflow: hidden;
            background-color: #000;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }
          
          /* Direct styling for the container div */
          .video-container .aspect-video > div {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
          }
          
          /* Styling for the iframe created by YouTube API */
          .video-container .aspect-video iframe,
          .video-container .aspect-video > div > iframe {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            border-radius: 8px !important;
            border: none !important;
          }
        `}</style>
      </Head>

      <header className={styles.moduleHeader}>
        <button onClick={() => router.push('/members')} className={styles.backButton}>
          ← Back to Members Area
        </button>
        
        <Sheet>
          <SheetTrigger asChild>
            <button className="inline-flex items-center justify-center rounded-md h-10 w-10 hover:bg-accent hover:text-accent-foreground mr-4">
              <BookOpen className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent className="z-[9999]">
            <SheetHeader>
              <SheetTitle>Available Modules</SheetTitle>
              <SheetDescription>
                Quick access to all course modules
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {modules.map((module) => {
                const isAccessible = !module.isPremium || membershipStatus === 'premium';
                
                return (
                  <div
                    key={module._id}
                    className={`group rounded-lg border p-4 transition-colors ${
                      isAccessible 
                        ? 'hover:bg-accent' 
                        : 'opacity-75 cursor-not-allowed bg-zinc-900 border-zinc-800'
                    }`}
                    onClick={() => isAccessible && router.push(`/modules/${module._id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold ${isAccessible ? 'group-hover:text-accent-foreground' : 'text-zinc-400'}`}>
                        {module.title || 'Untitled Module'}
                      </h3>
                      <div className="flex gap-2">
                        <Badge 
                          variant="outline" 
                          className={difficultyStyles[module.difficulty]}
                        >
                          {module.difficulty}
                        </Badge>
                        {module.isPremium ? (
                          <Badge 
                            variant="outline" 
                            className="bg-violet-500/10 text-violet-500 hover:bg-violet-500/20"
                          >
                            Premium
                          </Badge>
                        ) : (
                          <Badge 
                            variant="outline" 
                            className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          >
                            Free
                          </Badge>
                        )}
                      </div>
                    </div>
                    {module.description && (
                      <p className={`mt-2 text-sm line-clamp-2 ${isAccessible ? 'text-muted-foreground' : 'text-zinc-500'}`}>
                        {module.description}
                      </p>
                    )}
                    {!isAccessible && (
                      <div className="mt-2 text-sm text-yellow-200 bg-yellow-950 p-2 rounded-md border border-yellow-900">
                        This is a premium module. Please upgrade your membership to access this content.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <main className={styles.moduleContent}>
        <section className={styles.topSection}>
          <h1 className={styles.moduleTitle}>{module.title}</h1>
          <p className={styles.moduleSummary}>{module.description}</p>
          <p className={styles.lastUpdated}>Last updated: {formatDate(module.lastUpdated)}</p>

          {module.sections?.map((section, index) => {
            const isLocked = sectionLocks[index] === true;
            const videoId = getYoutubeVideoId(section.youtubeUrl);
            
            return (
              <div key={index}>
                <div 
                  className={`${styles.moduleSection} ${isLocked ? styles.lockedSection : ''}`}
                  style={{ 
                    margin: '10px 0',
                    padding: '20px'
                  }}
                >
                  <h2 className={styles.sectionTitle}>
                    {section.title}
                  </h2>
                  
                  <p className={styles.sectionDescription}>{section.description}</p>
                  
                  {section.youtubeUrl && videoId && !isLocked && (
                    <div className={styles.videoWrapper}>
                      <div className="video-container">
                        <div className="aspect-video">
                          {/* Static fallback iframe that will be replaced by the API */}
                          <div id={`youtube-player-${index}`} className="youtube-player-container">
                            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white text-sm">
                              Loading video player...
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 mb-6 max-w-[900px] mx-auto w-full">
                        <div className="h-3 bg-gray-700 rounded-full">
                          <div 
                            className="h-full bg-orange-500 rounded-full transition-all duration-300"
                            style={{ width: `${sectionProgress[index] || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm mt-1 font-medium text-gray-300 inline-block">
                          {sectionProgress[index] === 100 ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {section.youtubeUrl && isLocked && (
                    <div className={styles.videoWrapper}>
                      <div className={styles.lockedVideoMessage}>
                        Complete the previous section to unlock this video
                      </div>
                    </div>
                  )}
                  
                  <div className={styles.content}>
                    <div className="prose prose-invert prose-zinc max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {section.content || ''}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
                {index < module.sections.length - 1 && (
                  <hr className={styles.sectionDivider} />
                )}
              </div>
            );
          })}
        </section>
        
        <div 
          className="calendly-inline-widget" 
          data-url="https://calendly.com/beunghar/meet-the-man?background_color=3e3d3d&text_color=f8f8f8&primary_color=d67d36" 
          data-color-scheme="dark"
          style={{ minWidth: "320px", height: "700px" }}
        />
      </main>

      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />
    </div>
  );
}
