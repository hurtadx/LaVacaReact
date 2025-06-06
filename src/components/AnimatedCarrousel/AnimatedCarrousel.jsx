import React, { useState, useEffect } from "react";
import "./AnimatedCarrousel.css";
import goodTeam from "../svg/good-team-animate.svg";
import savingsPiggy from "../svg/savings-animate-piggy.svg";
import savings from "../svg/savings-animate.svg";

const AnimatedCarrousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    const items = [
        {
            image: goodTeam,
  
        },
        {
            image: savingsPiggy,
           
        },
        {
            image: savings,
           
        }
    ];

    
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === items.length - 1 ? 0 : prevIndex + 1
            );
        }, 7000); 

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="animated-carrousel">
                <img src={items[currentIndex].image} alt={`Image of ${items[currentIndex].title}`} />
        </div>
    );
}

export default AnimatedCarrousel;
