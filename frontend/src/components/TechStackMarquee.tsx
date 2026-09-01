import React from 'react';

interface TechItem {
  name: string;
  category: string;
  icon: React.ReactNode;
  brandColor: string;
}

const TECH_ITEMS_ROW_1: TechItem[] = [
  {
    name: 'LangChain',
    category: 'LLM Framework',
    brandColor: '#1C3C3C',
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M14.5 4.5C12.5 4.5 11 6 11 8C11 8.5 11.1 9 11.3 9.4L6.9 13.8C6.5 13.6 6 13.5 5.5 13.5C3.5 13.5 2 15 2 17C2 19 3.5 20.5 5.5 20.5C7.5 20.5 9 19 9 17C9 16.5 8.9 16 8.7 15.6L13.1 11.2C13.5 11.4 14 11.5 14.5 11.5C16.5 11.5 18 10 18 8C18 6 16.5 4.5 14.5 4.5Z"
          fill="#1C3C3C"
          className="dark:fill-teal-300"
        />
        <path
          d="M18.5 9.5C16.5 9.5 15 11 15 13C15 13.5 15.1 14 15.3 14.4L13.9 15.8C14.3 16.2 14.6 16.6 14.8 17.1L16.2 15.7C16.8 16.2 17.6 16.5 18.5 16.5C20.5 16.5 22 15 22 13C22 11 20.5 9.5 18.5 9.5Z"
          fill="#10B981"
        />
      </svg>
    ),
  },
  {
    name: 'LangGraph',
    category: 'Agent Orchestration',
    brandColor: '#6366F1',
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="5" cy="12" r="3" fill="#6366F1" />
        <circle cx="19" cy="6" r="3" fill="#8B5CF6" />
        <circle cx="19" cy="18" r="3" fill="#3B82F6" />
        <circle cx="12" cy="12" r="2.5" fill="#10B981" />
        <path
          d="M7.8 10.7L9.8 11.5M7.8 13.3L9.8 12.5M14.2 11.2L16.5 7.8M14.2 12.8L16.5 16.2"
          stroke="#6366F1"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: 'Neo4j',
    category: 'Graph Database',
    brandColor: '#018BFF',
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="6" cy="7" r="3.5" fill="#018BFF" />
        <circle cx="18" cy="7" r="3.5" fill="#00D4AA" />
        <circle cx="12" cy="17.5" r="3.5" fill="#018BFF" />
        <path
          d="M8.8 8.8L15.2 8.8M7.8 9.8L10.5 14.5M16.2 9.8L13.5 14.5"
          stroke="#018BFF"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: 'Qdrant',
    category: 'Vector Search',
    brandColor: '#DC2626',
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2L3 7.2V16.8L12 22L21 16.8V7.2L12 2Z"
          fill="#DC2626"
          fillOpacity="0.15"
          stroke="#DC2626"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M12 2V12M12 12L21 7.2M12 12L3 7.2M12 12V22"
          stroke="#DC2626"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="2.5" fill="#DC2626" />
      </svg>
    ),
  },
  {
    name: 'Python',
    category: 'Core Language',
    brandColor: '#3776AB',
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M11.9 2C8.7 2 6.8 3.4 6.8 5.7V7.5H12.1V8.3H4.6C2.6 8.3 1 9.9 1 12.3C1 14.7 2.3 15.9 4.3 15.9H5.8V14.1C5.8 12.3 7.3 10.8 9.1 10.8H14.4C15.8 10.8 16.9 9.7 16.9 8.3V5.7C16.9 3.4 15.1 2 11.9 2ZM9.3 3.6C9.9 3.6 10.4 4.1 10.4 4.7C10.4 5.3 9.9 5.8 9.3 5.8C8.7 5.8 8.2 5.3 8.2 4.7C8.2 4.1 8.7 3.6 9.3 3.6Z"
          fill="#3776AB"
        />
        <path
          d="M12.1 22C15.3 22 17.2 20.6 17.2 18.3V16.5H11.9V15.7H19.4C21.4 15.7 23 14.1 23 11.7C23 9.3 21.7 8.1 19.7 8.1H18.2V9.9C18.2 11.7 16.7 13.2 14.9 13.2H9.6C8.2 13.2 7.1 14.3 7.1 15.7V18.3C7.1 20.6 8.9 22 12.1 22ZM14.7 20.4C14.1 20.4 13.6 19.9 13.6 19.3C13.6 18.7 14.1 18.2 14.7 18.2C15.3 18.2 15.8 18.7 14.7 20.4Z"
          fill="#FFD43B"
        />
      </svg>
    ),
  },
  {
    name: 'PyTorch',
    category: 'Deep Learning',
    brandColor: '#EE4C2C',
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12.8 2.5C12.4 2.8 12.2 3.3 12.2 3.8C12.2 4.4 12.6 4.9 13.1 5.1C15.4 6 17 8.3 17 11C17 14.3 14.3 17 11 17C7.7 17 5 14.3 5 11C5 8.7 6.3 6.6 8.2 5.6C8.7 5.3 8.9 4.7 8.7 4.2C8.5 3.7 7.9 3.4 7.4 3.7C4.9 5 3.2 7.8 3.2 11C3.2 15.3 6.7 18.8 11 18.8C15.3 18.8 18.8 15.3 18.8 11C18.8 7.3 16.3 4.2 12.8 2.5Z"
          fill="#EE4C2C"
        />
        <circle cx="16.5" cy="4.5" r="1.5" fill="#EE4C2C" />
      </svg>
    ),
  },
  {
    name: 'FastAPI',
    category: 'Async Backend',
    brandColor: '#009688',
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#009688" />
        <path d="M13 3L6 13H11.5L10.5 21L18 10.5H12.5L13 3Z" fill="white" />
      </svg>
    ),
  },
  {
    name: 'Milvus',
    category: 'Vector Database',
    brandColor: '#00A1EA',
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 7L12 2L21 7V17L12 22L3 17V7Z"
          stroke="#00A1EA"
          strokeWidth="1.8"
          fill="#00A1EA"
          fillOpacity="0.1"
        />
        <path d="M7 10L12 7L17 10V15L12 18L7 15V10Z" fill="#00A1EA" />
      </svg>
    ),
  },
];

