import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    description?: string;
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
        // Modal Overlay
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
            {/* Modal Content */}
            <div 
                className={`bg-white rounded-2xl shadow-2xl  w-full ${maxWidthClass} transform transition-all`}
                onClick={(e) => e.stopPropagation()} 
                role="dialog"
                aria-modal="true"
                aria-labelledby="dialog-title"
            >
                {/* Header - NO BORDER */}
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                            <h2 id="dialog-title" className="text-2xl font-bold text-gray-900">{title}</h2>
                            {description && (
                                <p className="text-sm text-gray-500 mt-1">{description}</p>
                            )}
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 transform hover:scale-110"
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