import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AppData } from "@/lib/storage";

const storage = vi.hoisted(() => ({
  loadData: vi.fn<() => Promise<AppData>>(),
  saveData: vi.fn<(data: AppData) => Promise<void>>(),
}));
vi.mock("@/lib/storage", () => storage);

import { useData } from "@/hooks/use-data";

const data = (name: string) => ({ profile: { name } }) as unknown as AppData;

beforeEach(() => {
  storage.loadData.mockReset().mockResolvedValue(data("Ana"));
  storage.saveData.mockReset().mockResolvedValue(undefined);
});

afterEach(() => vi.useRealTimers());

describe("useData", () => {
  it("começa carregando e depois entrega os dados salvos", async () => {
    const { result } = renderHook(() => useData());
    expect(result.current).toMatchObject({ data: null, state: "loading" });
    await waitFor(() => expect(result.current.state).toBe("saved"));
    expect(result.current.data).toEqual(data("Ana"));
  });

  it("se a carga falhar, mostra erro", async () => {
    storage.loadData.mockRejectedValue(new Error("sem IndexedDB"));
    const { result } = renderHook(() => useData());
    await waitFor(() => expect(result.current.state).toBe("error"));
  });

  it("grava só depois de uma pausa e só a última versão", async () => {
    const { result } = renderHook(() => useData());
    await waitFor(() => expect(result.current.state).toBe("saved"));
    vi.useFakeTimers();

    act(() => result.current.update(data("A")));
    act(() => result.current.update(data("Ab")));
    expect(result.current).toMatchObject({ data: data("Ab"), state: "saving" });
    expect(storage.saveData).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(storage.saveData).toHaveBeenCalledTimes(1);
    expect(storage.saveData).toHaveBeenCalledWith(data("Ab"));
    expect(result.current.state).toBe("saved");
  });

  it("se a gravação falhar, mostra erro", async () => {
    storage.saveData.mockRejectedValue(new Error("cheio"));
    const { result } = renderHook(() => useData());
    await waitFor(() => expect(result.current.state).toBe("saved"));
    vi.useFakeTimers();
    act(() => result.current.update(data("B")));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(result.current.state).toBe("error");
  });

  it("ao sair da página, grava na hora o que estava pendente", async () => {
    const { result } = renderHook(() => useData());
    await waitFor(() => expect(result.current.state).toBe("saved"));
    act(() => result.current.update(data("C")));
    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });
    expect(storage.saveData).toHaveBeenCalledWith(data("C"));
  });

  it("ao desmontar, também grava o pendente", async () => {
    const { result, unmount } = renderHook(() => useData());
    await waitFor(() => expect(result.current.state).toBe("saved"));
    act(() => result.current.update(data("D")));
    unmount();
    expect(storage.saveData).toHaveBeenCalledWith(data("D"));
  });
});
