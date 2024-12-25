import { useUser } from '@clerk/nextjs';
import styles from '../styles/MembersPage.module.css';
import Head from 'next/head';
import { SignInButton, UserButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import Script from 'next/script';

const SuccessModal = ({ onClose }) => {
  const [showUpgrading, setShowUpgrading] = useState(false);

  useEffect(() => {
    // Show success message for 2 seconds
    const upgradeTimer = setTimeout(() => {
      setShowUpgrading(true);
    }, 2000);

    // Close modal after 6 seconds total
    const closeTimer = setTimeout(() => {
      onClose();
    }, 6000);

    return () => {
      clearTimeout(upgradeTimer);
      clearTimeout(closeTimer);
    };
  }, [onClose]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.successIcon}>
          <svg viewBox="0 0 24 24" className={styles.checkmark}>
            <path fill="white" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
        </div>
        <h2>Payment Successful!</h2>
        <p>Welcome to Premium Membership</p>
        {showUpgrading && (
          <p className={styles.upgradingText}>
            Upgrading your membership, please wait a moment...
          </p>
        )}
      </div>
    </div>
  );
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 3000;

export default function MembersPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [membershipStatus, setMembershipStatus] = useState('free');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const syncUserData = async (retries = 0) => {
    if (!user || retries >= MAX_RETRIES) return false;

    try {
      const response = await fetch('https://beunghar-api.onrender.com/api/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id, email: user.emailAddresses[0].emailAddress }),
      });

      if (response.ok) {
        const data = await response.json();
        setMembershipStatus(data.membershipStatus);
        
        // Only continue retrying if not premium
        if (data.membershipStatus !== 'premium' && retries < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retries + 1))); // Exponential backoff
          return syncUserData(retries + 1);
        }
        return data.membershipStatus === 'premium';
      }
    } catch (error) {
      console.error('Error syncing user data:', error);
    }
    return false;
  };

  useEffect(() => {
    syncUserData();
  }, [user]);

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

  const handlePayment = async () => {
    const orderId = 'order-' + Math.random().toString(36).substring(2, 15);

    try {
      const response = await fetch('https://beunghar-api.onrender.com/create-transaction-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          orderId,
          userId: user.id
        }),
      });

      const data = await response.json();

      if (data.token) {
        window.snap.pay(data.token, {
          onSuccess: async function (result) {
            console.log('success', result);
            setShowSuccessModal(true);
            
            // More controlled polling with maximum 3 attempts
            let retryCount = 0;
            const pollStatus = async () => {
              const updated = await syncUserData();
              if (!updated && retryCount < 2) { // Only retry twice after initial attempt
                retryCount++;
                setTimeout(pollStatus, RETRY_DELAY * (retryCount + 1)); // Exponential backoff
              }
            };
            
            await pollStatus();
          },
          onPending: function (result) {
            console.log('pending', result);
          },
          onError: function (result) {
            console.log('error', result);
            alert('Payment failed. Please try again.');
          },
          onClose: function () {
            console.log('customer closed the popup without finishing the payment');
          }
        });
      } else {
        console.error('Failed to get transaction token');
        alert('Failed to initiate payment.');
      }
    } catch (error) {
      console.error('Error during payment:', error);
      alert('An error occurred during payment.');
    }
  };

  return (
    <>
      <Head>
        <title>Members Area - Course Modules</title>
      </Head>
      {showSuccessModal && (
        <SuccessModal onClose={() => {
          setShowSuccessModal(false);
          window.location.reload();
        }} />
      )}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key="Mid-client-k_Fm2h3BtREGEwMe"
        strategy="afterInteractive"
      />
      <div className={styles.membersPage}>
        <div className={styles.userButtonContainer}>
          <UserButton signOutUrl="/members" />
        </div>
        <div className={styles.content}>
          <h1>Welcome to Your Course</h1>
          <p className={styles.subtitle}>Select a module to begin your journey</p>
          
          <div className={styles.membershipContainer}>
            {membershipStatus === 'free' ? (
              <div className={styles.freeStatus}>
                <p>🔓 Free Member</p>
                <p>Upgrade to unlock all course modules!</p>
                <button className={styles.payButton} onClick={handlePayment}>
                  Upgrade to Premium
                </button>
              </div>
            ) : membershipStatus === 'premium' ? (
              <div className={styles.premiumStatus}>
                <p>✨ Premium Member ✨</p>
                <p>Enjoy full access to all course modules!</p>
              </div>
            ) : (
              <p>Membership Status: {membershipStatus}</p>
            )}
          </div>

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
