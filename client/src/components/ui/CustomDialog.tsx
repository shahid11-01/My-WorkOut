import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    description?: string;
    // Tailwind class for maximum width, e.g., 'max-w-md'
    maxWidthClass?: string; 
}

export function CustomDialog({ 
    isOpen, 
    onClose, 
    title, 
    description,
    children, 
    maxWidthClass = 'max-w-md' 
}: DialogProps) {
    if (!isOpen) return null;

    return (
        // Modal Overlay (Fixed, dark background)
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4"
            onClick={onClose} // Close on backdrop click
        >
            {/* Modal Content (Stops clicks from bubbling up to close the modal) */}
            <div 
                className={`bg-white rounded-xl shadow-2xl w-full ${maxWidthClass}`}
                onClick={(e) => e.stopPropagation()} 
                role="dialog"
                aria-modal="true"
                aria-labelledby="dialog-title"
            >
                {/* Header */}
                <div className="p-6 border-b">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                            <h2 id="dialog-title" className="text-xl font-semibold text-gray-900">{title}</h2>
                            {description && (
                                <p className="text-sm text-gray-500 mt-1">{description}</p>
                            )}
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}