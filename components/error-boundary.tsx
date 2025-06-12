"use client" // Error boundaries must be client components

import React from 'react';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to an error reporting service
    logger.error("Uncaught client-side error", error, { componentStack: errorInfo.componentStack });
  }

  handleRetry = () => {
    // Attempt to recover by reloading the page
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4 bg-background text-foreground">
          <Card className="w-full max-w-md text-center shadow-lg border-destructive">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold text-destructive">Application Error</CardTitle>
              <CardDescription className="text-muted-foreground pt-2">
                Oops! Something went wrong while trying to render this part of the application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-sm">
                We have logged this error and will look into it. Please try reloading the page.
              </p>
              <Button onClick={this.handleRetry} variant="destructive">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
