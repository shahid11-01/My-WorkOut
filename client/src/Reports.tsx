import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Target, FileText, CheckCircle2, Calendar, Download } from 'lucide-react';

// --- Global Environment Variables (For Mock Token) ---
declare const __initial_auth_token: string | null;

// Mock API URL 
const API_BASE_URL = '/api/report';

// --- Type Definitions ---

interface Report {
    reportId: number;
    reportType: string;
    periodDisplay: string;
    completionRate: number;
    totalWorkouts: number;
    completedWorkouts: number;
    uncompletedWorkouts: number; 
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'destructive';
    size?: 'default' | 'sm';
}

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'info' | 'outline';
    className?: string;
}

// --- Custom UI Components ---

const Card: React.FC<{ title: React.ReactNode; className?: string; children: React.ReactNode }> = ({ title, className = '', children }) => (
    <div className={`bg-white shadow-lg rounded-xl border border-gray-100 p-6 ${className}`}>
        {title && <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-700">{title}</h3>}
        {children}
    </div>
);

const Button: React.FC<ButtonProps> = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
    let baseStyles = "rounded-lg font-medium transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const padding = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2';
    
    if (variant === 'default') baseStyles += ` bg-blue-600 text-white hover:bg-blue-700 ${padding}`;
    else if (variant === 'outline') baseStyles += ` border border-gray-300 text-gray-700 hover:bg-gray-50 ${padding}`;
    else if (variant === 'ghost') baseStyles += " hover:bg-gray-100 p-2"; 
    else if (variant === 'destructive') baseStyles += ` bg-red-600 text-white hover:bg-red-700 ${padding}`;
    
    return <button className={`${baseStyles} ${className}`} {...props}>{children}</button>;
};

const Badge: React.FC<BadgeProps> = ({ children, variant = 'outline', className = '' }) => {
    let baseStyles = "px-2.5 py-0.5 text-xs font-semibold rounded-full";
    if (variant === 'success') baseStyles += " bg-green-100 text-green-800";
    else if (variant === 'warning') baseStyles += " bg-yellow-100 text-yellow-800";
    else if (variant === 'info') baseStyles += " bg-blue-100 text-blue-800";
    else if (variant === 'outline') baseStyles += " border border-gray-300 text-gray-700";
    
    return <span className={`${baseStyles} ${className}`}>{children}</span>;
};

const SummaryCard: React.FC<{ icon: React.ReactNode; title: string; rate: string; completed: number; total: number; bgClass: string }> = ({ icon, title, rate, completed, total, bgClass }) => {
    const value = parseFloat(rate);
    const progressValue = isNaN(value) ? 0 : value;

    return (
        <div className={`shadow-lg rounded-xl p-5 text-white border-0 ${bgClass}`}>
            <div className="flex items-center gap-2 text-white text-base font-semibold pb-3">
                {icon}
                {title}
            </div>
            <div>
                <p className="text-4xl mb-2">{rate}%</p>
                <p className="text-sm opacity-90">
                    운동 {completed}/{total} 완료
                </p>
                <div className="w-full h-2 bg-white/30 rounded-full mt-2">
                    <div 
                        style={{ width: `${progressValue}%` }} 
                        className={`h-2 rounded-full bg-white transition-all duration-500`}
                    />
                </div>
            </div>
        </div>
    );
};

