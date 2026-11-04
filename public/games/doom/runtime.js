/* Portfolio host for the unmodified Cloudflare / Chocolate Doom WebAssembly engine. */
var Module;
(() => {
  // Keep SDL’s render buffer fixed; CSS scales it when the device rotates.
  window.addEventListener("resize", (event) => event.stopImmediatePropagation(), true);
  const canvas = document.getElementById("canvas");
  // Older SDL calls pointer lock without handling modern browser rejections.
  const requestLock = canvas.requestPointerLock?.bind(canvas);
  canvas.requestPointerLock = () => {
    try { return requestLock?.()?.catch(() => {}); } catch { return Promise.resolve(); }
  };
  const channel = "calvs-doom";
  const saveKey = "calvs-doom-saves-v1";
  const pressed = new Set();
  let ready = false;
  let paused = false;
  let muted = false;
  let lastSave = "";
  let storageNoticeSent = false;

  const notify = (type) => parent.postMessage({ channel, type }, location.origin);
  const storageUnavailable = () => {
    if (!storageNoticeSent) notify("storage-unavailable");
    storageNoticeSent = true;
  };

  function saveFiles() {
    if (!ready) return;
    try {
      const files = {};
      function read(directory) {
        for (const name of Module.FS.readdir(directory)) {
          if (name === "." || name === "..") continue;
          const path = `${directory}/${name}`;
          if (Module.FS.isDir(Module.FS.stat(path).mode)) read(path);
          else if (/\.dsg$/i.test(name)) {
            const bytes = Module.FS.readFile(path);
            let binary = "";
            for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
            files[path] = btoa(binary);
          }
        }
      }
      read("/saves");
      const serialized = JSON.stringify(files);
      if (serialized !== lastSave) {
        localStorage.setItem(saveKey, serialized);
        lastSave = serialized;
      }
    } catch { storageUnavailable(); }
  }

  function restoreFiles() {
    Module.FS.mkdirTree("/saves");
    try {
      const serialized = localStorage.getItem(saveKey);
      if (!serialized || serialized.length > 5000000) return;
      const files = JSON.parse(serialized);
      for (const [path, encoded] of Object.entries(files)) {
        if (!/^\/saves\/(?:[a-z0-9_-]+\.wad\/)?doomsav[0-5]\.dsg$/i.test(path) || typeof encoded !== "string") continue;
        Module.FS.mkdirTree(path.slice(0, path.lastIndexOf("/")));
        Module.FS.writeFile(path, Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0)));
      }
      lastSave = serialized;
    } catch { storageUnavailable(); }
  }

  function key(code, down) {
    const event = new Event(down ? "keydown" : "keyup", { bubbles: true, cancelable: true });
    event.keyCode = code;
    event.which = code;
    canvas.dispatchEvent(event);
  }
  function releaseKeys() {
    for (const code of pressed) key(code, false);
    pressed.clear();
    document.querySelectorAll(".pressed").forEach((element) => element.classList.remove("pressed"));
  }
  function syncAudio() {
    if (typeof SDL2 === "undefined" || !SDL2.audioContext) return;
    const audio = SDL2.audioContext;
    if (paused || muted || document.hidden) void audio.suspend().catch(() => {});
    else void audio.resume().catch(() => {});
  }
  function syncPause() {
    if (!ready) return;
    releaseKeys();
    if (paused || document.hidden) {
      Module.pauseMainLoop();
      document.exitPointerLock?.();
      saveFiles();
    } else Module.resumeMainLoop();
    syncAudio();
  }
  function exit() { releaseKeys(); saveFiles(); notify("exit"); }

  Module = {
    canvas,
    noInitialRun: true,
    locateFile: (path) => new URL(path, location.href).href,
    preRun: () => {
      Module.FS.createPreloadedFile("/", "doom1.wad", "doom1.wad", true, false);
      Module.FS.createPreloadedFile("/", "default.cfg", "default.cfg", true, true);
      restoreFiles();
    },
    onRuntimeInitialized: () => {
      callMain(["-iwad", "doom1.wad", "-window", "-nogui", "-nomusic", "-config", "default.cfg", "-savedir", "/saves", "-width", "640", "-height", "400"]);
      ready = true;
      notify("ready");
      canvas.focus();
    },
    onAbort: () => notify("error"),
    onExit: () => { saveFiles(); notify("exit"); },
    print: () => {},
    printErr: (message) => console.warn("DOOM:", message),
  };

  window.addEventListener("message", (event) => {
    if (event.origin !== location.origin || event.source !== parent || event.data?.channel !== channel) return;
    if (event.data.type === "pause") { paused = Boolean(event.data.value); syncPause(); }
    if (event.data.type === "mute") { muted = Boolean(event.data.value); syncAudio(); }
    if (event.data.type === "exit") exit();
  });
  window.addEventListener("keydown", (event) => {
    if (event.shiftKey && event.key === "Escape") { event.preventDefault(); event.stopImmediatePropagation(); exit(); return; }
    if (event.target === canvas || event.target === document.body) {
      if (["Tab", " ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Escape", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11"].includes(event.key)) event.preventDefault();
      if (event.keyCode) pressed.add(event.keyCode);
    }
    syncAudio();
  }, true);
  window.addEventListener("keyup", (event) => pressed.delete(event.keyCode), true);
  canvas.addEventListener("contextmenu", (event) => event.preventDefault());
  canvas.addEventListener("click", () => {
    canvas.focus();
    syncAudio();
    if (matchMedia("(pointer: fine)").matches && ready && !paused) {
      const result = canvas.requestPointerLock?.();
      result?.catch(() => {});
    }
  });
  for (const button of document.querySelectorAll("[data-key]")) {
    const code = Number(button.dataset.key);
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (!ready || paused) return;
      button.setPointerCapture(event.pointerId);
      pressed.add(code);
      button.classList.add("pressed");
      key(code, true);
      if (code === 87 || code === 83) key(code === 87 ? 38 : 40, true);
      syncAudio();
    });
    const release = () => { pressed.delete(code); button.classList.remove("pressed"); key(code, false); if (code === 87 || code === 83) key(code === 87 ? 38 : 40, false); };
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
  }
  window.addEventListener("blur", releaseKeys);
  document.addEventListener("visibilitychange", syncPause);
  window.addEventListener("pagehide", () => {
    saveFiles();
    if (ready) Module.pauseMainLoop();
    if (typeof SDL2 !== "undefined" && SDL2.audioContext) void SDL2.audioContext.close().catch(() => {});
  });
  window.addEventListener("error", () => notify("error"));
  window.addEventListener("unhandledrejection", () => notify("error"));
  setInterval(saveFiles, 2000);
  if (typeof WebAssembly === "undefined") notify("error");
})();
