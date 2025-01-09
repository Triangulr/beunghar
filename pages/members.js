import { useUser } from '@clerk/nextjs';
import styles from '../styles/MembersPage.module.css';
import Head from 'next/head';
import { SignInButton, UserButton } from '@clerk/nextjs';
import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import {
  ScrollArea,
  ScrollBar,
} from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

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

const AffiliateSheet = () => {
  const { user } = useUser();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const fileInputRef = useRef(null);
  const { toast } = useToast()
  const [affiliateId, setAffiliateId] = useState('');
  const [isEditingId, setIsEditingId] = useState(false);
  const [editableId, setEditableId] = useState('');
  const [idError, setIdError] = useState('');

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
    const baseUrl = 'https://beunghar.com';
    return `${baseUrl}/?ref=${affiliateId || user?.id}`;
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

  useEffect(() => {
    const fetchAffiliateId = async () => {
      try {
        const response = await fetch(`https://beunghar-api-92744157839.asia-south1.run.app/api/affiliate-id/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.affiliateId) {
            setAffiliateId(data.affiliateId);
            setEditableId(data.affiliateId);
          }
        }
      } catch (error) {
        console.error('Error fetching affiliate ID:', error);
      }
    };

    if (user?.id) {
      fetchAffiliateId();
    }
  }, [user]);

  const handleUpdateAffiliateId = async () => {
    if (!editableId.trim()) {
      setIdError('Affiliate ID cannot be empty');
      return;
    }

    try {
      const response = await fetch('https://beunghar-api-92744157839.asia-south1.run.app/api/update-affiliate-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          affiliateId: editableId.trim()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAffiliateId(data.affiliateId);
        setIsEditingId(false);
        setIdError('');
        toast({
          title: "Success",
          description: "Affiliate ID updated successfully",
          duration: 2000,
        });
      } else {
        const error = await response.json();
        setIdError(error.detail || 'Failed to update affiliate ID');
      }
    } catch (error) {
      setIdError('Failed to update affiliate ID');
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className={styles.pillButton}>
          Affiliate Settings
        </button>
      </SheetTrigger>
      <SheetContent side="right" className={styles.sheetContainer}>
        <SheetHeader>
          <SheetTitle>Affiliate Settings</SheetTitle>
          <SheetDescription>
            Manage your affiliate settings and banner image
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className={styles.sheetBody}>
          <div className={styles.affiliateLinkSection}>
            <div className={styles.sectionHeader}>
              <h3>Affiliate Link</h3>
              <p className={styles.uploadDescription}>
                Share this link to earn commissions when people sign up through it.
              </p>
            </div>
            <div className={styles.linkContainer}>
              {isEditingId ? (
                <>
                  <input
                    type="text"
                    value={editableId}
                    onChange={(e) => setEditableId(e.target.value)}
                    className={styles.linkInput}
                    placeholder="Enter custom affiliate ID"
                  />
                  <button
                    className={styles.saveButton}
                    onClick={handleUpdateAffiliateId}
                    style={{ cursor: 'pointer' }}
                  >
                    Save
                  </button>
                  <button
                    className={styles.cancelButton}
                    onClick={() => {
                      setIsEditingId(false);
                      setEditableId(affiliateId || user?.id);
                      setIdError('');
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    value={getAffiliateLink()}
                    readOnly
                    className={styles.linkInput}
                  />
                  <button
                    className={styles.editButton}
                    onClick={() => setIsEditingId(true)}
                    style={{ cursor: 'pointer' }}
                  >
                    Edit ID
                  </button>
                  <button
                    className={styles.copyButton}
                    onClick={() => handleCopyLink(getAffiliateLink())}
                    style={{ cursor: 'pointer' }}
                  >
                    Copy
                  </button>
                </>
              )}
            </div>
            {idError && <p className={styles.errorText}>{idError}</p>}
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
          <ScrollBar />
        </ScrollArea>

        <SheetFooter className={styles.sheetFooter}>
          <button 
            className={styles.uploadButton}
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : imageUrl ? 'Change Image' : 'Upload Image'}
          </button>
          <SheetClose asChild>
            <button className={styles.closeButton}>Close</button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

// Add these badge variant styles
const difficultyStyles = {
  Beginner: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  Intermediate: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  Advanced: "bg-red-500/10 text-red-500 hover:bg-red-500/20"
};

export default function MembersPage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [loading, setLoading] = useState(true);
  const [membershipStatus, setMembershipStatus] = useState('free');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [showAffiliateModal, setShowAffiliateModal] = useState(false);
  const [modules, setModules] = useState([]);

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

  const fetchModules = async () => {
    try {
      const response = await fetch('https://beunghar-api-92744157839.asia-south1.run.app/api/modules');
      if (!response.ok) {
        throw new Error('Failed to fetch modules');
      }
      const data = await response.json();
      setModules(Array.isArray(data) ? data : []);
      console.log('Fetched modules:', data);
    } catch (error) {
      console.error('Error fetching modules:', error);
      setModules([]);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchModules();
    }
  }, [isSignedIn]);

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@900&display=swap" rel="stylesheet" />
      </Head>
      
      <AffiliateSheet />
      
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
              <AffiliateSheet />
              <UserButton signOutUrl="/members" />
            </div>
          </div>
        </header>
        <div className={styles.content}>
          <h1 style={{ fontWeight: 800, fontFamily: "'Inter Tight', sans-serif" }}>
            Welcome to your Course
          </h1>
          <h2 style={{ 
            fontWeight: 800, 
            fontFamily: "'Inter Tight', sans-serif",
            textAlign: 'center'
          }}>
            Select a module to get started
          </h2>
          
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
            {Array.isArray(modules) && modules.map((module) => (
              <div key={module._id} className={styles.moduleCard}>
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-lg font-semibold">
                    {module.title || 'Untitled Module'}
                  </h2>
                  <div className="flex gap-2 mt-1">
                    <Badge 
                      variant="outline" 
                      className={difficultyStyles[module.difficulty]}
                    >
                      {module.difficulty}
                    </Badge>
                    {module.isPremium && (
                      <Badge 
                        variant="outline" 
                        className="bg-violet-500/10 text-violet-500 hover:bg-violet-500/20"
                      >
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>
                <p style={{ fontWeight: 500 }}>
                  {module.description || 'No description available'}
                </p>
                <p className={styles.sectionCount}>
                  {module.sections?.length || 0} sections
                </p>
                <Link 
                  href={`/modules/${module._id}`} 
                  className={styles.moduleLink}
                  style={{
                    pointerEvents: membershipStatus === 'premium' || !module.isPremium ? 'auto' : 'none',
                    opacity: membershipStatus === 'premium' || !module.isPremium ? 1 : 0.5
                  }}
                >
                  {membershipStatus === 'premium' || !module.isPremium ? (
                    'Start Learning'
                  ) : (
                    '🔒 Premium Only'
                  )}
                </Link>
                {membershipStatus !== 'premium' && module.isPremium && (
                  <p className={styles.premiumNote}>Upgrade to access this module</p>
                )}
              </div>
            ))}
            
            {(!modules || modules.length === 0) && (
              <div className={styles.noModules}>
                <p>No modules available yet. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
