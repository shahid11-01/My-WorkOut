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
  // extend if backend returns more fields
};

export default function Dashboard() {
  const [reports, setReports] = useState<ReportDto[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = "http://localhost:8586"; // change if your backend runs elsewhere

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        // Fetch report history and workouts in parallel
        const [rRes, wRes] = await Promise.all([
          axios.get<ReportDto[]>(`${baseUrl}/api/report/history`, { headers }),
          axios.get<WorkoutDto[]>(`${baseUrl}/api/workout/workouts/list`, { headers })
        ]);

        // Normalize completionRate to number if backend returns BigDecimal/string
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

  // Use the most recent report for chart (assume sorted by date descending or pick last)
  const chartSource = (() => {
    if (!reports || reports.length === 0) {
      // default dummy 7-day chart
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

    // If report entries correspond to periods, map them as series points.
    // Here we try to produce a simple chart series from reports array:
    // If reports represent weeks/months, map using completionRate or totalWorkouts.
    const mapped = reports.slice(-7).map((r, i) => ({
      label: r.periodDisplay ?? `P${i + 1}`,
      value: Number(r.totalWorkouts ?? r.completionRate ?? 0)
    }));

    // If too few points, pad to 7 elements for consistent layout
    while (mapped.length < 7) {
      mapped.unshift({ label: "", value: 0 });
    }

    return mapped;
  })();

  const totalWorkouts = workouts?.length ?? 0;
  const totalCompleted = workouts?.reduce((acc, w) => acc + (Number(w.completedExercises ?? 0)), 0);
  // If completedExercises not provided, we fallback to 0.
  const latestReport = reports.length > 0 ? reports[0] : undefined;
  const completionRate = latestReport ? Number(latestReport.completionRate ?? 0) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-3">
            <Dumbbell className="w-6 h-6 text-indigo-600" />
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">오늘의 운동 현황을 확인하세요</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">완료율 (최근 리포트)</p>
          <p className="text-xl font-semibold">
            {(completionRate * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Error / Loading */}
      {loading ? (
        <div className="p-4 bg-white border rounded">로딩 중...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
      ) : null}

      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border rounded flex items-center gap-4">
          <Calendar className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">이번 주 운동</p>
            <p className="text-2xl font-semibold">{totalWorkouts}</p>
          </div>
        </div>

        <div className="p-4 bg-white border rounded flex items-center gap-4">
          <TrendingUp className="w-8 h-8 text-green-600" />
          <div>
            <p className="text-sm text-gray-500">완료한 세트(대략)</p>
            <p className="text-2xl font-semibold">{totalCompleted ?? 0}</p>
          </div>
        </div>

        <div className="p-4 bg-white border rounded flex items-center gap-4">
          <Flame className="w-8 h-8 text-orange-500" />
          <div>
            <p className="text-sm text-gray-500">연속 운동</p>
            <p className="text-2xl font-semibold">{/* You can compute streak from user data; default: */}7일</p>
          </div>
        </div>
      </div>

      {/* Chart + summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-4 bg-white border rounded">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" /> 주간 활동
            </h2>
            <p className="text-sm text-muted-foreground">{latestReport?.periodDisplay ?? ""}</p>
          </div>

          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartSource}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completion summary */}
        <div className="p-4 bg-white border rounded">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" /> 성취
          </h3>

          <div className="mt-3 space-y-3">
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">완료율</p>
              <p className="text-xl font-medium">
                  {(completionRate * 100).toFixed(0)}%
             </p>
            </div>

            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">총 운동 수</p>
              <p className="text-xl font-semibold">{latestReport?.totalWorkouts ?? totalWorkouts}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">완료된 운동</p>
              <p className="text-xl font-semibold">{latestReport?.completedWorkouts ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent workouts */}
      <div className="p-4 bg-white border rounded">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-gray-700" /> 최근 운동
          </h3>
          <button
            onClick={async () => {
              // quick refresh
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
            className="text-sm text-primary hover:underline"
          >
            새로고침
          </button>
        </div>

        <div className="space-y-2">
          {workouts && workouts.length > 0 ? (
            workouts.map((w, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium">{w.title ?? `Workout ${w.workoutId ?? idx + 1}`}</p>
                  <p className="text-sm text-gray-500">{w.scheduledDate ? new Date(w.scheduledDate).toLocaleString() : ""}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{w.completionRate ? `${(Number(w.completionRate) * 100).toFixed(0)}%` : "-"}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">최근 운동이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
