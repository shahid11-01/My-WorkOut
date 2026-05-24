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
    <header className="bg-gradient-to-r from-white via-gray-50 to-white shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Section: Logo and Greeting */}
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg transform transition hover:scale-105">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">My WorkOut</p>
              <p className="text-xs text-gray-500">안녕하세요, <span className="font-semibold text-indigo-600">{userName}</span>님!</p>
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
                `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 hover:text-gray-900 hover:shadow-md'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}

          <button
            onClick={onLogout}
            className="ml-4 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <LogOut className="w-5 h-5" />
            <span>로그아웃</span>
          </button>
        </nav>
      </div>
    </header>
  );
}