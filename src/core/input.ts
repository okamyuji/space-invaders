import type { Input } from "./loop.ts";

type Key = "ArrowLeft" | "ArrowRight" | "Space" | "Enter";

export type Keyboard = {
  readonly snapshot: () => Input;
  readonly enterPressed: () => boolean;
  readonly dispose: () => void;
};

export function createKeyboard(target: Window | HTMLElement = window): Keyboard {
  const down = new Set<Key>();
  let enterEdge = false;

  const onDown = (e: KeyboardEvent) => {
    const k = mapKey(e.code, e.key);
    if (!k) return;
    if (k === "Enter" && !down.has("Enter")) enterEdge = true;
    down.add(k);
    e.preventDefault();
  };
  const onUp = (e: KeyboardEvent) => {
    const k = mapKey(e.code, e.key);
    if (!k) return;
    down.delete(k);
  };

  target.addEventListener("keydown", onDown as EventListener);
  target.addEventListener("keyup", onUp as EventListener);

  return {
    snapshot: () => ({
      axis: down.has("ArrowLeft") ? -1 : down.has("ArrowRight") ? 1 : 0,
      fire: down.has("Space"),
    }),
    enterPressed: () => {
      const v = enterEdge;
      enterEdge = false;
      return v;
    },
    dispose: () => {
      target.removeEventListener("keydown", onDown as EventListener);
      target.removeEventListener("keyup", onUp as EventListener);
    },
  };
}

function mapKey(code: string, key: string): Key | null {
  if (code === "ArrowLeft" || key === "ArrowLeft") return "ArrowLeft";
  if (code === "ArrowRight" || key === "ArrowRight") return "ArrowRight";
  if (code === "Space" || key === " ") return "Space";
  if (code === "Enter" || key === "Enter") return "Enter";
  return null;
}
