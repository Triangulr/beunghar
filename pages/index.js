import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import CountUp from 'react-countup';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import { Volume2 } from 'lucide-react';
import tailwindColors from 'tailwindcss/colors';

export const formatThemeColors = (color) => {35
    return tailwindColors[color];
};


export default function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [modules, setModules] = useState([]);
  const [affiliateImage, setAffiliateImage] = useState(null);
  const [affiliateName, setAffiliateName] = useState('');
  const [affiliateDescription, setAffiliateDescription] = useState('');
  const [introVideoMuted, setIntroVideoMuted] = useState(true);
  const videoRef = useRef(null);
  const router = useRouter();

  const toggleMenu = () => {
    const navbar = document.getElementById('nav-container');
    const hamburger = document.querySelector('.hamburger');
    
    if (!navbar.classList.contains('active')) {
      // Opening menu
      navbar.classList.add('active');
      hamburger.classList.add('active');
      document.body.classList.add('no-scroll'); // Add no-scroll class instead
    } else {
      // Closing menu
      hamburger.classList.remove('active');
      navbar.classList.remove('active');
      
      // Remove no-scroll class after animation
      setTimeout(() => {
        document.body.classList.remove('no-scroll');
      }, 600);
    }
  };

  useEffect(() => {
    const testimonials = document.querySelectorAll('.testimonial-item');
    const totalTestimonials = testimonials.length;

    const intervalId = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % totalTestimonials);
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const testimonials = document.querySelectorAll('.testimonial-item');
    testimonials.forEach((testimonial, i) => {
      testimonial.classList.toggle('active', i === currentTestimonial);
    });
  }, [currentTestimonial]);

  const navigateToModule = (moduleId) => {
    router.push(`/modules/${moduleId}`);
  };

  useEffect(() => {
    // Only add custom cursor if we're on the home page
    if (window.location.pathname !== '/') {
      return;
    }

    const cursor = document.createElement('div');
    const glow = document.createElement('div');
    
    cursor.className = 'custom-cursor';
    glow.className = 'cursor-glow';
    
    document.body.appendChild(cursor);
    document.body.appendChild(glow);

    const moveCursor = (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';

      // Check if hovering over white element
      const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
      if (elementBelow && (
        elementBelow.classList.contains('trigger-dark-cursor') || 
        elementBelow.closest('.trigger-dark-cursor')
      )) {
        cursor.classList.add('on-light');
      } else {
        cursor.classList.remove('on-light');
      }
    };

    const handleElementHover = () => {
      cursor.style.width = '40px';
      cursor.style.height = '40px';
    };

    const handleElementLeave = () => {
      cursor.style.width = '20px';
      cursor.style.height = '20px';
    };

    // Add hover effect to all clickable elements
    const clickableElements = document.querySelectorAll('a, button, .accordion-trigger, [role="button"]');
    clickableElements.forEach(element => {
      element.addEventListener('mouseenter', handleElementHover);
      element.addEventListener('mouseleave', handleElementLeave);
    });

    window.addEventListener('mousemove', moveCursor);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      clickableElements.forEach(element => {
        element.removeEventListener('mouseenter', handleElementHover);
        element.removeEventListener('mouseleave', handleElementLeave);
      });
      if (cursor.parentNode) document.body.removeChild(cursor);
      if (glow.parentNode) document.body.removeChild(glow);
    };
  }, []);

  const handleGetStarted = () => {
    router.push('/members');
  };

  const scrollToSection = (sectionId, event) => {
    event.preventDefault();
    const section = document.querySelector(sectionId);
    if (section) {
      const offset = 100; 
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      toggleMenu(); // Close the menu after clicking
    }
  };

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch('https://beunghar-api-92744157839.asia-south1.run.app/api/publicModules');
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

    fetchModules();
  }, []);

  useEffect(() => {
    const fetchAffiliateImage = async (ref) => {
      try {
        const response = await fetch(`https://beunghar-api-92744157839.asia-south1.run.app/api/affiliate-image/${ref}`);
        if (response.ok) {
          const data = await response.json();
          if (data.imageUrl) {
            setAffiliateImage(data.imageUrl);
          }
          if (data.name) {
            setAffiliateName(data.name);
          }
          if (data.description) {
            setAffiliateDescription(data.description);
          }
          if (data.userId) {
            // Also store the user ID of the affiliate creator
            localStorage.setItem('affiliatorUserId', data.userId);
          }
        }
      } catch (error) {
        console.error('Error fetching affiliate image:', error);
      }
    };

    // Get ref from URL query parameters
    const { ref } = router.query;
    if (ref) {
      fetchAffiliateImage(ref);
      
      // Store affiliate ID in localStorage for persistence
      localStorage.setItem('affiliateRef', ref);
    }
  }, [router.query]);

  useEffect(() => {
    const updateHeader = () => {
      requestAnimationFrame(() => {
        const header = document.querySelector("header");
        if (!header) return;
        
        if (window.scrollY > 50) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      });
    };

    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader(); // Initial check

    return () => {
      window.removeEventListener("scroll", updateHeader);
    };
  }, []);

  const handleVideoClick = () => {
    if (videoRef.current) {
      videoRef.current.volume = 0.5;
      setIntroVideoMuted(false);
    }
  };

  return (
    <div className="home-page">
      <Head>
        <title>beunghar.com</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;900&family=Montserrat:wght@100;400;700&family=Ubuntu:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <style jsx global>{`
          @font-face {
            font-family: 'TheBoldFont';
            src: url('/fonts/TheBoldFont.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
          }
          
          .video-container * {
            cursor: none !important;
          }
          
          .video-container .custom-cursor {
            display: none !important;
          }
          
          .video-container video::-webkit-media-controls-panel {
            cursor: auto !important;
          }
        `}</style>
      </Head>
      <header>
        <div className="container4">
        <img src="/img/message.png" alt="Message Icon" class="animated-icon"/>
          <div className="header-left">
            <a href="mailto:info@beunghar.com" className="text-white hover:text-orange-400 transition-colors">
            info@beunghar.com
            </a>
          </div>
          <nav1 className="flex-1 flex justify-center">
            <div className="nav-container">
              <div className="logo">
                <img src="/logo/Beunghar-FINAL7.png" alt="Logo" />
              </div>
            </div>
          </nav1>              
          <nav>
            <button className="hamburger hamburger--elastic hamburger--squeeze js-menu-toggle" type="button" aria-label="Menu" aria-controls="nav-container" onClick={toggleMenu}>
              <span className="d-none d-md-inline"></span>
              <span className="hamburger-box">
                <span className="hamburger-inner"></span>
              </span>
            </button>
            <nav id="nav-container" className="fullscreen-menu">
              <ul className="menu-items">
                <li><a href="#home" onClick={toggleMenu}>Home</a></li>
                <li><a href="#reviews" onClick={(e) => scrollToSection('#reviews', e)}>Reviews</a></li>
                <li><a href="#faq" onClick={(e) => scrollToSection('#faq', e)}>FAQ</a></li>
                <li><a href="/members">Member Login</a></li>
                <li><a href="/admin">Admin Login</a></li>
              </ul>
            </nav>
          </nav>
        </div>
      </header>
      
      <motion.section 
        id="home" 
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="background-image-container">
          <div style={{ backgroundColor: '#333' }}></div>
        </div>
        <div className="background-overlay"></div>
        <video autoPlay muted loop className="background-video">
          <source src="/video/Beunghar vid.mp4" type="video/mp4" />
        </video>
        <div className="hero-content">
          <h1>
            <span style={{ fontFamily: 'TheBoldFont' }}>Entrepreneurship on </span>
            <span className="gradient-text" style={{ fontFamily: 'TheBoldFont' }}>Steroids</span>
          </h1>
          <h2 className="text-2xl">
            How I made $<CountUp
              start={0}
              end={98786374}
              duration={2.5}
              decimals={2}
              decimal="."
              prefix=""
              suffix=""
              separator=","
            />
            <span className="hidden md:inline"> </span>
            <span className="block md:inline">in a Year</span>
          </h2>
          <p>Starting a business is difficult. It doesn't need to be. We have the System, Education, Mentorship, Community all in a box</p>
          <Button 
            className="relative overflow-hidden bg-gradient-to-r from-orange-400 to-orange-600 
            text-white font-semibold px-8 py-3 rounded-full
            transform transition-all duration-300 ease-in-out
            hover:scale-105 hover:-translate-y-1
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-orange-500 before:to-orange-700
            before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100
            after:absolute after:inset-[2px] after:bg-gradient-to-r after:from-orange-400 after:to-orange-600
            after:rounded-full after:transition-all after:duration-300
            border-2 border-orange-300/30 shadow-[0_0_15px_rgba(255,171,64,0.3)]
            hover:shadow-[0_0_25px_rgba(255,171,64,0.5)]
            group"
            onClick={handleGetStarted}
          >
            <span className="relative z-10 flex items-center gap-2">
              Get Started Now
              <svg 
                className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </Button>
        </div>
      </motion.section>
      
      <div className="glowing-line" />
      
      <div className="stripes">
        <ContainerScroll
          titleComponent={
            <h1 className="text-4xl font-semibold text-center mb-4 sm:mb-8 text-white px-4">
              Watch Our Introduction
            </h1>
          }
        >
          <div className="relative rounded-xl overflow-hidden shadow-2xl w-full max-w-[95%] sm:max-w-4xl mx-auto video-container px-2 sm:px-0">
            {introVideoMuted && (
              <div 
                className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer z-10 video-overlay"
                onClick={handleVideoClick}
              >
                <div className="text-white text-center px-4 py-2 rounded-lg bg-black/60 backdrop-blur-sm">
                  <Volume2 className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
                  Click to Enable Audio
                </div>
              </div>
            )}
            <video 
              ref={videoRef}
              className="w-full aspect-video"
              controls
              playsInline
              preload="metadata"
              autoPlay
              muted={introVideoMuted}
              loop
              onClick={handleVideoClick}
            >
              <source src="/video/Beunghar vid.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </ContainerScroll>
      </div>
    
      <section id="reviews" className="py-24 px-6 bg-[#111111] dark:bg-[#111111] overflow-hidden">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.h2
            className="text-4xl font-bold text-white"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            What Our Students Say
          </motion.h2>
        </div>
        
        {/* First Row - Scrolling Left */}
        <div className="relative">
          <motion.div 
            className="flex space-x-6 animate-scroll-left"
            initial={{ x: "100%" }}
            whileInView={{ x: "0%" }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            {/* First set of cards */}
            <Card className="min-w-[500px] bg-[#333333] dark:bg-[#333333]">
              <CardHeader>
                <CardTitle className="text-white">John Doe</CardTitle>
                <CardDescription className="text-gray-100">Business Owner</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white italic">
                  "This course changed my life! The knowledge I gained has been invaluable to my business journey. 
                  I've seen a 3x increase in my revenue since implementing these strategies."
                </p>
              </CardContent>
            </Card>

            <Card className="min-w-[500px] bg-[#333333] dark:bg-[#333333]">
              <CardHeader>
                <CardTitle className="text-white">Jane Smith</CardTitle>
                <CardDescription className="text-gray-100">Startup Founder</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white italic">
                  "I gained practical skills that I use every day. The mentorship and community support made all the difference. 
                  This was one of the best investments in myself."
                </p>
              </CardContent>
            </Card>

            <Card className="min-w-[500px] bg-[#333333] dark:bg-[#333333]">
              <CardHeader>
                <CardTitle className="text-white">Alex Brown</CardTitle>
                <CardDescription className="text-gray-100">Digital Entrepreneur</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white italic">
                  "The mentorship provided has been a game changer for me. The step-by-step guidance helped me 
                  launch my first successful online business."
                </p>
              </CardContent>
            </Card>

            {/* Duplicate first set for seamless loop */}
            <Card className="min-w-[500px] bg-[#333333] dark:bg-[#333333]">
              <CardHeader>
                <CardTitle className="text-white">John Doe</CardTitle>
                <CardDescription className="text-gray-100">Business Owner</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white italic">
                  "This course changed my life! The knowledge I gained has been invaluable to my business journey. 
                  I've seen a 3x increase in my revenue since implementing these strategies."
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Second Row - Scrolling Right */}
        <div className="relative mt-6">
          <motion.div 
            className="flex space-x-6 animate-scroll-right"
            initial={{ x: "-100%" }}
            whileInView={{ x: "0%" }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            {/* Second set of cards */}
            <Card className="min-w-[500px] bg-[#333333] dark:bg-[#333333]">
              <CardHeader>
                <CardTitle className="text-white">Sarah Davis</CardTitle>
                <CardDescription className="text-gray-100">E-commerce Expert</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white italic">
                  "I appreciated the community support and resources available throughout the course. 
                  The networking opportunities alone were worth the investment."
                </p>
              </CardContent>
            </Card>

            <Card className="min-w-[500px] bg-[#333333] dark:bg-[#333333]">
              <CardHeader>
                <CardTitle className="text-white">Michael Chen</CardTitle>
                <CardDescription className="text-gray-100">Tech Startup CEO</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white italic">
                  "The course provided actionable insights that helped me scale my business from $0 to $50k 
                  in just 6 months. The ROI was incredible."
                </p>
              </CardContent>
            </Card>

            <Card className="min-w-[500px] bg-[#333333] dark:bg-[#333333]">
              <CardHeader>
                <CardTitle className="text-white">Emma Wilson</CardTitle>
                <CardDescription className="text-gray-100">Marketing Consultant</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white italic">
                  "The strategies taught in this course revolutionized my approach to business. 
                  I've been able to help my clients achieve amazing results."
                </p>
              </CardContent>
            </Card>

            {/* Duplicate second set for seamless loop */}
            <Card className="min-w-[500px] bg-[#333333] dark:bg-[#333333]">
              <CardHeader>
                <CardTitle className="text-white">Sarah Davis</CardTitle>
                <CardDescription className="text-gray-100">E-commerce Expert</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white italic">
                  "I appreciated the community support and resources available throughout the course. 
                  The networking opportunities alone were worth the investment."
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
      
      <motion.section 
        className="w-full max-w-3xl mx-auto px-4 py-16 bg-[#111111]"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-center mb-8 text-white">Why Join Beunghar.com?</h2>
        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="item-1" className="bg-[#333333] dark:bg-[#333333] rounded-lg px-6">
            <AccordionTrigger className="text-xl py-6 accordion-trigger text-white">
              Comprehensive Modules
            </AccordionTrigger>
            <AccordionContent className="text-lg pb-6 text-white">
              Our Curriculum provides short comprehensive knowledge regarding starting an online sales business. 
              From foundational knowledge to advanced knowledge is taught. Each module builds upon the previous one, 
              ensuring a structured and thorough learning experience.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="bg-[#333333] dark:bg-[#333333] rounded-lg px-6">
            <AccordionTrigger className="text-xl py-6 accordion-trigger text-white">
              Expert Instructors
            </AccordionTrigger>
            <AccordionContent className="text-lg pb-6 text-white">
              Learn from instructors with experience in this business that has made seven-figure sales revenue. 
              Our instructors do not teach just knowledge based on textbooks, but from experience that they went 
              through in building their business.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </motion.section>

      <motion.section 
        className="w-full max-w-3xl mx-auto px-4 py-16 bg-[#111111]"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-center mb-8 text-white">Our Core Values</h2>
        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="item-1" className="bg-[#333333] dark:bg-[#333333] rounded-lg px-6">
            <AccordionTrigger className="text-xl py-6 accordion-trigger text-white">
              "Mou ippon mindset"
            </AccordionTrigger>
            <AccordionContent className="text-lg pb-6 text-white">
              We at beunghar.com strive for competitive greatness. Mou ippon was derived from a Japanese sports chant 
              that meant "one more point." Sometimes, in business, we tend to lack that hunger for greatness, being 
              obsessed with this game. We teach you to have the mindset of having room to improve, hungry for results. 
              Although you are tired, lazy, or at your limit, you can do one more whether it is one more video to learn, 
              one more sales call, or one more hour in building your business. And for veterans. It's not over yet. 
              Disclaimer: This is not for the WEAK.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="bg-[#333333] dark:bg-[#333333] rounded-lg px-6">
            <AccordionTrigger className="text-xl py-6 accordion-trigger text-white">
              "Ubuntu"
            </AccordionTrigger>
            <AccordionContent className="text-lg pb-6 text-white">
              Ubuntu is not just a word, its a lifestyle "I am, because we are". Ubuntu is the essence of being human. 
              I have to learn from other beings how to be human. A person is a person through other people. We are taught 
              that beunghar.com is one. My shine is your shine, my success is your success. 'I can be my best only if you 
              are at your best, and you can only be your best if I am at my best, because we are one. I can't be my best 
              if you are not your best". Ubuntu promotes Respect, Unity, Empathy and interconnectedness.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </motion.section>

      {/* Modules Section - Moved here, above About Us */}
      <motion.section 
        className="py-24 px-6 bg-[#111111] dark:bg-[#111111]"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">
            Our Modules
          </h2>
        </div>
        <div className="flex justify-center w-full">
          <div className={`grid gap-8 ${
            modules.length === 1 ? 'grid-cols-1 w-[400px]' :
            modules.length === 2 ? 'grid-cols-2 w-[850px]' :
            'grid-cols-1 md:grid-cols-3 w-full max-w-[1300px]'
          } justify-items-center`}>
            {Array.isArray(modules) && modules.map((module) => (
              <Card 
                key={module._id} 
                className="w-full bg-[#333333] dark:bg-[#333333] transform hover:scale-105 transition-transform duration-200 flex flex-col max-w-[400px] text-center"
              >
                <CardHeader className="p-8">
                  <CardTitle className="text-white text-2xl mb-4 text-center">{module.title || 'Untitled Module'}</CardTitle>
                  <CardDescription className="text-white/80 text-lg text-center">
                    {module.description || 'No description available'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between p-8 pt-0">
                  <p className="text-white/90 text-lg mb-8 text-center">
                    {module.sections || 0} sections
                  </p>
                  <Button 
                    className="w-full bg-black/40 text-white hover:bg-black/50 py-6 rounded-md hover:opacity-90 transition-opacity text-lg"
                    onClick={() => navigateToModule(module._id)}
                  >
                    Start Learning
                  </Button>
                </CardContent>
              </Card>
            ))}

            {(!modules || modules.length === 0) && (
              <div className="col-span-full text-center text-white/90 py-8">
                <p>No modules available yet. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Subscription Comparison Section */}
      <motion.section 
        className="py-24 px-6 bg-[#111111] dark:bg-[#111111] relative overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#111111] via-[#1a1a1a] to-[#111111] opacity-50"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">
            Choose Your Plan
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-16">
            Select the subscription that fits your needs and start your entrepreneurial journey today
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="bg-[#222222] dark:bg-[#222222] border border-gray-800 overflow-hidden relative h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <CardHeader className="pb-6">
                <CardTitle className="text-3xl font-bold text-white">Free</CardTitle>
                <CardDescription className="text-xl text-white/80">Basic access to get started</CardDescription>
                <div className="mt-6 mb-2">
                  <span className="text-4xl font-bold text-white">$0</span>
                  <span className="text-white/70 ml-2">/ month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-4 text-left">
                  <li className="flex items-center text-white">
                    <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Access to beginner modules
                  </li>
                  <li className="flex items-center text-white">
                    <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Community forum access
                  </li>
                  <li className="flex items-center text-white">
                    <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Basic learning materials
                  </li>
                  <li className="flex items-center text-white/50">
                    <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Exclusive video content
                  </li>
                  <li className="flex items-center text-white/50">
                    <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Commission system
                  </li>
                  <li className="flex items-center text-white/50">
                    <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Advanced strategies
                  </li>
                </ul>
                <Button 
                  className="w-full bg-blue-900/40 text-white hover:bg-blue-900/60 py-6 rounded-md hover:opacity-90 transition-opacity text-lg"
                  onClick={handleGetStarted}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
            
            {/* Premium Plan */}
            <div className="relative transform hover:scale-105 transition-all duration-300">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 text-white px-5 py-1 rounded-full text-sm font-semibold shadow-md border border-orange-300/30">
                  RECOMMENDED
                </span>
              </div>
              <Card className="bg-gradient-to-b from-[#333333] to-[#222222] border border-orange-500/30 overflow-hidden relative h-full shadow-[0_0_20px_rgba(255,171,64,0.3)] hover:shadow-[0_0_25px_rgba(255,171,64,0.5)]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
                <CardHeader className="pb-6 pt-8">
                  <CardTitle className="text-3xl font-bold text-white">Premium</CardTitle>
                  <CardDescription className="text-xl text-white/80">Full access to all features</CardDescription>
                  <div className="mt-6 mb-2">
                    <span className="text-4xl font-bold text-white">$60</span>
                    <span className="text-white/70 ml-2">/ month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-4 text-left">
                    <li className="flex items-center text-white">
                      <svg className="w-5 h-5 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="font-medium">Everything in Free plan</span>
                    </li>
                    <li className="flex items-center text-white">
                      <svg className="w-5 h-5 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="font-medium">Exclusive premium video content</span>
                    </li>
                    <li className="flex items-center text-white">
                      <svg className="w-5 h-5 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="font-medium">Commission system with custom referral links</span>
                    </li>
                    <li className="flex items-center text-white">
                      <svg className="w-5 h-5 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Advanced business strategies
                    </li>
                    <li className="flex items-center text-white">
                      <svg className="w-5 h-5 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Priority support
                    </li>
                    <li className="flex items-center text-white">
                      <svg className="w-5 h-5 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Monthly live Q&A sessions
                    </li>
                  </ul>
                  <Button 
                    className="relative overflow-hidden bg-gradient-to-r from-orange-400 to-orange-600 
                    text-white font-semibold px-8 py-6 rounded-md w-full
                    transform transition-all duration-300 ease-in-out
                    hover:from-orange-500 hover:to-orange-700
                    border border-orange-300/30 shadow-[0_0_15px_rgba(255,171,64,0.3)]
                    hover:shadow-[0_0_25px_rgba(255,171,64,0.5)]
                    group text-lg"
                    onClick={() => router.push('/pricing')}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Upgrade Now
                      <svg 
                        className="w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section 
        className="py-24 px-6 bg-[#111111] dark:bg-[#111111]"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">
            About Us
          </h2>
        </div>
        <div className="container1 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div class="container5">
              <div class="box">
            <Card className="bg-[#333333] dark:bg-[#333333]">
              <CardHeader>
                <div className="w-full aspect-square overflow-hidden rounded-lg mb-4">
                  <img 
                    src="img/paskal.jpg" 
                    alt="Paskal" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="text-white">Andry Barlian/ Mang Idjot</CardTitle>
                <CardDescription className="text-white/80">Founder</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white mb-4">
                Is a serial entrepreneur, an owner of a villa, restaurant, home developer, and also helped significantly in the building of beunghar.com. He has generated over $500k sales throughout his team and has helped people to break free their 9-5 jobs
                </p>
              </CardContent>
            </Card>
            </div>
            </div>

            <Card className="bg-[#333333] dark:bg-[#333333]">
            <div class="container5">
            <div class="box">
              <CardHeader>
                <div className="w-full aspect-square overflow-hidden rounded-lg mb-4">
                  <img 
                    src="img/betrand.jpg" 
                    alt="Paskal" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="text-white">Paskalis Betrand</CardTitle>
                <CardDescription className="text-white/80">Founder</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white mb-4">
                Was once a forex trader over three years with 6 figure income, quits trading and pursue entrepreneurial path. Open restaurants and a glamping site, eventually making beunghar.com. He has helped hundreds of people to break free from the rat race and live the life that they want.
                </p>
              </CardContent>
            </div>
            </div>
            </Card>

            <Card className="bg-[#333333] dark:bg-[#333333]">
            <div class="container5">
            <div class="box">
              <CardHeader>
                <div className="w-full aspect-square overflow-hidden rounded-lg mb-4">
                  <img 
                    src={affiliateImage || "/img/mike-ross.jpg"} 
                    alt="Team Member" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="text-white">
                  {affiliateImage ? (affiliateName || "Your Affiliate Partner") : "Mike Ross"}
                </CardTitle>
                <CardDescription className="text-white/80">
                  {affiliateImage ? "Affiliate Partner" : "Art Director"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white mb-4">
                  {affiliateImage ? (affiliateDescription || "Your affiliate partner is here to help you succeed.") : "Some text that describes me lorem ipsum ipsum lorem."}
                </p>
              </CardContent>
            </div>
            </div>
            </Card>
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section 
        id="faq"
        className="w-full max-w-3xl mx-auto px-4 py-16 bg-[#111111]"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-center mb-8 text-white">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="item-1" className="bg-[#333333] dark:bg-[#333333] rounded-lg px-6">
            <AccordionTrigger className="text-xl py-6 accordion-trigger text-white">
              How long is the course?
            </AccordionTrigger>
            <AccordionContent className="text-lg pb-6 text-white">
              The beginner course would take you around 3 hours. You would have a lifetime access to the material on 
              the intermediate and advance courses once signed up to the premium membership.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="bg-[#333333] dark:bg-[#333333] rounded-lg px-6">
            <AccordionTrigger className="text-xl py-6 accordion-trigger text-white">
              Will I have enough time to do another business?
            </AccordionTrigger>
            <AccordionContent className="text-lg pb-6 text-white">
              There is always going to be busy seasons in our lives. The busier you are, its more reason to start. 
              What is the difference between doing this business now and 2 years later? The unaccounted loss of time 
              (which is the most valuable asset). If you start now when you're too busy, you have all the support, 
              community, mentorship, and platform when you need it most. With experience managing this business during 
              busy times, it becomes routine. You save literally 2 years of your time. Lastly, if you want this business 
              to last and can't figure out how to do it during busy seasons, then it isn't going to last.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="bg-[#333333] dark:bg-[#333333] rounded-lg px-6">
            <AccordionTrigger className="text-xl py-6 accordion-trigger text-white">
              I'm not sure if it's for me...
            </AccordionTrigger>
            <AccordionContent className="text-lg pb-6 text-white">
              When you have new identities, that is when you have new priorities. If you identify yourself as a lazy 
              idiot bastard who can't do shit, then your priorities would be just be lazy, unproductive shit. Whereas 
              if you identify yourself as a successful billionaire, you would do whatever it takes to succeed. Pro tip: 
              those who want to be rich spend on themselves on education, invest in skillsets. Skillset over asset. Now, 
              would you like to use that $1000 outfit, or being rich as fuck? And don't get me wrong its going to hurt 
              when you change. The question is if the pain of staying the same is greater than the pain of change?
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </motion.section>
      <div class="divider-wave"></div>
      <footer className="bg-[#111111] text-white">
        {/* CTA Section */}
        <div className="bg-radial-at-center from-[#111111] via-[#111111] to-[#111111] min-h-[200px] flex items-center justify-center">
          <div className="w-full max-w-4xl mx-auto px-6">
            <div className="flex flex-col items-center justify-center gap-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Ready to Get Started?</h2>
                <p className="text-lg text-white/90">
                  Register now and we'll show you some 'magic'.
                </p>
              </div>
              <Button 
                className="relative overflow-hidden bg-gradient-to-r from-orange-400 to-orange-600 
                text-white font-semibold px-8 py-3 rounded-full
                transform transition-all duration-300 ease-in-out
                hover:scale-105 hover:-translate-y-1
                before:absolute before:inset-0 before:bg-gradient-to-r before:from-orange-500 before:to-orange-700
                before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100
                after:absolute after:inset-[2px] after:bg-gradient-to-r after:from-orange-400 after:to-orange-600
                after:rounded-full after:transition-all after:duration-300
                border-2 border-orange-300/30 shadow-[0_0_15px_rgba(255,171,64,0.3)]
                hover:shadow-[0_0_25px_rgba(255,171,64,0.5)]
                group"
                onClick={handleGetStarted}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Now
                  <svg 
                    className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="bg-[#111111] min-h-[200px] flex items-center justify-center py-16">
          <div className="w-full max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              {/* Quick Links */}
              <div>
                <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><a href="#home" className="text-slate-400 hover:text-white transition-colors">Home</a></li>
                  <li><a href="#reviews" className="text-slate-400 hover:text-white transition-colors">Reviews</a></li>
                  <li><a href="#faq" className="text-slate-400 hover:text-white transition-colors">FAQ</a></li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-white font-semibold mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li><a href="#blog" className="text-slate-400 hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#tutorials" className="text-slate-400 hover:text-white transition-colors">Tutorials</a></li>
                  <li><a href="#guides" className="text-slate-400 hover:text-white transition-colors">Guides</a></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-white font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#about" className="text-slate-400 hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#careers" className="text-slate-400 hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#contact" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h3 className="text-white font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><a href="#privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#cookie" className="text-slate-400 hover:text-white transition-colors">Cookie Policy</a></li>
                </ul>
              </div>
            </div>

            {/* Bottom Section with Logo, Social Links, and Copyright */}
            <div className="border-t border-slate-800 pt-8 flex flex-col items-center gap-6">
              <img 
                src="/logo/Beunghar-FINAL4.png" 
                alt="Beunghar Logo" 
                className="h-8 w-auto"
              />
              <div className="flex space-x-6">
                <a href="https://x.com/beungharcom" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Twitter</a>
                <a href="#linkedin" className="text-slate-400 hover:text-white transition-colors">LinkedIn</a>
                <a href="https://www.instagram.com/beungharcom/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Instagram</a>
                <a href="https://www.facebook.com/people/BEUNGHARcom/61566606643521/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Facebook</a>
              </div>
              <p className="text-slate-400">© {new Date().getFullYear()} Beunghar. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
