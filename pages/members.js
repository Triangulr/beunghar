import { useUser } from '@clerk/nextjs';
import styles from '../styles/MembersPage.module.css';
import Head from 'next/head';
import { SignInButton, UserButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export default function MembersPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded || loading) {
    return (
      <div className={`${styles.loaderContainer} ${fadeOut ? styles.fadeOut : ''}`}>
        <span className={styles.loader}></span>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className={styles.notSignedIn}>
        <div className={styles.signInContainer}>
          <h1>Members Area</h1>
          <p>Please sign in to access exclusive content</p>
          <SignInButton mode="modal">
            <button className={styles.signInButton}>
              Sign In to Continue
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Members Area - Course Modules</title>
      </Head>
      <div className={styles.membersPage}>
        <div className={styles.userButtonContainer}>
          <UserButton afterSignOutUrl="/" />
        </div>
        <div className={styles.content}>
          <h1>Welcome to Your Course</h1>
          <p className={styles.subtitle}>Select a module to begin your journey</p>
          
          <div className={styles.moduleGrid}>
            <div className={styles.moduleCard}>
              <h2>Module 1</h2>
              <p>Introduction to Basics</p>
              <a href="/module1" className={styles.moduleLink}>Start Learning</a>
            </div>
            
            <div className={styles.moduleCard}>
              <h2>Module 2</h2>
              <p>Advanced Techniques</p>
              <a href="/module2" className={styles.moduleLink}>Start Learning</a>
            </div>
            
            <div className={styles.moduleCard}>
              <h2>Module 3</h2>
              <p>Master the Skills</p>
              <a href="/module3" className={styles.moduleLink}>Start Learning</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
