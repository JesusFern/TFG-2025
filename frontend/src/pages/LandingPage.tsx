// src/pages/LandingPage.tsx
import React from 'react';
import { LandingLayout } from '../components/templates/LandingLayout';
import { Navbar } from '../components/organisms/Navbar';
import { Hero } from '../components/organisms/Hero';
import { Features } from '../components/organisms/Features';
import { FAQ } from '../components/organisms/FAQ';
import { Footer } from '../components/organisms/Footer';

const LandingPage: React.FC = () => {
  return (
    <LandingLayout>
      <Navbar />
      <Hero />
      <Features />
      <FAQ />
      <Footer />
    </LandingLayout>
  );
};

export default LandingPage;