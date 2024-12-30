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

export default function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);


  const toggleMenu = () => {
    const navbar = document.getElementById('nav-container');
    navbar.classList.toggle('active');
    const hamburger = document.querySelector('.hamburger');
    hamburger.classList.toggle('active');
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
    const moduleRoutes = {
      module1: '/module1',
      module2: '/module2',
      module3: '/module3',
    };

    if (moduleRoutes[moduleId]) {
      window.location.href = moduleRoutes[moduleId];
    } else {
      console.error('Module not found');
    }
  };

  useEffect(() => {
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
        document.body.removeChild(cursor);
        document.body.removeChild(glow);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Beunghar Business Course</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;400;700&family=Ubuntu:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </Head>
      <header>
        <div className="container">
          <div className="header-left">
          </div>
          <nav1>
                <div className="nav-container">
                  <div className="logo">
                    <img src="/logo/Beunghar-FINAL6.png" alt="Logo" />
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
                      <li><a href="reviews.html" onClick={toggleMenu}>Reviews</a></li>
                      <li><a href="#faq" onClick={toggleMenu}>FAQ</a></li>
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
          <h1>Entrepreneurship on Steroids</h1>
          <h2>How I made $ 83,498.62 in a Year</h2>
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

      <section className="py-24 px-6 bg-black dark:bg-black overflow-hidden">
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
            <Card className="min-w-[500px] bg-slate-700 dark:bg-slate-700">
              <CardHeader>
                <CardTitle className="text-white">John Doe</CardTitle>
                <CardDescription className="text-gray-200">Business Owner</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white italic">
                  "This course changed my life! The knowledge I gained has been invaluable to my business journey. 
                  I've seen a 3x increase in my revenue since implementing these strategies."
                </p>
              </CardContent>
            </Card>

            <Card className="min-w-[500px] bg-slate-700 dark:bg-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Jane Smith</CardTitle>
                <CardDescription className="text-gray-200">Startup Founder</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white italic">
                  "I gained practical skills that I use every day. The mentorship and community support made all the difference. 
                  This was one of the best investments in myself."
                </p>
              </CardContent>
            </Card>

            <Card className="min-w-[500px] bg-slate-700 dark:bg-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Alex Brown</CardTitle>
                <CardDescription className="text-gray-200">Digital Entrepreneur</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white italic">
                  "The mentorship provided has been a game changer for me. The step-by-step guidance helped me 
                  launch my first successful online business."
                </p>
              </CardContent>
            </Card>

            {/* Duplicate first set for seamless loop */}
            <Card className="min-w-[500px] bg-slate-700 dark:bg-slate-700">
              <CardHeader>
                <CardTitle className="text-white">John Doe</CardTitle>
                <CardDescription className="text-gray-200">Business Owner</CardDescription>
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
            <Card className="min-w-[500px] bg-slate-700 dark:bg-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Sarah Davis</CardTitle>
                <CardDescription className="text-gray-200">E-commerce Expert</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white italic">
                  "I appreciated the community support and resources available throughout the course. 
                  The networking opportunities alone were worth the investment."
                </p>
              </CardContent>
            </Card>

            <Card className="min-w-[500px] bg-slate-700 dark:bg-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Michael Chen</CardTitle>
                <CardDescription className="text-gray-200">Tech Startup CEO</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white italic">
                  "The course provided actionable insights that helped me scale my business from $0 to $50k 
                  in just 6 months. The ROI was incredible."
                </p>
              </CardContent>
            </Card>

            <Card className="min-w-[500px] bg-slate-700 dark:bg-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Emma Wilson</CardTitle>
                <CardDescription className="text-gray-200">Marketing Consultant</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white italic">
                  "The strategies taught in this course revolutionized my approach to business. 
                  I've been able to help my clients achieve amazing results."
                </p>
              </CardContent>
            </Card>

            {/* Duplicate second set for seamless loop */}
            <Card className="min-w-[500px] bg-slate-700 dark:bg-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Sarah Davis</CardTitle>
                <CardDescription className="text-gray-200">E-commerce Expert</CardDescription>
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
        className="w-full max-w-3xl mx-auto px-4 py-16 bg-black"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-center mb-8 text-white">Why Join Our Course?</h2>
        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="item-1" className="bg-slate-700 dark:bg-slate-700 rounded-lg px-6">
            <AccordionTrigger className="text-xl py-6 accordion-trigger">
              Comprehensive Curriculum
            </AccordionTrigger>
            <AccordionContent className="text-lg pb-6 text-gray-200">
              Our curriculum is carefully designed to cover all essential aspects of business success. From foundational principles to advanced strategies, 
              you'll learn everything you need to build and scale your business. Each module builds upon the previous one, 
              ensuring a structured and thorough learning experience.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="bg-slate-700 dark:bg-slate-700 rounded-lg px-6">
            <AccordionTrigger className="text-xl py-6 accordion-trigger">
              Expert Instructors
            </AccordionTrigger>
            <AccordionContent className="text-lg pb-6 text-gray-200">
              Learn from successful entrepreneurs and industry leaders who have built multiple seven-figure businesses. 
              Our instructors don't just teach theory – they share real-world experiences, strategies, and lessons 
              learned from their own entrepreneurial journeys.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="bg-slate-700 dark:bg-slate-700 rounded-lg px-6">
            <AccordionTrigger className="text-xl py-6 accordion-trigger">
              Flexible Learning
            </AccordionTrigger>
            <AccordionContent className="text-lg pb-6 text-gray-200">
              Study at your own pace with 24/7 access to course materials. Whether you're a full-time entrepreneur 
              or building your business on the side, our platform allows you to learn whenever and wherever it's 
              convenient for you. All content is available on-demand and can be accessed from any device.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="bg-slate-700 dark:bg-slate-700 rounded-lg px-6">
            <AccordionTrigger className="text-xl py-6 accordion-trigger">
              Community Support
            </AccordionTrigger>
            <AccordionContent className="text-lg pb-6 text-gray-200">
              Join a vibrant community of like-minded entrepreneurs. Network with peers, find accountability partners, 
              and get support from mentors. Our active community forum and regular networking events ensure you're 
              never alone on your entrepreneurial journey. Plus, gain access to exclusive resources and opportunities 
              shared only within our community.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </motion.section>

      <motion.section 
        className="w-full max-w-3xl mx-auto px-4 py-16 bg-black"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-center mb-8 text-white">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="item-1" className="bg-slate-700 dark:bg-slate-700 rounded-lg px-6">
            <AccordionTrigger className="text-xl py-6 accordion-trigger">
              How long is the course?
            </AccordionTrigger>
            <AccordionContent className="text-lg pb-6 text-gray-200">
              The course lasts for 6 weeks, with new modules released each week. You'll have lifetime access to all materials, so you can learn at your own pace.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="bg-slate-700 dark:bg-slate-700 rounded-lg px-6">
            <AccordionTrigger className="text-xl py-6 accordion-trigger">
              What if I fall behind?
            </AccordionTrigger>
            <AccordionContent className="text-lg pb-6 text-gray-200">
              No problem! You can access all materials at any time and complete the course at your own pace. Our community and support team are always here to help you catch up.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="bg-slate-700 dark:bg-slate-700 rounded-lg px-6">
            <AccordionTrigger className="text-xl py-6 accordion-trigger">
              Is there a money-back guarantee?
            </AccordionTrigger>
            <AccordionContent className="text-lg pb-6 text-gray-200">
              Yes! We offer a 30-day money-back guarantee. If you're not completely satisfied with the course, we'll refund your investment with no questions asked.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="bg-slate-700 dark:bg-slate-700 rounded-lg px-6">
            <AccordionTrigger className="text-xl py-6 accordion-trigger">
              Do I get lifetime access?
            </AccordionTrigger>
            <AccordionContent className="text-lg pb-6 text-gray-200">
              Absolutely! Once you enroll, you'll have lifetime access to all course materials, including future updates and improvements to the curriculum.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="bg-slate-700 dark:bg-slate-700 rounded-lg px-6">
            <AccordionTrigger className="text-xl py-6 accordion-trigger">
              Is there live support available?
            </AccordionTrigger>
            <AccordionContent className="text-lg pb-6 text-gray-200">
              Yes! We provide live support through our community platform, weekly Q&A sessions, and dedicated mentorship calls to ensure you get the help you need.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </motion.section>

      <motion.section 
        className="py-24 px-6 bg-black dark:bg-black"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">
            Our Modules
          </h2>
        </div>
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-800 dark:bg-slate-800 transform hover:scale-105 transition-transform duration-200" 
                  onClick={() => navigateToModule('module1')}>
              <CardHeader>
                <CardTitle>Module 1</CardTitle>
                <CardDescription>Introduction to Basics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  Learn the fundamental concepts and principles to build a strong foundation.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 dark:bg-slate-800 transform hover:scale-105 transition-transform duration-200"
                  onClick={() => navigateToModule('module2')}>
              <CardHeader>
                <CardTitle>Module 2</CardTitle>
                <CardDescription>Intermediate Concepts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  Dive deeper into advanced strategies and practical applications.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 dark:bg-slate-800 transform hover:scale-105 transition-transform duration-200"
                  onClick={() => navigateToModule('module3')}>
              <CardHeader>
                <CardTitle>Module 3</CardTitle>
                <CardDescription>Advanced Topics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  Master complex techniques and real-world business scenarios.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.section>

      <motion.section 
        className="py-24 px-6 bg-black dark:bg-black"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">
            About Us
          </h2>
        </div>
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-700 dark:bg-slate-700">
              <CardHeader>
                <div className="w-full aspect-square overflow-hidden rounded-lg mb-4">
                  <img 
                    src="/img/big.jpg" 
                    alt="Jane Doe" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="text-white">Jane Doe</CardTitle>
                <CardDescription className="text-gray-200">CEO & Founder</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white mb-4">
                  Some text that describes me lorem ipsum ipsum lorem.
                </p>
                <p className="text-gray-200 mb-4">
                  jane@example.com
                </p>
                <button className="w-full bg-slate-900 text-white hover:bg-slate-800 py-2 rounded-md hover:opacity-90 transition-opacity">
                  Contact
                </button>
              </CardContent>
            </Card>

            <Card className="bg-slate-700 dark:bg-slate-700">
              <CardHeader>
                <div className="w-full aspect-square overflow-hidden rounded-lg mb-4">
                  <img 
                    src="/img/mike-ross.jpg" 
                    alt="Mike Ross" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="text-white">Mike Ross</CardTitle>
                <CardDescription className="text-gray-200">Art Director</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white mb-4">
                  Some text that describes me lorem ipsum ipsum lorem.
                </p>
                <p className="text-gray-200 mb-4">
                  mike@example.com
                </p>
                <button className="w-full bg-slate-900 text-white hover:bg-slate-800 py-2 rounded-md hover:opacity-90 transition-opacity">
                  Contact
                </button>
              </CardContent>
            </Card>

            <Card className="bg-slate-700 dark:bg-slate-700">
              <CardHeader>
                <div className="w-full aspect-square overflow-hidden rounded-lg mb-4">
                  <img 
                    src="/img/big.jpg" 
                    alt="John Doe" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="text-white">John Doe</CardTitle>
                <CardDescription className="text-gray-200">Designer</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white mb-4">
                  Some text that describes me lorem ipsum ipsum lorem.
                </p>
                <p className="text-gray-200 mb-4">
                  john@example.com
                </p>
                <button className="w-full bg-slate-900 text-white hover:bg-slate-800 py-2 rounded-md hover:opacity-90 transition-opacity">
                  Contact
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.section>

      <footer className="bg-black text-white">
        {/* CTA Section */}
        <div className="bg-radial-at-center from-gray-900 via-gray-900 to-black min-h-[200px] flex items-center justify-center">
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
                onClick={() => window.location.href = '/members'}
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
        <div className="bg-black min-h-[200px] flex items-center justify-center py-16">
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
                <a href="#twitter" className="text-slate-400 hover:text-white transition-colors">Twitter</a>
                <a href="#linkedin" className="text-slate-400 hover:text-white transition-colors">LinkedIn</a>
                <a href="#facebook" className="text-slate-400 hover:text-white transition-colors">Facebook</a>
              </div>
              <p className="text-slate-400">© {new Date().getFullYear()} Beunghar Business Course. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      <Script src="/script.js" defer />
    </>
  );
}
