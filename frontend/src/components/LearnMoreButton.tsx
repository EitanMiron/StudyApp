// src/components/LearnMoreButton.tsx
import React, { useState } from "react";
import Button from "./Button";

const LearnMoreButton: React.FC = () => {
  const [showText, setShowText] = useState(false);

  return (
    <div className="learn-more-container">
      <Button
        border="none"
        color="#4CAF50"
        height="36px"  // Smaller button
        onClick={() => setShowText(!showText)}
        radius="4px"
        width="110px"  // Smaller button
        style={{
          fontSize: "0.9rem",  // Smaller text
          margin: "0 auto",    // Centered
          display: "block"     // Ensure it's block level
        }}
      >
        {showText ? "Show Less" : "Learn More"}
      </Button>
      
      {showText && (
        <p style={{ 
          marginTop: "10px",
          padding: "10px",
          fontSize: "0.85rem",  // Smaller text
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          borderRadius: "4px",
          borderLeft: "3px solid #4CAF50",
          backdropFilter: "blur(5px)"
        }}>
          StudyApp is a modern learning platform designed to help students study more effectively.
          Our application offers various study modes, flashcards, and quizzes.
        </p>
      )}
    </div>
  );
};

export default LearnMoreButton;
