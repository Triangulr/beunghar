import React, { useState, useEffect } from 'react';

export default function ProgressTracker({ moduleName, lessons, videoId }) {
  const [completedLessons, setCompletedLessons] = useState([]);
  const [videoProgress, setVideoProgress] = useState(0);

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = JSON.parse(localStorage.getItem(`${moduleName}-progress`)) || {};
    setCompletedLessons(savedProgress.completedLessons || []);
    setVideoProgress(savedProgress.videoProgress || 0);
  }, [moduleName]);

  useEffect(() => {
    // Save progress to localStorage
    const progressData = {
      completedLessons,
      videoProgress,
    };
    localStorage.setItem(`${moduleName}-progress`, JSON.stringify(progressData));
  }, [completedLessons, videoProgress, moduleName]);

  const handleLessonComplete = (lesson) => {
    if (!completedLessons.includes(lesson)) {
      setCompletedLessons([...completedLessons, lesson]);
    }
  };

  const handleVideoProgress = (event) => {
    const currentProgress = Math.floor((event.target.currentTime / event.target.duration) * 100);
    setVideoProgress(currentProgress);
  };

  const totalSteps = lessons.length + 1; // Include the video as one step
  const completedSteps = completedLessons.length + (videoProgress === 100 ? 1 : 0);
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="progress-tracker">
      <h2>{`${moduleName} Progress Tracker`}</h2>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <p>{`Progress: ${completedSteps} / ${totalSteps} steps completed`}</p>
      <ul className="progress-details">
        {lessons.map((lesson, index) => (
          <li
            key={index}
            className={completedLessons.includes(lesson) ? 'completed' : ''}
          >
            {lesson}
            <button onClick={() => handleLessonComplete(lesson)}>
              Mark as Completed
            </button>
          </li>
        ))}
      </ul>
      <div className="video-progress">
        <h3>Video Progress</h3>
        <video
          className="module-video"
          controls
          onTimeUpdate={handleVideoProgress}
        >
          <source src={`/videos/${videoId}.mp4`} type="video/mp4" />
        </video>
        <p>{`Video Progress: ${videoProgress}%`}</p>
      </div>
    </div>
  );
}
