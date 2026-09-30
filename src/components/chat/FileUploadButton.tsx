import React, { useState } from "react";
import { Paperclip, X, Loader2 } from "lucide-react";
import { puter } from "@heyputer/puter.js";

interface PickedFile {
    url: string;
    name: string;
    type: string;
}

interface FileUploadButtonProps {
    onUpload: (file: PickedFile) => void;
    onRemove: () => void;
    currentFile: PickedFile | null;
}

const MAX_BYTES = 10 * 1024 * 1024;

const FileUploadButton: React.FC<FileUploadButtonProps> = ({
    onUpload,
    onRemove,
    currentFile,
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Only images for now.");
            return;
        }

        if (file.size > MAX_BYTES) {
            setError("That image is too big.");
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            // Puter storage gives us a public URL the Worker can fetch.
            const uploaded = await puter.fs.write(file.name, file);
            const url = await puter.fs.getReadURL(uploaded.path);
            onUpload({ url, name: file.name, type: file.type });
        } catch (err) {
            console.error("Upload failed:", err);
            setError("That didn't upload. Try again.");
        } finally {
            setIsUploading(false);
        }
    };

    if (currentFile) {
        return (
            <div className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-lg border border-[var(--ryta-border)] bg-[var(--ryta-surface-raised)] max-w-[180px]">
                <span className="text-[11px] text-[var(--ryta-text-muted)] truncate">
                    {currentFile.name}
                </span>
                <button
                    type="button"
                    onClick={() => {
                        onRemove();
                        setError(null);
                    }}
                    title="Take it back"
                    aria-label="Remove attachment"
                    className="shrink-0 p-0.5 rounded-full text-[var(--ryta-text-subtle)] hover:text-[var(--ryta-text)] transition-colors"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5">
            <label className="cursor-pointer">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isUploading}
                />
                <span
                    title="Share something"
                    aria-label="Share something"
                    aria-busy={isUploading}
                    className={`flex p-1.5 rounded-full transition-colors ${
                        isUploading
                            ? "text-[var(--ryta-text-subtle)]"
                            : "text-[var(--ryta-text-subtle)] hover:text-[var(--ryta-text)] hover:bg-[var(--ryta-surface-raised)]"
                    }`}
                >
                    {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Paperclip className="w-4 h-4" />
                    )}
                </span>
            </label>

            {error && (
                <span className="text-[10px] text-[var(--ryta-text-subtle)]">
                    {error}
                </span>
            )}
        </div>
    );
};

export default FileUploadButton;
