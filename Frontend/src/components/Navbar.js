import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";
import "./Navbar.css";

const Navbar = ({ showLinks = true, dashboardLinks = null }) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("overview");

  // Check if we're on a dashboard page
  const isDashboard = location.pathname.includes("dashboard");

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="nav-overlay fixed top-0 left-0 right-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center group-hover:scale-110 transition">
              <i className="fas fa-truck text-white text-lg"></i>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              NeuroFleetX
            </span>
          </Link>

          {/* Dashboard Navigation Links */}
          {isDashboard && dashboardLinks && (
            <div className="flex items-center gap-2 overflow-x-auto">
              {dashboardLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveSection(link.id);
                    if (link.onClick) link.onClick();
                    // Smooth scroll to section
                    const element = document.getElementById(link.id);
                    if (element) {
                      const offset = 100; // Account for navbar height
                      const elementPosition =
                        element.getBoundingClientRect().top;
                      const offsetPosition =
                        elementPosition + window.pageYOffset - offset;
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                      });
                    }
                  }}
                  className={`px-3 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    activeSection === link.id
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <i className={`${link.icon} mr-1 text-sm`}></i>
                  <span className="text-sm">{link.label}</span>
                </button>
              ))}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition flex-shrink-0"
              >
                <i
                  className={`fas fa-${theme === "dark" ? "sun" : "moon"}`}
                ></i>
              </button>
            </div>
          )}

          {/* Landing Page Navigation Links */}
          {showLinks && !isDashboard && (
            <div className="flex items-center gap-6">
              <a
                href="#features"
                className="text-slate-300 hover:text-white transition relative group"
              >
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a
                href="#about"
                className="text-slate-300 hover:text-white transition relative group"
              >
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300"></span>
              </a>
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition"
              >
                <i
                  className={`fas fa-${theme === "dark" ? "sun" : "moon"}`}
                ></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
