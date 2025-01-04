import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import styles from '../../styles/ModuleOne.module.css';
import Head from 'next/head';
import Script from 'next/script';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function DynamicModule() {
  const router = useRouter();
  const { id } = router.query;
  const { isLoaded, isSignedIn } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/members');
      return;
    } else if (isLoaded && isSignedIn) {
      setIsAuthorized(true);
      if (id) {
        fetchModule();
      }
    }
  }, [id, isLoaded, isSignedIn]);

  const fetchModule = async () => {
    try {
      const response = await fetch(`https://beunghar-api-92744157839.asia-south1.run.app/api/modules/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch module');
      }
      const data = await response.json();
      setModule(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching module:', error);
      setLoading(false);
    }
  };

  if (!isAuthorized || loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className={styles.errorContainer}>
        <h1>Module Not Found</h1>
        <button onClick={() => router.push('/members')} className={styles.backButton}>
          Back to Members Area
        </button>
      </div>
    );
  }

  return (
    <div className={styles.moduleContainer}>
      <Head>
        <title>{module.title || 'Course Module'}</title>
        <link 
          href="https://assets.calendly.com/assets/external/widget.css" 
          rel="stylesheet"
        />
      </Head>

      <header className={styles.moduleHeader}>
        <button onClick={() => router.push('/members')} className={styles.backButton}>
          ← Back to Members Area
        </button>
      </header>

      <main className={styles.moduleContent}>
        <section className={styles.topSection}>
          <h1 className={styles.moduleTitle}>{module.title}</h1>
          <p className={styles.moduleSummary}>{module.description}</p>

          {module.sections?.map((section, index) => (
            <div key={index}>
              <div className={styles.moduleSection}>
                <h2 className={styles.sectionTitle}>{section.title}</h2>
                <p className={styles.sectionDescription}>{section.description}</p>
                
                <div className={styles.content}>
                  <div className="prose prose-invert prose-zinc max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {section.content || ''}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
              {index < module.sections.length - 1 && (
                <hr className={styles.sectionDivider} />
              )}
            </div>
          ))}
        </section>
      </main>

      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />
    </div>
  );
}
