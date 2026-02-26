import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Particles from "../components/Particles";
import { LampContainer } from "../components/ui/Lamp";
import {
  CardSpotlight,
  HoverBorderGradient,
} from "../components/ui/CardEffects";
import { BackgroundGradient } from "../components/ui/BackgroundGradient";
import { TextGenerateEffect } from "../components/ui/TextEffects";
import "./Landing.css";

const Landing = () => {
  return (
    <div className="landing-page bg-slate-950 page-top-padding">
      <Particles />
      <Navbar />

      {/* Hero Section with Lamp Effect */}
      <LampContainer>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="text-center pt-2 md:pt-3 lg:pt-4"
        >
          <h1 className="mt-4 bg-gradient-to-br from-slate-300 to-slate-500 py-2 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
            NeuroFleetX
          </h1>
          <TextGenerateEffect
            words="AI-Driven Urban Mobility Optimization"
            className="text-2xl md:text-4xl text-center mt-4 mb-8"
          />
          <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto mb-12">
            An AI-powered system designed to reduce traffic congestion and
            optimize vehicle routing and fleet operations in cities using
            real-time data and machine learning.
          </p>

          {/* Portal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
            <CardSpotlight className="h-auto">
              <div className="text-center space-y-4 p-6">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <i className="fas fa-truck text-white text-3xl"></i>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Fleet Manager Portal
                </h3>
                <p className="text-slate-400">
                  Monitor fleet operations, optimize routes, and manage drivers
                  with AI-powered insights
                </p>
                <div className="flex gap-4 justify-center pt-4">
                  <Link to="/fleet-login">
                    <HoverBorderGradient
                      as="div"
                      className="bg-slate-900 text-white"
                    >
                      <i className="fas fa-sign-in-alt"></i>
                      <span>Login</span>
                    </HoverBorderGradient>
                  </Link>
                  <Link to="/fleet-signup">
                    <HoverBorderGradient
                      as="div"
                      className="bg-slate-900 text-white"
                    >
                      <i className="fas fa-user-plus"></i>
                      <span>Sign Up</span>
                    </HoverBorderGradient>
                  </Link>
                </div>
              </div>
            </CardSpotlight>

            <CardSpotlight className="h-auto">
              <div className="text-center space-y-4 p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center shadow-lg">
                    {/* inline steering wheel SVG (no external font dependency) */}
                    <svg
                      width="36"
                      height="36"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="white"
                        strokeWidth="1.6"
                        fill="none"
                      />
                      <circle cx="12" cy="12" r="2" fill="white" />
                      <path
                        d="M12 4v3"
                        stroke="white"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M12 17v3"
                        stroke="white"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M4.5 12h3"
                        stroke="white"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M16.5 12h3"
                        stroke="white"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M7.5 7.5l2 2"
                        stroke="white"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16.5 16.5l-2-2"
                        stroke="white"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white">Driver Portal</h3>
                <p className="text-slate-400">
                  Access optimized routes and track your performance with
                  real-time analytics
                </p>
                <div className="flex gap-4 justify-center pt-4">
                  <Link to="/driver-login">
                    <HoverBorderGradient
                      as="div"
                      className="bg-slate-900 text-white"
                    >
                      <i className="fas fa-sign-in-alt"></i>
                      <span>Login</span>
                    </HoverBorderGradient>
                  </Link>
                  <Link to="/driver-signup">
                    <HoverBorderGradient
                      as="div"
                      className="bg-slate-900 text-white"
                    >
                      <i className="fas fa-user-plus"></i>
                      <span>Sign Up</span>
                    </HoverBorderGradient>
                  </Link>
                </div>
              </div>
            </CardSpotlight>

            {/* Customer Portal Card */}
            <CardSpotlight className="bg-slate-900/50 backdrop-blur-sm hover-lift">
              <div className="p-8 text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="9"
                        cy="7"
                        r="4"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M23 21v-2a4 4 0 0 0-3-3.87"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16 3.13a4 4 0 0 1 0 7.75"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Customer Portal
                </h3>
                <p className="text-slate-400">
                  Book vehicles easily and manage your reservations
                </p>
                <div className="flex gap-4 justify-center pt-4">
                  <Link to="/customer-login">
                    <HoverBorderGradient
                      as="div"
                      className="bg-slate-900 text-white"
                    >
                      <i className="fas fa-sign-in-alt"></i>
                      <span>Login</span>
                    </HoverBorderGradient>
                  </Link>
                  <Link to="/customer-signup">
                    <HoverBorderGradient
                      as="div"
                      className="bg-slate-900 text-white"
                    >
                      <i className="fas fa-user-plus"></i>
                      <span>Sign Up</span>
                    </HoverBorderGradient>
                  </Link>
                </div>
              </div>
            </CardSpotlight>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative bg-slate-900 rounded-lg p-6">
                  <i className="fas fa-truck text-4xl text-purple-500 mb-2"></i>
                  <h3 className="text-4xl font-bold text-white">500+</h3>
                  <p className="text-slate-400">Vehicles Managed</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center"
            >
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative bg-slate-900 rounded-lg p-6">
                  <i className="fas fa-route text-4xl text-blue-500 mb-2"></i>
                  <h3 className="text-4xl font-bold text-white">1000+</h3>
                  <p className="text-slate-400">Routes Optimized</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-center"
            >
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative bg-slate-900 rounded-lg p-6">
                  <i className="fas fa-clock text-4xl text-green-500 mb-2"></i>
                  <h3 className="text-4xl font-bold text-white">30%</h3>
                  <p className="text-slate-400">Congestion Reduced</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </LampContainer>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent"
          >
            AI-Powered Features
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <BackgroundGradient className="rounded-3xl p-1">
              <div className="bg-slate-900 rounded-3xl p-8 h-full">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-4">
                  <i className="fas fa-brain text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  AI Route Optimization
                </h3>
                <p className="text-slate-400">
                  Machine learning algorithms optimize vehicle routing in
                  real-time to minimize congestion and fuel consumption
                </p>
              </div>
            </BackgroundGradient>

            <BackgroundGradient className="rounded-3xl p-1">
              <div className="bg-slate-900 rounded-3xl p-8 h-full">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mb-4">
                  <i className="fas fa-chart-line text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Predictive Analytics
                </h3>
                <p className="text-slate-400">
                  Forecast traffic patterns and optimize fleet operations using
                  historical data and real-time sensors
                </p>
              </div>
            </BackgroundGradient>

            <BackgroundGradient className="rounded-3xl p-1">
              <div className="bg-slate-900 rounded-3xl p-8 h-full">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center mb-4">
                  <i className="fas fa-mobile-alt text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Real-time Monitoring
                </h3>
                <p className="text-slate-400">
                  Track vehicle locations, performance metrics, and route
                  efficiency from any device
                </p>
              </div>
            </BackgroundGradient>

            <BackgroundGradient className="rounded-3xl p-1">
              <div className="bg-slate-900 rounded-3xl p-8 h-full">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center mb-4">
                  <i className="fas fa-bell text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Smart Alerts
                </h3>
                <p className="text-slate-400">
                  Get notifications for route deviations, maintenance needs, and
                  traffic incidents
                </p>
              </div>
            </BackgroundGradient>

            <BackgroundGradient className="rounded-3xl p-1">
              <div className="bg-slate-900 rounded-3xl p-8 h-full">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center mb-4">
                  <i className="fas fa-file-export text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Performance Reports
                </h3>
                <p className="text-slate-400">
                  Generate comprehensive reports on fleet efficiency, cost
                  savings, and environmental impact
                </p>
              </div>
            </BackgroundGradient>

            <BackgroundGradient className="rounded-3xl p-1">
              <div className="bg-slate-900 rounded-3xl p-8 h-full">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center mb-4">
                  <i className="fas fa-shield-alt text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Data Security
                </h3>
                <p className="text-slate-400">
                  Enterprise-grade security with encrypted data transmission and
                  secure cloud storage
                </p>
              </div>
            </BackgroundGradient>

            <BackgroundGradient className="rounded-3xl p-1">
              <div className="bg-slate-900 rounded-3xl p-8 h-full">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mb-4">
                  <i className="fas fa-gas-pump text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Fuel Optimization
                </h3>
                <p className="text-slate-400">
                  AI-driven fuel consumption analysis and optimization
                  recommendations to reduce operational costs
                </p>
              </div>
            </BackgroundGradient>

            <BackgroundGradient className="rounded-3xl p-1">
              <div className="bg-slate-900 rounded-3xl p-8 h-full">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center mb-4">
                  <i className="fas fa-tools text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Predictive Maintenance
                </h3>
                <p className="text-slate-400">
                  Machine learning models predict vehicle maintenance needs
                  before breakdowns occur, minimizing downtime
                </p>
              </div>
            </BackgroundGradient>

            <BackgroundGradient className="rounded-3xl p-1">
              <div className="bg-slate-900 rounded-3xl p-8 h-full">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center mb-4">
                  <i className="fas fa-users text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Driver Performance
                </h3>
                <p className="text-slate-400">
                  Comprehensive driver analytics including safety scores,
                  efficiency metrics, and personalized training recommendations
                </p>
              </div>
            </BackgroundGradient>

            <BackgroundGradient className="rounded-3xl p-1">
              <div className="bg-slate-900 rounded-3xl p-8 h-full">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-600 to-pink-600 flex items-center justify-center mb-4">
                  <i className="fas fa-globe text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Multi-City Support
                </h3>
                <p className="text-slate-400">
                  Scalable platform supporting multiple cities with
                  region-specific traffic patterns and regulations
                </p>
              </div>
            </BackgroundGradient>

            <BackgroundGradient className="rounded-3xl p-1">
              <div className="bg-slate-900 rounded-3xl p-8 h-full">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center mb-4">
                  <i className="fas fa-cloud text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Cloud Integration
                </h3>
                <p className="text-slate-400">
                  Seamless integration with major cloud platforms for scalable
                  data processing and storage solutions
                </p>
              </div>
            </BackgroundGradient>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              About NeuroFleetX
            </h2>
            <p className="text-slate-400 text-lg md:text-xl max-w-4xl mx-auto">
              Revolutionizing urban mobility through cutting-edge AI technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-3xl font-bold text-white mb-6">
                Transforming Cities with AI
              </h3>
              <div className="space-y-4 text-slate-300">
                <p>
                  NeuroFleetX harnesses the power of artificial intelligence to
                  create smarter, more efficient urban transportation systems.
                  Our platform combines real-time data analytics, machine
                  learning algorithms, and predictive modeling to optimize fleet
                  operations and reduce traffic congestion.
                </p>
                <p>
                  By integrating IoT sensors, GPS tracking, and advanced AI
                  models, we provide fleet managers and drivers with actionable
                  insights that improve efficiency, reduce costs, and minimize
                  environmental impact.
                </p>
                <p>
                  Join the future of urban mobility and experience how AI can
                  transform transportation in your city.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 gap-6"
            >
              <BackgroundGradient className="rounded-2xl p-1">
                <div className="bg-slate-800 rounded-2xl p-6 text-center">
                  <i className="fas fa-city text-3xl text-purple-500 mb-3"></i>
                  <h4 className="text-xl font-bold text-white mb-2">
                    Smart Cities
                  </h4>
                  <p className="text-slate-400 text-sm">
                    Building intelligent urban infrastructure
                  </p>
                </div>
              </BackgroundGradient>

              <BackgroundGradient className="rounded-2xl p-1">
                <div className="bg-slate-800 rounded-2xl p-6 text-center">
                  <i className="fas fa-robot text-3xl text-blue-500 mb-3"></i>
                  <h4 className="text-xl font-bold text-white mb-2">
                    AI-Powered
                  </h4>
                  <p className="text-slate-400 text-sm">
                    Advanced machine learning algorithms
                  </p>
                </div>
              </BackgroundGradient>

              <BackgroundGradient className="rounded-2xl p-1">
                <div className="bg-slate-800 rounded-2xl p-6 text-center">
                  <i className="fas fa-leaf text-3xl text-green-500 mb-3"></i>
                  <h4 className="text-xl font-bold text-white mb-2">
                    Eco-Friendly
                  </h4>
                  <p className="text-slate-400 text-sm">
                    Reducing emissions and fuel consumption
                  </p>
                </div>
              </BackgroundGradient>

              <BackgroundGradient className="rounded-2xl p-1">
                <div className="bg-slate-800 rounded-2xl p-6 text-center">
                  <i className="fas fa-chart-bar text-3xl text-pink-500 mb-3"></i>
                  <h4 className="text-xl font-bold text-white mb-2">
                    Data-Driven
                  </h4>
                  <p className="text-slate-400 text-sm">
                    Real-time analytics and insights
                  </p>
                </div>
              </BackgroundGradient>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                <i className="fas fa-truck text-purple-500"></i>
                NeuroFleetX
              </h3>
              <p className="text-slate-400">
                AI-powered urban mobility optimization for smarter cities
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">
                Quick Links
              </h4>
              <div className="flex flex-col gap-2">
                <a
                  href="#about"
                  className="text-slate-400 hover:text-purple-400 transition"
                >
                  About
                </a>
                <a
                  href="#features"
                  className="text-slate-400 hover:text-purple-400 transition"
                >
                  Features
                </a>
                <a
                  href="#privacy"
                  className="text-slate-400 hover:text-purple-400 transition"
                >
                  Privacy Policy
                </a>
                <a
                  href="#terms"
                  className="text-slate-400 hover:text-purple-400 transition"
                >
                  Terms of Service
                </a>
                <a
                  href="#support"
                  className="text-slate-400 hover:text-purple-400 transition"
                >
                  Support
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center">
            <p className="text-slate-400">
              &copy; 2025 NeuroFleetX. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
