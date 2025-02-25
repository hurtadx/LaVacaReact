import React from "react";
import PropTypes from 'prop-types';
import './Footer.css';
import logo from '../../Components/Img/LogoLaVaca.png';

// Constants
const SERVICES_LINKS = [
  { href: "/cuentas", text: "Cuentas" },
  { href: "/tarjetas", text: "Tarjetas" },
  { href: "/prestamos", text: "Préstamos" },
  { href: "/inversiones", text: "Inversiones" }
];

const CUSTOMER_SERVICE_LINKS = [
  { href: "/contacto", text: "Contacto" },
  { href: "/sucursales", text: "Sucursales" },
  { href: "/ayuda", text: "Centro de Ayuda" }
];

const LEGAL_LINKS = [
  { href: "/privacidad", text: "Política de Privacidad" },
  { href: "/terminos", text: "Términos y Condiciones" },
  { href: "/seguridad", text: "Seguridad" }
];

const FooterSection = ({ title, links }) => (
  <div className="links-section">
    <h4>{title}</h4>
    <ul>
      {links.map(({ href, text }) => (
        <li key={href}>
          <a href={href}>{text}</a>
        </li>
      ))}
    </ul>
  </div>
);

FooterSection.propTypes = {
  title: PropTypes.string.isRequired,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      href: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired
    })
  ).isRequired
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div className="footer-content">
        <div className="footer-brand">
          <img src={logo} alt="LaVaca Banking Logo" />
          <p>LaVaca</p>
        </div>

        <div className="footer-links">
          <FooterSection title="Servicios" links={SERVICES_LINKS} />
          <FooterSection title="Atención al Cliente" links={CUSTOMER_SERVICE_LINKS} />
          <FooterSection title="Legal" links={LEGAL_LINKS} />
        </div>
      </div>

      <div className="security-info" role="contentinfo">
        <p><i className="fas fa-shield-alt" aria-hidden="true"></i> Sitio protegido y certificado</p>
        <p><i className="fas fa-lock" aria-hidden="true"></i> SSL 256-bit encryption</p>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} LaVaca. Todos los derechos reservados.</p>
        <p>Entidad regulada por el Banco Central</p>
      </div>
    </footer>
  );
};

export default React.memo(Footer);