import Head from 'next/head';
import Script from 'next/script';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import styles from '../styles/ModuleOne.module.css';

export default function Module1() {
  const { isLoaded, isSignedIn } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      window.location.href = '/members';
    } else if (isLoaded && isSignedIn) {
      setIsAuthorized(true);
    }
  }, [isLoaded, isSignedIn]);

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className={styles.moduleContainer}>
      <Head>
        <title>Module 1 - In-Depth Lessons</title>
        <link 
          href="https://assets.calendly.com/assets/external/widget.css" 
          rel="stylesheet"
        />
      </Head>
      <header className={styles.header}>
        <nav>
          <ul className={styles.navMenu}>
            <li><a href="/module1">Module 1</a></li>
            <li><a href="/module2">Module 2</a></li>
            <li><a href="/module3">Module 3</a></li>
          </ul>
        </nav>
      </header>

      <main className={styles.moduleContent}>
        <section className={styles.topSection}>
          <h1 className={styles.moduleTitle}>Module 1: Introduction to Basics</h1>
          <p className={styles.moduleSummary}>
            Learn the fundamentals of this subject with hands-on lessons and examples.
          </p>

          <section className={styles.moduleVideoContainer}>
            <div className={styles.videoBox}>
              <video className={styles.moduleVideo} controls>
                <source src="/video/3141320-uhd_3840_2160_25fps.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className={styles.progressTracker}>
              <h2>Progress Tracker</h2>
              <div className={styles.progressBar}>
                <div className={styles.progressFill}></div>
              </div>
              <ul className={styles.progressDetails}>
                <li>Lesson 1: Overview</li>
                <li>Lesson 2: Key Concepts</li>
                <li>Lesson 3: Practical Example</li>
              </ul>
              <button className={styles.progressButton}>Mark Step as Completed</button>
            </div>
          </section>
        </section>

        <div className={styles.bottomGrid}>
          <section className={styles.lessonDetails}>
            <h2>Lesson Details</h2>
            <article>
              <h3>Lesson 1: Overview</h3>
              <p>Explore the background and importance of the topic...</p>
            </article>
            <article>
              <h3>Lesson 2: Key Concepts</h3>
              <p>Dive into the core concepts required to build expertise...</p>
            </article>
            <article>
              <h3>Lesson 3: Practical Example</h3>
              <p>Apply your knowledge through a practical example...</p>
            </article>
          </section>

          <div className={styles.calendlyContainer}>
            <div
              className="calendly-inline-widget"
              data-url="https://calendly.com/beunghar/meet-the-man?hide_gdpr_banner=1&primary_color=f2630d"
              style={{ minWidth: '320px', height: '700px' }}
            />
          </div>
        </div>
      </main>

      <div className={styles.backButtonContainer}>
        <button className={styles.backButton} onClick={() => window.location.href = '/'}>
          Back to Main Page
        </button>
      </div>

      <footer className={styles.footer}>
        <p>© 2024 Learning Platform</p>
      </footer>

      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />
    </div>
  );
}
