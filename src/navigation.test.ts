import { describe, expect, it } from 'vitest';
import { navigationReducer, swipeAction, type NavigationAction, type NavigationState } from './navigation';

// Profile, experience and projects have deliberately different list lengths.
const reduce = navigationReducer([4, 6, 8]);
const initial = (): NavigationState => ({ category: 0, selected: [0, 0, 0], detail: false });

function navigate(actions: NavigationAction[], state = initial()) {
  return actions.reduce(reduce, state);
}

describe('XMB navigation', () => {
  it('remembers each category’s selected item when switching back and forth', () => {
    const state = navigate([
      { type: 'vertical', delta: 2 },
      { type: 'horizontal', delta: 1 },
      { type: 'vertical', delta: 4 },
      { type: 'category', index: 2 },
      { type: 'vertical', delta: 7 },
      { type: 'horizontal', delta: -2 },
    ]);

    expect(state.category).toBe(0);
    expect(state.selected).toEqual([2, 4, 7]);
    expect(reduce(state, { type: 'category', index: 1 }).selected[1]).toBe(4);
  });

  it('stops at both ends of the category row instead of wrapping', () => {
    let state = reduce(initial(), { type: 'horizontal', delta: -1 });
    expect(state.category).toBe(0);
    state = reduce(state, { type: 'horizontal', delta: 10 });
    expect(state.category).toBe(2);
    state = reduce(state, { type: 'horizontal', delta: 1 });
    expect(state.category).toBe(2);
  });

  it('keeps direct category selections within the available row', () => {
    expect(reduce(initial(), { type: 'category', index: -1 }).category).toBe(0);
    expect(reduce(initial(), { type: 'category', index: 99 }).category).toBe(2);
  });

  it('stops at the first and last item of the current category', () => {
    const top = navigate([{ type: 'vertical', delta: -1 }]);
    expect(top.selected[0]).toBe(0);

    const profileBottom = navigate([{ type: 'vertical', delta: 99 }]);
    expect(profileBottom.selected[0]).toBe(3);

    const projectsBottom = navigate([
      { type: 'category', index: 2 },
      { type: 'vertical', delta: 99 },
      { type: 'vertical', delta: 1 },
    ]);
    expect(projectsBottom.selected).toEqual([0, 0, 7]);
  });

  it('opens the highlighted item with Enter and a clicked item by index', () => {
    const highlighted = navigate([
      { type: 'vertical', delta: 2 },
      { type: 'open' },
    ]);
    expect(highlighted.detail).toBe(true);
    expect(highlighted.selected[0]).toBe(2);

    const clicked = reduce(initial(), { type: 'open', index: 3 });
    expect(clicked.detail).toBe(true);
    expect(clicked.selected[0]).toBe(3);
  });

  it.each<NavigationAction>([
    { type: 'horizontal', delta: 1 },
    { type: 'vertical', delta: 1 },
    { type: 'category', index: 2 },
    { type: 'open', index: 0 },
  ])('does not move the hidden menu while a detail is open: $type', (action) => {
    const open = navigate([{ type: 'vertical', delta: 2 }, { type: 'open' }]);
    expect(reduce(open, action)).toEqual(open);
  });

  it('returns to the same category and item when closing a detail', () => {
    const browsing = navigate([
      { type: 'category', index: 1 },
      { type: 'vertical', delta: 4 },
    ]);
    const open = reduce(browsing, { type: 'open' });
    expect(reduce(open, { type: 'close' })).toEqual(browsing);
  });

  it('opens a related project from a detail and returns to that project in the menu', () => {
    const source = navigate([{ type: 'vertical', delta: 2 }, { type: 'open' }]);
    const project = reduce(source, { type: 'jump', category: 2, item: 5 });

    expect(project).toEqual({ category: 2, selected: [2, 0, 5], detail: true });
    expect(reduce(project, { type: 'close' })).toEqual({
      category: 2, selected: [2, 0, 5], detail: false,
    });
    // The original category's selection survives the related-project detour.
    expect(source.selected).toEqual([2, 0, 0]);
  });
});

describe('touch swipe recognition', () => {
  it('leaves taps and small finger movements available for clicking', () => {
    expect(swipeAction(0, 0)).toBeNull();
    expect(swipeAction(12, -9)).toBeNull();
    expect(swipeAction(34, 34)).toBeNull();
    expect(swipeAction(-34, -34)).toBeNull();
  });

  it.each([
    { direction: 'left', dx: -80, dy: 0, action: { type: 'horizontal', delta: 1 } },
    { direction: 'right', dx: 80, dy: 0, action: { type: 'horizontal', delta: -1 } },
    { direction: 'up', dx: 0, dy: -80, action: { type: 'vertical', delta: 1 } },
    { direction: 'down', dx: 0, dy: 80, action: { type: 'vertical', delta: -1 } },
  ])('moves through the menu when swiping $direction', ({ dx, dy, action }) => {
    expect(swipeAction(dx, dy)).toEqual(action);
  });

  it('recognizes a swipe at the 35-pixel threshold', () => {
    expect(swipeAction(35, 0)).toEqual({ type: 'horizontal', delta: -1 });
    expect(swipeAction(0, -35)).toEqual({ type: 'vertical', delta: 1 });
  });

  it('uses the dominant axis for diagonal gestures', () => {
    expect(swipeAction(-90, 50)).toEqual({ type: 'horizontal', delta: 1 });
    expect(swipeAction(50, -90)).toEqual({ type: 'vertical', delta: 1 });
    expect(swipeAction(50, 50)).toEqual({ type: 'vertical', delta: -1 });
  });
});
