import type { PortfolioItem } from "../types";
import { XmbItemIcon } from "../../appearance/icons/icons";

export default function ItemArtwork({
  item,
  large = false,
}: {
  item: PortfolioItem;
  large?: boolean;
}) {
  return (
    <span
      className={`item-artwork ${large ? "artwork-large" : ""} ${item.image ? "has-image" : ""}`}
    >
      {item.image ? (
        <img src={item.image} alt="" loading={large ? "eager" : "lazy"} />
      ) : (
        <XmbItemIcon name={item.icon ?? "code"} />
      )}
    </span>
  );
}
