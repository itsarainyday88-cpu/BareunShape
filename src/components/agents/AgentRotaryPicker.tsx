'use client';

import React from 'react';
import { FileText, Instagram, Share2, Video, TrendingUp, ExternalLink, Code, CheckCircle } from 'lucide-react';
import { useAgent } from '@/context/AgentContext';
import type { AgentId } from '@/context/AgentContext';

const AGENT_CONFIG = [
    {
        id: 'Blog' as AgentId,
        name: 'Blog',
        role: '파인액터스 전문 라이터',
        icon: FileText,
        glyph: '✦',
    },
    {
        id: 'Insta' as AgentId,
        name: 'Insta',
        role: '연기학원 비주얼 디렉터',
        icon: Instagram,
        glyph: '◎',
    },
    {
        id: 'Threads' as AgentId,
        name: 'Threads',
        role: '인사이트 디렉터',
        icon: Share2,
        glyph: '◎',
    },
    {
        id: 'Shortform' as AgentId,
        name: 'Shortform',
        role: '숏폼 / 릴스 디렉터',
        icon: Video,
        glyph: '◎',
    },
    {
        id: 'Marketer' as AgentId,
        name: 'Marketer',
        role: '전략가 + 감시관',
        icon: TrendingUp,
        glyph: '◎',
    },
] as const;

export default function AgentListPanel() {
    const { activeAgent, setActiveAgent } = useAgent();

    return (
        <aside className="w-[280px] bg-[#f6f3ee] border-r border-[#1c1c19]/10 flex flex-col h-full shrink-0 overflow-y-auto">
            {/* Header */}
            <div className="p-6 pb-3">
                <h2 className="font-['Playfair_Display'] italic text-2xl text-[#1c1c19] tracking-tight">에이전트 선택</h2>
            </div>

            {/* Agent List */}
            <div className="flex-1 flex flex-col gap-0.5 px-3 pb-4">
                {AGENT_CONFIG.map((agent) => {
                    const Icon = agent.icon;
                    const isActive = activeAgent === agent.id;
                    return (
                        <button
                            key={agent.id}
                            onClick={() => setActiveAgent(agent.id)}
                            className={`w-full text-left p-4 flex items-start gap-4 group transition-colors duration-200
                                ${isActive
                                    ? 'bg-[#fcf9f4] border-l-2 border-[#725b37]'
                                    : 'border-l-2 border-transparent hover:bg-[#ebe8e3]'
                                }`}
                        >
                            <div className={`w-9 h-9 flex items-center justify-center shrink-0 mt-0.5 transition-colors
                                ${isActive ? 'bg-[#725b37]/10 text-[#725b37]' : 'bg-[#e5e2dd] text-[#4d463c] group-hover:text-[#725b37]'}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className={`text-xs transition-colors ${isActive ? 'text-[#725b37]' : 'text-[#4d463c]/40 group-hover:text-[#725b37]'}`}>
                                        {isActive ? '✦' : agent.glyph}
                                    </span>
                                    <span className={`font-['Playfair_Display'] italic text-base leading-tight transition-colors
                                        ${isActive ? 'text-[#1c1c19]' : 'text-[#1c1c19]/70'}`}>
                                        {agent.name}
                                    </span>
                                    {isActive && (
                                        <span className="font-['Space_Grotesk'] text-[9px] font-medium px-1.5 py-0.5 bg-[#725b37] text-white uppercase tracking-widest">
                                            {agent.id}
                                        </span>
                                    )}
                                </div>
                                <p className={`font-['Space_Grotesk'] text-[11px] tracking-wide leading-snug transition-colors
                                    ${isActive ? 'text-[#4d463c]' : 'text-[#4d463c]/50'}`}>
                                    {agent.role}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* System Status */}
            <div className="mx-4 mb-3 p-4 bg-[#f0ede8] border border-[#d0c5b7]/20">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-['Space_Grotesk'] text-[10px] font-medium text-[#4d463c]/60 uppercase tracking-widest flex items-center gap-1.5">
                        <Code className="w-3 h-3" /> System Status
                    </h4>
                    <span className="font-['Space_Grotesk'] text-[9px] border border-[#d0c5b7]/40 text-[#725b37] px-1.5 py-0.5 uppercase tracking-widest">READY</span>
                </div>
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                        <span className="font-['Space_Grotesk'] text-[10px] text-[#4d463c]/60">Phase 1 Insight</span>
                        <span className="font-['Space_Grotesk'] text-[10px] text-[#725b37] flex items-center gap-1">
                            <CheckCircle className="w-2.5 h-2.5" /> Synced
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="font-['Space_Grotesk'] text-[10px] text-[#4d463c]/60">Legal Filter</span>
                        <span className="font-['Space_Grotesk'] text-[9px] text-[#725b37] uppercase tracking-widest">ACTIVE</span>
                    </div>
                    <div className="pt-2 border-t border-[#d0c5b7]/20">
                        <p className="font-['Playfair_Display'] italic text-[10px] text-[#4d463c]/50 leading-relaxed">
                            "독보적인 지적 자산을 모든 플랫폼에 일관되게 동기화 중입니다."
                        </p>
                    </div>
                </div>
            </div>

            {/* Chrome Extension */}
            <a
                href="https://chromewebstore.google.com/detail/faire-click-marketing-aut/kfldgophlmpejmlgjapbbnemnkdffobo?authuser=0&hl=ko"
                target="_blank"
                rel="noopener noreferrer"
                className="mx-4 mb-6 flex items-center gap-3 p-3 border border-[#d0c5b7]/30 hover:border-[#725b37]/30 bg-[#fcf9f4] transition-all group"
            >
                <div className="p-2 bg-[#f0ede8] text-[#725b37] group-hover:bg-[#725b37] group-hover:text-white transition-colors shrink-0">
                    <ExternalLink className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                    <p className="font-['Playfair_Display'] italic text-sm text-[#1c1c19]">Faire Click 설치</p>
                    <p className="font-['Space_Grotesk'] text-[9px] tracking-[0.08em] uppercase text-[#4d463c]/50 truncate">마케팅 자동화 확장프로그램</p>
                </div>
            </a>
        </aside>
    );
}
