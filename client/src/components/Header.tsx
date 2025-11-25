import React from 'react';
import { NavLink } from 'react-router-dom';
import { Dumbbell, List, Calendar, FileText, LogOut, LayoutDashboard } from 'lucide-react';

const navItems = [
  { name: "대시보드", icon: LayoutDashboard, path: "/" },
  { name: "운동 목록", icon: List, path: "/exercises" },
  { name: "운동 일정", icon: Calendar, path: "/schedule" },
  { name: "보고서", icon: FileText, path: "/reports" },
];

interface HeaderProps {
  userName: string;
  onLogout: () => void;
}

export default function Header({ userName, onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Section: Logo and Greeting */}
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900">My WorkOut</p>
              <p className="text-xs text-gray-500 mt-[-2px]">안녕하세요, {userName}님!</p>
            </div>
          </div>
        </div>

        {/* Right Section: Navigation and Logout */}
        <nav className="flex items-center space-x-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="ml-4 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>로그아웃</span>
          </button>
        </nav>
      </div>
    </header>
  );
}