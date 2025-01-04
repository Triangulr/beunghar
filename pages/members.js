import { useUser } from '@clerk/nextjs';
import styles from '../styles/MembersPage.module.css';
import Head from 'next/head';
import { SignInButton, UserButton } from '@clerk/nextjs';
import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useToast } from "@/hooks/use-toast"

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

const AffiliateDrawer = () => {
  const { user } = useUser();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const fileInputRef = useRef(null);
  const { toast } = useToast()

  // Fetch existing image on component mount
  useEffect(() => {
    const fetchUserAsset = async () => {
      try {
        const response = await fetch(`https://beunghar-api-92744157839.asia-south1.run.app/api/user-asset/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.imageUrl) {
            setImageUrl(data.imageUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching user asset:', error);
      }
    };

    if (user?.id) {
      fetchUserAsset();
    }
  }, [user]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    console.log('File selected:', file); // Debug log
    console.log('Current user ID:', user?.id); // Debug user ID

    if (!file) {
      toast({
        title: "Error",
        description: "No file selected",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "User ID not found. Please try again.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Send the request with the user_id as a URL parameter
      const url = `https://beunghar-api-92744157839.asia-south1.run.app/api/upload-affiliate-image?user_id=${encodeURIComponent(user.id)}`;
      
      console.log('Uploading file...'); // Debug log
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Upload error:', errorData); // Debug log
        throw new Error(`Upload failed: ${errorData}`);
      }

      const data = await response.json();
      console.log('Response data:', data); // Debug log

      if (data.status === 'success' && data.imageUrl) {
        setImageUrl(data.imageUrl);
        toast({
          title: "Success",
          description: "Image uploaded successfully",
          duration: 2000,
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Keep existing helper functions
  const getAffiliateLink = () => {
    const firstName = user?.firstName?.toLowerCase() || '';
    const lastName = user?.lastName?.toLowerCase() || '';
    const baseUrl = 'https://beunghar.com';
    return `${baseUrl}/?ref=${firstName}${lastName}`;
  };

  const handleCopyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link)
      toast({
        title: "Link Copied!",
        description: "The affiliate link has been copied to your clipboard.",
        className: styles.toast,
        duration: 2000,
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try copying the link manually.",
        variant: "destructive",
        duration: 2000,
      })
    }
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className={styles.pillButton}>
          Affiliate Settings
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <div className={styles.drawerContainer}>
          <DrawerHeader>
            <DrawerTitle>Affiliate Settings</DrawerTitle>
            <DrawerDescription>
              Manage your affiliate settings and banner image
            </DrawerDescription>
          </DrawerHeader>

          <div className={styles.drawerBody}>
            <div className={styles.affiliateLinkSection}>
              <div className={styles.sectionHeader}>
                <h3>Affiliate Link</h3>
                <p className={styles.uploadDescription}>
                  Share this link to earn commissions when people sign up through it.
                </p>
              </div>
              <div className={styles.linkContainer}>
                <input 
                  type="text" 
                  value={getAffiliateLink()} 
                  readOnly 
                  className={styles.linkInput}
                />
                <button 
                  className={styles.copyButton}
                  onClick={() => handleCopyLink(getAffiliateLink())}
                >
                  Copy
                </button>
              </div>
            </div>
            
            <div className={styles.imageUploadSection}>
              <div className={styles.sectionHeader}>
                <h3>Affiliate Banner</h3>
                <p className={styles.uploadDescription}>
                  This banner will be shown to users who sign up using your affiliate link. 
                  Recommended size: 1200x300 pixels
                </p>
              </div>
              
              {imageUrl ? (
                <div className={styles.currentImage}>
                  <img 
                    src={imageUrl} 
                    alt="Affiliate banner" 
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '200px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                    }}
                  />
                </div>
              ) : (
                <div className={styles.uploadPlaceholder}>
                  <p>Upload your affiliate banner</p>
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
                id="affiliate-image-upload"
              />
            </div>
          </div>

          <DrawerFooter>
            <button 
              className={styles.uploadButton}
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : imageUrl ? 'Change Image' : 'Upload Image'}
            </button>
            <DrawerClose asChild>
              <button className={styles.closeButton}>Close</button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default function MembersPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [membershipStatus, setMembershipStatus] = useState('free');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [showAffiliateModal, setShowAffiliateModal] = useState(false);

  useEffect(() => {
    // Force cursor to always show
    document.body.style.cursor = 'default';
    
    // Cleanup function
    return () => {
      document.body.style.cursor = 'default';
    };
  }, []);

  const syncUserData = async (retries = 0) => {
    if (!user || retries >= MAX_RETRIES) return false;

    try {
      const response = await fetch('https://beunghar-api-92744157839.asia-south1.run.app/api/sync-user', {
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

  const handlePayment = async () => {
    const orderId = 'order-' + Math.random().toString(36).substring(2, 15);

    try {
      const response = await fetch('https://beunghar-api-92744157839.asia-south1.run.app/create-transaction-token', {
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
      
      <AffiliateDrawer />
      
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
      <div className={`${styles.membersPage} members-page`}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <Link href="/" className={styles.logo}>
              <img src="/logo/Beunghar-FINAL1.png" alt="Beunghar Logo" />
            </Link>
            <div className={styles.userButtonContainer}>
              <AffiliateDrawer />
              <UserButton signOutUrl="/members" />
            </div>
          </div>
        </header>
        <div className={styles.content}>
          <h1 style={{ fontWeight: 600 }}>Welcome to Your Course</h1>
          <p className={`${styles.subtitle} ${styles.globalFont}`} style={{ fontWeight: 500 }}>
            Select a module to begin your journey
          </p>
          
          <div className={styles.membershipContainer}>
            {membershipStatus === 'free' ? (
              <div className={styles.freeStatus}>
                <p style={{ fontWeight: 600 }}>🔓 Free Member 🔓</p>
                <p style={{ fontWeight: 500 }}>Upgrade to unlock all course modules!</p>
                <button className={styles.payButton} onClick={handlePayment}>
                  Upgrade to Premium
                </button>
              </div>
            ) : membershipStatus === 'premium' ? (
              <div className={styles.premiumStatus}>
                <p style={{ fontWeight: 600 }}>✨ Premium Member ✨</p>
                <p style={{ fontWeight: 500 }}>Enjoy full access to all course modules!</p>
              </div>
            ) : (
              <p style={{ fontWeight: 500 }}>Membership Status: {membershipStatus}</p>
            )}
          </div>

          <div className={styles.moduleGrid}>
            <div className={styles.moduleCard}>
              <h2 style={{ fontWeight: 600 }}>Module 1</h2>
              <p style={{ fontWeight: 500 }}>Introduction to Basics</p>
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
