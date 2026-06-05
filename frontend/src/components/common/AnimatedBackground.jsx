import React from 'react';

const AnimatedBackground = () => {
    return (
        <>
            
            <div className="bg-orbs-container">
                <div className="bg-orb bg-orb-1"></div>
                <div className="bg-orb bg-orb-2"></div>
                <div className="bg-orb bg-orb-3"></div>
                <div className="bg-orb bg-orb-4"></div>
            </div>

            
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                
                <div className="floating-shape circle-1"></div>
                <div className="floating-shape circle-2"></div>
                <div className="floating-shape circle-3"></div>

                
                <div className="floating-square square-1"></div>
                <div className="floating-square square-2"></div>

                
                <div className="grid-pattern"></div>

                
                <div className="gradient-mesh"></div>

                
                <div className="scan-line"></div>
            </div>
        </>
    );
};

export default AnimatedBackground;
