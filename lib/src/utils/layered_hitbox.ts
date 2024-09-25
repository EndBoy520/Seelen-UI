import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

export async function declareDocumentAsLayeredHitbox() {
  const webview = getCurrentWebviewWindow();
  const { x, y } = await webview.outerPosition();
  const { width, height } = await webview.outerSize();

  let webviewRect = { x, y, width, height };
  let ignoring_cursor_events = true;
  await webview.setIgnoreCursorEvents(true);

  webview.onMoved((e) => {
    webviewRect.x = e.payload.x;
    webviewRect.y = e.payload.y;
  });

  webview.onResized((e) => {
    webviewRect.width = e.payload.width;
    webviewRect.height = e.payload.height;
  });

  webview.listen<[x: number, y: number]>('global-mouse-move', (event) => {
    const [mouseX, mouseY] = event.payload;
    let { x: windowX, y: windowY, width: windowWidth, height: windowHeight } = webviewRect;

    // check if the mouse is inside the window
    const isHoverWindow =
      mouseX >= windowX &&
      mouseX <= windowX + windowWidth &&
      mouseY >= windowY &&
      mouseY <= windowY + windowHeight;

    if (!isHoverWindow) {
      return;
    }

    const adjustedX = (mouseX - windowX) / window.devicePixelRatio;
    const adjustedY = (mouseY - windowY) / window.devicePixelRatio;

    let isOverBody = document.elementFromPoint(adjustedX, adjustedY) == document.body;
    if (isOverBody && !ignoring_cursor_events) {
      ignoring_cursor_events = true;
      webview.setIgnoreCursorEvents(true);
    }

    if (!isOverBody && ignoring_cursor_events) {
      ignoring_cursor_events = false;
      webview.setIgnoreCursorEvents(false);
    }
  });
}
