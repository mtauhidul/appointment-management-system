"use client";

import FeatureCard from "@/components/cards/featureCard";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const Home = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(0);

  useEffect(() => {
    // Mark hydration complete
    setIsHydrated(true);

    // Set initial window width and update on resize
    const handleResize = () => setWindowWidth(window.innerWidth);
    setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Use a default placeholder value until hydration completes
  const headerText =
    isHydrated && windowWidth > 640
      ? "Your Total Foot Care Specialist"
      : "YTFCS";

  return (
    <div className="relative h-screen bg-gradient-to-r from-blue-500 to-green-500">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat sm:bg-cover"
        style={{ backgroundImage: "url('/assets/images/home_bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-[#EAF4F7] opacity-40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <header className="flex justify-between items-center p-4 sm:p-6">
          <div className="flex items-center">
            <Image
              src="/assets/images/logo-480.svg"
              alt="logo"
              width={32}
              height={32}
              className="inline-block"
            />
            <h1 className="text-[#383536] text-lg sm:text-xl font-bold ml-1">
              {headerText}
            </h1>
          </div>
          <Link href="/login" passHref>
            <Button
              variant="default"
              size="lg"
              className="text-[#EAF4F7] font-bold bg-[#7B9099] hover:text-[#7B9099] hover:bg-[#EAF4F7] text-sm sm:text-base px-4 py-2"
            >
              Login
            </Button>
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex flex-col justify-center items-center h-full px-4">
          <motion.h1
            className="text-white text-4xl sm:text-6xl font-bold text-center mb-4 px-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Patient Portal
          </motion.h1>
          <motion.div
            className="bg-[#7B9099] bg-opacity-80 px-6 py-8 sm:px-12 sm:py-16 mt-4 flex flex-wrap justify-center items-center gap-6 sm:gap-8 rounded-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          >
            <FeatureCard
              src="/assets/images/patient_profile.svg"
              alt="patient profile"
              label="Patient Profile"
            />
            <FeatureCard
              src="/assets/images/dr_appointments.svg"
              alt="appointments"
              label="Appointments"
            />
            <FeatureCard
              src="/assets/images/medical_records.svg"
              alt="medical records"
              label="Medical Records"
            />
            <FeatureCard
              src="/assets/images/medications.svg"
              alt="treatments"
              label="Treatments"
            />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Home;
