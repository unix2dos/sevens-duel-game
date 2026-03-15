import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { mockPlay, mockHowl } = vi.hoisted(() => {
  const mockPlay = vi.fn();
  const mockHowl = vi.fn(() => ({ play: mockPlay }));

  return { mockPlay, mockHowl };
});

vi.mock("howler", () => ({ Howl: mockHowl }));

import { soundDefinitions } from "../sounds";
import { useSound } from "../useSound";

describe("useSound", () => {
  afterEach(() => {
    mockHowl.mockClear();
    mockPlay.mockClear();
  });

  it("does not play sounds when audio is disabled", () => {
    const { result } = renderHook(() => useSound(false));

    result.current.playSound("play");

    expect(mockPlay).not.toHaveBeenCalled();
  });

  it("plays a configured sound when audio is enabled", () => {
    const { result } = renderHook(() => useSound(true));

    result.current.playSound("play");

    expect(mockPlay).toHaveBeenCalledTimes(1);
  });

  it("does not throw when a sound definition has no sources", () => {
    const originalSources = soundDefinitions.play.src;
    soundDefinitions.play.src = undefined;

    const { result } = renderHook(() => useSound(true));

    expect(() => result.current.playSound("play")).not.toThrow();

    soundDefinitions.play.src = originalSources;
  });
});
