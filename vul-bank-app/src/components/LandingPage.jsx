import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const LandingPage = () => {
  const [landingData, setLandingData] = useState(null);

  useEffect(() => {
    fetchLandingData();
  }, []);

  const fetchLandingData = async () => {
    try {
      const response = await axios.get("/api/landing");
      setLandingData(response.data);
    } catch (error) {
      console.error("Failed to fetch landing data:", error);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <h1 className="text-2xl font-bold text-white">InsecureBank</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition duration-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section-container relative">
        {/* Background Image Carousel */}
        <div className="hero-image-carousel">
          <div className="carousel-track">
            <div className="carousel-image">
              <img
                src="/src/assets/hero-images/hero-1.png"
                alt="Banking Service 1"
              />
            </div>
            <div className="carousel-image">
              <img
                src="/src/assets/hero-images/hero-2.png"
                alt="Banking Service 2"
              />
            </div>
            <div className="carousel-image">
              <img
                src="/src/assets/hero-images/hero-3.png"
                alt="Banking Service 3"
              />
            </div>
            {/* Duplicate for seamless loop */}
            <div className="carousel-image">
              <img
                src="/src/assets/hero-images/hero-1.png"
                alt="Banking Service 1"
              />
            </div>
          </div>
        </div>

        {/* Hero Content - on top of images */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 hero-title">
            Your Trusted Financial Partner
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto hero-subtitle">
            Experience secure and reliable banking services with InsecureBank.
            Manage your finances with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105"
            >
              Get Started Today
            </Link>
            <Link
              to="/login"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 font-bold py-4 px-8 rounded-lg text-lg transition duration-300"
            >
              Login to Your Account
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white/5 backdrop-blur-sm py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose InsecureBank?
            </h2>
            <p className="text-xl text-blue-100">
              Modern banking solutions for your financial needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {landingData?.features?.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20"
              >
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature}
                </h3>
                <p className="text-blue-100">
                  {index === 0 &&
                    "Industry-leading security to protect your assets."}
                  {index === 1 &&
                    "24/7 customer support for all your banking needs."}
                  {index === 2 &&
                    "Access your account from any device, anywhere."}
                  {index === 3 && "Fast and secure transactions worldwide."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                1M+
              </div>
              <div className="text-xl text-blue-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                $50B+
              </div>
              <div className="text-xl text-blue-100">
                Assets Under Management
              </div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                99.9%
              </div>
              <div className="text-xl text-blue-100">Uptime Guarantee</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 border-t border-white/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-blue-100">
            <p>&copy; 2025 InsecureBank. All rights reserved.</p>
            <p className="mt-2 text-sm">
              Trusted financial services since 2010
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
