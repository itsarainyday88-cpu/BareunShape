'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, FileText, Download, Trash2, Send, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Document = {
    id: string;
    agent_id: string;
    content: string;
    created_at: string;
    title?: string;
};

export default function ArchiveView() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [docListWidth, setDocListWidth] = useState(360);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const savedWidth = localStorage.getItem('archiveDocListWidth');
        if (savedWidth) setDocListWidth(parseInt(savedWidth));
    }, []);

    const startResizing = useCallback(() => setIsResizing(true), []);
    const stopResizing = useCallback(() => setIsResizing(false), []);

    const resize = useCallback((e: MouseEvent) => {
        if (isResizing && containerRef.current) {
            const newWidth = e.clientX - containerRef.current.getBoundingClientRect().left;
            if (newWidth > 200 && newWidth < 600) {
                setDocListWidth(newWidth);
                localStorage.setItem('archiveDocListWidth', newWidth.toString());
            }
        }
    }, [isResizing]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    useEffect(() => { fetchDocuments(); }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setDocuments(data || []);
        } catch (error: any) {
            console.error('Error fetching docs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('문서를 영구 삭제하시겠습니까?')) return;
        try {
            const { error } = await supabase.from('documents').delete().eq('id', id);
            if (error) throw error;
            if (selectedDoc?.id === id) setSelectedDoc(null);
            fetchDocuments();
        } catch { alert('삭제 실패'); }
    };

    const handleDownload = (doc: Document) => {
        const el = document.createElement('a');
        el.href = URL.createObjectURL(new Blob([doc.content], { type: 'text/markdown' }));
        el.download = `Archive_${doc.agent_id}_${new Date(doc.created_at).toLocaleDateString()}.md`;
        document.body.appendChild(el);
        el.click();
    };

    const handleUpload = async (doc: Document, platform: 'NaverBlog' | 'Instagram' | 'Threads') => {
        const strip = (t: string) => t.replace(/^#+\s+/gm, '').replace(/(\*\*|__)(.*?)\1/g, '$2').replace(/(\*|_)(.*?)\1/g, '$2').replace(/\[(.*?)\]\(.*?\)/g, '$1').replace(/^>\s+/gm, '').replace(/^\s*[-*+]\s+/gm, '').replace(/^\s*\d+\.\s+/gm, '').trim();
        const body = doc.content.split(/🚦|🚥|Compliance Check/i)[0].trim();
        let type = '', data: any = {};
        if (platform === 'NaverBlog') {
            type = 'FAIRECLICK_UPLOAD_NAVER';
            let title = doc.content.split('\n').find(l => l.startsWith('# '))?.replace(/^# /, '') || '보관함 포스팅';
            data = { title, content: strip(body), blocks: [{ type: 'text', content: strip(body) }] };
        } else if (platform === 'Instagram') {
            type = 'FAIRECLICK_UPLOAD_INSTA';
            data = { caption: strip(body), blocks: [] };
        } else {
            type = 'FAIRECLICK_UPLOAD_THREADS';
            data = { content: body };
        }
        try {
            const res = await fetch('/api/handoff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, data }) });
            const { id } = await res.json();
            if (id) window.open(`/handoff?id=${id}`, '_blank', 'noreferrer,noopener');
        } catch { alert('데이터 전송 중 오류가 발생했습니다.'); }
    };

    const filteredDocs = documents.filter(doc =>
        doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.agent_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div ref={containerRef} className="flex h-full bg-[#fcf9f4] overflow-hidden">
            {/* Document List */}
            <aside className="flex flex-col border-r border-[#1c1c19]/10 bg-[#f6f3ee] relative shrink-0" style={{ width: `${docListWidth}px` }}>
                {/* Resizer */}
                <div
                    onMouseDown={startResizing}
                    className={`absolute right-0 top-0 w-1.5 h-full cursor-col-resize z-20 ${isResizing ? 'bg-[#725b37]/20' : 'hover:bg-[#725b37]/10'}`}
                />

                {/* Search */}
                <div className="p-4 border-b border-[#1c1c19]/10">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4d463c]/40" />
                        <input
                            type="text"
                            placeholder="문서 내용 또는 에이전트 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-[#fcf9f4] border border-[#d0c5b7]/30 text-sm font-['Space_Grotesk'] text-[#1c1c19] placeholder:text-[#4d463c]/30 outline-none focus:border-[#725b37]/40 transition-all"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center font-['Space_Grotesk'] text-xs text-[#4d463c]/40 uppercase tracking-widest">불러오는 중...</div>
                    ) : documents.length === 0 ? (
                        <div className="p-8 text-center font-['Space_Grotesk'] text-xs text-[#4d463c]/40">저장된 문서가 없습니다.</div>
                    ) : (
                        filteredDocs.map((doc) => (
                            <div
                                key={doc.id}
                                onClick={() => setSelectedDoc(doc)}
                                className={`p-4 border-b border-[#1c1c19]/5 cursor-pointer transition-all group relative
                                    ${selectedDoc?.id === doc.id
                                        ? 'bg-[#fcf9f4] border-l-2 border-l-[#725b37]'
                                        : 'border-l-2 border-l-transparent hover:bg-[#ebe8e3]'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1.5">
                                    <span className="font-['Space_Grotesk'] text-[9px] font-medium px-1.5 py-0.5 bg-[#725b37]/10 text-[#725b37] uppercase tracking-widest">
                                        {doc.agent_id}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-['Space_Grotesk'] text-[9px] text-[#4d463c]/40">
                                            {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : ''}
                                        </span>
                                        <button
                                            onClick={(e) => handleDelete(doc.id, e)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-[#4d463c]/30 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                <h4 className="font-['Playfair_Display'] italic text-sm text-[#1c1c19] line-clamp-1 mb-1">
                                    {doc.content.split('\n')[0].replace(/[#*]/g, '').trim() || '제목 없음'}
                                </h4>
                                <p className="font-['Space_Grotesk'] text-[11px] text-[#4d463c]/50 line-clamp-2 leading-relaxed">
                                    {doc.content.substring(0, 100).replace(/\n/g, ' ')}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* Preview */}
            <div className="flex-1 overflow-y-auto">
                {selectedDoc ? (
                    <div className="h-full flex flex-col">
                        {/* Doc Header */}
                        <div className="px-8 py-5 border-b border-[#1c1c19]/10 bg-[#fcf9f4]/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-9 h-9 bg-[#f0ede8] flex items-center justify-center text-[#725b37]">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-['Playfair_Display'] italic text-base text-[#1c1c19]">작업 결과물 상세</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="font-['Space_Grotesk'] text-[9px] text-[#4d463c]/40">
                                            {selectedDoc.created_at ? new Date(selectedDoc.created_at).toLocaleString() : ''}
                                        </span>
                                        <span className="font-['Space_Grotesk'] text-[9px] px-1.5 py-0.5 bg-[#725b37]/10 text-[#725b37] uppercase tracking-widest">
                                            {selectedDoc.agent_id}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedDoc.agent_id === 'Blog' && (
                                    <button onClick={() => handleUpload(selectedDoc, 'NaverBlog')} className="px-3 py-1.5 bg-[#03C75A] text-white text-[10px] font-['Space_Grotesk'] tracking-wider uppercase flex items-center gap-1.5">
                                        <Send className="w-3 h-3" /> 네이버
                                    </button>
                                )}
                                {selectedDoc.agent_id === 'Insta' && (
                                    <button onClick={() => handleUpload(selectedDoc, 'Instagram')} className="px-3 py-1.5 bg-gradient-to-tr from-[#FFDC80] via-[#E1306C] to-[#5851DB] text-white text-[10px] font-['Space_Grotesk'] tracking-wider uppercase flex items-center gap-1.5">
                                        <Share2 className="w-3 h-3" /> 인스타
                                    </button>
                                )}
                                {selectedDoc.agent_id === 'Threads' && (
                                    <button onClick={() => handleUpload(selectedDoc, 'Threads')} className="px-3 py-1.5 bg-[#1c1c19] text-white text-[10px] font-['Space_Grotesk'] tracking-wider uppercase flex items-center gap-1.5">
                                        <Send className="w-3 h-3" /> 스레드
                                    </button>
                                )}
                                <button onClick={() => handleDownload(selectedDoc)} className="p-2 text-[#4d463c]/40 hover:text-[#725b37] transition-colors">
                                    <Download className="w-4 h-4" />
                                </button>
                                <button onClick={(e) => handleDelete(selectedDoc.id, e)} className="p-2 text-[#4d463c]/40 hover:text-red-600 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 p-8 prose prose-sm max-w-3xl mx-auto w-full font-['Space_Grotesk'] prose-headings:font-['Playfair_Display'] prose-headings:italic">
                            <ReactMarkdown>{selectedDoc.content}</ReactMarkdown>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="font-['Playfair_Display'] italic text-[80px] text-[#725b37]/20 leading-none select-none">II/</div>
                        <p className="font-['Space_Grotesk'] text-xs text-[#4d463c]/40 tracking-[0.1em] mt-4">보관함에서 확인하실 문서를 선택해 주세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
