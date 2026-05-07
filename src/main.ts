// Stub entry — wired during the Renderer task.
// Keeping this file present so `vite build` / dev server can resolve the module.
const canvas = document.getElementById("game") as HTMLCanvasElement | null;
if (canvas) {
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#fff";
    ctx.font = "12px monospace";
    ctx.fillText("LOADING…", 220, 140);
  }
}
