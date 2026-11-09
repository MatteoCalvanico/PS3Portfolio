import type { CSSProperties, Ref } from "react";
import type { PortfolioItem } from "../types";
import ItemArtwork from "./item-artwork";

export default function ItemMenu({
  items,
  label,
  selectedIndex,
  selectedRef,
  onOpen,
  className,
  inactive = false,
}: {
  items: PortfolioItem[];
  label: string;
  selectedIndex: number;
  selectedRef?: Ref<HTMLButtonElement>;
  onOpen: (index: number) => void;
  className: string;
  inactive?: boolean;
}) {
  return (
    <section
      className={`item-window ${className}`}
      aria-hidden={inactive || undefined}
      inert={inactive}
      aria-label={`${label} items`}
    >
      <div
        className="item-list"
        style={{ "--item-index": selectedIndex } as CSSProperties}
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={index === selectedIndex ? selectedRef : undefined}
            tabIndex={!inactive && index === selectedIndex ? 0 : -1}
            className={`menu-item ${index === selectedIndex ? "selected" : ""}`}
            style={
              {
                "--item-position":
                  index < selectedIndex
                    ? `calc(var(--previous-y) + ${index - selectedIndex + 1} * var(--item-step))`
                    : index === selectedIndex
                      ? "var(--selected-y)"
                      : `calc(var(--next-y) + ${index - selectedIndex - 1} * var(--item-step))`,
              } as CSSProperties
            }
            onClick={() => onOpen(index)}
            aria-label={`Open ${item.title}`}
            aria-current={index === selectedIndex ? "true" : undefined}
          >
            <ItemArtwork item={item} />
            <span className="item-copy">
              <span className="item-title">{item.title}</span>
              <span className="item-subtitle">
                {item.children
                  ? `Folder · ${item.children.length} ${item.children.length === 1 ? "item" : "items"}`
                  : item.subtitle}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
