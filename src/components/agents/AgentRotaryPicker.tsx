'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FileText, Instagram, Share2, Video, TrendingUp } from 'lucide-react';
import { useAgent } from '@/context/AgentContext';
import type { AgentId } from '@/context/AgentContext';

const AGENT_CONFIG = [
  {
    id: 'Blog' as AgentId,
    name: 'Blog',
    role: '파인액터스 전문 라이터',
    icon: FileText,
    gradient: 'from-emerald-50 to-teal-100',
    accent: '#10b981',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'Insta' as AgentId,
    name: 'Insta',
    role: '연기학원 비주얼 디렉터',
    icon: Instagram,
    gradient: 'from-pink-50 to-rose-100',
    accent: '#ec4899',
    iconColor: 'text-pink-600',
  },
  {
    id: 'Threads' as AgentId,
    name: 'Threads',
    role: '인사이트 디렉터',
    icon: Share2,
    gradient: 'from-slate-50 to-gray-100',
    accent: '#334155',
    iconColor: 'text-slate-700',
  },
  {
    id: 'Shortform' as AgentId,
    name: 'Shortform',
    role: '숏폼 / 릴스 디렉터',
    icon: Video,
    gradient: 'from-violet-50 to-purple-100',
    accent: '#7c3aed',
    iconColor: 'text-violet-600',
  },
  {
    id: 'Marketer' as AgentId,
    name: 'Marketer',
    role: '전략가 + 감시관',
    icon: TrendingUp,
    gradient: 'from-amber-50 to-orange-100',
    accent: '#d97706',
    iconColor: 'text-amber-600',
  },
] as const;

