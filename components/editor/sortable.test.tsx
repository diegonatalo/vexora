import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SortableItem, SortableList } from "@/components/editor/sortable";

const HEIGHT = 100;

// O jsdom não tem layout: cada item ocupa uma faixa de 100px, em ordem.
function simulateLayout() {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    function (this: Element) {
      const item = this.closest("[data-item]") ?? this;
      const index = Number(item.getAttribute("data-item") ?? 0);
      const top = index * HEIGHT;
      return {
        x: 0,
        y: top,
        top,
        left: 0,
        right: 300,
        bottom: top + HEIGHT,
        width: 300,
        height: HEIGHT,
        toJSON: () => ({}),
      } as DOMRect;
    },
  );
}

function Example({ onMove }: { onMove: (from: number, to: number) => void }) {
  const ids = ["a", "b", "c"];
  return (
    <SortableList ids={ids} label="item" onMove={onMove}>
      {ids.map((id, i) => (
        <div key={id} data-item={i}>
          <SortableItem id={id} handleLabel={`Reordenar ${id}`}>
            {(handle) => (
              <div>
                {handle}
                <span>{id}</span>
              </div>
            )}
          </SortableItem>
        </div>
      ))}
    </SortableList>
  );
}

describe("ListaOrdenavel", () => {
  beforeEach(simulateLayout);
  afterEach(() => vi.restoreAllMocks());

  it("reordena pelo teclado: espaço, seta e espaço", async () => {
    const onMove = vi.fn();
    render(<Example onMove={onMove} />);
    const handle = screen.getByRole("button", { name: "Reordenar a" });
    handle.focus();
    const wait = () => act(() => new Promise((r) => setTimeout(r, 120)));
    fireEvent.keyDown(handle, { code: "Space", key: " " });
    await wait();
    fireEvent.keyDown(document, { code: "ArrowDown", key: "ArrowDown" });
    await wait();
    fireEvent.keyDown(document, { code: "Space", key: " " });
    await wait();
    await vi.waitFor(() => expect(onMove).toHaveBeenCalledWith(0, 1));
  });
});
