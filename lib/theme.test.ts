import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { currentTheme, setTheme, subscribeTheme } from "@/lib/theme";

const KEY = "vexora:theme:v1";

type Listener = () => void;
let systemListeners: Listener[] = [];

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  systemListeners = [];
  vi.spyOn(window, "matchMedia").mockImplementation(
    () =>
      ({
        matches: true,
        addEventListener: (_: string, fn: Listener) => systemListeners.push(fn),
        removeEventListener: (_: string, fn: Listener) => {
          systemListeners = systemListeners.filter((l) => l !== fn);
        },
      }) as unknown as MediaQueryList,
  );
});

afterEach(() => vi.restoreAllMocks());

describe("tema", () => {
  it("lê o tema atual pela classe dark do <html>", () => {
    expect(currentTheme()).toBe("light");
    document.documentElement.classList.add("dark");
    expect(currentTheme()).toBe("dark");
  });

  it("setTheme aplica a classe, guarda a escolha e avisa quem acompanha", () => {
    const onChange = vi.fn();
    const stop = subscribeTheme(onChange);
    setTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem(KEY)).toBe("dark");
    expect(onChange).toHaveBeenCalledTimes(1);
    stop();
    setTheme("light");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("sem escolha salva, acompanha a mudança do sistema", () => {
    const onChange = vi.fn();
    subscribeTheme(onChange);
    systemListeners.forEach((l) => l());
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(onChange).toHaveBeenCalled();
  });

  it("com escolha salva, ignora a mudança do sistema", () => {
    localStorage.setItem(KEY, "light");
    subscribeTheme(() => {});
    systemListeners.forEach((l) => l());
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("parar de acompanhar remove o listener do sistema", () => {
    const stop = subscribeTheme(() => {});
    expect(systemListeners).toHaveLength(1);
    stop();
    expect(systemListeners).toHaveLength(0);
  });
});
