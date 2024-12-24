import Head from 'next/head';
import Script from 'next/script';
import { useEffect, useState } from 'react';

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

      <section id="home" className="hero-section">
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
      </section>

      <section id="video-section" className="video-section">
        <video id="dynamic-video" className="dynamic-video" autoPlay muted loop>
          <source src="/video/testing2_30fps.mp4" type="video/mp4" />
        </video>
      </section>

      <section className="testimonials-section">
          <h2>Don't trust what I say</h2>
          <h3>Here's what our students have to say</h3>
          <div className="testimonials-grid">
              <div className="testimonial-card">
                  <video className="testimonial-video" controls>
                      <source src="/video/3141320-uhd_3840_2160_25fps.mp4" type="video/mp4" />
                  </video>
                  <div className="testimonial-content">
                      <p className="testimonial-text">"Amazing experience! Highly recommend."</p>
                      <p className="testimonial-name">- John Doe</p>
                  </div>
              </div>
              <div className="testimonial-card">
                  <video className="testimonial-video" controls>
                      <source src="/video/3253862-uhd_3840_2160_25fps.mp4" type="video/mp4" />
                  </video>
                  <div className="testimonial-content">
                      <p className="testimonial-text">"A truly transformative service."</p>
                      <p className="testimonial-name">- Jane Smith</p>
                  </div>
              </div>
              <div className="testimonial-card">
                  <video className="testimonial-video" controls>
                      <source src="/video/852179-hd_1920_1080_30fps.mp4" type="video/mp4" />
                  </video>
                  <div className="testimonial-content">
                      <p className="testimonial-text">"Exceeded my expectations in every way!"</p>
                      <p className="testimonial-name">- Alex Brown</p>
                  </div>
              </div>
          </div>
      </section>

      <section className="course-overview">
          <div className="container">
              <h2>Why Join Our Course?</h2>
              <p>Our course covers everything from business fundamentals to practical real-world strategies. Whether you're starting a new venture or improving an existing one, this course is for you.</p>
              <div className="benefits">
                  <div className="benefit">
                      <h3>Expert Instructors</h3>
                      <p>Learn from experienced professionals with years of business experience.</p>
                  </div>
                  <div className="benefit">
                      <h3>Hands-On Projects</h3>
                      <p>Work on real-life business cases and receive valuable feedback.</p>
                  </div>
                  <div className="benefit">
                      <h3>Flexible Learning</h3>
                      <p>Access course materials anytime, anywhere on your own schedule.</p>
                  </div>
              </div>
          </div>
      </section>

      <section id="testimonials" className="testimonials">
          <h2>What Our Students Say</h2>
          <div className="testimonial-slider">
              <div className="testimonial-item">
                  <p>"This course changed my life! The knowledge I gained has been invaluable to my business journey." - John Doe</p>
              </div>
              <div className="testimonial-item">
                  <p>"I gained practical skills that I use every day. This was one of the best decisions I’ve made!" - Jane Smith</p>
              </div>
              <div className="testimonial-item">
                  <p>"The mentorship provided has been a game changer for me. Highly recommend!" - Alex Brown</p>
              </div>
              <div className="testimonial-item">
                  <p>"I appreciated the community support and resources available throughout the course." - Sarah Davis</p>
              </div>
              {/* --Duplicate-- */}
              <div className="testimonial-item">
                  <p>"This course changed my life! The knowledge I gained has been invaluable to my business journey." - John Doe</p>
              </div>
              <div className="testimonial-item">
                  <p>"I gained practical skills that I use every day. This was one of the best decisions I’ve made!" - Jane Smith</p>
              </div>
              <div className="testimonial-item">
                  <p>"The mentorship provided has been a game changer for me. Highly recommend!" - Alex Brown</p>
              </div>
              <div className="testimonial-item">
                  <p>"I appreciated the community support and resources available throughout the course." - Sarah Davis</p>
              </div>
          </div>
      </section>

      <section id="faq" className="faq-section">
          <div className="container1">
              <h2>Frequently Asked Questions</h2>
              <div className="faq-item">
                  <h3>How long is the course?</h3>
                  <p>The course lasts for 6 weeks, with new modules released each week.</p>
              </div>
              <div className="faq-item">
                  <h3>What if I fall behind?</h3>
                  <p>No problem! You can access all materials at any time and complete the course at your own pace.</p>
              </div>
          </div>
      </section>

      <section id="modules" className="modules">
          <h2>Our Modules</h2>
          <div className="module-container">
              <div className="module-box" onClick={() => navigateToModule('module1')}>
                  <h3>Module 1</h3>
                  <p>Introduction to Basics</p>
              </div>
              <div className="module-box" onClick={() => navigateToModule('module2')}>
                  <h3>Module 2</h3>
                  <p>Intermediate Concepts</p>
              </div>
              <div className="module-box" onClick={() => navigateToModule('module3')}>
                  <h3>Module 3</h3>
                  <p>Advanced Topics</p>
              </div>
          </div>
      </section>

      <div className="about-section">
          <h1>About Us Page</h1>
          <p> What we do </p>
        </div>
      
      <div className="about-section-h2">
        <h2>Our Team</h2>
      </div>
        <div className="row">
          <div className="column">
            <div className="card">
              <img src="/img/big.jpg" alt="Jane" style={{ width: '100%' }} />
              <div className="container2">
                <h2>Jane Doe</h2>
                <p className="title">CEO & Founder</p>
                <p>Some text that describes me lorem ipsum ipsum lorem.</p>
                <p>jane@example.com</p>
                <button className="button">Contact</button>
              </div>
            </div>
          </div>

          <div className="column">
            <div className="card">
              <img src="/img/mike-ross.jpg" alt="Mike" style={{ width: '100%' }} />
              <div className="container2">
                <h2>Mike Ross</h2>
                <p className="title">Art Director</p>
                <p>Some text that describes me lorem ipsum ipsum lorem.</p>
                <p>mike@example.com</p>
                <button className="button">Contact</button>
              </div>
            </div>
          </div>

          <div className="column">
            <div className="card">
              <img src="/img/big.jpg" alt="John" style={{ width: '100%' }} />
              <div className="container2">
                <h2>John Doe</h2>
                <p className="title">Designer</p>
                <p>Some text that describes me lorem ipsum ipsum lorem.</p>
                <p>john@example.com</p>
                <button className="button">Contact</button>
              </div>
            </div>
          </div>
        </div>

      <footer>
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Register now and we’ll show you some ‘magic’.</p>
          <button className="btn hero-btn">Get Started</button>
        </div>
          <ul className="nav-menu">
            <li><a href="#home">Home</a></li>
            <li><a href="#reviews">Reviews</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#sign-in">Login</a></li>
          </ul>
      </footer>

      <Script src="/script.js" defer />
    </>
  );
}
