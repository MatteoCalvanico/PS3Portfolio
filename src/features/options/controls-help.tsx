export default function ControlsHelp() {
  return (
    <>
      <h2 className="controls-title">Controls</h2>
      <dl>
        <div>
          <dt>← →</dt>
          <dd>Change category. In a folder: back / open.</dd>
        </div>
        <div>
          <dt>↑ ↓</dt>
          <dd>Choose an item</dd>
        </div>
        <div>
          <dt>Enter</dt>
          <dd>Open the selected item</dd>
        </div>
        <div>
          <dt>Esc</dt>
          <dd>Go back one level</dd>
        </div>
        <div>
          <dt>Mouse</dt>
          <dd>Click to select or open. Scroll to browse.</dd>
        </div>
        <div>
          <dt>Touch</dt>
          <dd>Swipe in either direction or use the arrow buttons.</dd>
        </div>
      </dl>
    </>
  );
}
