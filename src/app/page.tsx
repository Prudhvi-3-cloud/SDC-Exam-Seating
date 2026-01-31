"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/app/components/header';
import { Footer } from '@/app/components/footer';
import { HomePage } from '@/app/components/home-page';
import { AboutPage } from '@/app/components/about-page';
import { DepartmentsPage } from '@/app/components/departments-page';
import { AdmissionsPage } from '@/app/components/admissions-page';
import { AcademicsPage } from '@/app/components/academics-page';
import { PlacementsPage } from '@/app/components/placements-page';
import { CampusLifePage } from '@/app/components/campus-life-page';
import { LoginPage } from '@/app/components/login-page';

export default function App() {
  const [currentPage, setCurrentPage] = useState<
    'home' | 'about' | 'departments' | 'admissions' | 'academics' | 'placements' | 'campus' | 'login'
  >('home');

  // Simple navigation handler
  const handleNavigate = (page: typeof currentPage) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Override default link behavior for navigation
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.href) {
        const href = anchor.getAttribute('href');
        if (href?.startsWith('#')) {
          e.preventDefault();
          const page = href.slice(1) as typeof currentPage;
          if (['home', 'about', 'departments', 'admissions', 'academics', 'placements', 'campus', 'login'].includes(page)) {
            handleNavigate(page);
          }
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Render login page separately (no header/footer)
  if (currentPage === 'login') {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'departments' && <DepartmentsPage />}
        {currentPage === 'admissions' && <AdmissionsPage />}
        {currentPage === 'academics' && <AcademicsPage />}
        {currentPage === 'placements' && <PlacementsPage />}
        {currentPage === 'campus' && <CampusLifePage />}
      </main>
      <Footer />
    </div>
  );
}
