import React from "react";
import './Header.css';
import logo from '../../App/Img/LogoLaVaca.png';

const Header = () => {
    return (
        <header>
        <div className="header-container">
        <div className="title">
            <img src={logo}></img>
            <h1>LaVaca</h1>
        </div>
        </div>
        </header>
    );
};

export default Header;