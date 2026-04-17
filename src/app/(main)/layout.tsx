'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    MessageSquare,
    Settings,
    LogOut,
    Calendar,
    Library,
    Code,
    CheckCircle,
    Users,
    LayoutDashboard,
    Sparkles,
    ShieldAlert,
    Search,
    Menu,
    ExternalLink,
    Play,
    AtSign
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AgentProvider, useAgent } from '@/context/AgentContext';
import AgentRotaryPicker from '@/components/agents/AgentRotaryPicker';

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
                        <h1 className="text-lg font-black tracking-tight text-charcoal">파인액터스 <span className="text-secondary font-black">Faire Click</span></h1>
                    </div>
                    <p className="text-xs text-charcoal/50 tracking-wider">Acting Academy Solution</p>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {/* View Mode Toggle */}
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

                {/* Agent Rotary Picker */}
                <AgentRotaryPicker />

                {/* System Status Dashboard */}
                {currentView === 'chat' && (
                    <div className="mt-12 p-5 rounded-2xl bg-secondary/5 border border-secondary/20 space-y-4">
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

                {/* Chrome Extension Install Button */}
                {currentView === 'chat' && (
                    <a
                        href="https://chromewebstore.google.com/detail/faire-click-marketing-aut/kfldgophlmpejmlgjapbbnemnkdffobo?authuser=0&hl=ko"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 flex items-center gap-4 p-4 rounded-2xl bg-white border border-sand/50 shadow-sm hover:shadow-md hover:border-secondary/30 transition-all group"
                    >
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <ExternalLink className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h5 className="text-[12px] font-black text-secondary tracking-tight">Faire Click 설치</h5>
                            <p className="text-[10px] text-foreground/40 font-medium truncate">마케팅 자동화 확장프로그램</p>
                        </div>
                    </a>
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

                {/* Main Content */}
                <main className="flex-1 flex flex-col relative bg-primary overflow-hidden">
                    <Header />
                    <div className="flex-1 flex flex-col pt-16 min-h-0 overflow-hidden">
                        {children}
                    </div>
                </main>
            </div>
        </AgentProvider>
    );
}
