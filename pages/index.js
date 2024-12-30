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
                    <img src="/logo/Beunghar-FINAL4.png" alt="Logo" />
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
          <button className="btn hero-btn" onClick={() => window.location.href = '/members'}>Get Started</button>
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

      <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.h2
            className="text-4xl font-bold text-slate-900 dark:text-white"
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
            <Card className="min-w-[500px] bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>John Doe</CardTitle>
                <CardDescription>Business Owner</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 italic">
                  "This course changed my life! The knowledge I gained has been invaluable to my business journey. 
                  I've seen a 3x increase in my revenue since implementing these strategies."
                </p>
              </CardContent>
            </Card>

            <Card className="min-w-[500px] bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Jane Smith</CardTitle>
                <CardDescription>Startup Founder</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 italic">
                  "I gained practical skills that I use every day. The mentorship and community support made all the difference. 
                  This was one of the best investments in myself."
                </p>
              </CardContent>
            </Card>

            <Card className="min-w-[500px] bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Alex Brown</CardTitle>
                <CardDescription>Digital Entrepreneur</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 italic">
                  "The mentorship provided has been a game changer for me. The step-by-step guidance helped me 
                  launch my first successful online business."
                </p>
              </CardContent>
            </Card>

            {/* Duplicate first set for seamless loop */}
            <Card className="min-w-[500px] bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>John Doe</CardTitle>
                <CardDescription>Business Owner</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 italic">
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
            <Card className="min-w-[500px] bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Sarah Davis</CardTitle>
                <CardDescription>E-commerce Expert</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 italic">
                  "I appreciated the community support and resources available throughout the course. 
                  The networking opportunities alone were worth the investment."
                </p>
              </CardContent>
            </Card>

            <Card className="min-w-[500px] bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Michael Chen</CardTitle>
                <CardDescription>Tech Startup CEO</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 italic">
                  "The course provided actionable insights that helped me scale my business from $0 to $50k 
                  in just 6 months. The ROI was incredible."
                </p>
              </CardContent>
            </Card>

            <Card className="min-w-[500px] bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Emma Wilson</CardTitle>
                <CardDescription>Marketing Consultant</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 italic">
                  "The strategies taught in this course revolutionized my approach to business. 
                  I've been able to help my clients achieve amazing results."
                </p>
              </CardContent>
            </Card>

            {/* Duplicate second set for seamless loop */}
            <Card className="min-w-[500px] bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Sarah Davis</CardTitle>
                <CardDescription>E-commerce Expert</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 italic">
                  "I appreciated the community support and resources available throughout the course. 
                  The networking opportunities alone were worth the investment."
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <motion.section 
        className="w-full max-w-3xl mx-auto px-4 py-16"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-center mb-8">Why Join Our Course?</h2>
        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="item-1" className="bg-slate-50 dark:bg-slate-900 rounded-lg px-6">
            <AccordionTrigger className="text-xl py-6 hover:no-underline hover:text-primary">
              Comprehensive Curriculum
            </AccordionTrigger>
            <AccordionContent className="text-lg pb-6">
              Our curriculum is carefully designed to cover all essential aspects of business success. From foundational principles to advanced strategies, 
              you'll learn everything you need to build and scale your business. Each module builds upon the previous one, 
              ensuring a structured and thorough learning experience.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="bg-slate-50 dark:bg-slate-900 rounded-lg px-6">
            <AccordionTrigger className="text-xl py-6 hover:no-underline hover:text-primary">
              Expert Instructors
            </AccordionTrigger>
            <AccordionContent className="text-lg pb-6">
              Learn from successful entrepreneurs and industry leaders who have built multiple seven-figure businesses. 
              Our instructors don't just teach theory – they share real-world experiences, strategies, and lessons 
              learned from their own entrepreneurial journeys.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="bg-slate-50 dark:bg-slate-900 rounded-lg px-6">
            <AccordionTrigger className="text-xl py-6 hover:no-underline hover:text-primary">
              Flexible Learning
            </AccordionTrigger>
            <AccordionContent className="text-lg pb-6">
              Study at your own pace with 24/7 access to course materials. Whether you're a full-time entrepreneur 
              or building your business on the side, our platform allows you to learn whenever and wherever it's 
              convenient for you. All content is available on-demand and can be accessed from any device.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="bg-slate-50 dark:bg-slate-900 rounded-lg px-6">
            <AccordionTrigger className="text-xl py-6 hover:no-underline hover:text-primary">
              Community Support
            </AccordionTrigger>
            <AccordionContent className="text-lg pb-6">
              Join a vibrant community of like-minded entrepreneurs. Network with peers, find accountability partners, 
              and get support from mentors. Our active community forum and regular networking events ensure you're 
              never alone on your entrepreneurial journey. Plus, gain access to exclusive resources and opportunities 
              shared only within our community.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </motion.section>

      <motion.section 
        className="w-full max-w-3xl mx-auto px-4 py-16"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="item-1" className="bg-slate-50 dark:bg-slate-900 rounded-lg px-6">
            <AccordionTrigger className="text-xl py-6 hover:no-underline hover:text-primary">
              How long is the course?
            </AccordionTrigger>
            <AccordionContent className="text-lg pb-6">
              The course lasts for 6 weeks, with new modules released each week. You'll have lifetime access to all materials, so you can learn at your own pace.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="bg-slate-50 dark:bg-slate-900 rounded-lg px-6">
            <AccordionTrigger className="text-xl py-6 hover:no-underline hover:text-primary">
              What if I fall behind?
            </AccordionTrigger>
            <AccordionContent className="text-lg pb-6">
              No problem! You can access all materials at any time and complete the course at your own pace. Our community and support team are always here to help you catch up.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="bg-slate-50 dark:bg-slate-900 rounded-lg px-6">
            <AccordionTrigger className="text-xl py-6 hover:no-underline hover:text-primary">
              Is there a money-back guarantee?
            </AccordionTrigger>
            <AccordionContent className="text-lg pb-6">
              Yes! We offer a 30-day money-back guarantee. If you're not completely satisfied with the course, we'll refund your investment with no questions asked.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="bg-slate-50 dark:bg-slate-900 rounded-lg px-6">
            <AccordionTrigger className="text-xl py-6 hover:no-underline hover:text-primary">
              Do I get lifetime access?
            </AccordionTrigger>
            <AccordionContent className="text-lg pb-6">
              Absolutely! Once you enroll, you'll have lifetime access to all course materials, including future updates and improvements to the curriculum.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="bg-slate-50 dark:bg-slate-900 rounded-lg px-6">
            <AccordionTrigger className="text-xl py-6 hover:no-underline hover:text-primary">
              Is there live support available?
            </AccordionTrigger>
            <AccordionContent className="text-lg pb-6">
              Yes! We provide live support through our community platform, weekly Q&A sessions, and dedicated mentorship calls to ensure you get the help you need.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </motion.section>

      <motion.section 
        className="py-24 px-6 bg-slate-50 dark:bg-slate-900"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white">
            Our Modules
          </h2>
        </div>
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white dark:bg-slate-800 transform hover:scale-105 transition-transform duration-200" 
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

            <Card className="bg-white dark:bg-slate-800 transform hover:scale-105 transition-transform duration-200"
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

            <Card className="bg-white dark:bg-slate-800 transform hover:scale-105 transition-transform duration-200"
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
        className="py-24 px-6 bg-white dark:bg-slate-800"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white">
            About Us
          </h2>
        </div>
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <div className="w-full aspect-square overflow-hidden rounded-lg mb-4">
                  <img 
                    src="/img/big.jpg" 
                    alt="Jane Doe" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle>Jane Doe</CardTitle>
                <CardDescription>CEO & Founder</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Some text that describes me lorem ipsum ipsum lorem.
                </p>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  jane@example.com
                </p>
                <button className="w-full bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 py-2 rounded-md hover:opacity-90 transition-opacity">
                  Contact
                </button>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <div className="w-full aspect-square overflow-hidden rounded-lg mb-4">
                  <img 
                    src="/img/mike-ross.jpg" 
                    alt="Mike Ross" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle>Mike Ross</CardTitle>
                <CardDescription>Art Director</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Some text that describes me lorem ipsum ipsum lorem.
                </p>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  mike@example.com
                </p>
                <button className="w-full bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 py-2 rounded-md hover:opacity-90 transition-opacity">
                  Contact
                </button>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <div className="w-full aspect-square overflow-hidden rounded-lg mb-4">
                  <img 
                    src="/img/big.jpg" 
                    alt="John Doe" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle>John Doe</CardTitle>
                <CardDescription>Designer</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Some text that describes me lorem ipsum ipsum lorem.
                </p>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  john@example.com
                </p>
                <button className="w-full bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 py-2 rounded-md hover:opacity-90 transition-opacity">
                  Contact
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.section>

      <footer className="bg-slate-900 text-white">
        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary/90 to-primary py-12">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-left">
                <h2 className="text-3xl font-bold mb-2">Ready to Get Started?</h2>
                <p className="text-lg text-white/90">
                  Register now and we'll show you some 'magic'.
                </p>
              </div>
              <Button 
                className="bg-white text-primary hover:bg-white/90 px-8 py-3 rounded-full font-semibold"
                onClick={() => window.location.href = '/members'}
              >
                Get Started Now
              </Button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Quick Links */}
            <div className="flex flex-col">
              <h3 className="font-semibold text-lg mb-6 mt-6">Quick Links</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#home" className="text-slate-300 hover:text-white transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#reviews" className="text-slate-300 hover:text-white transition-colors">
                    Reviews
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-slate-300 hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="flex flex-col">
              <h3 className="font-semibold text-lg mb-6 mt-6">Resources</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#blog" className="text-slate-300 hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#tutorials" className="text-slate-300 hover:text-white transition-colors">
                    Tutorials
                  </a>
                </li>
                <li>
                  <a href="#guides" className="text-slate-300 hover:text-white transition-colors">
                    Guides
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="flex flex-col">
              <h3 className="font-semibold text-lg mb-6 mt-6">Company</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#about" className="text-slate-300 hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#careers" className="text-slate-300 hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-slate-300 hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="flex flex-col">
              <h3 className="font-semibold text-lg mb-6 mt-6">Legal</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#privacy" className="text-slate-300 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#terms" className="text-slate-300 hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#cookies" className="text-slate-300 hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <img 
                  src="/logo/Beunghar-FINAL4.png" 
                  alt="Beunghar Logo" 
                  className="h-8 w-auto"
                />
              </div>
              <div className="flex space-x-6">
                <a href="#twitter" className="text-slate-300 hover:text-white">
                  Twitter
                </a>
                <a href="#linkedin" className="text-slate-300 hover:text-white">
                  LinkedIn
                </a>
                <a href="#facebook" className="text-slate-300 hover:text-white">
                  Facebook
                </a>
                <a href="#instagram" className="text-slate-300 hover:text-white">
                  Instagram
                </a>
              </div>
            </div>
            <div className="text-center mt-6 text-slate-400">
              <p>© {new Date().getFullYear()} Beunghar Business Course. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      <Script src="/script.js" defer />
    </>
  );
}
