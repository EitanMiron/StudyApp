import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <p>Welcome back, User! Here's your overview:</p>
      <div className="dashboard-sections">
        <section className="group-section">
          <h2>Your Study Groups</h2>
          <p>View your current study groups or create a new one.</p>
          <Link to="/groups" className="cta-button">Manage Groups</Link>
        </section>

        <section className="note-section">
          <h2>Your Notes</h2>
          <p>Access your notes and flashcards for review.</p>
          <Link to="/notes" className="cta-button">View Notes</Link>
        </section>

        <section className="quiz-section">
          <h2>Your Quizzes</h2>
          <p>Take quizzes to test your knowledge or create a new one.</p>
          <Link to="/quizzes" className="cta-button">Manage Quizzes</Link>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