const ReportItem: React.FC<{ report: Report, notify: (message: string, type?: 'success' | 'error') => void }> = ({ report, notify }) => {
    const isHighRate = report.completionRate >= 80;
    
    return (
        <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="text-xs">{report.reportType}</Badge>
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            {report.periodDisplay}
                        </span>
                        <Badge 
                            variant={isHighRate ? 'success' : 'warning'} 
                            className={isHighRate ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                        >
                            {report.completionRate.toFixed(2)}%
                        </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                            <p className="text-gray-500">총 계획</p>
                            <p className="text-gray-800 font-medium">{report.totalWorkouts}회</p>
                        </div>
                        <div>
                            <p className="text-gray-500">완료</p>
                            <p className="text-green-600 font-medium">{report.completedWorkouts}회</p>
                        </div>
                        <div>
                            <p className="text-gray-500">미완료</p>
                            <p className="text-orange-600 font-medium">{report.uncompletedWorkouts}회</p>
                        </div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div 
                            style={{ width: `${report.completionRate}%` }} 
                            className={`h-2 rounded-full ${isHighRate ? 'bg-green-500' : 'bg-orange-500'} transition-all duration-500`}
                        />
                    </div>
                </div>
                <div className="flex gap-1 ml-4 flex-shrink-0">
                    {/* Mock Download Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => notify(`보고서 [ID: ${report.reportId}] 다운로드 기능이 호출되었습니다.`, 'success')}
                        className="text-blue-600 hover:bg-blue-50 p-2"
                    >
                        <Download className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

/**
 * Custom hook to handle API calls using JWT token stored in localStorage.
 */
const useApiCall = () => {
    // Determine the mock token based on the environment's provided token
    const initialToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : '';
    // Use token from localStorage if available, otherwise use environment token, otherwise mock token
    const token = localStorage.getItem("token") || initialToken || 'MOCK_TOKEN_FOR_ANONYMOUS_USER';
    
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
    
    const makeApiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
        
        if (!token) {
            setIsAuthenticated(false);
            console.error("Authorization token is missing in localStorage. Redirect to login needed.");
            throw new Error("Authorization token is missing.");
        }

        const defaultHeaders = {
            'Authorization': `Bearer ${token}`,
        };
        
        if (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') {
            // @ts-ignore
            defaultHeaders['Content-Type'] = 'application/json';
        }

        const combinedHeaders: HeadersInit = {
            ...(options.headers as Record<string, string> || {}),
            ...defaultHeaders,
        };
        
        // Exponential backoff retry logic
        for (let i = 0; i < 3; i++) {
            try {
                const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                    ...options,
                    headers: combinedHeaders,
                });

                if (response.status === 401 || response.status === 403) {
                    // If unauthorized, clear token and fail fast
                    localStorage.removeItem("token");
                    setIsAuthenticated(false);
                    throw new Error(`Authentication failed. Status: ${response.status}`);
                }

                if (!response.ok) {
                    // Safer JSON parsing for error bodies
                    let errorBody = {};
                    try {
                        errorBody = await response.json();
                    } catch (e) {
                        console.error("Received non-JSON error response (likely HTML or empty body).");
                    }
                    
                    const details = (errorBody as any).message || response.statusText || 'No message.';
                    throw new Error(`HTTP error! status: ${response.status}. Details: ${details}`);
                }

                // Safer JSON parsing for successful (but potentially empty) body
                if (response.status === 204 || response.headers.get("Content-Length") === "0") {
                    return null; // Return null for No Content
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

// Custom Alert/Toast function (remains here as it interacts directly with the DOM)
const notify = (message: string, type: 'success' | 'error' = 'success') => {
    const color = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    const alertBox = document.createElement('div');
    alertBox.className = `fixed top-4 right-4 ${color} text-white p-4 rounded-lg shadow-lg z-50 transition-transform duration-300 transform translate-x-0`;
    alertBox.textContent = message;
    document.body.appendChild(alertBox);
    setTimeout(() => {
        alertBox.classList.add('translate-x-full');
        alertBox.addEventListener('transitionend', () => alertBox.remove());
    }, 3000);
};

// Main Component
const ReportPage: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [selectedType, setSelectedType] = useState<string>('WEEKLY');
    const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<'all' | 'WEEKLY' | 'MONTHLY'>('all');

    const { makeApiCall, isAuthenticated } = useApiCall();

    const fetchReports = useCallback(async () => {
        
        setIsLoading(true);
        setError('');
        try {
            const data = await makeApiCall('/history');
            setReports(data || []);
        } catch (err: any) {
            console.error("Failed to fetch reports:", err);
            setError('보고서 기록을 불러오는 데 실패했습니다: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setIsLoading(false);
        }
    }, [makeApiCall]); 

    useEffect(() => {
        if (isAuthenticated) {
            fetchReports();
        } else {
             // If token is missing, stop loading and show auth error
            setIsLoading(false);
            setError("로그인 토큰이 유효하지 않습니다. 다시 로그인 해주세요.");
        }
    }, [isAuthenticated, fetchReports]); 

    const handleGenerateReport = async () => {
        if (!selectedType) {
            setError('보고서 타입을 선택해주세요.');
            return;
        }

        setIsGenerating(true);
        setError('');
        try {
            const newReport = await makeApiCall(`/generate?type=${selectedType}`, {
                method: 'POST',
            });

            if (newReport) {
                setReports(prev => {
                    const filtered = prev.filter(r => r.reportId !== (newReport as Report).reportId);
                    return [newReport as Report, ...filtered];
                });

                notify(`새로운 ${(newReport as Report).reportType}가 성공적으로 생성되었습니다.`);
            } else {
                 notify('보고서가 생성되었지만 응답 본문이 비어있습니다.', 'success');
            }


        } catch (err: any) {
            console.error("Failed to generate report:", err);
            notify('보고서 생성에 실패했습니다.', 'error');
            setError('보고서 생성에 실패했습니다: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setIsGenerating(false);
        }
    };
    
    // --- Data Aggregation Logic ---

    const overallStats = reports.reduce((acc, r) => {
        acc.totalWorkouts += r.totalWorkouts;
        acc.completedWorkouts += r.completedWorkouts;
        return acc;
    }, { totalWorkouts: 0, completedWorkouts: 0 });

    const overallCompletionRate = overallStats.totalWorkouts > 0
        ? ((overallStats.completedWorkouts / overallStats.totalWorkouts) * 100).toFixed(1)
        : '0.0';

    const getLatestReportByType = (type: '주간 보고서' | '월간 보고서'): Report | null => {
        const filtered = reports.filter(r => r.reportType === type);
        if (filtered.length === 0) return null;
        
        return filtered.reduce((latest, current) => {
            return current.reportId > latest.reportId ? current : latest;
        }, filtered[0]);
    };

    const latestWeekReport = getLatestReportByType('주간 보고서');
    const latestMonthReport = getLatestReportByType('월간 보고서');

    const filteredReports = reports
        .filter(r => {
            if (selectedPeriodFilter === 'all') return true;
            return r.reportType === (selectedPeriodFilter === 'WEEKLY' ? '주간 보고서' : '월간 보고서');
        })
        .sort((a, b) => b.reportId - a.reportId);


    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-['Inter']">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">운동 보고서 📊</h1>
                        <p className="text-sm text-gray-500">
                            운동 계획 및 완료 기록을 기반으로 자동 생성된 통계입니다.
                        </p>
                    </div>
                    <Button 
                        onClick={fetchReports}
                        variant="outline"
                        className="mt-4 sm:mt-0"
                        disabled={isLoading || isGenerating || !isAuthenticated}
                    >
                        <RefreshCw className="w-4 h-4" />
                        새로고침
                    </Button>
                </div>

                {/* Current Weekly/Monthly Stat Cards (Figma Style) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    <SummaryCard
                        icon={<Target className="w-5 h-5" />}
                        title="전체 완료율"
                        rate={overallCompletionRate}
                        completed={overallStats.completedWorkouts}
                        total={overallStats.totalWorkouts}
                        bgClass="bg-gradient-to-br from-blue-500 to-blue-600"
                    />

                    <SummaryCard
                        icon={<CheckCircle2 className="w-5 h-5" />}
                        title="최신 주간 완료율"
                        rate={latestWeekReport?.completionRate.toFixed(1) ?? '0.0'}
                        completed={latestWeekReport?.completedWorkouts ?? 0}
                        total={latestWeekReport?.totalWorkouts ?? 0}
                        bgClass="bg-gradient-to-br from-green-500 to-green-600"
                    />

                    <SummaryCard
                        icon={<Calendar className="w-5 h-5" />}
                        title="최신 월간 완료율"
                        rate={latestMonthReport?.completionRate.toFixed(1) ?? '0.0'}
                        completed={latestMonthReport?.completedWorkouts ?? 0}
                        total={latestMonthReport?.totalWorkouts ?? 0}
                        bgClass="bg-gradient-to-br from-purple-500 to-purple-600"
                    />

                    <SummaryCard
                        icon={<FileText className="w-5 h-5" />}
                        title="총 생성된 보고서"
                        rate={reports.length > 0 ? (reports.length / 10).toFixed(1) : '0.0'}
                        completed={reports.length}
                        total={10} 
                        bgClass="bg-gradient-to-br from-orange-500 to-orange-600"
                    />
                </div>

                {/* Report Generation & History Section */}
                <Card title="보고서 관리" className="p-4 sm:p-6">
                    
                    {/* Report Generation UI */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center border-b pb-4">
                        <label htmlFor="report-type" className="text-sm font-medium text-gray-700 w-full sm:w-auto flex-shrink-0">
                            새 보고서 생성:
                        </label>
                        <select
                            id="report-type"
                            className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-700"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            disabled={isGenerating || isLoading || !isAuthenticated}
                        >
                            <option value="WEEKLY">주간 보고서 (WEEKLY)</option>
                            <option value="MONTHLY">월간 보고서 (MONTHLY)</option>
                        </select>
                        <Button
                            onClick={handleGenerateReport}
                            disabled={isGenerating || isLoading || !isAuthenticated}
                            className="w-full sm:w-auto px-6 py-3 bg-blue-600"
                        >
                            {isGenerating ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                '보고서 생성 시작'
                            )}
                        </Button>
                    </div>

                    {/* Report History List */}
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold text-gray-800">보고서 기록 ({reports.length})</h4>
                        <select
                            className="w-32 p-2 border border-gray-300 rounded-lg text-sm bg-white"
                            value={selectedPeriodFilter}
                            onChange={(e) => setSelectedPeriodFilter(e.target.value as 'all' | 'WEEKLY' | 'MONTHLY')}
                        >
                            <option value="all">전체</option>
                            <option value="WEEKLY">주간</option>
                            <option value="MONTHLY">월간</option>
                        </select>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4" role="alert">
                            <p className="font-bold">오류 발생</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="text-center py-10">
                            <svg className="animate-spin mx-auto h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="p-10 text-center border-dashed border-2 border-gray-300 rounded-xl bg-gray-50">
                            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-base font-medium text-gray-900">보고서 없음</p>
                            <p className="mt-1 text-sm text-gray-500">
                                필터 기준에 맞는 보고서가 없거나 아직 생성된 보고서가 없습니다.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredReports.map((report) => (
                                <ReportItem key={report.reportId} report={report} notify={notify} />
                            ))}
                        </div>
                    )}
                </Card>

                {/* Information Card (from Figma sample) */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <FileText className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <div>
                            <h3 className="mb-1 text-lg font-semibold text-gray-800">자동 보고서 생성 안내</h3>
                            <p className="text-sm text-gray-600">
                                운동 일정에서 운동을 완료하면 시스템이 자동으로 주간 및 월간 보고서를 생성합니다.
                                이 보고서는 완료율과 통계를 포함하며, 운동 진행 상황을 한눈에 확인할 수 있도록 돕습니다.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportPage;