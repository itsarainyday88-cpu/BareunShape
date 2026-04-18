'use client';

import { useAgent } from '@/context/AgentContext';
import AgentListPanel from '@/components/agents/AgentRotaryPicker';
import ChatInterface from '@/components/agents/ChatInterface';
import CalendarView from '@/components/calendar/CalendarView';
import ArchiveView from '@/components/archive/ArchiveView';

export default function MainPage() {
    const { currentView } = useAgent();

    if (currentView === 'archive') return <ArchiveView />;
    if (currentView === 'calendar') return <CalendarView />;

    return (
        <div className="flex h-full">
            <AgentListPanel />
            <ChatInterface />
        </div>
    );
}
