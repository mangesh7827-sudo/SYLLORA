import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './Button';
import { Card } from './Card';

type Props = { children: ReactNode };
type State = { hasError: boolean; message?: string };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: unknown): State { return { hasError: true, message: error instanceof Error ? error.message : undefined }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Syllora UI error', error, info); }
  reset = () => { this.setState({ hasError: false }); };
  render() {
    if (!this.state.hasError) return this.props.children;
    return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px' }}><Card><h1>Something went wrong</h1><p>The page could not be rendered. Your saved data is not affected.</p>{this.state.message && <details><summary>Technical details</summary><pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.message}</pre></details>}<Button onClick={this.reset}>Try again</Button></Card></main>;
  }
}
