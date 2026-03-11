'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    Users,
    MessageSquare,
    Settings,
    LogOut,
    LayoutDashboard,
    Sparkles,
    Calendar,
    Library,
    FileText,
    Share2,
    Instagram,
    ShieldAlert,
    Search,
    Code,
    TrendingUp,
    Menu,
    Video,
    CheckCircle,
    ExternalLink,
    Play,
    AtSign
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AgentProvider, useAgent } from '@/context/AgentContext';

// Sidebar separate component to consume context
function Sidebar() {
    const { activeAgent, setActiveAgent, currentView, setCurrentView } = useAgent();
    const [sidebarWidth, setSidebarWidth] = useState(400);
    const [isResizing, setIsResizing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const savedWidth = localStorage.getItem('sidebarWidth');
        if (savedWidth) setSidebarWidth(parseInt(savedWidth));
    }, []);

    const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback((mouseMoveEvent: MouseEvent) => {
        if (isResizing) {
            const newWidth = mouseMoveEvent.clientX;
            if (newWidth > 250 && newWidth < 800) {
                setSidebarWidth(newWidth);
                localStorage.setItem('sidebarWidth', newWidth.toString());
            }
        }
    }, [isResizing]);

    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const agents = [
        { id: 'Blog', name: 'Blog', role: '바른모양치과 전문 라이터', icon: FileText, color: 'text-green-600', bg: 'bg-green-50', desc: '임플란트/교정 전문 칼럼 및 블로그 컨텐츠 제작' },
        { id: 'Insta', name: 'Insta', role: '치과 비주얼 디렉터', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50', desc: '내원객 모집/병원 전경 중심의 카드뉴스 기획 및 프롬프트 생성' },
        { id: 'Shortform', name: 'Shortform', role: '컨텐츠/매크로 디렉터', icon: Video, color: 'text-purple-600', bg: 'bg-purple-50', desc: '유튜브 쇼츠/인스타 릴스용 대본 기획 및 전략 생성' },
        { id: 'Threads', name: 'Threads', role: '인사이트 디렉터', icon: AtSign, color: 'text-slate-900', bg: 'bg-slate-100', desc: '의료적 통찰을 담은 짧고 날카로운 스레드 타래 작성' },
        { id: 'Dang', name: 'Dang', role: '지역 커뮤니티 매니저', icon: Share2, color: 'text-orange-600', bg: 'bg-orange-50', desc: '지역 환자/내원객 커뮤니티(당근마켓) 홍보 및 소통' },
        { id: 'Supporter', name: 'Supporter', role: '내원객 상담 실장', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50', desc: '환자/내원객 진료/상담 문의 응대 스크립트 작성' },
        { id: 'Reputation', name: 'Reputation', role: '진료 후기 관리자', icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50', desc: '치과/진료 리뷰에 대한 맞춤형 답변 생성' },
        { id: 'Marketer', name: 'Marketer', role: '전략가 + 감시관', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', desc: '경쟁 치과 동향 분석 및 의료법/광고법 리스크 감시' },
    ];

    return (
        <aside
            className="flex flex-col border-r border-sand/30 bg-white/50 backdrop-blur-sm relative shrink-0"
            style={{ width: `${sidebarWidth}px` }}
        >
            {/* Drag Handle */}
            <div
                onMouseDown={startResizing}
                className={`absolute right-0 top-0 w-1.5 h-full cursor-col-resize transition-all z-20 flex items-center justify-center
                    ${isResizing ? 'bg-primary/20' : 'hover:bg-primary/10'}`}
            >
                <div className={`w-[2px] h-12 rounded-full transition-colors ${isResizing ? 'bg-primary' : 'bg-gray-200 group-hover:bg-gray-300'}`} />
            </div>
            <div className="p-6 border-b border-sand/30 flex justify-between items-center">
                <button
                    onClick={() => window.location.href = '/'}
                    className="text-left group hover:opacity-70 transition-opacity"
                    title="새로고침 (초기화)"
                >
                    <div className="flex flex-col gap-0.5">
                        <h1 className="text-lg font-black tracking-tight text-secondary">바른모양치과 <span className="text-primary font-black">마케팅 OS</span></h1>
                    </div>
                    <p className="text-xs text-secondary/60 tracking-wider">Dental Clinic Solution</p>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {/* View Mode Toggle (Chat vs Calendar) */}
                <div className="flex bg-sand/20 rounded-lg p-1 gap-1 mb-6">
                    <button
                        onClick={() => setCurrentView('chat')}
                        className={`flex-1 py-2 text-[11px] font-bold transition-all rounded-md flex items-center justify-center gap-1.5
                            ${currentView === 'chat' ? 'bg-white shadow text-foreground' : 'text-gray-500 hover:text-foreground'}`}
                    >
                        <MessageSquare className="w-3.5 h-3.5" /> 채팅
                    </button>
                    <button
                        onClick={() => setCurrentView('calendar')}
                        className={`flex-1 py-2 text-[11px] font-bold transition-all rounded-md flex items-center justify-center gap-1.5
                            ${currentView === 'calendar' ? 'bg-white shadow text-foreground' : 'text-gray-500 hover:text-foreground'}`}
                    >
                        <Calendar className="w-3.5 h-3.5" /> 캘린더
                    </button>
                    <button
                        onClick={() => setCurrentView('archive')}
                        className={`flex-1 py-2 text-[11px] font-bold transition-all rounded-md flex items-center justify-center gap-1.5
                            ${currentView === 'archive' ? 'bg-white shadow text-foreground' : 'text-gray-500 hover:text-foreground'}`}
                    >
                        <Library className="w-3.5 h-3.5" /> 보관함
                    </button>
                </div>

                <div className={`flex flex-col gap-3 transition-opacity ${currentView !== 'chat' ? 'opacity-40 pointer-events-none' : ''}`}>
                    {agents.map((agent) => (
                        <button
                            key={agent.id}
                            onClick={() => setActiveAgent(agent.id as any)}
                            className={`flex items-center gap-5 p-5 rounded-2xl border transition-all text-left group relative
                                ${activeAgent === agent.id
                                    ? 'bg-secondary text-primary border-secondary shadow-xl scale-[1.02] ring-4 ring-secondary/10'
                                    : 'bg-white border-sand/40 hover:border-secondary/50 hover:bg-sand/5 text-foreground shadow-sm'
                                }
                            `}
                        >
                            <div className={`p-3 rounded-xl shrink-0 transition-colors shadow-inner
                                ${activeAgent === agent.id ? 'bg-white/20' : `${agent.bg} ${agent.color}`} `}>
                                <agent.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="font-black text-[17px] tracking-tight leading-tight">{agent.name}</h3>
                                    {activeAgent === agent.id && (
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        </div>
                                    )}
                                </div>
                                <p className={`text-[12px] font-medium mt-1.5 truncate ${activeAgent === agent.id ? 'text-primary/90' : 'text-foreground/40'}`}>
                                    {agent.role}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* 🛡️ Strategy Status Dashboard Box */}
                {currentView === 'chat' && (
                    <div className="mt-10 p-5 rounded-2xl bg-secondary/5 border border-secondary/20 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[11px] font-black text-secondary/60 uppercase tracking-widest flex items-center gap-2">
                                <Code className="w-3 h-3" /> System Status
                            </h4>
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">READY</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-foreground/50 font-medium">Phase 1 Insight</span>
                                <span className="text-secondary font-bold flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-green-500" /> Synced
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-foreground/50 font-medium">Legal Filter</span>
                                <span className="text-secondary font-bold flex items-center gap-1 text-[10px]">ACTIVE</span>
                            </div>
                            <div className="pt-2 border-t border-secondary/10">
                                <p className="text-[10px] text-foreground/40 leading-relaxed italic">
                                    "독보적인 지적 자산을 모든 플랫폼에 일관되게 동기화 중입니다."
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-sand/30 bg-white/30">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 transition-colors font-medium text-sm"
                >
                    <LogOut className="w-4 h-4" /> 로그아웃
                </button>
            </div>
        </aside>
    );
}

function Header() {
    const { activeAgent } = useAgent();
    return (
        <div className="absolute top-0 inset-x-0 z-10 p-4 bg-white/80 backdrop-blur border-b border-sand/30 flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="font-mono text-sm font-semibold text-foreground uppercase">
                    활성: {activeAgent} 에이전트
                </span>
            </div>
            <div className="flex gap-2">


            </div>
        </div>
    );
}


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AgentProvider>
            <div className="flex h-screen bg-primary overflow-hidden">
                <Sidebar />

                {/* Main Content (Right Panel - 60%) */}
                <main className="flex-1 flex flex-col relative bg-primary overflow-hidden">
                    <Header />
                    {/* Chat Area - Added min-h-0 to allow scrolling within children */}
                    <div className="flex-1 flex flex-col pt-16 min-h-0 overflow-hidden">
                        {children}
                    </div>
                </main>
            </div>
        </AgentProvider>
    );
}
