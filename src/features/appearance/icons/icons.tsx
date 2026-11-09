import { createContext, useContext } from "react";
import type { ComponentType, ReactNode } from "react";
import type { IconStyleId } from "./icon-styles";
import OutlineIcon from "./outline-icon";
import type { IconProps } from "./icon-types";

const IconStyleContext = createContext<IconStyleId>("xmb");

export function IconStyleProvider({
  style,
  children,
}: {
  style: IconStyleId;
  children: ReactNode;
}) {
  return <IconStyleContext value={style}>{children}</IconStyleContext>;
}

const categorySymbols: Record<string, string> = {
  profile: "user",
  experience: "briefcase",
  projects: "gamepad",
  languages: "code",
  frameworks: "globe",
  tools: "tools",
  contacts: "linkedin",
};

export function XmbCategoryIcon({ category }: { category: string }) {
  const Icon = iconPacks[useContext(IconStyleContext)];
  return (
    <Icon
      name={categorySymbols[category] ?? "tools"}
      className="xmb-category-art"
    />
  );
}

// Original Sony sample-theme artwork, kept byte-for-byte in public/xmb.
function ClassicIcon({ name, className }: IconProps) {
  return (
    <img
      className={className}
      src={`${import.meta.env.BASE_URL}xmb/${itemArtwork[name] ?? "icon_onlinemanual.png"}`}
      alt=""
      draggable={false}
    />
  );
}

const itemArtwork: Record<string, string> = {
  folder: "icon_photo_album_default.png",
  user: "icon_user.png",
  briefcase: "icon_trophy.png",
  graduation: "icon_trophy.png",
  gamepad: "icon_game.png",
  code: "icon_chatroom_text.png",
  layers: "icon_network.png",
  tools: "icon_setting.png",
  mail: "icon_mbox.png",
  globe: "icon_network.png",
  document: "icon_savedata.png",
  film: "icon_video.png",
  plane: "icon_network.png",
  terminal: "icon_system_setting.png",
  database: "icon_system_setting.png",
  cloud: "icon_network.png",
  github: "icon_browser.png",
  linkedin: "icon_friend.png",
};

export function XmbItemIcon({ name }: { name: string }) {
  const Icon = iconPacks[useContext(IconStyleContext)];
  if (name.startsWith("brand:")) {
    const source = `${import.meta.env.BASE_URL}technology/${name.slice(6)}.svg`;
    return (
      <span className="xmb-item-art technology-art" aria-hidden="true">
        <span
          className="technology-silhouette"
          style={{
            maskImage: `url("${source}")`,
            WebkitMaskImage: `url("${source}")`,
          }}
        />
      </span>
    );
  }
  return (
    <Icon
      name={name}
      className={`xmb-item-art ${name === "folder" ? "folder-art" : ""}`}
    />
  );
}

const iconPacks = {
  xmb: ClassicIcon,
  outline: OutlineIcon,
} satisfies Record<IconStyleId, ComponentType<IconProps>>;
