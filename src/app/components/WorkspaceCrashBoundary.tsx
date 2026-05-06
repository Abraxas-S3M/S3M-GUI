import { Component, type ErrorInfo, type ReactNode } from 'react';

interface WorkspaceCrashBoundaryProps {
  name: string;
  children: ReactNode;
}

interface WorkspaceCrashBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class WorkspaceCrashBoundary extends Component<
  WorkspaceCrashBoundaryProps,
  WorkspaceCrashBoundaryState
> {
  state: WorkspaceCrashBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: Error): WorkspaceCrashBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Unknown runtime error',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`[${this.props.name}] workspace runtime error`, error, errorInfo);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="h-full p-4">
        <div className="h-full rounded-xl border border-cyber-red/40 bg-s3m-card p-4 flex flex-col justify-center">
          <div className="text-[15px] tracking-wider uppercase font-semibold text-cyber-red mb-2">
            {this.props.name} WORKSPACE RUNTIME ERROR
          </div>
          <div className="text-s3m-text-primary text-[13px] font-mono break-words mb-2">
            {this.state.errorMessage}
          </div>
          <div className="text-s3m-text-tertiary text-[15px] uppercase tracking-wider">
            Check browser console for full stack trace.
          </div>
        </div>
      </div>
    );
  }
}
