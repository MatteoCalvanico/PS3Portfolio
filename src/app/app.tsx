import { useCallback, useState } from "react";
import ThemeBackground from "../features/appearance/backgrounds/theme-background";
import { useAppearance } from "../features/appearance/hooks/use-appearance";
import { IconStyleProvider } from "../features/appearance/icons/icons";
import GameSession from "../features/games/game-session";
import OptionsDialog from "../features/options/options-dialog";
import ItemDetailDialog from "../features/portfolio/components/item-detail-dialog";
import PortfolioBrowser from "../features/portfolio/components/portfolio-browser";
import TouchControls from "../features/portfolio/components/touch-controls";
import { profile } from "../features/portfolio/data/portfolio";
import { usePortfolioNavigation } from "../features/portfolio/hooks/use-portfolio-navigation";
import { categories } from "../features/portfolio/model/catalog";
import { useReducedMotion } from "../hooks/use-reduced-motion";
import StartupSequence from "./components/startup-sequence";
import SystemFooter from "./components/system-footer";
import SystemHeader from "./components/system-header";

export default function App() {
  const navigation = usePortfolioNavigation();
  const appearance = useAppearance();
  const systemReduced = useReducedMotion();
  const [startingUp, setStartingUp] = useState(() => !systemReduced);
  const [motionPaused, setMotionPaused] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [playingGame, setPlayingGame] = useState(false);
  const reducedMotion = systemReduced || motionPaused;
  const { state, closeDetail } = navigation;

  const finishStartup = useCallback(() => setStartingUp(false), []);
  const openOptions = useCallback(() => setOptionsOpen(true), []);
  const closeGame = useCallback(() => {
    setPlayingGame(false);
    closeDetail();
  }, [closeDetail]);

  return (
    <IconStyleProvider style={appearance.iconStyle}>
      <div
        className={`console ${reducedMotion ? "reduced-motion" : ""} ${state.detail ? "details-open" : ""}`}
      >
        <ThemeBackground
          selection={appearance.background}
          reducedMotion={reducedMotion || playingGame}
          startingUp={startingUp}
        />
        {startingUp ? (
          <StartupSequence
            reducedMotion={reducedMotion}
            onComplete={finishStartup}
          />
        ) : null}
        <div
          className={`xmb-interface ${startingUp ? "awaiting-startup" : ""}`}
          inert={startingUp || playingGame}
        >
          <SystemHeader profile={profile} />
          <PortfolioBrowser
            navigation={navigation}
            disabled={startingUp || state.detail || optionsOpen || playingGame}
            startingUp={startingUp}
            onOpenOptions={openOptions}
          />
          <TouchControls
            categoryIndex={state.category}
            categoryCount={categories.length}
            selectedIndex={navigation.selectedIndex}
            itemCount={navigation.items.length}
            inFolder={navigation.inFolder}
            onNavigate={navigation.dispatch}
          />
          <SystemFooter
            inFolder={navigation.inFolder}
            onOpen={() => navigation.dispatch({ type: "open" })}
            onBack={closeDetail}
            onOpenOptions={openOptions}
          />
          {state.detail && !playingGame ? (
            <ItemDetailDialog
              key={navigation.selectedItem.id}
              category={navigation.category}
              folderTitle={navigation.folder?.title}
              item={navigation.selectedItem}
              onClose={closeDetail}
              onProjectOpen={navigation.jumpToProject}
              onPlayGame={() => setPlayingGame(true)}
            />
          ) : null}
          {optionsOpen ? (
            <OptionsDialog
              appearance={appearance}
              reducedMotion={reducedMotion}
              systemReduced={systemReduced}
              onClose={() => setOptionsOpen(false)}
              onToggleMotion={() => setMotionPaused((value) => !value)}
              onReplayStartup={() => {
                setOptionsOpen(false);
                setStartingUp(true);
              }}
            />
          ) : null}
        </div>
        {playingGame ? <GameSession onClose={closeGame} /> : null}
      </div>
    </IconStyleProvider>
  );
}
