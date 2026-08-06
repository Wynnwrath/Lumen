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
      <footer className="bg-primary-container text-on-primary py-12 border-t border-slate-800 mt-auto">
        <div className="max-w-container-max mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-white">
                <Icon name="auto_awesome" className="text-sm" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">Lumen</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Illuminate your lifestyle with our curated collection of premium tech, fashion, and modern goods.
              Designed for excellence.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Company</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/products" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/products" className="hover:text-white transition">Careers</Link></li>
              <li><Link to="/products" className="hover:text-white transition">Press Release</Link></li>
              <li><Link to="/products" className="hover:text-white transition">Sustainability</Link></li>
            </ul>
          </div>

          <div>
            <h4 id="support" className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/cart" className="hover:text-white transition">Returns &amp; Refunds</Link></li>
              <li><Link to="/checkout" className="hover:text-white transition">Shipping Policy</Link></li>
              <li><Link to="/checkout" className="hover:text-white transition">Order Tracking</Link></li>
              <li><a href="mailto:support@lumen.com" className="hover:text-white transition">Contact Support</a></li>
              <li><Link to="/admin/login" className="hover:text-white transition">Store Admin</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Stay Connected</h4>
            <p className="text-xs text-slate-400 mb-2">Subscribe to receive exclusive deals and product drops.</p>
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
                className="bg-secondary hover:bg-secondary-container text-white px-3 py-2 rounded-lg text-xs font-bold transition"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-container-max mx-auto px-6 mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <p>&copy; 2026 Lumen Tech Marketplace. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Cookies Settings</a>
          </div>
        </div>
      </footer>
    </>
  );
};
