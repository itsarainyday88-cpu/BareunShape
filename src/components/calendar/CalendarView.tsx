'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAgent } from '@/context/AgentContext';
import { ChevronLeft, ChevronRight, Plus, Clock, FileText, CheckCircle, Trash2, X } from 'lucide-react';

type CalendarEntry = {
    id: string;
    work_date: string;
    agent_id: string;
    topic: string;
    status: string;
};

const AGENT_COLORS: Record<string, string> = {
    Blog: 'bg-[#725b37]/15 text-[#725b37]',
    Insta: 'bg-pink-100 text-pink-700',
    Threads: 'bg-[#e5e2dd] text-[#4d463c]',
    Shortform: 'bg-violet-100 text-violet-700',
    Marketer: 'bg-amber-100 text-amber-700',
};

const AGENT_DOT: Record<string, string> = {
    Blog: 'bg-[#725b37]',
    Insta: 'bg-pink-500',
    Threads: 'bg-[#4d463c]',
    Shortform: 'bg-violet-500',
    Marketer: 'bg-amber-500',
};

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

export default function CalendarView() {
    const [entries, setEntries] = useState<CalendarEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [today] = useState(new Date());
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [isCreating, setIsCreating] = useState(false);
    const [newDate, setNewDate] = useState('');
    const [selectedAgents, setSelectedAgents] = useState<string[]>(['Blog']);
    const [newTopic, setNewTopic] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const { setActiveAgent, setCurrentView, setSelectedTopic } = useAgent();

    useEffect(() => { fetchCalendar(); }, []);

    const fetchCalendar = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from('calendar').select('*').order('work_date', { ascending: true });
            if (error) throw error;
            setEntries(data || []);
        } catch (error: any) {
            console.error('Error:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newDate || !newTopic || selectedAgents.length === 0) return;
        try {
            const { error } = await supabase.from('calendar').insert(
                selectedAgents.map(agent => ({ work_date: newDate, agent_id: agent, topic: newTopic, status: 'planned' }))
            );
            if (error) throw error;
            setIsCreating(false);
            setNewTopic('');
            setSelectedAgents(['Blog']);
            fetchCalendar();
        } catch { alert('일정 등록에 실패했습니다.'); }
    };

    const handleStartWork = (agentId: string, topic: string) => {
        setSelectedTopic(topic);
        setActiveAgent(agentId as any);
        setCurrentView('chat');
    };

    const confirmDelete = async () => {
        if (!deleteTargetId) return;
        try {
            const { error } = await supabase.from('calendar').delete().eq('id', deleteTargetId);
            if (error) throw error;
            fetchCalendar();
        } catch { alert('삭제에 실패했습니다.'); }
        finally {
            setShowDeleteModal(false);
            setDeleteTargetId(null);
        }
    };

    // Calendar grid calculation
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const monthLabel = `${year}년 ${month + 1}월`;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    // Monday-based week: getDay() 0=Sun→6, 1=Mon→0, ...
    const startOffset = (firstDay.getDay() + 6) % 7;
    const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;

    const cells: (number | null)[] = Array.from({ length: totalCells }, (_, i) => {
        const day = i - startOffset + 1;
        return day >= 1 && day <= lastDay.getDate() ? day : null;
    });

    const entriesForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return entries.filter(e => e.work_date === dateStr);
    };

    // Upcoming entries for right panel (sorted by date, next 10)
    const upcoming = [...entries]
        .filter(e => e.work_date >= today.toISOString().split('T')[0])
        .slice(0, 8);

    return (
        <div className="flex h-full bg-[#fcf9f4] overflow-hidden">
            {/* Calendar Area */}
            <div className="flex-1 flex flex-col overflow-y-auto p-8">
                {/* Header */}
                <div className="flex items-end justify-between mb-6">
                    <div>
                        <h2 className="font-['Playfair_Display'] italic text-3xl text-[#1c1c19]">마케팅 스케줄</h2>
                        <p className="font-['Space_Grotesk'] text-sm text-[#4d463c]/60 mt-1">{monthLabel}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewDate(new Date(year, month - 1, 1))}
                            className="w-8 h-8 flex items-center justify-center border border-[#d0c5b7]/40 text-[#4d463c] hover:bg-[#f0ede8] transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewDate(new Date(year, month + 1, 1))}
                            className="w-8 h-8 flex items-center justify-center border border-[#d0c5b7]/40 text-[#4d463c] hover:bg-[#f0ede8] transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Day Labels */}
                <div className="grid grid-cols-7 mb-1">
                    {DAY_LABELS.map(d => (
                        <div key={d} className="py-2 text-center font-['Space_Grotesk'] text-[10px] text-[#4d463c]/40 uppercase tracking-widest">{d}</div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 border-l border-t border-[#d0c5b7]/20">
                    {cells.map((day, i) => {
                        const dayEntries = day ? entriesForDay(day) : [];
                        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                        return (
                            <div
                                key={i}
                                className={`min-h-[90px] border-r border-b border-[#d0c5b7]/20 p-2 relative
                                    ${day ? 'bg-[#fcf9f4] hover:bg-[#f6f3ee] transition-colors cursor-pointer' : 'bg-[#f6f3ee]/30'}
                                    ${isToday ? 'bg-[#f0ede8]' : ''}`}
                                onClick={() => {
                                    if (day) {
                                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                        setNewDate(dateStr);
                                        setIsCreating(true);
                                    }
                                }}
                            >
                                {day && (
                                    <>
                                        <span className={`font-['Space_Grotesk'] text-xs ${isToday ? 'w-5 h-5 bg-[#725b37] text-white flex items-center justify-center text-[10px]' : 'text-[#4d463c]/60'}`}>
                                            {day}
                                        </span>
                                        <div className="mt-1 flex flex-col gap-0.5">
                                            {dayEntries.slice(0, 2).map(e => (
                                                <div
                                                    key={e.id}
                                                    onClick={(ev) => { ev.stopPropagation(); handleStartWork(e.agent_id, e.topic); }}
                                                    className={`text-[9px] font-['Space_Grotesk'] px-1 py-0.5 truncate ${AGENT_COLORS[e.agent_id] || 'bg-gray-100 text-gray-600'}`}
                                                >
                                                    {e.agent_id} ✦
                                                </div>
                                            ))}
                                            {dayEntries.length > 2 && (
                                                <span className="text-[8px] font-['Space_Grotesk'] text-[#4d463c]/40">+{dayEntries.length - 2}</span>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Panel: Automation */}
            <aside className="w-[320px] border-l border-[#1c1c19]/10 flex flex-col bg-[#f6f3ee] shrink-0 overflow-y-auto">
                <div className="p-6 pb-4">
                    <h3 className="font-['Playfair_Display'] italic text-xl text-[#1c1c19]">예정된 자동화</h3>
                </div>

                <div className="flex-1 px-4 flex flex-col gap-3">
                    {loading ? (
                        <p className="text-center font-['Space_Grotesk'] text-xs text-[#4d463c]/40 pt-8">불러오는 중...</p>
                    ) : upcoming.length === 0 ? (
                        <p className="text-center font-['Space_Grotesk'] text-xs text-[#4d463c]/40 pt-8">예정된 자동화가 없습니다.</p>
                    ) : (
                        upcoming.map(entry => (
                            <div key={entry.id} className="bg-[#fcf9f4] border border-[#d0c5b7]/20 p-4 group relative">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-1.5 h-1.5 ${AGENT_DOT[entry.agent_id] || 'bg-gray-400'}`} />
                                        <span className="font-['Space_Grotesk'] text-[9px] font-medium text-[#4d463c]/60 uppercase tracking-widest">
                                            {entry.agent_id} Agent
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="font-['Space_Grotesk'] text-[9px] text-[#4d463c]/40">{entry.work_date}</span>
                                        <button
                                            onClick={() => { setDeleteTargetId(entry.id); setShowDeleteModal(true); }}
                                            className="opacity-0 group-hover:opacity-100 p-0.5 text-[#4d463c]/30 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                <h4
                                    onClick={() => handleStartWork(entry.agent_id, entry.topic)}
                                    className="font-['Playfair_Display'] italic text-base text-[#1c1c19] leading-snug cursor-pointer hover:text-[#725b37] transition-colors mb-1"
                                >
                                    {entry.topic}
                                </h4>
                                <div className="flex items-center justify-between mt-2">
                                    {entry.status === 'planned' && (
                                        <span className="font-['Space_Grotesk'] text-[9px] px-2 py-0.5 border border-[#d0c5b7]/40 text-[#4d463c]/50 uppercase tracking-widest flex items-center gap-1">
                                            <Clock className="w-2.5 h-2.5" /> 계획됨
                                        </span>
                                    )}
                                    {entry.status === 'generated' && (
                                        <span className="font-['Space_Grotesk'] text-[9px] px-2 py-0.5 border border-[#725b37]/30 text-[#725b37] uppercase tracking-widest flex items-center gap-1">
                                            <FileText className="w-2.5 h-2.5" /> 원고완료
                                        </span>
                                    )}
                                    {entry.status === 'posted' && (
                                        <span className="font-['Space_Grotesk'] text-[9px] px-2 py-0.5 border border-green-300 text-green-600 uppercase tracking-widest flex items-center gap-1">
                                            <CheckCircle className="w-2.5 h-2.5" /> 발행됨
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Button */}
                <div className="p-4 pt-3">
                    <button
                        onClick={() => setIsCreating(true)}
                        className="w-full py-3 bg-[#725b37] text-white font-['Space_Grotesk'] text-xs tracking-[0.1em] uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-4 h-4" /> 새 자동화
                    </button>
                </div>
            </aside>

            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-[#1c1c19]/40 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-[#fcf9f4] w-full max-w-md mx-4 p-8 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-['Playfair_Display'] italic text-xl text-[#1c1c19]">새 자동화 일정</h3>
                            <button onClick={() => setIsCreating(false)} className="text-[#4d463c]/40 hover:text-[#1c1c19]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="font-['Space_Grotesk'] text-[10px] text-[#4d463c]/60 uppercase tracking-widest block mb-2">발행 예정일</label>
                                <input
                                    type="date"
                                    value={newDate}
                                    onChange={e => setNewDate(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[#f6f3ee] border border-[#d0c5b7]/40 text-sm font-['Space_Grotesk'] text-[#1c1c19] outline-none focus:border-[#725b37]/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="font-['Space_Grotesk'] text-[10px] text-[#4d463c]/60 uppercase tracking-widest block mb-2">작업 주제</label>
                                <input
                                    type="text"
                                    placeholder="예: 신학기 대비 내신 설명회 안내"
                                    value={newTopic}
                                    onChange={e => setNewTopic(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[#f6f3ee] border border-[#d0c5b7]/40 text-sm font-['Space_Grotesk'] text-[#1c1c19] placeholder:text-[#4d463c]/30 outline-none focus:border-[#725b37]/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="font-['Space_Grotesk'] text-[10px] text-[#4d463c]/60 uppercase tracking-widest block mb-2">담당 에이전트</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Blog', 'Insta', 'Shortform', 'Threads'].map(agent => (
                                        <button
                                            key={agent}
                                            onClick={() => setSelectedAgents(prev =>
                                                prev.includes(agent) ? (prev.length > 1 ? prev.filter(a => a !== agent) : prev) : [...prev, agent]
                                            )}
                                            className={`px-3 py-1.5 text-xs font-['Space_Grotesk'] uppercase tracking-wide border transition-all
                                                ${selectedAgents.includes(agent)
                                                    ? 'bg-[#725b37] text-white border-[#725b37]'
                                                    : 'bg-transparent text-[#4d463c] border-[#d0c5b7]/40 hover:border-[#725b37]/40'
                                                }`}
                                        >
                                            {agent}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setIsCreating(false)} className="flex-1 py-3 border border-[#d0c5b7]/40 text-[#4d463c] font-['Space_Grotesk'] text-xs uppercase tracking-wider hover:bg-[#f0ede8] transition-colors">
                                취소
                            </button>
                            <button onClick={handleCreate} className="flex-1 py-3 bg-[#725b37] text-white font-['Space_Grotesk'] text-xs uppercase tracking-wider hover:opacity-90 transition-opacity">
                                일정 저장
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-[#1c1c19]/40 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-[#fcf9f4] w-full max-w-sm mx-4 p-8 shadow-lg text-center">
                        <div className="w-12 h-12 bg-red-50 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="font-['Playfair_Display'] italic text-xl text-[#1c1c19] mb-2">일정 삭제</h3>
                        <p className="font-['Space_Grotesk'] text-xs text-[#4d463c]/60 leading-relaxed mb-8">선택하신 일정을 삭제하시겠습니까?<br />삭제된 데이터는 복구할 수 없습니다.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 border border-[#d0c5b7]/40 text-[#4d463c] font-['Space_Grotesk'] text-xs uppercase tracking-wider hover:bg-[#f0ede8] transition-colors">
                                취소
                            </button>
                            <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white font-['Space_Grotesk'] text-xs uppercase tracking-wider hover:bg-red-700 transition-colors">
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
