interface NavigationItem {
  children?: NavigationItem[];
}

export interface FolderSelection {
  index: number;
  selected: number;
}

export interface NavigationState {
  category: number;
  selected: number[];
  detail: boolean;
  folders: FolderSelection[];
}

export type NavigationAction =
  | { type: "category"; index: number }
  | { type: "horizontal"; delta: number }
  | { type: "vertical"; delta: number }
  | { type: "open"; index?: number }
  | { type: "close" }
  | { type: "jump"; category: number; item: number };

const clamp = (value: number, length: number) =>
  Math.max(0, Math.min(length - 1, value));

export function swipeAction(dx: number, dy: number): NavigationAction | null {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 35) return null;
  return Math.abs(dx) > Math.abs(dy)
    ? { type: "horizontal", delta: dx < 0 ? 1 : -1 }
    : { type: "vertical", delta: dy < 0 ? 1 : -1 };
}

export function navigationReducer(categories: NavigationItem[][]) {
  return (
    state: NavigationState,
    action: NavigationAction,
  ): NavigationState => {
    if (action.type === "close") {
      if (state.detail) return { ...state, detail: false };
      return { ...state, folders: state.folders.slice(0, -1) };
    }
    if (action.type === "jump") {
      const category = clamp(action.category, categories.length);
      const selected = [...state.selected];
      selected[category] = clamp(action.item, categories[category].length);
      return { category, selected, detail: true, folders: [] };
    }
    if (state.detail) return state;

    const inFolder = state.folders.length > 0;
    if (inFolder && action.type === "horizontal") {
      if (action.delta < 0)
        return { ...state, folders: state.folders.slice(0, -1) };
      if (action.delta === 0) return state;
      action = { type: "open" };
    }
    if (action.type === "category" || action.type === "horizontal") {
      return {
        ...state,
        category: clamp(
          action.type === "category"
            ? action.index
            : state.category + action.delta,
          categories.length,
        ),
        folders: [],
      };
    }

    let items = categories[state.category];
    for (const folder of state.folders)
      items = items[folder.index].children ?? [];
    if (!items.length) return state;

    const selected = [...state.selected];
    const folders = state.folders.map((folder) => ({ ...folder }));
    const current = folders.at(-1);
    const previous = current?.selected ?? selected[state.category];
    const index = clamp(
      action.type === "vertical"
        ? previous + action.delta
        : (action.index ?? previous),
      items.length,
    );
    if (current) current.selected = index;
    else selected[state.category] = index;

    if (action.type === "open" && items[index].children) {
      if (!items[index].children.length) return state;
      return {
        ...state,
        selected,
        folders: [...folders, { index, selected: 0 }],
      };
    }
    return { ...state, selected, folders, detail: action.type === "open" };
  };
}
