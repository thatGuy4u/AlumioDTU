import { HiOutlineHeart } from 'react-icons/hi2';

const footerLinks = {
  Product: ['Features', 'Mentorship', 'Job Board', 'Events'],
  Community: ['Forums', 'Alumni Directory', 'Success Stories'],
  Connect: ['About DTU', 'Contact Us', 'Privacy Policy'],
};

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="nav-logo">Alumio<span>DTU</span></div>
            <p className="footer-tagline">
              Bridging generations of DTU excellence.<br />
              Connect, mentor & grow together.
            </p>
          </div>
          <div className="footer-links-grid">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div className="footer-col" key={category}>
                <h4>{category}</h4>
                {links.map((link) => (
                  <a key={link} href="#">{link}</a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="footer-divider" />
        <div className="footer-bottom">
          <p>© 2026 AlumioDTU. Built with <HiOutlineHeart style={{ verticalAlign: 'middle', color: '#f43f5e', width: 14, height: 14 }} /> by Aman.</p>
          <div className="footer-socials">
            <a href="#" aria-label="Twitter">𝕏</a>
            <a href="#" aria-label="LinkedIn">in</a>
            <a href="#" aria-label="GitHub">GH</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
