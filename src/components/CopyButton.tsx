import React, { useState } from 'react';

interface CopyButtonProps {
    text: string;
    className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text, className }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`${className} material-symbols-outlined`}
            style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0 0.5rem',
                fontSize: '1.2rem',
                verticalAlign: 'middle',
                color: copied ? 'var(--color-success, #4caf50)' : 'var(--color-text-light)',
                transition: 'color 0.2s',
            }}
            title="クリックしてコピー"
        >
            {copied ? 'check' : 'content_copy'}
        </button>
    );
};
