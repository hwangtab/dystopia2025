import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center p-4">
          <h2 className="text-2xl font-blender text-accent-pink mb-4">페이지 로딩 오류</h2>
          <p className="text-gray-300 mb-4">
            페이지를 표시하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
          {/* Optionally show error details during development */}
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-4 text-xs text-left bg-primary-dark p-2 rounded overflow-auto max-w-full">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
