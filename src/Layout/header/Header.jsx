import React from "react";
import PropTypes from 'prop-types';
import './Header.css';
import logo from '../../Components/Img/LogoLaVaca.png';

const Header = () => {
  return (
    <header className="site-header" role="banner">
      <div className="header-container">
        <div className="header-title">
          <img src={logo} alt="LaVaca Banking Logo" />
          <h1>LaVaca</h1>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);