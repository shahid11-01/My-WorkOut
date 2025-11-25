import React, { useState, useEffect, useCallback } from 'react';
import { Search, Dumbbell, RefreshCw } from 'lucide-react';

// --- API Call Hook ---
declare const __initial_auth_token: string | null;

const API_BASE_URL = '/api/exercises';

const getMockToken = () => typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : 'MOCK_TOKEN_FOR_ANONYMOUS_USER';
const initialToken = getMockToken();

/**
 * Custom hook to handle API calls using JWT token from localStorage/mock.
 */
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

// --- Custom UI Components (Tailwind CSS based) ---

const Card: React.FC<{ title?: React.ReactNode; className?: string; children: React.ReactNode }> = ({ title, className = '', children }) => (
    <div className={`bg-white shadow-md rounded-xl border border-gray-100 p-6 ${className}`}>
        {title && <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-700">{title}</h3>}
        {children}
    </div>
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
    variant?: 'default' | 'outline' | 'ghost',
    size?: 'default' | 'sm'
}> = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
    let baseStyles = "rounded-lg font-medium transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const padding = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2';
    
    if (variant === 'default') baseStyles += ` bg-blue-600 text-white hover:bg-blue-700 ${padding}`;
    else if (variant === 'outline') baseStyles += ` border border-gray-300 text-gray-700 hover:bg-gray-50 ${padding}`;
    else if (variant === 'ghost') baseStyles += " hover:bg-gray-100 p-2"; 
    
    return <button className={`${baseStyles} ${className}`} {...props}>{children}</button>;
};

const Badge: React.FC<{ children: React.ReactNode; variant?: 'outline'; className?: string }> = ({ children, className = '' }) => {
    let baseStyles = "px-2.5 py-0.5 text-xs font-semibold rounded-full border border-gray-300 bg-gray-50 text-gray-700";
    return <span className={`${baseStyles} ${className}`}>{children}</span>;
};


// --- Main Component Logic ---

interface Exercise {
    id: number;
    exerciseName: string;
    exerciseCategory: string; // Must match backend field
    exerciseDescription: string; // Must match backend field
}

function ExerciseList() { 
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    
    const { makeApiCall, isAuthenticated } = useApiCall();

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            '가슴': 'bg-blue-100 text-blue-800 border-blue-200',
            '등': 'bg-green-100 text-green-800 border-green-200',
            '하체': 'bg-purple-100 text-purple-800 border-purple-200',
            '어깨': 'bg-orange-100 text-orange-800 border-orange-200',
            '팔': 'bg-pink-100 text-pink-800 border-pink-200',
            '복근': 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
        return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
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
        <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 font-['Inter']">
            
            {/* Header and Refresh */}
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-1">운동 목록 📋</h1>
                    <p className="text-sm text-gray-500">
                        백엔드에서 제공하는 모든 운동을 확인하고 관리합니다.
                    </p>
                </div>
                <Button 
                    onClick={fetchExercises}
                    variant="outline"
                    disabled={isLoading || !isAuthenticated}
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    새로고침
                </Button>
            </div>

            {/* Filter Section */}
            <Card>
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    
                    {/* Search Input (Disabled) */}
                    <div className="flex-1 relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <input
                            type="text"
                            placeholder="검색 기능 제외됨 (Only Category Filter below)"
                            disabled
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-500 cursor-not-allowed"
                        />
                    </div>
                    
                    {/* Category Filter Dropdown */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white appearance-none cursor-pointer"
                        disabled={isLoading}
                    >
                        <option value="all">전체 카테고리</option>
                        {uniqueCategories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
            </Card>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-center">
                    <p className="text-3xl text-blue-600 font-bold mb-1">{exercises.length}</p>
                    <p className="text-sm text-gray-500">전체 운동</p>
                </Card>
                {/* Dynamically generate top categories from the fetched data */}
                {Object.entries(categoryCounts)
                    .sort(([, countA], [, countB]) => countB - countA)
                    .slice(0, 3)
                    .map(([category, count]) => (
                    <Card key={category} className="text-center">
                        <p className="text-3xl text-blue-600 font-bold mb-1">{count}</p>
                        <p className="text-sm text-gray-500">{category}</p>
                    </Card>
                ))}
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl" role="alert">
                    <p className="font-bold">데이터 로딩 오류</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Exercise List Grid */}
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
                        <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Dumbbell className="w-5 h-5 text-blue-600" />
                                        
                                        {/* FIX 1: 운동 이름 표시 */}
                                        <p className="text-lg font-bold text-gray-900">{exercise.exerciseName}</p>
                                    </div>
                                    <Badge className={getCategoryColor(exercise.exerciseCategory)}>
                                        {exercise.exerciseCategory}
                                    </Badge>
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <p className="text-sm text-gray-600 mb-3">{exercise.exerciseDescription}</p>
                                
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
export default ExerciseList;