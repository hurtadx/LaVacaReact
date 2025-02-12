import React from "react";
import './Footer.css';
import logo from '../../App/Img/LogoLaVaca.png';

const Footer = () => {    return (
        <footer>
            <div className="footer-content">
                <div className="footer-brand">
                    <img src={logo} alt="LaVaca Logo" />
                    <p>LaVaca</p>
                    <div className="social-links">
                        <a href="#" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook"></i></a>
                        <a href="#" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
                        <a href="#" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
                    </div>
                </div>

                <div className="footer-links">
                    <div className="links-section">
                        <h4>Diseño</h4>
                        <ul>
                            <li><a href="https://www.figma.com/es-es/ui-design-tool/" target="_blank">UI Design</a></li>
                            <li><a href="https://www.figma.com/es-es/ux-design-tool/" target="_blank">UX Design</a></li>
                            <li><a href="https://www.figma.com/es-es/prototyping/" target="_blank">Prototyping</a></li>
                        </ul>
                    </div>

                    <div className="links-section">
                        <h4>Herramientas</h4>
                        <ul>
                            <li><a href="https://www.figma.com/es-es/graphic-design-tool/" target="_blank">Graphic Design</a></li>
                            <li><a href="https://www.figma.com/es-es/wireframe-tool/" target="_blank">Wireframing</a></li>
                            <li><a href="https://www.figma.com/es-es/templates/" target="_blank">Templates</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2024 LaVaca. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
}

export default Footer;