"use client";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-brand-mark">L</span>
          <span className="footer-brand-text">Lighthouse</span>
        </div>
        <div className="footer-copy">
          Data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>
        </div>
        <div className="footer-links">
          <a href="https://github.com/Aviox8/lighthouse" target="_blank" rel="noopener noreferrer">Source code</a>
          <a href="https://github.com/Aviox8/lighthouse/issues" target="_blank" rel="noopener noreferrer">Issues</a>
        </div>
      </div>
    </footer>
  );
}
