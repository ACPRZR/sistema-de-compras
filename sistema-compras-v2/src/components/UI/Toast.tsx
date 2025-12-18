import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type = 'info', onClose, duration = 5000 }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Allow animation to finish
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!message) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <Info className="w-5 h-5 text-sky-500" />;
        }
    };

    const getStyles = () => {
        switch (type) {
            case 'success': return 'border-green-100 bg-green-50';
            case 'error': return 'border-red-100 bg-red-50';
            default: return 'border-sky-100 bg-sky-50';
        }
    };

    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center w-full max-w-sm p-4 rounded-lg border shadow-lg transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'} ${getStyles()}`}>
            <div className="flex-shrink-0">
                {getIcon()}
            </div>
            <div className="ml-3 text-sm font-medium text-slate-800 flex-1">
                {message}
            </div>
            <button
                onClick={() => setIsVisible(false)}
                className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 hover:bg-black/5 inline-flex h-8 w-8 text-slate-500 hover:text-slate-900 focus:ring-2 focus:ring-slate-300"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
