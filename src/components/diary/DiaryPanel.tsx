import React from "react";
import { BookOpen } from "lucide-react";

const DiaryPanel: React.FC = () => {
    return (
        <div className="ryta-panel">
            <header className="ryta-panel-header">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[var(--ryta-primary)]" />
                    <h2 className="ryta-panel-title">My Diary</h2>
                </div>
            </header>
            <div className="ryta-panel-body flex items-center justify-center text-sm text-[var(--ryta-text-muted)]">
                Coming in the next phase…
            </div>
        </div>
    );
};

export default DiaryPanel;