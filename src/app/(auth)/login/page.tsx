'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, remember }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');
            router.push('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0ede8] relative overflow-hidden">
            {/* Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-['Playfair_Display'] italic text-[22vw] text-[#1c1c19] opacity-[0.04] pointer-events-none select-none whitespace-nowrap z-0">
                Excellence
            </div>

            {/* Card */}
            <div className="relative z-10 w-full max-w-[420px] bg-white shadow-sm px-12 py-14">
                {/* Brand */}
                <div className="mb-10">
                    <h1 className="font-['Playfair_Display'] text-[28px] font-bold text-[#1c1c19] leading-tight">
                        파인액터스 <span className="text-[#725b37]">연기학원</span>
                    </h1>
                    <p className="font-['Playfair_Display'] italic text-xl text-[#4d463c] mt-1">Faire Click</p>
                    <p className="font-['Space_Grotesk'] tracking-[0.2em] uppercase text-[10px] text-[#4d463c]/60 mt-2">Acting Academy Solution</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 border-l-2 border-red-600 bg-red-50 text-red-700 text-xs font-['Space_Grotesk'] tracking-wide">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block font-['Space_Grotesk'] text-xs text-[#4d463c] tracking-[0.05em] mb-2">아이디</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="fineactors"
                            className="w-full px-4 py-3 bg-[#f6f3ee] border border-[#d0c5b7]/40 text-[#1c1c19] text-sm font-['Space_Grotesk'] outline-none focus:border-[#725b37]/50 focus:bg-white transition-all placeholder:text-[#4d463c]/30"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-['Space_Grotesk'] text-xs text-[#4d463c] tracking-[0.05em] mb-2">비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••"
                            className="w-full px-4 py-3 bg-[#f6f3ee] border border-[#d0c5b7]/40 text-[#1c1c19] text-sm font-['Space_Grotesk'] outline-none focus:border-[#725b37]/50 focus:bg-white transition-all placeholder:text-[#4d463c]/30"
                            required
                        />
                        <div className="flex items-center justify-between mt-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                    />
                                    <div className="w-4 h-4 border border-[#d0c5b7] bg-white peer-checked:bg-[#725b37] peer-checked:border-[#725b37] transition-all" />
                                    <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <span className="font-['Space_Grotesk'] text-xs text-[#4d463c]">자동 로그인</span>
                            </label>
                            <Link href="/forgot-password" className="font-['Space_Grotesk'] text-xs text-[#4d463c]/60 hover:text-[#725b37] transition-colors">
                                비밀번호 찾기
                            </Link>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-[#1c1c19] text-white font-['Space_Grotesk'] text-sm tracking-[0.1em] uppercase flex items-center justify-center gap-2 hover:bg-[#2d2d2a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <>로그인 →</>}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <span className="font-['Space_Grotesk'] text-xs text-[#4d463c]/50">계정이 없으신가요?&nbsp;</span>
                    <Link href="/register" className="font-['Space_Grotesk'] text-xs font-semibold text-[#1c1c19] hover:text-[#725b37] transition-colors">
                        회원가입
                    </Link>
                </div>

                <div className="mt-10 pt-6 border-t border-[#d0c5b7]/20 text-center">
                    <p className="font-['Space_Grotesk'] text-[10px] text-[#4d463c]/40 tracking-[0.05em]">파인액터스연기학원 관계자 전용</p>
                </div>
            </div>
        </div>
    );
}
