// Original Sony sample-theme artwork, kept byte-for-byte in public/xmb.
const categoryArtwork: Record<string, string> = {
  profile: "icon_user.png",
  experience: "icon_trophy.png",
  projects: "icon_game.png",
  languages: "icon_chatroom_text.png",
  frameworks: "icon_network.png",
  tools: "icon_setting.png",
  contacts: "icon_friend.png",
};

export function XmbCategoryIcon({ category }: { category: string }) {
  return (
    <img
      className="xmb-category-art"
      src={`${import.meta.env.BASE_URL}xmb/${categoryArtwork[category] ?? "icon_setting.png"}`}
      alt=""
      draggable={false}
    />
  );
}

const itemArtwork: Record<string, string> = {
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
  return (
    <img
      className="xmb-item-art"
      src={`${import.meta.env.BASE_URL}xmb/${itemArtwork[name] ?? "icon_onlinemanual.png"}`}
      alt=""
      draggable={false}
    />
  );
}
