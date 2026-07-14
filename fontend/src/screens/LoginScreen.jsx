import { useState } from "react";

import SideNavigation from "../components/landing/SideNavigation";

import HeroSection from "../components/landing/HeroSection";
import StorySection from "../components/landing/StorySection";
import WhyChooseUs from "../components/landing/WhyChooseUs";
import ServicesSection from "../components/landing/ServicesSection";
import HowItWorks from "../components/landing/HowItWorks";
import HVACFeatures from "../components/landing/HVACFeatures";
import SmartDispatch from "../components/landing/SmartDispatch";

import StaffLoginModal from "../components/landing/StaffLoginModal";

import ServiceFinder from "../screens/companyServiceArea/ServiceFinder";

import "../css/LandingLayout.css";


const LoginScreen = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      {/* Page specific side navigation */}

      <SideNavigation onLogin={() => setShowLogin(true)} />

      {/* Main landing content */}

      <main className="landing-content">
        {/* Customer Search */}

        <section id="finder">
          <ServiceFinder />
        </section>

        {/* Hero Section */}

        <HeroSection />

        {/* Story Section */}

        <StorySection />

        {/* Why Choose Us */}

        <WhyChooseUs />

        {/* Services */}

        <ServicesSection />

        {/* Customer & Company Workflow */}

        <HowItWorks />

        {/* SaaS Roles */}

        <HVACFeatures />

        {/* Intelligent Dispatch */}

        <SmartDispatch />
      </main>

      {/* Staff Login Popup */}

      <StaffLoginModal show={showLogin} onHide={() => setShowLogin(false)} />
    </>
  );
};

export default LoginScreen;
