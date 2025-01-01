import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import styles from '../styles/AdminPage.module.css';
import Link from 'next/link';
import { SignInButton } from '@clerk/nextjs';

export default function AdminDashboard() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      try {
        const response = await fetch(`https://beunghar-api.onrender.com/api/sync-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            email: user.emailAddresses[0].emailAddress
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin === true || data.isAdmin === "true");
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setLoading(false);
      }
    };

    if (isLoaded) {
      checkAdminStatus();
    }
  }, [user, isLoaded]);

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
          <h1>Admin Area</h1>
          <p>Please sign in to access the admin dashboard</p>
          <div className={styles.signInButtonWrapper}>
            <SignInButton mode="modal">
              <button className={styles.signInButton}>
                Sign In to Continue
              </button>
            </SignInButton>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={styles.unauthorizedContainer}>
        <div className={styles.unauthorizedContent}>
          <div className={styles.errorCode}>403</div>
          <h1>Access Denied</h1>
          <p>Sorry, you don't have permission to access this area.</p>
          <Link href="/" className={styles.homeLink}>
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>admin page go here</h1>
    </div>
  );
}
