// src/pages/Home.tsx
import React from 'react';
import Dropdown from '../components/Dropdown';
import LearnMoreButton from '../components/LearnMoreButton';
import backgroundImage from "../styles/images/wallpapersden.com_minimal-hd-landscape_wxl.jpg";
import "../styles/Home.css";

const Home: React.FC = () => {
    return (
        <div className="home-background">
            <div className="home-container">
                {/* Left side card with text */}
                <div 
                    className="home-card home-left" 
                    style={{ backgroundImage: `url(${backgroundImage})` }}
                >
                    <div style={{ marginBottom: '15px' }}>
                        <h1>StudyApp</h1>
                        <p>|--|--|--|---|---|---|---|---|---|----|--|---|</p>
                        <p>Created By Eitan Miron</p>
                        <p>|--|--|--|---|---|---|---|---|---|----|--|---|</p>
                    </div>
                    <LearnMoreButton />
                </div>

                {/* Right side card - no changes needed */}
                <div 
                    className="home-card home-right" 
                    style={{ backgroundImage: `url(${backgroundImage})` }}
                >
                    <Dropdown />
                </div>
            </div>
        </div>
    );
};

export default Home;