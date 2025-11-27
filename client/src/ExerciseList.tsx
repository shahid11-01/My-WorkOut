import React, { useState, useEffect, useCallback } from 'react';
import { Search, Dumbbell, RefreshCw } from 'lucide-react';

// --- API Call Hook ---
declare const __initial_auth_token: string | null;

const API_BASE_URL = '/api/exercises';

const getMockToken = () => typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : 'MOCK_TOKEN_FOR_ANONYMOUS_USER';
const initialToken = getMockToken();

const useApiCall = () => {
    const initialTokenValue = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : '';
    const token = localStorage.getItem("token") || initialTokenValue || 'MOCK_TOKEN_FOR_ANONYMOUS_USER';
    
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
    
    const makeApiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
        
        if (!token) {
            setIsAuthenticated(false);
            throw new Error("Authorization token is missing.");
        }

        const headers: Record<string, string> = {
            'Authorization': `Bearer ${token}`,
        };
        
        if (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') {
            headers['Content-Type'] = 'application/json';
        }

        const userHeaders = options.headers as Record<string, string> || {};
        
        const combinedHeaders: HeadersInit = {
            ...userHeaders,
            ...headers, 
        };
        
        for (let i = 0; i < 3; i++) {
            try {
                const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                    ...options,
                    headers: combinedHeaders,
                });

                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem("token");
                    setIsAuthenticated(false);
                    throw new Error(`Authentication failed. Status: ${response.status}`);
                }

                if (!response.ok) {
                    let errorBody = {};
                    try { errorBody = await response.json(); } catch (e) {}
                    const details = (errorBody as any).message || response.statusText || 'No message.';
                    throw new Error(`HTTP error! status: ${response.status}. Details: ${details}`);
                }

                if (response.status === 204 || response.headers.get("Content-Length") === "0") {
                    return null;
                }

                return response.json();

            } catch (err: any) { 
                if (i === 2) throw err; 
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
            }
        }
        throw new Error("Failed to make API call after multiple retries.");
    }, [token]);

    return { makeApiCall, isAuthenticated };
};

// --- Custom UI Components (NO BORDERS!) ---

const Card: React.FC<{ title?: React.ReactNode; className?: string; children: React.ReactNode }> = ({ title, className = '', children }) => (
    <div className={`bg-white shadow-md rounded-xl p-6 ${className}`}>
        {title && <h3 className="text-lg font-bold mb-4 text-gray-800">{title}</h3>}
        {children}
    </div>
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
    variant?: 'default' | 'outline' | 'ghost',
    size?: 'default' | 'sm'
}> = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
    let baseStyles = "rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const padding = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2';
    
    if (variant === 'default') baseStyles += ` bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:scale-105 ${padding}`;
    else if (variant === 'outline') baseStyles += ` bg-white text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md ${padding}`;
    else if (variant === 'ghost') baseStyles += " hover:bg-gray-100 p-2"; 
    
    return <button className={`${baseStyles} ${className}`} {...props}>{children}</button>;
};

const Badge: React.FC<{ children: React.ReactNode; variant?: 'outline'; className?: string }> = ({ children, className = '' }) => {
    return <span className={`px-3 py-1 text-xs font-bold rounded-full ${className}`}>{children}</span>;
};


// --- Main Component Logic ---

interface Exercise {
    id: number;
    exerciseName: string;
    exerciseCategory: string;
    exerciseDescription: string;
}