const TECH_ITEMS_ROW_2: TechItem[] = [
  {
    name: 'Hugging Face',
    category: 'Open Models',
    brandColor: '#FFD21E',
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#FFD21E" />
        <circle cx="8.5" cy="10" r="1.5" fill="#202224" />
        <circle cx="15.5" cy="10" r="1.5" fill="#202224" />
        <path
          d="M7.5 14C8.5 16.5 15.5 16.5 16.5 14"
          stroke="#202224"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M3 13C2.5 11 4.5 10 5.5 11.5L7 14"
          stroke="#202224"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M21 13C21.5 11 19.5 10 18.5 11.5L17 14"
          stroke="#202224"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: 'Ollama',
    category: 'Local LLM Runtime',
    brandColor: '#000000',
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect width="24" height="24" rx="6" fill="#18181B" />
        <path
          d="M8 8.5C8 7.1 9.1 6 10.5 6C11.9 6 13 7.1 13 8.5V11H15.5C16.9 11 18 12.1 18 13.5C18 14.9 16.9 16 15.5 16H8.5C7.1 16 6 14.9 6 13.5C6 12.1 7.1 11 8.5 11V8.5Z"
          fill="white"
        />
        <circle cx="10" cy="8.5" r="1" fill="#18181B" />
      </svg>
    ),
  },
  {
    name: 'vLLM',
    category: 'High-Throughput Serving',
    brandColor: '#8B5CF6',
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 6L12 19L20 6"
          stroke="#8B5CF6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 6L12 13L16 6"
          stroke="#06B6D4"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: 'PostgreSQL',
    category: 'Relational Database',
    brandColor: '#336791',
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM17.2 16.8C16.4 17.4 15.4 17.8 14.2 17.9C13.2 18 12.3 17.7 11.5 17.2C10.7 16.7 10.2 16 9.8 15.1C9.4 14.2 9.2 13.1 9.2 12C9.2 10.8 9.4 9.8 9.9 8.9C10.4 8 11.1 7.3 12 6.8C12.9 6.3 13.9 6 15.1 6C16.2 6 17.1 6.3 17.8 6.9C18.5 7.5 18.9 8.3 19 9.3H16.8C16.7 8.8 16.4 8.4 16 8.1C15.6 7.8 15.1 7.7 14.4 7.7C13.6 7.7 12.9 8 12.4 8.5C11.9 9 11.6 9.8 11.6 10.9V13.1C11.6 14.2 11.9 15 12.4 15.5C12.9 16 13.6 16.3 14.4 16.3C15.1 16.3 15.7 16.1 16.1 15.8C16.5 15.5 16.8 15 16.9 14.4H19.1C18.9 15.4 18.3 16.2 17.2 16.8Z"
          fill="#336791"
        />
      </svg>
    ),
  },
  {
    name: 'React',
    category: 'Frontend UI',
    brandColor: '#61DAFB',
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="2.2" fill="#61DAFB" />
        <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#61DAFB" strokeWidth="1.3" />
        <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#61DAFB" strokeWidth="1.3" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#61DAFB" strokeWidth="1.3" transform="rotate(120 12 12)" />
      </svg>
    ),
  },
  {
    name: 'TypeScript',
    category: 'Type-Safe Logic',
    brandColor: '#3178C6',
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect width="24" height="24" rx="4" fill="#3178C6" />
        <path d="M4 9H11M7.5 9V18" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M19 10.5C18.5 9.5 17 9 15.5 9C13.8 9 13 9.8 13 11C13 13 19 12.5 19 15.5C19 17.2 17.5 18 15.5 18C13.5 18 12.5 17 12 16"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: 'Tailwind CSS',
    category: 'Design System',
    brandColor: '#06B6D4',
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 6C9 6 7.2 7.5 6.6 10.5C7.8 8.7 9.3 8.1 11.1 8.7C12.3 9.1 13.2 10 14.1 11C15.6 12.6 17.4 14.5 21 14.5C24 14.5 25.8 13 26.4 10C25.2 11.8 23.7 12.4 21.9 11.8C20.7 11.4 19.8 10.5 18.9 9.5C17.4 7.9 15.6 6 12 6ZM6.6 14.5C3.6 14.5 1.8 16 1.2 19C2.4 17.2 3.9 16.6 5.7 17.2C6.9 17.6 7.8 18.5 8.7 19.5C10.2 21.1 12 23 15.6 23C18.6 23 20.4 21.5 21 18.5C19.8 20.3 18.3 20.9 16.5 20.3C15.3 19.9 14.4 19 13.5 18C12 16.4 10.2 14.5 6.6 14.5Z"
          fill="#06B6D4"
          transform="scale(0.8) translate(1, -1)"
        />
      </svg>
    ),
  },
  {
    name: 'Docker',
    category: 'Containerization',
    brandColor: '#2496ED',
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M22.5 11.5C21.8 11.4 21.2 11.8 20.8 12.2C20.1 11 18.8 10.3 17.4 10.3C16.8 10.3 16.3 10.4 15.8 10.7V9.5C15.8 9.2 15.6 9 15.3 9H13.5C13.2 9 13 9.2 13 9.5V11H10.5C10.2 11 10 11.2 10 11.5V13H2.5C2.2 13 2 13.2 2 13.5C2 17.6 5.4 21 9.5 21C14.7 21 19.1 17.4 20.3 12.5C21 12.7 21.7 12.5 22.2 12C22.6 11.7 22.7 11.5 22.5 11.5Z"
          fill="#2496ED"
        />
        <rect x="7" y="8" width="2" height="2" rx="0.3" fill="#2496ED" />
        <rect x="9.5" y="8" width="2" height="2" rx="0.3" fill="#2496ED" />
        <rect x="7" y="5.5" width="2" height="2" rx="0.3" fill="#2496ED" />
        <rect x="9.5" y="5.5" width="2" height="2" rx="0.3" fill="#2496ED" />
        <rect x="12" y="5.5" width="2" height="2" rx="0.3" fill="#2496ED" />
      </svg>
    ),
  },
];

