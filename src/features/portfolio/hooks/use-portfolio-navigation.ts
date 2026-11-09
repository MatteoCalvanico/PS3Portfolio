import { useCallback, useReducer, useRef } from "react";
import { categories, projects, projectsIndex } from "../model/catalog";
import { navigationReducer } from "../model/navigation";
import type { PortfolioItem } from "../types";

const reducer = navigationReducer(categories.map((category) => category.items));

export function usePortfolioNavigation() {
  const [state, dispatch] = useReducer(reducer, {
    category: projectsIndex,
    selected: categories.map(() => 0),
    detail: false,
    folders: [],
  });
  const surfaceRef = useRef<HTMLElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const category = categories[state.category];
  let items = category.items;
  let folder: PortfolioItem | undefined;
  for (const selection of state.folders) {
    folder = items[selection.index];
    items = folder.children ?? [];
  }
  const selectedIndex =
    state.folders.at(-1)?.selected ?? state.selected[state.category];

  const closeDetail = useCallback(() => {
    dispatch({ type: "close" });
    requestAnimationFrame(() =>
      selectedRef.current?.focus({ preventScroll: true }),
    );
  }, []);

  const jumpToProject = useCallback((id: string) => {
    const index = projects.findIndex((item) => item.id === id);
    if (index >= 0)
      dispatch({ type: "jump", category: projectsIndex, item: index });
  }, []);

  return {
    state,
    dispatch,
    surfaceRef,
    selectedRef,
    category,
    items,
    folder,
    selectedIndex,
    selectedItem: items[selectedIndex],
    listingLabel: folder?.title ?? category.label,
    inFolder: state.folders.length > 0,
    closeDetail,
    jumpToProject,
  };
}

export type PortfolioNavigation = ReturnType<typeof usePortfolioNavigation>;