function ExerciseList() { 
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    
    const { makeApiCall, isAuthenticated } = useApiCall();

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            '가슴': 'bg-blue-500 text-white',
            '등': 'bg-green-500 text-white',
            '하체': 'bg-purple-500 text-white',
            '어깨': 'bg-orange-500 text-white',
            '팔': 'bg-pink-500 text-white',
            '복근': 'bg-yellow-500 text-white'
        };
        return colors[category] || 'bg-gray-500 text-white';
    };

    const fetchExercises = useCallback(async () => {
        if (!isAuthenticated) {
            setError("인증 토큰이 유효하지 않습니다. 로그인 상태를 확인해주세요.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const data = await makeApiCall('');
            setExercises((data as Exercise[] | null) || []);
        } catch (err: any) {
            console.error("Failed to fetch exercises:", err);
            setError('운동 목록을 불러오는 데 실패했습니다: ' + (err.message || String(err)));
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, makeApiCall]);

    useEffect(() => {
        fetchExercises();
    }, [fetchExercises]);
    
    const uniqueCategories = Array.from(new Set(exercises.map(e => e.exerciseCategory)))
        .filter(c => c);
    
    const filteredExercises = exercises.filter(exercise => {
        return selectedCategory === 'all' || exercise.exerciseCategory === selectedCategory;
    });
    
    const categoryCounts: Record<string, number> = exercises.reduce((acc, e) => {
        acc[e.exerciseCategory] = (acc[e.exerciseCategory] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen">
            
            {/* Header - NO BORDER */}
            <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                        <span>운동 목록</span>
                        <span className="text-2xl">📋</span>
                    </h1>
                    <p className="text-sm text-gray-500">
                        백엔드에서 제공하는 모든 운동을 확인하고 관리합니다.
                    </p>
                </div>
                <Button 
                    onClick={fetchExercises}
                    variant="outline"
                    disabled={isLoading || !isAuthenticated}
                >
                    <RefreshCw className="w-4 h-4" />
                    새로고침
                </Button>
            </div>

            {/* Filter Section - NO BORDERS */}
            <Card>
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    
                    {/* Search Input */}
                    <div className="flex-1 relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="검색 기능 제외됨 (Only Category Filter below)"
                            disabled
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 text-sm text-gray-500 cursor-not-allowed focus:outline-none"
                        />
                    </div>
                    
                    {/* Category Filter Dropdown - NO BORDER */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full sm:w-48 px-4 py-2 rounded-xl text-sm bg-gradient-to-r from-indigo-50 to-blue-50 font-semibold text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        disabled={isLoading}
                    >
                        <option value="all">전체 카테고리</option>
                        {uniqueCategories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
            </Card>

            {/* Stat Cards - NO BORDERS, Colorful Gradients */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg text-center transform transition hover:scale-105">
                    <p className="text-4xl font-bold mb-1">{exercises.length}</p>
                    <p className="text-sm text-blue-100">전체 운동</p>
                </div>
                {Object.entries(categoryCounts)
                    .sort(([, countA], [, countB]) => countB - countA)
                    .slice(0, 3)
                    .map(([category, count], idx) => {
                        const gradients = [
                            'from-purple-500 to-pink-600',
                            'from-green-500 to-emerald-600',
                            'from-orange-500 to-red-600'
                        ];
                        return (
                            <div key={category} className={`bg-gradient-to-br ${gradients[idx]} text-white p-6 rounded-xl shadow-lg text-center transform transition hover:scale-105`}>
                                <p className="text-4xl font-bold mb-1">{count}</p>
                                <p className="text-sm opacity-90">{category}</p>
                            </div>
                        );
                    })}
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-gradient-to-r from-red-50 to-red-100 text-red-700 px-6 py-4 rounded-xl shadow-md" role="alert">
                    <p className="font-bold">데이터 로딩 오류</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Exercise List Grid - NO BORDERS */}
            {isLoading ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-md">
                    <svg className="animate-spin mx-auto h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-gray-600">운동 목록을 불러오는 중...</p>
                </div>
            ) : filteredExercises.length === 0 ? (
                <Card>
                    <div className="flex flex-col items-center justify-center py-16">
                        <Dumbbell className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-center">
                            {selectedCategory !== 'all' ? '해당 카테고리의 운동이 없습니다.' : '등록된 운동이 없습니다.'}
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredExercises.map((exercise) => (
                        <div key={exercise.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                            <Dumbbell className="w-5 h-5 text-white" />
                                        </div>
                                        <p className="text-lg font-bold text-gray-900">{exercise.exerciseName}</p>
                                    </div>
                                    <Badge className={getCategoryColor(exercise.exerciseCategory)}>
                                        {exercise.exerciseCategory}
                                    </Badge>
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <p className="text-sm text-gray-600 leading-relaxed">{exercise.exerciseDescription}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
export default ExerciseList;