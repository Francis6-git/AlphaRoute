import React from 'react';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import ExecutionProof from '../components/landing/ExecutionProof';
import Footer from '../components/landing/Footer';

export default function LandingPage({ onLaunch }) {
  return (
    <div className="min-h-screen bg-alpha-bg overflow-y-auto">
      <Hero onLaunch={onLaunch} />
      <Features />
      <ExecutionProof onLaunch={onLaunch} />
      <Footer />
    </div>
  );
}
