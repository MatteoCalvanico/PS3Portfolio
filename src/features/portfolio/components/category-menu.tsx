import type { CSSProperties } from "react";
import { XmbCategoryIcon } from "../../appearance/icons/icons";
import { categories } from "../model/catalog";

interface CategoryMenuProps {
  selectedIndex: number;
  inFolder: boolean;
  onSelect: (index: number) => void;
}

export default function CategoryMenu({
  selectedIndex,
  inFolder,
  onSelect,
}: CategoryMenuProps) {
  return (
    <nav
      className="category-window"
      aria-label="Portfolio categories"
      inert={inFolder}
      aria-hidden={inFolder || undefined}
    >
      <div
        className="category-track"
        style={{ "--category-index": selectedIndex } as CSSProperties}
      >
        {categories.map((item, index) => (
          <button
            key={item.id}
            tabIndex={index === selectedIndex ? 0 : -1}
            aria-label={item.label}
            title={item.label}
            className={`category ${index === selectedIndex ? "active" : ""}`}
            onClick={() => onSelect(index)}
            aria-current={index === selectedIndex ? "true" : undefined}
          >
            <span className="category-icon">
              <XmbCategoryIcon category={item.id} />
            </span>
            <span className="category-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