const TechCard: React.FC<{ tech: TechItem }> = ({ tech }) => (
  <article
    className="group relative flex h-[94px] sm:h-[108px] w-[136px] sm:w-[168px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-white/80 px-3 sm:px-4 text-center shadow-xs backdrop-blur-sm opacity-60 hover:opacity-100 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-xl dark:border-slate-800/80 dark:bg-slate-900/80 dark:opacity-60 dark:hover:opacity-100 transition-all duration-300 cursor-default select-none"
  >
    <div className="mb-1 sm:mb-1.5 flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center transition-transform duration-300 group-hover:scale-110">
      {tech.icon}
    </div>

    <div className="text-xs sm:text-[13px] font-semibold tracking-[-0.01em] text-slate-950 dark:text-white truncate max-w-[118px] sm:max-w-[150px] transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
      {tech.name}
    </div>

    <div className="mt-0.5 max-w-[118px] sm:max-w-[145px] truncate text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.06em] sm:tracking-[0.08em] text-slate-500 dark:text-slate-400">
      {tech.category}
    </div>
  </article>
);

const MarqueeRow: React.FC<{
  items: TechItem[];
  direction?: 'left' | 'right';
  speed?: number;
}> = ({ items, direction = 'left', speed = 32 }) => (
  <div className="group/row relative w-full overflow-hidden">
    <div
      className={`tech-marquee-track flex w-max items-center gap-3 sm:gap-4 py-1 ${direction === 'right' ? 'tech-marquee-reverse' : 'tech-marquee'}`}
      style={{ '--marquee-duration': `${speed}s` } as React.CSSProperties}
    >
      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        {items.map((tech) => (
          <TechCard key={`a-${tech.name}`} tech={tech} />
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-4" aria-hidden="true">
        {items.map((tech) => (
          <TechCard key={`b-${tech.name}`} tech={tech} />
        ))}
      </div>
    </div>
  </div>
);

export const TechStackMarquee: React.FC = () => {
  return (
    <section
      id="tech-stack-section"
      aria-labelledby="tech-stack-title"
      className="min-h-screen lg:h-screen w-full shrink-0 snap-start lg:snap-always flex flex-col justify-center items-center relative overflow-hidden border-t border-slate-200/70 bg-slate-50 py-12 lg:py-0 px-4 sm:px-6 dark:border-slate-800/70 dark:bg-slate-950"
    >
      {/* Ambient background — deliberately subtle so the tech logos stay primary. */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08),transparent_42%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(129,140,248,0.10),transparent_42%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl w-full">
        <div className="mx-auto max-w-3xl px-2 sm:px-6 text-center mb-6 sm:mb-8 lg:mb-10 shrink-0">
          <h2
            id="tech-stack-title"
            className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white"
          >
            Nền tảng công nghệ phía sau hệ thống
          </h2>

          <p className="mx-auto mt-2.5 sm:mt-4 max-w-2xl text-xs sm:text-sm md:text-[15px] leading-relaxed text-slate-600 dark:text-slate-400 px-2">
            Kết hợp LLM, Agent, Graph, Vector Search và hạ tầng web hiện đại để tạo nên một hệ thống AI nhanh, linh hoạt và có khả năng mở rộng.
          </p>
        </div>

        <div className="relative space-y-3 sm:space-y-4 overflow-hidden w-full max-w-full">
          {/* Edge masks are important for making the infinite loop feel intentional. */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 sm:w-16 lg:w-28 bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent dark:from-slate-950 dark:via-slate-950/90"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 sm:w-16 lg:w-28 bg-gradient-to-l from-slate-50 via-slate-50/90 to-transparent dark:from-slate-950 dark:via-slate-950/90"
            aria-hidden="true"
          />

          <MarqueeRow items={TECH_ITEMS_ROW_1} direction="left" speed={28} />
          <MarqueeRow items={TECH_ITEMS_ROW_2} direction="right" speed={32} />
          <MarqueeRow items={TECH_ITEMS_ROW_1} direction="left" speed={28} />
        </div>
      </div>

      <style>{`
        .tech-marquee-track {
          animation: tech-marquee var(--marquee-duration) linear infinite;
          will-change: transform;
        }

        .tech-marquee-reverse {
          animation-name: tech-marquee-reverse;
        }

        .group\\/row:hover .tech-marquee-track,
        .group\\/row:focus-within .tech-marquee-track {
          animation-play-state: paused;
        }

        @keyframes tech-marquee {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(-50%, 0, 0);
          }
        }

        @keyframes tech-marquee-reverse {
          from {
            transform: translate3d(-50%, 0, 0);
          }
          to {
            transform: translate3d(0, 0, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tech-marquee-track {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default TechStackMarquee;