export default function AgentRotaryPicker() {
  const { activeAgent, setActiveAgent, currentView } = useAgent();

  const [localIndex, setLocalIndex] = useState<number>(
    AGENT_CONFIG.findIndex((a) => a.id === activeAgent)
  );
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const isTransitioning = useRef(false);

  // activeAgent 외부 변경 시 localIndex 동기화
  useEffect(() => {
    const idx = AGENT_CONFIG.findIndex((a) => a.id === activeAgent);
    if (idx !== -1 && idx !== localIndex) {
      setLocalIndex(idx);
    }
  }, [activeAgent, localIndex]);

  // 인덱스 변경 → Context 업데이트
  const handleSelect = useCallback((idx: number, forcedDirection?: 'up' | 'down') => {
    if (isTransitioning.current) return;

    const normalized = (idx + AGENT_CONFIG.length) % AGENT_CONFIG.length;
    if (normalized === localIndex) return;

    // 수직 방향 결정: 인덱스 증가 시 'up'(아래에서 위로 올라옴)
    let dir: 'up' | 'down' = forcedDirection || (idx > localIndex ? 'up' : 'down');
    
    setDirection(dir);
    setLocalIndex(normalized);
    setActiveAgent(AGENT_CONFIG[normalized].id);

    isTransitioning.current = true;
    setTimeout(() => { isTransitioning.current = false; }, 600);
  }, [localIndex, setActiveAgent]);

  // 마우스 휠로 에이전트 순환
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 10) return;
      handleSelect(localIndex + (e.deltaY > 0 ? 1 : -1));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [localIndex, handleSelect]);

  const prev = (localIndex - 1 + AGENT_CONFIG.length) % AGENT_CONFIG.length;
  const next = (localIndex + 1) % AGENT_CONFIG.length;
  const active = AGENT_CONFIG[localIndex];

  const PrevIcon = AGENT_CONFIG[prev].icon;
  const NextIcon = AGENT_CONFIG[next].icon;
  const ActiveIcon = active.icon;

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center select-none transition-opacity duration-300 w-full ${
        currentView !== 'chat' ? 'opacity-40 pointer-events-none' : ''
      }`}
      style={{ perspective: '1200px' }}
    >
      {/* 배경 그라디언트 패널 */}
      <div
        className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${active.gradient} transition-all duration-700 opacity-60`}
        style={{ zIndex: 0, transform: 'translateZ(-10px)' }}
      />

      {/* 위쪽 카드 (Prev) */}
      <button
        onClick={() => handleSelect(prev, 'down')}
        className="cursor-pointer relative z-10 w-[80%] py-2.5 rounded-xl bg-white/50 backdrop-blur-sm border border-white/80 flex items-center px-4 gap-3 scale-[0.9] opacity-30 blur-[1px] transition-all duration-500 hover:opacity-60 hover:scale-[0.94] hover:blur-none"
        style={{ transform: 'rotateX(20deg) translateY(5px)' }}
      >
        <div className={`p-1.5 rounded-lg bg-white/50 shadow-sm`}>
            <PrevIcon className={`w-5 h-5 ${AGENT_CONFIG[prev].iconColor}`} />
        </div>
        <div className="text-left">
            <span className="block text-[10px] font-bold text-charcoal/60 uppercase tracking-widest">{AGENT_CONFIG[prev].name}</span>
            <span className="block text-[9px] text-charcoal/40 font-medium truncate max-w-[120px]">{AGENT_CONFIG[prev].role}</span>
        </div>
      </button>

      {/* 중앙 활성 카드 (Active - 30% 축소) */}
      <div
        key={active.id}
        className="relative z-20 w-full py-5 rounded-[2rem] my-2 bg-white/95 backdrop-blur-md border-2 shadow-xl flex items-center px-6 gap-4 transition-all duration-500"
        style={{
          borderColor: 'var(--color-stage-green)',
          boxShadow: `0 15px 40px var(--color-stage-green)20`,
          animation: `rotary-in-${direction} 480ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
          transform: 'translateZ(30px)',
        }}
      >
        <div className="relative">
          <div className="p-3.5 rounded-2xl bg-accent shadow-inner">
            <ActiveIcon className={`w-10 h-10 ${active.iconColor}`} />
          </div>
          <span className="absolute -top-1 -right-1 flex w-2.5 h-2.5">
            <span
              className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping"
              style={{ backgroundColor: 'var(--color-stage-green)' }}
            />
            <span
              className="relative inline-flex w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: 'var(--color-stage-green)' }}
            />
          </span>
        </div>

        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h3 className="font-['Noto_Serif_KR'] text-xl font-black text-charcoal tracking-tighter">
              {active.name}
            </h3>
            <span className="bg-secondary text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1.5 uppercase tracking-widest">
              {active.id}
            </span>
          </div>
          <p className="text-[12px] font-semibold text-charcoal/60 mt-0.5 leading-snug">
            {active.role}
          </p>
          <div className="mt-2.5 flex gap-1 items-center">
            <div className="w-6 h-1 rounded-full bg-secondary" />
            <div className="w-1 h-1 rounded-full bg-gray-200" />
            <div className="w-1 h-1 rounded-full bg-gray-200" />
          </div>
        </div>
      </div>

      {/* 아래쪽 카드 (Next) */}
      <button
        onClick={() => handleSelect(next, 'up')}
        className="cursor-pointer relative z-10 w-[80%] py-2.5 rounded-xl bg-white/50 backdrop-blur-sm border border-white/80 flex items-center px-4 gap-3 scale-[0.9] opacity-30 blur-[1px] transition-all duration-500 hover:opacity-60 hover:scale-[0.94] hover:blur-none"
        style={{ transform: 'rotateX(-20deg) translateY(-5px)' }}
      >
        <div className={`p-1.5 rounded-lg bg-white/50 shadow-sm`}>
            <NextIcon className={`w-5 h-5 ${AGENT_CONFIG[next].iconColor}`} />
        </div>
        <div className="text-left">
            <span className="block text-[10px] font-bold text-charcoal/60 uppercase tracking-widest">{AGENT_CONFIG[next].name}</span>
            <span className="block text-[9px] text-charcoal/40 font-medium truncate max-w-[120px]">{AGENT_CONFIG[next].role}</span>
        </div>
      </button>

      {/* 우측 인디케이터 (수직형 하단) */}
      <div className="flex gap-2 mt-4">
        {AGENT_CONFIG.map((agent, i) => (
          <button
            key={agent.id}
            onClick={() => handleSelect(i)}
            className="transition-all duration-300 rounded-full"
            style={
              i === localIndex
                ? { width: '24px', height: '6px', backgroundColor: 'var(--color-stage-green)' }
                : { width: '6px', height: '6px', backgroundColor: '#e2e8f0' }
            }
          />
        ))}
      </div>
    </div>
  );
}
