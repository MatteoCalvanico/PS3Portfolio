export interface NavigationState {
  category: number;
  selected: number[];
  detail: boolean;
}

export type NavigationAction =
  | { type: 'category'; index: number }
  | { type: 'horizontal'; delta: number }
  | { type: 'vertical'; delta: number }
  | { type: 'open'; index?: number }
  | { type: 'close' }
  | { type: 'jump'; category: number; item: number };

const clamp = (value: number, length: number) => Math.max(0, Math.min(length - 1, value));

export function swipeAction(dx: number, dy: number): NavigationAction | null {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 35) return null;
  return Math.abs(dx) > Math.abs(dy)
    ? { type: 'horizontal', delta: dx < 0 ? 1 : -1 }
    : { type: 'vertical', delta: dy < 0 ? 1 : -1 };
}

export function navigationReducer(lengths: number[]) {
  return (state: NavigationState, action: NavigationAction): NavigationState => {
    if (action.type === 'close') return { ...state, detail: false };
    if (action.type === 'jump') {
      const category = clamp(action.category, lengths.length);
      const selected = [...state.selected];
      selected[category] = clamp(action.item, lengths[category]);
      return { category, selected, detail: true };
    }
    if (state.detail) return state;
    if (action.type === 'category' || action.type === 'horizontal') {
      return { ...state, category: clamp(action.type === 'category' ? action.index : state.category + action.delta, lengths.length) };
    }
    const selected = [...state.selected];
    selected[state.category] = clamp(action.type === 'vertical'
      ? selected[state.category] + action.delta
      : action.index ?? selected[state.category], lengths[state.category]);
    return { ...state, selected, detail: action.type === 'open' };
  };
}
