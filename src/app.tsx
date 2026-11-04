import { useEffect, useReducer, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent, ReactNode } from 'react';
import { categories, profile } from './data';
import type { PortfolioItem } from './data';
import { Icon } from './icons';
import { navigationReducer, swipeAction } from './navigation';
import WaveBackground from './wave-background';

const reducer = navigationReducer(categories.map((category) => category.items.length));
const projectsIndex = categories.findIndex((category) => category.id === 'projects');

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return <time dateTime={now.toISOString()}>{now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}<span className="clock-time">{now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span></time>;
}

function Dialog({ children, label, onClose, className = '' }: { children: ReactNode; label: string; onClose: () => void; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return <dialog ref={ref} aria-labelledby={label} className={className} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    {children}
  </dialog>;
}

function ItemArtwork({ item, large = false }: { item: PortfolioItem; large?: boolean }) {
  return <span className={`item-artwork ${large ? 'artwork-large' : ''} ${item.image ? 'has-image' : ''}`}>
    {item.image ? <img src={item.image} alt="" loading={large ? 'eager' : 'lazy'} /> : <Icon name={item.icon ?? 'code'} />}
  </span>;
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, { category: projectsIndex, selected: categories.map(() => 0), detail: false });
  const [help, setHelp] = useState(false);
  const [systemReduced, setSystemReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [motionPaused, setMotionPaused] = useState(false);
  const reducedMotion = systemReduced || motionPaused;
  const surfaceRef = useRef<HTMLElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const pointerStart = useRef<{ x: number; y: number; id: number } | null>(null);
  const suppressClick = useRef(false);
  const wheelTime = useRef(0);
  const category = categories[state.category];
  const selectedIndex = state.selected[state.category];
  const selectedItem = category.items[selectedIndex];

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setSystemReduced(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (state.detail || help || event.altKey || event.ctrlKey || event.metaKey) return;
      const action = { ArrowLeft: { type: 'horizontal', delta: -1 }, ArrowRight: { type: 'horizontal', delta: 1 }, ArrowUp: { type: 'vertical', delta: -1 }, ArrowDown: { type: 'vertical', delta: 1 } } as const;
      if (event.key in action) {
        event.preventDefault();
        dispatch(action[event.key as keyof typeof action]);
        surfaceRef.current?.focus({ preventScroll: true });
      } else if (event.key === 'Enter' && !(event.target instanceof Element && event.target.closest('button, a'))) {
        event.preventDefault();
        dispatch({ type: 'open' });
      } else if (event.key === '?') {
        setHelp(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.detail, help]);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const wheel = (event: WheelEvent) => {
      if (state.detail || help || event.ctrlKey) return;
      event.preventDefault();
      const amount = Math.max(Math.abs(event.deltaX), Math.abs(event.deltaY));
      if (amount < 15 || performance.now() - wheelTime.current < 160) return;
      wheelTime.current = performance.now();
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) dispatch({ type: 'horizontal', delta: Math.sign(event.deltaX) });
      else dispatch({ type: 'vertical', delta: Math.sign(event.deltaY) });
    };
    surface.addEventListener('wheel', wheel, { passive: false });
    return () => surface.removeEventListener('wheel', wheel);
  }, [state.detail, help]);

  function closeDetail() {
    dispatch({ type: 'close' });
    requestAnimationFrame(() => selectedRef.current?.focus({ preventScroll: true }));
  }

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType === 'mouse') return;
    suppressClick.current = false;
    pointerStart.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
  }

  function onPointerUp(event: PointerEvent) {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start || start.id !== event.pointerId) return;
    const action = swipeAction(event.clientX - start.x, event.clientY - start.y);
    if (!action) return;
    suppressClick.current = true;
    dispatch(action);
  }

  function jumpToProject(id: string) {
    const index = categories[projectsIndex].items.findIndex((item) => item.id === id);
    if (index >= 0) dispatch({ type: 'jump', category: projectsIndex, item: index });
  }

  return <div className={`console ${reducedMotion ? 'reduced-motion' : ''}`}>
    <WaveBackground reducedMotion={reducedMotion} />
    <header className="system-header">
      <div className="wordmark" aria-label="Matteo Calvanico portfolio"><span className="monogram">mc.</span><span className="wordmark-divider"/><span>PORTFOLIO</span></div>
      <div className="user-panel">
        <img className="avatar" src={profile.image} alt="Matteo’s GitHub avatar" />
        <div className="user-info"><span>{profile.name}</span><Clock /></div>
        <span className="status-dot" aria-hidden="true" />
      </div>
    </header>

    <main className="xmb" ref={surfaceRef} tabIndex={-1} aria-label="Portfolio browser" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { pointerStart.current = null; }} onClickCapture={(event) => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } }}>
      <nav className="category-window" aria-label="Portfolio categories">
        <div className="category-track" style={{ '--category-index': state.category } as CSSProperties}>
          {categories.map((item, index) => <button key={item.id} tabIndex={index === state.category ? 0 : -1} className={`category ${index === state.category ? 'active' : ''}`} onClick={() => dispatch({ type: 'category', index })} aria-current={index === state.category ? 'true' : undefined}>
            <span className="category-icon"><Icon name={item.icon} /></span><span className="category-label">{item.label}</span>
          </button>)}
        </div>
      </nav>

      <section className="item-window" aria-label={`${category.label} items`} key={category.id}>
        <span className={`list-chevron up ${selectedIndex === 0 ? 'invisible' : ''}`} aria-hidden="true">⌃</span>
        <div className="item-list" style={{ '--item-index': selectedIndex } as CSSProperties}>
          {category.items.map((item, index) => <button key={item.id} ref={index === selectedIndex ? selectedRef : undefined} tabIndex={index === selectedIndex ? 0 : -1} className={`menu-item ${index === selectedIndex ? 'selected' : ''}`} style={{ '--index': index } as CSSProperties} onClick={() => dispatch({ type: 'open', index })} aria-label={`Open ${item.title}`} aria-current={index === selectedIndex ? 'true' : undefined}>
            <ItemArtwork item={item} />
            <span className="item-copy"><span className="item-title">{item.title}</span><span className="item-subtitle">{item.subtitle}</span></span>
          </button>)}
        </div>
      </section>

      <aside className="selection-context" aria-label="Selected item summary">
        <div className="context-count"><span>{String(selectedIndex + 1).padStart(2, '0')}</span> / {String(category.items.length).padStart(2, '0')}</div>
        <div className="context-line" />
        <p>{selectedItem.description}</p>
        <button className="context-open" onClick={() => dispatch({ type: 'open' })}>Explore <span aria-hidden="true">→</span></button>
      </aside>
      <div className="screen-reader" role="status" aria-live="polite">{category.label}, {selectedItem.title}, {selectedIndex + 1} of {category.items.length}</div>
    </main>

    <div className="touch-controls" aria-label="Touch navigation">
      <div className="dpad">
        <button className="dpad-up" aria-label="Previous item" disabled={selectedIndex === 0} onClick={() => dispatch({ type: 'vertical', delta: -1 })}>↑</button>
        <button className="dpad-left" aria-label="Previous category" disabled={state.category === 0} onClick={() => dispatch({ type: 'horizontal', delta: -1 })}>←</button>
        <span className="dpad-center" />
        <button className="dpad-right" aria-label="Next category" disabled={state.category === categories.length - 1} onClick={() => dispatch({ type: 'horizontal', delta: 1 })}>→</button>
        <button className="dpad-down" aria-label="Next item" disabled={selectedIndex === category.items.length - 1} onClick={() => dispatch({ type: 'vertical', delta: 1 })}>↓</button>
      </div>
      <div className="touch-action"><span className="touch-tip">Swipe to explore</span><button onClick={() => dispatch({ type: 'open' })}><span className="controller-symbol cross">×</span> Open</button></div>
    </div>

    <footer className="system-footer">
      <div className="navigation-hints"><span className="arrow-hint">↔ ↕ <span>Navigate</span></span><button onClick={() => dispatch({ type: 'open' })}><span className="controller-symbol cross">×</span> Enter <span className="hint-extra">to open</span></button><span className="back-hint"><span className="controller-symbol circle">○</span> Esc <span className="hint-extra">to go back</span></span></div>
      <div className="system-options"><button className="motion-button" aria-pressed={reducedMotion} disabled={systemReduced} title={systemReduced ? 'Reduced motion follows your device settings' : 'Pause or resume the background and menu animations'} onClick={() => setMotionPaused((value) => !value)}><span aria-hidden="true">{reducedMotion ? 'Ⅱ' : '≈'}</span><span>Motion {reducedMotion ? 'off' : 'on'}</span></button><button className="help-button" onClick={() => setHelp(true)} aria-label="Navigation help">?</button></div>
    </footer>

    {state.detail ? <Dialog key={selectedItem.id} label="detail-title" onClose={closeDetail} className="detail-dialog">
      <div className="detail-shell">
        <header className="detail-header"><span><Icon name={category.icon} />{category.label}</span><button onClick={closeDetail} className="close-button" aria-label="Close details"><span className="controller-symbol circle">○</span> Back <kbd>Esc</kbd></button></header>
        <div className={`detail-content ${selectedItem.image ? 'with-image' : ''}`} key={selectedItem.id}>
          {selectedItem.image ? <div className={`detail-image ${category.id === 'projects' ? 'project-image' : ''}`}><img src={selectedItem.image} alt={`${selectedItem.title} ${category.id === 'projects' ? 'preview' : 'image'}`} /></div> : <div className="detail-symbol"><Icon name={selectedItem.icon ?? category.icon}/></div>}
          <article className="detail-copy"><p className="detail-eyebrow">{selectedItem.subtitle}</p><h1 id="detail-title">{selectedItem.title}</h1><p className="detail-description">{selectedItem.description}</p>
            {selectedItem.tags?.length ? <ul className="tags" aria-label="Technologies">{selectedItem.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul> : null}
            {selectedItem.relatedProjects?.length ? <div className="related-projects"><h2>Selected projects</h2>{selectedItem.relatedProjects.map((id) => <button key={id} onClick={() => jumpToProject(id)}>{categories[projectsIndex].items.find((item) => item.id === id)?.title}<span aria-hidden="true">↗</span></button>)}</div> : null}
            {selectedItem.links?.length ? <div className="detail-links">{selectedItem.links.map((link) => <a key={link.url} href={link.url} target={link.url.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer">{link.label}<span aria-hidden="true">↗</span></a>)}</div> : null}
          </article>
        </div>
        <div className="detail-footnote">{profile.name}<span>{profile.role}</span></div>
      </div>
    </Dialog> : null}

    {help ? <Dialog label="help-title" onClose={() => setHelp(false)} className="help-dialog"><div className="help-content"><button className="close-button" onClick={() => setHelp(false)} aria-label="Close help">Close ×</button><p className="detail-eyebrow">MAKE YOURSELF AT HOME</p><h1 id="help-title">A familiar way to explore.</h1><p>Move across categories, then down through their contents.</p><dl><div><dt>← →</dt><dd>Change category</dd></div><div><dt>↑ ↓</dt><dd>Choose an item</dd></div><div><dt>Enter</dt><dd>Open the selected item</dd></div><div><dt>Esc</dt><dd>Return to the menu</dd></div><div><dt>Mouse</dt><dd>Click to select or open. Scroll to browse.</dd></div><div><dt>Touch</dt><dd>Swipe in either direction or use the arrow buttons.</dd></div></dl><p className="help-note">You can also use Tab to move between controls. Motion follows your device preferences and can be paused below.</p></div></Dialog> : null}
  </div>;
}
