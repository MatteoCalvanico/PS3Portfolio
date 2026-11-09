import Dialog from "../../../components/dialog";
import { XmbCategoryIcon, XmbItemIcon } from "../../appearance/icons/icons";
import { profile } from "../data/portfolio";
import { projects } from "../model/catalog";
import type { Category, PortfolioItem } from "../types";
import LastWatched from "./last-watched";

interface ItemDetailDialogProps {
  category: Category;
  folderTitle?: string;
  item: PortfolioItem;
  onClose: () => void;
  onProjectOpen: (id: string) => void;
  onPlayGame: () => void;
}

export default function ItemDetailDialog({
  category,
  folderTitle,
  item,
  onClose,
  onProjectOpen,
  onPlayGame,
}: ItemDetailDialogProps) {
  return (
    <Dialog
      key={item.id}
      label="detail-title"
      onClose={onClose}
      className="detail-dialog"
    >
      <div className="detail-shell">
        <header className="detail-header">
          <span>
            <XmbCategoryIcon category={category.id} />
            {folderTitle
              ? `${category.label} / ${folderTitle}`
              : category.label}
          </span>
          <button
            onClick={onClose}
            className="close-button"
            aria-label="Close details"
          >
            <span className="controller-symbol circle">○</span> Back{" "}
            <kbd>Esc</kbd>
          </button>
        </header>
        <div
          className={`detail-content ${item.image ? "with-image" : ""}`}
          key={item.id}
        >
          {item.image ? (
            <div
              className={`detail-image ${category.id === "projects" ? "project-image" : ""}`}
            >
              <img
                src={item.image}
                alt={`${item.title} ${category.id === "projects" ? "preview" : "image"}`}
              />
            </div>
          ) : (
            <div className="detail-symbol">
              <XmbItemIcon name={item.icon ?? category.icon} />
            </div>
          )}
          <article className="detail-copy">
            <p className="detail-eyebrow">{item.subtitle}</p>
            <h1 id="detail-title">{item.title}</h1>
            <p className="detail-description">{item.description}</p>
            {category.id === "profile" && item.id === "cinema" ? (
              <LastWatched />
            ) : null}
            {item.contentImage ? (
              <img
                className="detail-content-image"
                src={item.contentImage.src}
                alt={item.contentImage.alt}
                width={1200}
                height={630}
              />
            ) : null}
            {item.game ? (
              <button className="play-game" onClick={onPlayGame}>
                ▷ Play DOOM
              </button>
            ) : null}
            {item.tags?.length ? (
              <ul className="tags" aria-label="Technologies">
                {item.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            ) : null}
            {item.relatedProjects?.length ? (
              <div className="related-projects">
                <h2>Selected projects</h2>
                {item.relatedProjects
                  .filter((id) => projects.some((item) => item.id === id))
                  .map((id) => (
                    <button key={id} onClick={() => onProjectOpen(id)}>
                      {projects.find((item) => item.id === id)?.title}
                      <span aria-hidden="true">›</span>
                    </button>
                  ))}
              </div>
            ) : null}
            {item.links?.length ? (
              <div className="detail-links">
                {item.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target={
                      link.url.startsWith("mailto:") ? undefined : "_blank"
                    }
                    rel="noopener noreferrer"
                  >
                    {link.label}
                    <span aria-hidden="true">›</span>
                  </a>
                ))}
              </div>
            ) : null}
          </article>
        </div>
        <div className="detail-footnote">
          {profile.name}
          <span>{profile.role}</span>
        </div>
      </div>
    </Dialog>
  );
}
