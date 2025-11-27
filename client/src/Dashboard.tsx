// src/Dashboard.tsx
// Figma/screenshot reference (local file): /mnt/data/429ab0dd-7c00-4d19-8b5f-e034e3185d5e.png

import React, { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Dumbbell, Calendar, Flame, TrendingUp, Target, Award } from "lucide-react";

type ReportDto = {
  reportId: number;
  reportType: string;
  periodDisplay: string;
  completionRate: number | string;
  totalWorkouts: number;
  completedWorkouts: number;
  uncompletedWorkouts: number;
};

type WorkoutDto = {
  workoutId?: number;
  title?: string;
  scheduledDate?: string;
  completionRate?: number;
  totalExercises?: number;
  completedExercises?: number;
};

export default function Dashboard() {
  const [reports, setReports] = useState<ReportDto[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = "http://localhost:8586";

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const [rRes, wRes] = await Promise.all([
          axios.get<ReportDto[]>(`${baseUrl}/api/report/history`, { headers }),
          axios.get<WorkoutDto[]>(`${baseUrl}/api/workout/workouts/list`, { headers })
        ]);

        const normalizedReports = (rRes.data || []).map((r) => ({
          ...r,
          completionRate: typeof r.completionRate === "string" ? parseFloat(r.completionRate) : Number(r.completionRate ?? 0)
        }));

        setReports(normalizedReports);
        setWorkouts(wRes.data || []);
      } catch (e: any) {
        console.error("Dashboard fetch error:", e);
        setError(
          e?.response?.status === 401
            ? "인증 실패: 다시 로그인 해주세요."
            : "데이터를 불러오지 못했습니다. 서버가 실행 중인지 확인하세요."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const chartSource = (() => {
    if (!reports || reports.length === 0) {
      return [
        { label: "Mon", value: 1 },
        { label: "Tue", value: 2 },
        { label: "Wed", value: 1 },
        { label: "Thu", value: 0 },
        { label: "Fri", value: 1 },
        { label: "Sat", value: 0 },
        { label: "Sun", value: 0 }
      ];
    }

    const mapped = reports.slice(-7).map((r, i) => ({
      label: r.periodDisplay ?? `P${i + 1}`,
      value: Number(r.totalWorkouts ?? r.completionRate ?? 0)
    }));

    while (mapped.length < 7) {
      mapped.unshift({ label: "", value: 0 });
    }

    return mapped;
  })();

  const totalWorkouts = workouts?.length ?? 0;
  const totalCompleted = workouts?.reduce((acc, w) => acc + (Number(w.completedExercises ?? 0)), 0);
  const latestReport = reports.length > 0 ? reports[0] : undefined;
  const completionRate = latestReport ? Number(latestReport.completionRate ?? 0) : 0;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
            <Dumbbell className="w-8 h-8 text-indigo-600" />
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">오늘의 운동 현황을 확인하세요</p>
        </div>
        <div className="text-right bg-gradient-to-br from-indigo-50 to-purple-50 px-6 py-4 rounded-xl">
          <p className="text-sm text-gray-600 font-medium">완료율 (최근 리포트)</p>
          <p className="text-3xl font-bold text-indigo-600">
            {(completionRate * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Error / Loading */}
      {loading ? (
        <div className="p-6 bg-white rounded-xl shadow-sm text-center text-gray-600">로딩 중...</div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-700 rounded-xl shadow-sm">{error}</div>
      ) : null}

      {/* Top stats - NO BORDERS, colorful backgrounds */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg flex items-center gap-4 text-white transform transition hover:scale-105">
          <div className="p-3 bg-white/20 rounded-lg">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-blue-100">이번 주 운동</p>
            <p className="text-3xl font-bold">{totalWorkouts}</p>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg flex items-center gap-4 text-white transform transition hover:scale-105">
          <div className="p-3 bg-white/20 rounded-lg">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-green-100">완료한 세트(대략)</p>
            <p className="text-3xl font-bold">{totalCompleted ?? 0}</p>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg flex items-center gap-4 text-white transform transition hover:scale-105">
          <div className="p-3 bg-white/20 rounded-lg">
            <Flame className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-orange-100">연속 운동</p>
            <p className="text-3xl font-bold">7일</p>
          </div>
        </div>
      </div>

      {/* Chart + summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
              <Target className="w-6 h-6 text-purple-600" /> 주간 활동
            </h2>
            <p className="text-sm text-gray-500 font-medium">{latestReport?.periodDisplay ?? ""}</p>
          </div>

          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartSource}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" stroke="#6b7280" />
                <YAxis allowDecimals={false} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8b5cf6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#8b5cf6' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completion summary - NO BORDERS */}
        <div className="p-6 bg-white rounded-xl shadow-sm">
          <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800 mb-4">
            <Award className="w-6 h-6 text-yellow-500" /> 성취
          </h3>

          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl">
              <p className="text-sm text-gray-600 font-medium">완료율</p>
              <p className="text-2xl font-bold text-purple-600">
                {(completionRate * 100).toFixed(0)}%
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
              <p className="text-sm text-gray-600 font-medium">총 운동 수</p>
              <p className="text-2xl font-bold text-blue-600">{latestReport?.totalWorkouts ?? totalWorkouts}</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <p className="text-sm text-gray-600 font-medium">완료된 운동</p>
              <p className="text-2xl font-bold text-green-600">{latestReport?.completedWorkouts ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent workouts - NO BORDERS */}
      <div className="p-6 bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
            <Dumbbell className="w-6 h-6 text-indigo-600" /> 최근 운동
          </h3>
          <button
            onClick={async () => {
              setLoading(true);
              try {
                const token = localStorage.getItem("token");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const wRes = await axios.get<WorkoutDto[]>(`${baseUrl}/api/workout/workouts/list`, { headers });
                setWorkouts(wRes.data || []);
              } catch (e) {
                console.error(e);
              } finally {
                setLoading(false);
              }
            }}
            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
          >
            새로고침
          </button>
        </div>

        <div className="space-y-3">
          {workouts && workouts.length > 0 ? (
            workouts.map((w, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition"
              >
                <div>
                  <p className="font-semibold text-gray-800">{w.title ?? `Workout ${w.workoutId ?? idx + 1}`}</p>
                  <p className="text-sm text-gray-500">{w.scheduledDate ? new Date(w.scheduledDate).toLocaleString() : ""}</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                    {w.completionRate ? `${(Number(w.completionRate) * 100).toFixed(0)}%` : "-"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">최근 운동이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}