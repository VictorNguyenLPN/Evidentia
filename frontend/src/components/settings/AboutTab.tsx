import React from 'react';

export const AboutTab: React.FC = () => {
  return (
    <div className="divide-y divide-slate-200/80 dark:divide-slate-800 space-y-3 pt-2">
      <div className="py-2 space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
          Evidentia - Trợ lý pháp lý đa tác tử thông minh
        </h4>
        <p>
          Evidentia là hệ thống ứng dụng mô hình ngôn ngữ lớn (LLM) kết hợp kiến trúc đa tác tử (Multi-Agent) chuyên sâu nhằm hỗ trợ tra cứu, phân tích và giải thích quy phạm pháp luật Việt Nam theo từng mốc thời gian và tình huống thực tế.
        </p>
        <p className="text-slate-400 dark:text-slate-500">
          Phiên bản: 1.0.0 • Phát triển bởi NLP & KD Lab
        </p>
      </div>
    </div>
  );
};
