import Head from 'next/head';
import Script from 'next/script';
import { useEffect, useState } from 'react';
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

export default function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [modules, setModules] = useState([]);
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

    fetchModules();
  }, []);

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
        `}</style>
      </Head>
      <header>
        <div className="container4">
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
          <source src="/video/testing-vid_24fps (1) (1).mp4" type="video/mp4" />
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
            /> in a Year
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
   
      
   <div className="stripes">
    

      <motion.section
        id="video-section"
        className="video-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
 
        <video id="dynamic-video" className="dynamic-video" autoPlay muted loop>
          <source src="/video/testing2_30fps.mp4" type="video/mp4" />
        </video>
      </motion.section>
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
                    {module.sections?.length || 0} sections
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="bg-[#333333] dark:bg-[#333333]">
              <CardHeader>
                <div className="w-full aspect-square overflow-hidden rounded-lg mb-4">
                  <img 
                    src="img/paskal.jpg" 
                    alt="Paskal" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="text-white">Paskal</CardTitle>
                <CardDescription className="text-white/80">Founder</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white mb-4">
                  Was once a forex trader over three years with 6 figure income, quits trading and pursue entrepreneurial path. 
                  Open restaurants and eventually making beunghar.com. He has helped hundreds of people to break free from the 
                  rat race and live the life that they want.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#333333] dark:bg-[#333333]">
              <CardHeader>
                <div className="w-full aspect-square overflow-hidden rounded-lg mb-4">
                  <img 
                    src="/img/mike-ross.jpg" 
                    alt="Mike Ross" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="text-white">Mike Ross</CardTitle>
                <CardDescription className="text-white/80">Art Director</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white mb-4">
                  Some text that describes me lorem ipsum ipsum lorem.
                </p>
                <p className="text-white/80 mb-4">
                  mike@example.com
                </p>
                <a 
                  href="https://www.youtube.com/watch?v=dQw4w9WgXcQ&pp=ygUJcmljayByb2xs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <button className="w-full bg-black/40 text-white hover:bg-black/50 py-2 rounded-md hover:opacity-90 transition-opacity">
                    Contact
                  </button>
                </a>
              </CardContent>
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
                <a href="#facebook" className="text-slate-400 hover:text-white transition-colors">Facebook</a>
              </div>
              <p className="text-slate-400">© {new Date().getFullYear()} Beunghar. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      <script src="script.js"></script>
    </div>
  );
}
