import React from "react";
import './Footer.css';
import logo from '../../assets/Img/LogoLaVaca.png';

const Footer = () => {
    return (
        <footer>
            <div className="footer-content">
                <div className="footer-brand">
                    <img src={logo} alt="LaVaca Banking Logo" />
                    <p>LaVaca</p>
                </div>

                <div className="footer-links">
                    <div className="links-section">
                        <h4>Servicios</h4>
                        <ul>
                            <li><a href="/cuentas">Cuentas</a></li>
                            <li><a href="/tarjetas">Tarjetas</a></li>
                            <li><a href="/prestamos">Préstamos</a></li>
                            <li><a href="/inversiones">Inversiones</a></li>
                        </ul>
                    </div>

                    <div className="links-section">
                        <h4>Atención al Cliente</h4>
                        <ul>
                            <li><a href="/contacto">Contacto</a></li>
                            <li><a href="/sucursales">Sucursales</a></li>
                            <li><a href="/ayuda">Centro de Ayuda</a></li>
                        </ul>
                    </div>

                    <div className="links-section">
                        <h4>Legal</h4>
                        <ul>
                            <li><a href="/privacidad">Política de Privacidad</a></li>
                            <li><a href="/terminos">Términos y Condiciones</a></li>
                            <li><a href="/seguridad">Seguridad</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="security-info">
                <p><i className="fas fa-shield-alt"></i> Sitio protegido y certificado</p>
                <p><i className="fas fa-lock"></i> SSL 256-bit encryption</p>
            </div>

            <div className="footer-bottom">
                <p>&copy; 2024 LaVaca. Todos los derechos reservados.</p>
                <p>Entidad regulada por el Banco Central</p>
            </div>
        </footer>
    );
}

export default Footer;