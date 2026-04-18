'use client';

import React, { useState } from 'react';
import { LogOut, HelpCircle, Sparkles, Archive, CalendarDays, X, FileText, Instagram, Share2, Video, TrendingUp, CalendarCheck, Library } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AgentProvider, useAgent } from '@/context/AgentContext';

const HELP_SECTIONS = [
    {
        icon: FileText,
        agent: 'Blog',
        color: 'text-[#725b37]',
        bg: 'bg-[#f0ede8]',
        title: 'Blog 에이전트',
        desc: '네이버 블로그 전용 원고 작성기',
        tips: [
            '"[주제] 관련 블로그 글 써줘" 형식으로 요청',
            '작성 완료 후 🚀 네이버 업로드 버튼으로 바로 발행',
            '키워드를 함께 제공하면 SEO 최적화 반영',
        ],
    },
    {
        icon: Instagram,
        agent: 'Insta',
        color: 'text-pink-600',
        bg: 'bg-pink-50',
        title: 'Insta 에이전트',
        desc: '인스타그램 카드뉴스 + 캡션 생성',
        tips: [
            '"[주제] 인스타 카드뉴스 만들어줘" 형식 권장',
            '이미지 생성 후 🚀 인스타 업로드로 캡션 자동 복사',
            '슬라이드 수(3장/5장 등) 명시하면 더 정확하게 생성',
        ],
    },
    {
        icon: Share2,
        agent: 'Threads',
        color: 'text-[#4d463c]',
        bg: 'bg-[#e5e2dd]',
        title: 'Threads 에이전트',
        desc: '스레드 타래 형식 콘텐츠 작성',
        tips: [
            '"[주제] 스레드 타래로 써줘" 형식 권장',
            '1~5번 타래 구조로 자동 분절',
            '🚀 스레드 업로드로 Faire Click 확장프로그램에 전달',
        ],
    },
    {
        icon: Video,
        agent: 'Shortform',
        color: 'text-violet-600',
        bg: 'bg-violet-50',
        title: 'Shortform 에이전트',
        desc: '릴스/쇼츠용 대본 작성',
        tips: [
            '"[주제] 60초 릴스 대본 써줘" 형식 권장',
            '오프닝 → 본문 → 클로징 구조로 자동 구성',
            '📋 대본 복사 버튼으로 클립보드 복사 후 직접 촬영',
        ],
    },
    {
        icon: TrendingUp,
        agent: 'Marketer',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        title: 'Marketer 에이전트',
        desc: '콘텐츠 전략 기획 및 다른 에이전트 연결',
        tips: [
            '"이번 달 마케팅 전략 짜줘" 형식으로 큰 그림 요청',
            '결과물 하단 버튼으로 Blog/Insta/Shortform/Threads에 바로 전달',
            '캘린더 일정과 연동해 자동 콘텐츠 생성 트리거 가능',
        ],
    },
    {
        icon: CalendarCheck,
        agent: null,
        color: 'text-[#725b37]',
        bg: 'bg-[#f0ede8]',
        title: '스케줄 (캘린더)',
        desc: '예약 발행 및 자동화 일정 관리',
        tips: [
            '날짜 셀 클릭 → 새 자동화 일정 등록',
            '우측 패널 일정 제목 클릭 → 해당 에이전트로 즉시 이동',
            '매일 오전 9시 예약 항목 자동 실행 (Autopilot ON)',
        ],
    },
    {
        icon: Library,
        agent: null,
        color: 'text-[#725b37]',
        bg: 'bg-[#f0ede8]',
        title: '보관함 (Archive)',
        desc: '저장된 콘텐츠 열람 및 재발행',
        tips: [
            '에이전트가 생성한 모든 원고가 자동 저장',
            '문서 선택 후 네이버/인스타/스레드 버튼으로 재발행 가능',
            '우측 상단 다운로드 버튼으로 .md 파일 저장',
        ],
    },
];

function HelpModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-[#1c1c19]/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-[#fcf9f4] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-end justify-between px-8 pt-8 pb-5 border-b border-[#1c1c19]/10 shrink-0">
                    <div>
                        <h2 className="font-['Playfair_Display'] italic text-2xl text-[#1c1c19]">사용 가이드</h2>
                        <p className="font-['Space_Grotesk'] text-[10px] tracking-[0.15em] uppercase text-[#4d463c]/50 mt-1">Faire Click · 파인액터스연기학원</p>
                    </div>
                    <button onClick={onClose} className="text-[#4d463c]/40 hover:text-[#1c1c19] transition-colors mb-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1 px-8 py-6 space-y-5">
                    {HELP_SECTIONS.map((section) => {
                        const Icon = section.icon;
                        return (
                            <div key={section.title} className="flex gap-4">
                                <div className={`w-9 h-9 ${section.bg} ${section.color} flex items-center justify-center shrink-0 mt-0.5`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <h3 className="font-['Playfair_Display'] italic text-base text-[#1c1c19]">{section.title}</h3>
                                        <span className="font-['Space_Grotesk'] text-[10px] text-[#4d463c]/40">{section.desc}</span>
                                    </div>
                                    <ul className="space-y-1">
                                        {section.tips.map((tip, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="text-[#725b37]/50 mt-0.5 text-xs shrink-0">◎</span>
                                                <span className="font-['Space_Grotesk'] text-xs text-[#4d463c] leading-relaxed">{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-[#1c1c19]/10 shrink-0">
                    <p className="font-['Space_Grotesk'] text-[10px] text-[#4d463c]/40 tracking-[0.05em]">
                        문의: 관리자 문의 · 파인액터스연기학원 관계자 전용 시스템
                    </p>
                </div>
            </div>
        </div>
    );
}

function NavSidebar() {
    const { currentView, setCurrentView } = useAgent();
    const [showHelp, setShowHelp] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const navItems = [
        { view: 'chat' as const, glyph: '✦', label: '대시보드' },
        { view: 'archive' as const, glyph: '◎', label: '보관함' },
        { view: 'calendar' as const, glyph: '↗', label: '스케줄' },
    ];

    return (
        <>
            <nav className="h-screen w-[230px] fixed left-0 top-0 border-r border-[#1c1c19]/10 bg-[#fcf9f4] flex flex-col py-8 px-6 z-50">
                {/* Brand */}
                <div className="mb-10">
                    <h1 className="font-['Playfair_Display'] text-lg font-bold text-[#1c1c19] leading-tight">파인액터스 <span className="text-[#725b37]">연기학원</span></h1>
                    <p className="font-['Space_Grotesk'] tracking-[0.12em] uppercase text-[9px] text-[#4d463c]/60 mt-1">Acting Academy Solution</p>
                </div>

                {/* Main Nav */}
                <div className="flex-1 flex flex-col gap-1">
                    {navItems.map(({ view, glyph, label }) => (
                        <button
                            key={view}
                            onClick={() => setCurrentView(view)}
                            className={`flex items-center gap-4 py-3 px-4 text-left transition-colors duration-200
                                ${currentView === view
                                    ? 'text-[#725b37] border-r-2 border-[#725b37] font-medium'
                                    : 'text-[#1c1c19]/50 hover:text-[#1c1c19] hover:bg-[#f0ede8]'
                                }`}
                        >
                            <span className="text-base w-4 text-center">{glyph}</span>
                            <span className="font-['Space_Grotesk'] tracking-[0.08em] uppercase text-xs">{label}</span>
                        </button>
                    ))}
                </div>

                {/* Footer Nav */}
                <div className="flex flex-col gap-1 pt-6 border-t border-[#1c1c19]/10">
                    <button
                        onClick={() => setShowHelp(true)}
                        className="flex items-center gap-4 py-3 px-4 text-[#1c1c19]/40 hover:text-[#1c1c19] hover:bg-[#f0ede8] transition-colors duration-200"
                    >
                        <HelpCircle className="w-4 h-4" />
                        <span className="font-['Space_Grotesk'] tracking-[0.08em] uppercase text-xs">도움말</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 py-3 px-4 text-[#1c1c19]/40 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="font-['Space_Grotesk'] tracking-[0.08em] uppercase text-xs">로그아웃</span>
                    </button>
                </div>
            </nav>

            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
        </>
    );
}

function TopHeader() {
    return (
        <header className="fixed top-0 right-0 left-[230px] h-14 z-40 bg-[#fcf9f4]/90 backdrop-blur-xl border-b border-[#1c1c19]/10 flex items-center px-10">
            <span className="font-['Playfair_Display'] italic text-base text-[#1c1c19]/70">Faire Click</span>
        </header>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AgentProvider>
            <div className="flex h-screen bg-[#fcf9f4] overflow-hidden">
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-['Playfair_Display'] italic text-[18vw] text-[#1c1c19] opacity-[0.022] pointer-events-none z-0 select-none">
                    ATELIER
                </div>
                <NavSidebar />
                <TopHeader />
                <main className="ml-[230px] mt-14 flex-1 h-[calc(100vh-3.5rem)] overflow-hidden relative z-10">
                    {children}
                </main>
            </div>
        </AgentProvider>
    );
}
