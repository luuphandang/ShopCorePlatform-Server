import { ShutdownState } from './shutdown.state';

describe('ShutdownState', () => {
  it('reports not shutting down by default', () => {
    const state = new ShutdownState();
    expect(state.isShuttingDown()).toBe(false);
    expect(state.getSignal()).toBeUndefined();
  });

  it('flips to shutting down when lifecycle hook fires', () => {
    const state = new ShutdownState();
    state.onApplicationShutdown('SIGTERM');
    expect(state.isShuttingDown()).toBe(true);
    expect(state.getSignal()).toBe('SIGTERM');
  });

  it('handles missing signal argument', () => {
    const state = new ShutdownState();
    state.onApplicationShutdown();
    expect(state.isShuttingDown()).toBe(true);
    expect(state.getSignal()).toBeUndefined();
  });
});
