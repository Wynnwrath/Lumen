import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../common/Icon";
import { useToast } from "../../components/common/ToastProvider";

export const PublicFooter = () => {
  const { showToast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    showToast("Thank you for subscribing to Lumen updates!", "success");
    setNewsletterEmail("");
  };

  return (
    <>
      {/* Footer */}
      <footer className="bg-primary-container text-on-primary py-8 sm:py-12 border-t border-slate-800 mt-auto">
        <div className="hidden md:grid max-w-container-max mx-auto px-4 sm:px-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-white">
                <Icon name="auto_awesome" className="text-sm" />
              </div>
              <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Lumen</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Illuminate your lifestyle with our curated collection of premium tech, fashion, and modern goods.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 sm:mb-3">Company</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs text-slate-400">
              <li><Link to="/products" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/products" className="hover:text-white transition">Careers</Link></li>
              <li><Link to="/products" className="hover:text-white transition">Press Release</Link></li>
            </ul>
          </div>

          <div>
            <h4 id="support" className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 sm:mb-3">
              Customer Support
            </h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs text-slate-400">
              <li><Link to="/cart" className="hover:text-white transition">Returns &amp; Refunds</Link></li>
              <li><Link to="/checkout" className="hover:text-white transition">Shipping Policy</Link></li>
              <li><a href="mailto:support@lumen.com" className="hover:text-white transition">Contact Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 sm:mb-3">Stay Connected</h4>
            <div className="flex items-center gap-2.5 mb-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-secondary hover:bg-secondary/10 flex items-center justify-center transition"
              >
                <Icon name="facebook" className="text-base" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-secondary hover:bg-secondary/10 flex items-center justify-center transition"
              >
                <Icon name="instagram" className="text-base" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="w-9 h-9 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-secondary hover:bg-secondary/10 flex items-center justify-center transition"
              >
                <Icon name="x_twitter" className="text-base" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-secondary hover:bg-secondary/10 flex items-center justify-center transition"
              >
                <Icon name="youtube" className="text-base" />
              </a>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-3 py-2 text-white w-full outline-none focus:border-secondary"
              />
              <button
                type="submit"
                className="bg-secondary hover:bg-secondary-container text-white px-3 py-2 rounded-lg text-xs font-bold transition shrink-0"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-container-max mx-auto px-4 sm:px-6 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-3 text-center sm:text-left">
          <p>&copy; 2026 Lumen Tech Marketplace. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
          </div>
        </div>
      </footer>
    </>
  );
};
