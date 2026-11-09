import { categories as allCategories } from "../data/portfolio";
import type { PortfolioItem } from "../types";

function visibleItems(items: PortfolioItem[]): PortfolioItem[] {
  return items
    .filter((item) => item.hide !== true)
    .map((item) =>
      item.children ? { ...item, children: visibleItems(item.children) } : item,
    );
}

export const categories = allCategories.map((category) => ({
  ...category,
  items: visibleItems(category.items),
}));

export const projectsIndex = categories.findIndex(
  (category) => category.id === "projects",
);

export const projects = categories[projectsIndex].items;
