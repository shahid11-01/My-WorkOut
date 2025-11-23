// src/App.tsx

import { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom'; // Import Router
import { LoginForm } from './components/LoginForm';
import { SignupForm } from './components/SignUpForm';
import { MainLayout } from './components/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/Tabs';
import { Dumbbell } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  const handleLogin = (user: string) => {
    setUsername(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    // Clear token, then log out
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUsername('');
    setActiveTab('login');
  };

  // Wrap the entire application logic in <Router>
  return (
    <Router>
      {isLoggedIn ? (
        <MainLayout username={username} onLogout={handleLogout} />
      ) : (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 p-4">
          {/* Background image overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')`
            }}
          />
          
          <div className="relative z-10 w-full max-w-md">
            {/* Logo 및 타이틀 */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mb-4 shadow-lg">
                <Dumbbell className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-white text-4xl font-bold mb-2">My WorkOut</h1>
              <p className="text-blue-200 text-lg">당신의 운동을 기록하고 관리하세요</p>
            </div>

            {/* 로그인/회원가입 탭 */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">로그인</TabsTrigger>
                <TabsTrigger value="signup">회원가입</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <LoginForm 
                  onSwitchToSignup={() => setActiveTab('signup')} 
                  onLogin={handleLogin} 
                />
              </TabsContent>

              <TabsContent value="signup">
                <SignupForm 
                  onSwitchToLogin={() => setActiveTab('login')} 
                  onSignupSuccess={() => setActiveTab('login')}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </Router>
  );
}