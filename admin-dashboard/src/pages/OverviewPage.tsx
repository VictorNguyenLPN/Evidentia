import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  Database,
  RotateCcw,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import type {
  AdminOverviewStats,
  SystemHealthResponse,
  QdrantOverviewInfo,
  GeminiOverviewInfo,
} from '../types';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [health, setHealth] = useState<SystemHealthResponse | null>(null);
  const [qdrantInfo, setQdrantInfo] = useState<QdrantOverviewInfo | null>(null);
  const [geminiInfo, setGeminiInfo] = useState<GeminiOverviewInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [overviewRes, healthRes] = await Promise.all([
        adminService.getOverview(),
        adminService.getSystemHealth().catch(() => null),
      ]);

      setStats(overviewRes.stats);
      setQdrantInfo(overviewRes.qdrant);
      setGeminiInfo(overviewRes.gemini);
      if (healthRes) setHealth(healthRes);
      setLastRefreshed(new Date().toLocaleTimeString('vi-VN'));
    } catch (err) {
      console.error('Error fetching admin overview:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tổng quan hệ thống</h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi trạng thái thời gian thực của người dùng, cơ sở dữ liệu Vector và các dịch vụ AI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="text-xs text-slate-500">Cập nhật lúc: {lastRefreshed}</span>
          )}
          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng người dùng"
          value={stats?.total_users ?? '—'}
          subtitle={`${stats?.admin_users || 0} Admin & ${stats?.pro_users || 0} Pro & ${stats?.free_users || 0} Free`}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />

        <StatCard
          title="Tổng phiên hội thoại"
          value={stats?.total_chats ?? '—'}
          subtitle={`${stats?.total_messages || 0} tin nhắn`}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />

        <StatCard
          title="Vector Points"
          value={qdrantInfo?.count ?? '—'}
          subtitle={qdrantInfo?.configured ? 'Qdrant Cloud đã kết nối' : 'Chưa cấu hình Cloud'}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />

        <StatCard
          title="Lượt hỏi đáp đã phục vụ"
          value={stats?.total_questions_asked ?? '—'}
          subtitle={`Tổng số yêu cầu tra cứu từ người dùng`}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Second Row: System Health & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5"> 
              <div>
                <h2 className="text-sm font-bold text-slate-900">Trạng thái hệ thống</h2>
                <p className="text-[11px] text-slate-500">Giám sát tình trạng hạ tầng hệ thống</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {/* MongoDB */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-800">MongoDB Database</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {stats?.total_laws || 0} Văn bản luật / {stats?.total_articles || 0} Điều khoản
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {typeof health?.services?.mongodb?.latency_ms === 'number' && (
                  <span className="text-[11px] text-slate-500 font-mono">
                    {health.services.mongodb.latency_ms} ms
                  </span>
                )}
                <StatusBadge type="health" value={stats?.mongodb_connected ? 'healthy' : 'degraded'} />
              </div>
            </div>

            {/* Qdrant Cloud */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Qdrant Cloud Vector Database</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Collection: <span className="font-semibold">{qdrantInfo?.collection || 'evidentia_legal_chunks'}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {typeof health?.services?.qdrant?.latency_ms === 'number' && (
                  <span className="text-[11px] text-slate-500 font-mono">
                    {health.services.qdrant.latency_ms} ms
                  </span>
                )}
                <StatusBadge type="health" value={qdrantInfo?.configured ? 'healthy' : 'unconfigured'} />
              </div>
            </div>

            {/* Gemini Model */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Google Gemini LLM</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Model: <span className="font-semibold">{geminiInfo?.model || 'gemini-3.1-flash-lite'}</span>
                  </p>
                </div>
              </div>
              <StatusBadge type="health" value={geminiInfo?.ready ? 'healthy' : 'unconfigured'} />
            </div>

            {/* Embedding Engine */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Hybrid Embedding Engine</p>
                  <p className="text-[11px] text-slate-500 font-mono">Dense (768d) + Sparse BM25</p>
                </div>
              </div>
              <StatusBadge type="health" value="healthy" />
            </div>
          </div>
        </div>

        {/* Quick Action Hub */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Thao tác nhanh</h2>
                <p className="text-[11px] text-slate-500">Truy cập tức thì các tính năng chính</p>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <button
                onClick={() => navigate('/users')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-700">Quản lý người dùng</p>
                    <p className="text-[11px] text-slate-500">Tạo mới, phân quyền, đổi mật khẩu</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/vector-db')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-700">Vector DB</p>
                    <p className="text-[11px] text-slate-500">Nạp dữ liệu Qdrant Cloud & Test Search</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/guest-limits')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-700">Hạn mức & Đặt lại lượt</p>
                    <p className="text-[11px] text-slate-500">Quản lý và đặt lại số câu hỏi cho người dùng</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/chats')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-700">Nhật ký hội thoại</p>
                    <p className="text-[11px] text-slate-500">Xem toàn bộ lịch sử hỏi đáp pháp lý</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
