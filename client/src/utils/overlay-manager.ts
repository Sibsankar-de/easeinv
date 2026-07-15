type CloseCallback = () => void;
const overlayStack: CloseCallback[] = [];

export const OverlayManager = {
  push(closeFn: CloseCallback) {
    if (!overlayStack.includes(closeFn)) {
      overlayStack.push(closeFn);
    }
  },
  pop(closeFn: CloseCallback) {
    const index = overlayStack.indexOf(closeFn);
    if (index !== -1) {
      overlayStack.splice(index, 1);
    }
  },
  handleEscape() {
    if (overlayStack.length > 0) {
      const closeFn = overlayStack[overlayStack.length - 1];
      closeFn();
      return true;
    }
    return false;
  },
};

if (typeof window !== "undefined") {
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const handled = OverlayManager.handleEscape();
      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  });
}
