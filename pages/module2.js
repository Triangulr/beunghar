import Head from 'next/head';
import '../styles/module2.css';

export default function Module2() {
  return (
    <>
      <Head>
        <title>Module 2 - Advanced Techniques</title>
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
        <h1 className="module-title">Module 2: Advanced Techniques</h1>
        <p className="module-summary">
          Build on foundational skills and learn advanced techniques with detailed examples and exercises.
        </p>

        <section className="module-video-container">
          <div className="video-box">
            <video className="module-video" controls>
              <source src="/video/3253862-uhd_3840_2160_25fps.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="progress-tracker">
            <h2>Progress Tracker</h2>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <ul className="progress-details">
              <li>Lesson 1: Advanced Concepts</li>
              <li>Lesson 2: Real-World Application</li>
              <li>Lesson 3: Best Practices</li>
            </ul>
            <button className="progress-button">Mark Step as Completed</button>
          </div>
        </section>

        <section className="lesson-details">
          <h2>Lesson Details</h2>
          <article>
            <h3>Lesson 1: Advanced Concepts</h3>
            <p>Dive deep into advanced principles and strategies to elevate your skills...</p>
          </article>
          <article>
            <h3>Lesson 2: Real-World Application</h3>
            <p>Learn how to apply advanced concepts in real-world scenarios...</p>
          </article>
          <article>
            <h3>Lesson 3: Best Practices</h3>
            <p>Master the best practices to ensure efficiency and success...</p>
          </article>
        </section>
      </main>

      <div className="back-button-container">
        <button className="back-button" onClick={() => window.location.href = '/'}>Back to Main Page</button>
      </div>

      <footer>
        <p>© 2024 Learning Platform</p>
      </footer>
    </>
  );
}
