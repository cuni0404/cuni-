import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends (React.Component as any) {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle size={48} className="text-brand mb-4" />
          <h1 className="text-2xl font-bold mb-2">문제가 발생했습니다</h1>
          <p className="opacity-60 mb-8 max-w-md">
            애플리케이션 실행 중 오류가 발생했습니다. 페이지를 새로고침하거나 나중에 다시 시도해 주세요.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-brand text-black font-bold rounded-full hover:scale-105 transition-transform"
          >
            새로고침
          </button>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-8 p-4 bg-white/5 rounded text-left text-xs overflow-auto max-w-full">
              {this.state.error?.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
