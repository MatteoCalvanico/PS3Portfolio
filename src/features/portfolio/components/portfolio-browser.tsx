import type { PortfolioNavigation } from "../hooks/use-portfolio-navigation";
import { useBrowserControls } from "../hooks/use-browser-controls";
import CategoryMenu from "./category-menu";
import ItemMenu from "./item-menu";

interface PortfolioBrowserProps {
  navigation: PortfolioNavigation;
  disabled: boolean;
  startingUp: boolean;
  onOpenOptions: () => void;
}

export default function PortfolioBrowser({
  navigation,
  disabled,
  startingUp,
  onOpenOptions,
}: PortfolioBrowserProps) {
  const {
    state,
    dispatch,
    surfaceRef,
    selectedRef,
    category,
    folder,
    items,
    selectedIndex,
    selectedItem,
    listingLabel,
    inFolder,
    closeDetail,
  } = navigation;
  const controls = useBrowserControls({
    disabled,
    startingUp,
    inFolder,
    surfaceRef,
    onNavigate: dispatch,
    onOpenOptions,
  });

  return (
    <main
      className={`xmb ${inFolder ? "folder-open" : ""}`}
      ref={surfaceRef}
      tabIndex={-1}
      aria-label="Portfolio browser"
      {...controls}
    >
      <CategoryMenu
        selectedIndex={state.category}
        inFolder={inFolder}
        onSelect={(index) => dispatch({ type: "category", index })}
      />
      <ItemMenu
        key={category.id}
        className="root-items"
        items={category.items}
        label={category.label}
        selectedIndex={state.selected[state.category]}
        selectedRef={inFolder ? undefined : selectedRef}
        inactive={inFolder}
        onOpen={(index) => dispatch({ type: "open", index })}
      />
      {folder ? (
        <>
          <button
            className="folder-back-target"
            aria-label={`Back from ${folder.title}`}
            title={`Back from ${folder.title}`}
            onClick={closeDetail}
          >
            <span className="folder-back-chevron" aria-hidden="true">
              ‹
            </span>
          </button>
          <ItemMenu
            key={state.folders.map((entry) => entry.index).join("/")}
            className="folder-items"
            items={items}
            label={listingLabel}
            selectedIndex={selectedIndex}
            selectedRef={selectedRef}
            onOpen={(index) => dispatch({ type: "open", index })}
          />
        </>
      ) : null}

      <div className="screen-reader" role="status" aria-live="polite">
        {listingLabel}, {selectedItem.title}, {selectedIndex + 1} of{" "}
        {items.length}
      </div>
    </main>
  );
}
