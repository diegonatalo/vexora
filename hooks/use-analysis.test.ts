import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Prepared } from "@/lib/pdf/prepare";
import type { Profile } from "@/lib/schema";

const preparePdf = vi.hoisted(() => vi.fn<(profile: Profile) => Promise<Prepared>>());
vi.mock("@/lib/pdf/prepare", () => ({ preparePdf }));

import { useAnalysis } from "@/hooks/use-analysis";

const profile = (name: string) => ({ name }) as unknown as Profile;
const prepared = (label: string) => ({ label }) as unknown as Prepared;

const settle = () =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(400);
  });

beforeEach(() => {
  vi.useFakeTimers();
  preparePdf.mockReset().mockImplementation(async (p) => prepared((p as unknown as { name: string }).name));
});

afterEach(() => vi.useRealTimers());

describe("useAnalysis", () => {
  it("gera o PDF depois da pausa de digitação", async () => {
    const a = profile("A");
    const { result } = renderHook(() => useAnalysis(a));
    expect(result.current).toEqual({ state: "generating", prepared: null });
    expect(preparePdf).not.toHaveBeenCalled();
    await settle();
    expect(result.current).toEqual({ state: "ready", prepared: prepared("A") });
  });

  it("mantém o resultado anterior enquanto gera o novo", async () => {
    const { result, rerender } = renderHook(({ p }) => useAnalysis(p), { initialProps: { p: profile("A") } });
    await settle();
    rerender({ p: profile("B") });
    expect(result.current).toEqual({ state: "generating", prepared: prepared("A") });
    await settle();
    expect(result.current.prepared).toEqual(prepared("B"));
  });

  it("digitação rápida gera só uma vez, com o último perfil", async () => {
    const { rerender } = renderHook(({ p }) => useAnalysis(p), { initialProps: { p: profile("A") } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    rerender({ p: profile("AB") });
    await settle();
    expect(preparePdf).toHaveBeenCalledTimes(1);
    expect(preparePdf).toHaveBeenCalledWith(profile("AB"));
  });

  it("se a geração falhar, avisa o erro e mantém o último resultado", async () => {
    const { result, rerender } = renderHook(({ p }) => useAnalysis(p), { initialProps: { p: profile("A") } });
    await settle();
    preparePdf.mockRejectedValueOnce(new Error("fonte"));
    rerender({ p: profile("B") });
    await settle();
    expect(result.current).toEqual({ state: "error", prepared: prepared("A") });
  });
});
