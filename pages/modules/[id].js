import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import styles from '../../styles/ModuleOne.module.css';
import Head from 'next/head';
import Script from 'next/script';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  MediaPlayer,
  MediaProvider,
  Track,
  Poster
} from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { BookOpen } from "lucide-react"

function timeStringToSeconds(timeString) {
  if (!timeString) return 0;
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  return (hours * 3600) + (minutes * 60) + seconds;
}

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

export default function DynamicModule() {
  const router = useRouter();
  const { id } = router.query;
  const { isLoaded, isSignedIn, user } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [moduleVideos, setModuleVideos] = useState({});
  const playerRefs = useRef({});
  const [currentChapters, setCurrentChapters] = useState({});
  const [chapterProgress, setChapterProgress] = useState({});
  const [currentTime, setCurrentTime] = useState({});
  const [completedChapters, setCompletedChapters] = useState({});
  const [videoDurations, setVideoDurations] = useState({});
  const [modules, setModules] = useState([]);
  const [membershipStatus, setMembershipStatus] = useState(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/members');
      return;
    } else if (isLoaded && isSignedIn) {
      setIsAuthorized(true);
      if (id) {
        fetchMembershipStatus().then((status) => {
          fetchModule(status);
          fetchModuleVideos(id);
        });
      }
    }
  }, [id, isLoaded, isSignedIn]);

  useEffect(() => {
    return () => {
      Object.values(playerRefs.current).forEach(player => {
        player?.destroy();
      });
    };
  }, []);

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

  const fetchModuleVideos = async (moduleId) => {
    try {
      const response = await fetch(
        `https://beunghar-api-92744157839.asia-south1.run.app/api/modules/${moduleId}/videos`
      );
      if (response.ok) {
        const videos = await response.json();
        const videoMap = {};
        videos.forEach(video => {
          videoMap[video.sectionIndex] = {
            videoUrl: video.videoUrl,
            chapters: video.chapters || [],
            chaptersVttUrl: `${video.chaptersVttUrl}?t=${Date.now()}`,
            duration: video.duration
          };
        });
        setModuleVideos(videoMap);
      }
    } catch (error) {
      console.error('Error fetching module videos:', error);
    }
  };

  const handleDuration = (index) => (duration) => {
    setVideoDurations(prev => ({
      ...prev,
      [index]: duration
    }));
  };

  const handleTimeUpdate = (index) => (event) => {
    const time = event.currentTime;
    const duration = moduleVideos[index]?.duration;
    const chapters = moduleVideos[index]?.chapters || [];
    
    console.log(`Video ${index} using chapters VTT:`, moduleVideos[index]?.chaptersVttUrl);
    
    const completed = chapters.filter((chapter, i) => {
      const currentChapterStart = timeStringToSeconds(chapter.time);
      if (i === chapters.length - 1) {
        return duration && time >= (duration - 1);
      } else {
        const nextChapterStart = timeStringToSeconds(chapters[i + 1].time);
        return time >= nextChapterStart;
      }
    });

    const progress = (completed.length / chapters.length) * 100;

    setChapterProgress(prev => ({
      ...prev,
      [index]: progress
    }));

    setCompletedChapters(prev => ({
      ...prev,
      [index]: completed.map(c => c.time)
    }));
  };

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
        <style>
          {`
            :root {
              --plyr-color-main: #ff6b00;
              --plyr-range-fill-background: #ff6b00;
              --plyr-video-control-color-hover: #ff8533;
              --plyr-badge-background: #ff6b00;
              --plyr-range-thumb-background: #ff6b00;
            }
          `}
        </style>
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
                        ? 'hover:bg-accent cursor-pointer' 
                        : 'opacity-75 cursor-not-allowed bg-zinc-900 border-zinc-800'
                    }`}
                    onClick={() => isAccessible && router.push(`/modules/${module._id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-semibold ${isAccessible ? 'group-hover:text-accent-foreground' : 'text-zinc-400'}`}>
                          {module.title || 'Untitled Module'}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {module.sections?.length || 0} sections
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {!module.isPremium ? (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Free
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                            Premium
                          </span>
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

          {module.sections?.map((section, index) => (
            <div key={index}>
              <div className={styles.moduleSection}>
                <h2 className={styles.sectionTitle}>{section.title}</h2>
                <p className={styles.sectionDescription}>{section.description}</p>
                
                {moduleVideos[index]?.videoUrl && (
                  <div className={styles.videoWrapper}>
                    <div className={styles.videoContainer}>
                      <MediaPlayer
                        title={section.title}
                        src={moduleVideos[index].videoUrl}
                        crossorigin=""
                        playsinline
                        viewType="video"
                        streamType="on-demand"
                        onTimeUpdate={handleTimeUpdate(index)}
                        onDuration={handleDuration(index)}
                      >
                        <MediaProvider>
                          {moduleVideos[index]?.chaptersVttUrl && (
                            <Track
                              key={`chapters-${index}`}
                              src={moduleVideos[index].chaptersVttUrl}
                              kind="chapters"
                              default
                              label={`Chapters for Section ${index + 1}`}
                              crossOrigin="anonymous"
                            />
                          )}
                        </MediaProvider>
                        <DefaultVideoLayout 
                          icons={defaultLayoutIcons}
                          thumbnails={moduleVideos[index].videoUrl}
                        />
                      </MediaPlayer>
                    </div>
                    
                    {moduleVideos[index]?.chapters && moduleVideos[index].chapters.length > 0 && (
                      <div className={styles.chaptersTracker}>
                        <div className={styles.overallProgress}>
                          <div className={styles.mainProgressBar}>
                            <div 
                              className={styles.mainProgressFill}
                              style={{ width: `${chapterProgress[index] || 0}%` }}
                            />
                          </div>
                          <span className={styles.progressText}>
                            {Math.round(chapterProgress[index] || 0)}% Complete
                          </span>
                        </div>
                        
                        <div className={styles.chaptersList}>
                          {moduleVideos[index].chapters.map((chapter, chapterIndex) => (
                            <div 
                              key={chapterIndex}
                              className={`${styles.chapterItem} ${
                                completedChapters[index]?.includes(chapter.time) ? styles.active : ''
                              }`}
                            >
                              <div className={styles.chapterCheckbox}>
                                {completedChapters[index]?.includes(chapter.time) && (
                                  <svg viewBox="0 0 24 24" fill="currentColor" className={styles.checkIcon}>
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                  </svg>
                                )}
                              </div>
                              <div className={styles.chapterInfo}>
                                <span className={styles.chapterTitle}>{chapter.title}</span>
                                <span className={styles.chapterTime}>
                                  {formatTime(chapter.time)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
          ))}
        </section>
      </main>

      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />
    </div>
  );
}

function formatTime(timeString) {
  if (typeof timeString === 'string') {
    const [hours, minutes, seconds] = timeString.split(':');
    if (hours === '00') {
      return `${minutes}:${seconds}`;
    }
    return timeString;
  }
  
  const minutes = Math.floor(timeString / 60);
  const seconds = Math.floor(timeString % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
