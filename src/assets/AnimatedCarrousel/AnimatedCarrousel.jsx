import React from "react";
import "./AnimatedCarrousel.css";
import goodTeam from "./svg/good-team-animate.svg";
import savingsPiggy from "./svg/savings-animate-piggy.svg";
import savings from "./svg/savings-animate.svg";

const AnimatedCarrousel = () => {
    return (
        <div className="animated-carrousel">
            <div className="carrousel-item">
                <img src={goodTeam} alt="good team" />
                <h3>Good Team</h3>
                <p>Our team of experts is here to help you</p>
            </div>
            <div className="carrousel-item">
                <img src={savingsPiggy} alt="savings piggy" />
                <h3>Savings</h3>
                <p>Save money with our services</p>
            </div>
            <div className="carrousel-item">
                <img src={savings} alt="savings" />
                <h3>Investments</h3>
                <p>Invest your money with us</p>
            </div>
        </div>
    );
}

export default AnimatedCarrousel; 
