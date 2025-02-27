"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const Home = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen w-full">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/images/home_bg2.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Consistent navigation bar with login/register pages */}
        <nav className="absolute top-0 left-0 right-0 z-50 px-4 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 relative">
                <Image
                  src="/assets/images/logo-480.svg"
                  alt="YTFCS Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-medium text-sm sm:text-base text-white hidden sm:block">
                Your Total Foot Care Specialist
              </span>
              <span className="font-medium text-sm sm:text-base text-white sm:hidden">
                YTFCS
              </span>
            </Link>

            <div className="flex gap-2 sm:gap-3">
              <Link
                href="/patient/login"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors shadow-md"
              >
                Patient Portal
              </Link>
              <Link
                href="/caresync/login"
                className="px-4 py-2 border border-gray-600 text-white rounded-md text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Provider
              </Link>
            </div>
          </div>
        </nav>

        {/* Main content with adjusted padding for top nav */}
        <main className="flex-1 flex flex-col justify-center items-center px-4 pt-24 pb-8">
          <div className="w-full max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-white">
              Smart Health Gateway
            </h1>

            <p className="text-gray-200 text-base sm:text-lg mb-10 sm:mb-14 max-w-2xl mx-auto">
              One unified platform connecting providers, systems, and patients
            </p>

            {/* Cards in a responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
              {/* Caresync */}
              <div className="p-5 sm:p-6 rounded-lg bg-gray-800/70 backdrop-blur-sm border border-gray-700 shadow-xl group hover:border-blue-500/50 transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-blue-600/20 flex items-center justify-center">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    className="text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
                    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                    <circle cx="20" cy="10" r="2" />
                  </svg>
                </div>
                <h2 className="text-xl font-medium mb-2 text-white">
                  Caresync
                </h2>
                <p className="text-gray-300 text-sm">
                  Streamlined provider tools and patient management
                </p>
              </div>

              {/* KIOSK */}
              <div className="p-5 sm:p-6 rounded-lg bg-gray-800/70 backdrop-blur-sm border border-gray-700 shadow-xl group hover:border-purple-500/50 transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-purple-600/20 flex items-center justify-center">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    className="text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                    <path d="M12 18h.01" />
                    <path d="M10 6h4" />
                  </svg>
                </div>
                <h2 className="text-xl font-medium mb-2 text-white">KIOSK</h2>
                <p className="text-gray-300 text-sm">
                  Self-service check-in and information systems
                </p>
              </div>

              {/* Patients */}
              <div className="p-5 sm:p-6 rounded-lg bg-gray-800/70 backdrop-blur-sm border border-gray-700 shadow-xl group hover:border-emerald-500/50 transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    className="text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h2 className="text-xl font-medium mb-2 text-white">
                  Patients
                </h2>
                <p className="text-gray-300 text-sm">
                  Secure access to appointments and care information
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative w-full text-center py-5 px-4 text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Your Total Foot Care Specialist</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
