import Head from 'next/head';

export default function Module3() {
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
        <h1 className="module-title">Module 3 Master the skills</h1>
        <p className="module-summary">
          Master the leasons and perfect your skills
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
            <li>Lesson 1</li>
            <li>Lesson 2</li>
            <li>Lesson 3</li>
          </ul>
          <button className="progress-button">Mark Step as Complete</button>
        </div>
      </section>

      <section className="lesson-details">
        <h2>Lesson Details</h2>
        <article>
          <h3>Lesson 1: Advanced Topic Overview</h3>
          <p>This lesson provides an introduction to advanced topics, setting the stage for in-depth exploration.</p>
        </article>

        <article>
          <h3>Lesson 2: Deep Dive into Methods</h3>
          <p>We explore advanced methods and techniques to tackle complex challenges efficiently.</p>
        </article>

        <article>
          <h3>Lesson 3: Practical Applications</h3>
          <p>Concluding the module, this lesson demonstrates how to apply advanced concepts in real-world scenarios.</p>
        </article>
      </section>

      <div className="back-button-container">
        <button className="back-button" onClick={() => window.location.href = '/'}>Back to Main Page</button>
      </div>

      <footer>
        <p>&copy; 2024 Your Learning Platform</p>
      </footer>
    </>
  );
}
