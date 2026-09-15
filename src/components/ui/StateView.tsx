interface StateViewProps { state: 'loading' | 'empty' | 'error' | 'success'; message?: string }

export function StateView({ state, message }: StateViewProps) {
  const defaults = { loading: 'Loading…', empty: 'Nothing to show yet.', error: 'Something went wrong.', success: 'Ready.' };
  return <div role={state === 'error' ? 'alert' : 'status'}>{message ?? defaults[state]}</div>;
}
