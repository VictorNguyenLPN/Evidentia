import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  RefreshCw,
  Play,
  Search,
  Layers,
  BookOpen,
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { StatusBadge } from '../components/StatusBadge';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { getErrorMessage } from '../utils/error';
import type { VectorStatusResponse, TestRetrievalResponse } from '../types';

export const VectorDbPage: React.FC = () => {
  const [vectorStatus, setVectorStatus] = useState<VectorStatusResponse | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [isSyncingLaws, setIsSyncingLaws] = useState<boolean>(false);
  const [ingestLog, setIngestLog] = useState<string | null>(null);

  // Test Retrieval States
  const [testQuery, setTestQuery] = useState<string>('Thời hiệu xử phạt vi phạm hành chính là bao lâu?');
  const [testTopK, setTestTopK] = useState<number>(5);
  const [testTargetDate, setTestTargetDate] = useState<string>('');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<TestRetrievalResponse | null>(null);

  const { toasts, addToast, dismissToast } = useToast();

  const loadStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    try {
      const res = await adminService.getVectorStatus();
      setVectorStatus(res);
    } catch (err: unknown) {
      addToast('error', getErrorMessage(err, 'Lỗi khi kiểm tra trạng thái Vector DB.'));
    } finally {
      setIsLoadingStatus(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Trigger Vector Ingest
  const handleTriggerIngest = async () => {
    setIsIngesting(true);
    setIngestLog('Đang khởi động quá trình tạo Dense + Sparse Embeddings và nạp vào Qdrant Cloud...');
    try {
      const res = await adminService.triggerVectorIngest();
      addToast('success', res.message || 'Nạp Vector DB thành công!');
      setIngestLog(`Thành công: Đã nạp ${res.cloud_count} vector chunks lên Qdrant Cloud.`);
      loadStatus();
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Lỗi trong quá trình nạp Vector DB.');
      addToast('error', msg);
      setIngestLog(`Thất bại: ${msg}`);
    } finally {
      setIsIngesting(false);
    }
  };

  // Trigger MongoDB Law Sync
  const handleTriggerLawsSync = async () => {
    setIsSyncingLaws(true);
    try {
      const res = await adminService.triggerLawsSync();
      addToast('success', res.message || 'Đồng bộ dữ liệu Luật vào MongoDB thành công!');
      loadStatus();
    } catch (err: unknown) {
      addToast('error', getErrorMessage(err, 'Lỗi khi đồng bộ MongoDB Laws.'));
    } finally {
      setIsSyncingLaws(false);
    }
  };

  // Test Retrieval
  const handleTestRetrieval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    setIsTesting(true);
    try {
      const res = await adminService.testRetrieval({
        query: testQuery.trim(),
        top_k: testTopK,
        target_date: testTargetDate.trim() || undefined,
      });
      setTestResults(res);
      addToast('success', `Đã tìm thấy ${res.results_count} đoạn trích (${res.latency_ms} ms).`);
    } catch (err: unknown) {
      addToast('error', getErrorMessage(err, 'Lỗi khi chạy thử nghiệm truy xuất.'));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Ingestion & Vector Database</h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý tập chỉ mục Qdrant Cloud, nạp dữ liệu vector và kiểm thử công cụ Hybrid Retrieval.
          </p>
        </div>

        <button
          onClick={loadStatus}
          disabled={isLoadingStatus}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? 'animate-spin' : ''}`} />
          <span>Kiểm tra trạng thái</span>
        </button>
      </div>

      {/* Status Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Collection: <span className="font-mono text-indigo-700">{vectorStatus?.collection_name || 'evidentia_legal_chunks'}</span>
                </h2>
                {vectorStatus && (
                  <StatusBadge type="status" value={vectorStatus.sync_status?.status || 'unknown'} />
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {vectorStatus?.sync_status?.message || 'Đang kiểm tra kết nối với Qdrant Cloud...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-center">
              <span className="text-[10px] text-slate-500 block">Cloud Count</span>
              <span className="font-bold text-indigo-700 text-sm">
                {vectorStatus?.sync_status?.cloud_count?.toLocaleString() ?? '—'}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-center">
              <span className="text-[10px] text-slate-500 block">Local File Count</span>
              <span className="font-bold text-slate-800 text-sm">
                {vectorStatus?.sync_status?.local_count?.toLocaleString() ?? '—'}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-center">
              <span className="text-[10px] text-slate-500 block">Dense Dim</span>
              <span className="font-bold text-slate-800 text-sm">
                {vectorStatus?.dense_dimension || 768}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vector Ingest Trigger */}
          <div className="flex flex-col justify-start">
            <div>
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                Nạp lại toàn bộ Vector DB
              </div>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Tạo mới collection trên Qdrant Cloud, tính toán Dense Embedding và Sparse BM25, nạp theo batch từ file dữ liệu JSON.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={handleTriggerIngest}
                disabled={isIngesting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-60"
              >
                {isIngesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang nạp Vector...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Bắt đầu Ingestion</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* MongoDB Laws Sync */}
          <div className="flex flex-col justify-start">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                Đồng bộ cấu trúc văn bản luật vào MongoDB
              </div>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Cập nhật metadata của Luật, Chương, Mục và các Điều khoản vào MongoDB để phục vụ tra cứu văn bản nguyên văn.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={handleTriggerLawsSync}
                disabled={isSyncingLaws}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-60"
              >
                {isSyncingLaws ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang đồng bộ...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Đồng bộ MongoDB Laws</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {ingestLog && (
          <div className="mt-4 p-3 rounded-lg bg-slate-900 text-slate-200 text-xs font-mono">
            <span className="text-indigo-400 font-semibold">[Log]: </span>
            {ingestLog}
          </div>
        )}
      </div>

      {/* Test Retrieval Playground */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Thử nghiệm truy xuất Hybrid Search (Retrieval Playground)</h2>
            <p className="text-[11px] text-slate-500">
              Kiểm tra trực tiếp độ chính xác của bộ lọc thời gian và thuật toán RRF (Dense + BM25).
            </p>
          </div>
        </div>

        <form onSubmit={handleTestRetrieval} className="mt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Câu hỏi tra cứu</label>
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="Nhập câu hỏi pháp lý mẫu..."
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Thời điểm hiệu lực (YYYY-MM-DD)</label>
              <input
                type="text"
                value={testTargetDate}
                onChange={(e) => setTestTargetDate(e.target.value)}
                placeholder="2024-01-01 (Tùy chọn)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Top K kết quả</label>
              <div className="flex gap-2">
                <select
                  value={testTopK}
                  onChange={(e) => setTestTopK(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={3}>Top 3</option>
                  <option value={5}>Top 5</option>
                  <option value={10}>Top 10</option>
                  <option value={15}>Top 15</option>
                </select>

                <button
                  type="submit"
                  disabled={isTesting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-xs"
                >
                  {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>Chạy thử</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Results Stream */}
        {testResults && (
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-900">
                Tìm thấy {testResults.results_count} đoạn luật phù hợp:
              </span>
              <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                Thời gian xử lý: <span className="font-bold text-indigo-700">{testResults.latency_ms} ms</span>
              </span>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {testResults.results.map((chunk, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-xs text-slate-900">
                      #{idx + 1}. {chunk.document_title || 'Văn bản pháp luật'}
                    </span>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      Score: {chunk.score ? chunk.score.toFixed(4) : '—'}
                    </span>
                  </div>

                  {chunk.hierarchy_path && chunk.hierarchy_path.length > 0 && (
                    <p className="text-[11px] text-slate-500 font-medium mb-1">
                      {chunk.hierarchy_path.join(' > ')}
                    </p>
                  )}

                  <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                    {chunk.text}
                  </p>

                  <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Số hiệu: {chunk.doc_identity || 'N/A'}</span>
                    <span>Hiệu lực: {chunk.effect_date ? chunk.effect_date.split('T')[0] : 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VectorDbPage;
