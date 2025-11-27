// src/components/MainLayout.tsx

import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom'; // Import routing components
import Header from './Header'; 
import Dashboard from '../Dashboard'; 
import Schedule from '../Schedule';
import ExerciseList from '../ExerciseList';
import Reports from '../Reports'; 

interface MainLayoutProps {
 username: string;
onLogout: () => void;
}

export function MainLayout({ username, onLogout }: MainLayoutProps) {
  const location = useLocation();

 return (
   <div className="min-h-screen bg-gray-100">
      
      {/* 1. Header is rendered on all authenticated pages */}
      <Header userName={username} onLogout={onLogout} />

      {/* 2. Main content area for routing */}
      <main className="max-w-7xl mx-auto pb-6 sm:px-6 lg:px-8">
        <Routes>
          {/* Dashboard is the default page ("/") relative to the MainLayout being rendered */}
          <Route path="/" element={<Dashboard />} /> 
          
          {/* Workout Schedule/Insert */}
          <Route path="/schedule" element={<Schedule />} /> 
          
          {/* Other navigation items */}
          <Route path="/exercises" element={<ExerciseList />} />
          <Route path="/reports" element={<Reports />} />
          
          {/* Fallback route if the path doesn't match */}
          <Route path="*" element={
            <div className="p-4 bg-white rounded shadow text-center">
              페이지를 찾을 수 없습니다. (404)
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}