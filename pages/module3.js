import Head from 'next/head';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function Module3() {
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
    <>
      <Head>
        <title>Module 3</title>
      </Head>
      <header>
        <nav>
          <ul className="nav-menu">
            <li><a href="/module1">Module 1</a></li>
            <li><a href="/module2">Module 2</a></li>
            <li><a href="/module3">Module 3</a></li>
          </ul>
        </nav>
      </header>

      <main className="module-content">
        <h1 className="module-title">Module 3: Master the skills</h1>
        <p className="module-summary">
          Master the lessons and perfect your skills
        </p>
      </main>

      <section className="module-video-container">
        <div className="video-box">
          <video className="module-video" controls>
            <source src="/video/3141320-uhd_3840_2160_25fps.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="progress-tracker">
          <h2>Progress Tracker</h2>
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <ul className="progress-details">
            <li>Lesson 1: In-Depth review</li>
            <li>Lesson 2: The thought</li>
            <li>Lesson 3: Test your skill</li>
          </ul>
          <button className="progress-button">Mark Step as Complete</button>
        </div>
      </section>

      <section className="lesson-details">
        <h2>Lesson Details</h2>
        <article>
          <h3>Lesson 1: In-Depth review</h3>
          <p>A callback to the previous lessons...</p>
        </article>
        <article>
          <h3>Lesson 2: The thought</h3>
          <p>Grab the ideas that gather in your mind...</p>
        </article>
        <article>
          <h3>Lesson 3: Practical Example</h3>
          <p>Test the limits of your capability...</p>
        </article>
      </section>

      <div className="back-button-container">
        <button className="back-button" onClick={() => window.location.href = '/'}>Back to Main Page</button>
      </div>

      <footer>
        <p>© 2024 Learning Platform</p>
      </footer>
    </>
  );
}
