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
            title: "Good Team",
            description: "Our team of experts is here to help you"
        },
        {
            image: savingsPiggy,
            title: "Savings",
            description: "Save money with our services"
        },
        {
            image: savings,
            title: "Investments",
            description: "Invest your money with us"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === items.length - 1 ? 0 : prevIndex + 1
            );
        }, 10000000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="animated-carrousel">
            <div className="carrousel-item">
                <img src={items[currentIndex].image} alt={items[currentIndex].title} />
                <h3>{items[currentIndex].title}</h3>
                <p>{items[currentIndex].description}</p>
            </div>
        </div>
    );
}

export default AnimatedCarrousel;
