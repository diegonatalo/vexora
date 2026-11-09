import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ItemOrdenavel, ListaOrdenavel } from "@/components/editor/Ordenavel";

const ALTURA = 100;

// O jsdom não tem layout: cada item ocupa uma faixa de 100px, em ordem.
function simularLayout() {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    function (this: Element) {
      const item = this.closest("[data-item]") ?? this;
      const indice = Number(item.getAttribute("data-item") ?? 0);
      const top = indice * ALTURA;
      return {
        x: 0,
        y: top,
        top,
        left: 0,
        right: 300,
        bottom: top + ALTURA,
        width: 300,
        height: ALTURA,
        toJSON: () => ({}),
      } as DOMRect;
    },
  );
}

function Exemplo({ onMover }: { onMover: (de: number, para: number) => void }) {
  const ids = ["a", "b", "c"];
  return (
    <ListaOrdenavel ids={ids} rotulo="item" onMover={onMover}>
      {ids.map((id, i) => (
        <div key={id} data-item={i}>
          <ItemOrdenavel id={id} rotuloAlca={`Reordenar ${id}`}>
            {(alca) => (
              <div>
                {alca}
                <span>{id}</span>
              </div>
            )}
          </ItemOrdenavel>
        </div>
      ))}
    </ListaOrdenavel>
  );
}

describe("ListaOrdenavel", () => {
  beforeEach(simularLayout);
  afterEach(() => vi.restoreAllMocks());

  it("reordena pelo teclado: espaço, seta e espaço", async () => {
    const aoMover = vi.fn();
    render(<Exemplo onMover={aoMover} />);
    const alca = screen.getByRole("button", { name: "Reordenar a" });
    alca.focus();
    const esperar = () => act(() => new Promise((r) => setTimeout(r, 120)));
    fireEvent.keyDown(alca, { code: "Space", key: " " });
    await esperar();
    fireEvent.keyDown(document, { code: "ArrowDown", key: "ArrowDown" });
    await esperar();
    fireEvent.keyDown(document, { code: "Space", key: " " });
    await esperar();
    await vi.waitFor(() => expect(aoMover).toHaveBeenCalledWith(0, 1));
  });
});
