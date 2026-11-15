import { describe, expect, it } from "vitest";
import { readDocument } from "@/lib/pdf/read-document";

const ops = { paintImageXObject: 85, paintInlineImageXObject: 86, paintImageMaskXObject: 83 };

const page = (items: unknown[], fnArray: number[], view = [0, 0, 595, 842]) => ({
  view,
  getTextContent: async () => ({ items }),
  getOperatorList: async () => ({ fnArray }),
});

const doc = (pages: ReturnType<typeof page>[]) => ({
  numPages: pages.length,
  getPage: async (n: number) => pages[n - 1],
});

describe("readDocument", () => {
  it("extrai o texto de cada página com posição e tamanho da fonte", async () => {
    const { pages } = await readDocument(
      doc([
        page(
          [
            { str: "Ana Souza", transform: [18, 0, 0, 18, 50, 800], hasEOL: true },
            { str: "Desenvolvedora", transform: [0, 0, 6, 8, 50, 780] },
          ],
          [],
        ),
      ]),
      ops,
    );
    expect(pages).toEqual([
      {
        height: 842,
        items: [
          { str: "Ana Souza", y: 800, size: 18 },
          { str: "Desenvolvedora", y: 780, size: 10 },
        ],
        text: "Ana Souza\nDesenvolvedora",
      },
    ]);
  });

  it("ignora itens que não são texto (marcadores do pdfjs)", async () => {
    const { pages } = await readDocument(
      doc([page([{ type: "beginMarkedContent" }, { str: "ok", transform: [1, 0, 0, 1, 0, 0] }], [])]),
      ops,
    );
    expect(pages[0].items).toHaveLength(1);
    expect(pages[0].text).toBe("ok");
  });

  it("conta as imagens de todas as páginas, dos três tipos", async () => {
    const { images, pages } = await readDocument(
      doc([page([], [85, 1, 86]), page([], [83, 2, 3]), page([], [])]),
      ops,
    );
    expect(pages).toHaveLength(3);
    expect(images).toBe(3);
  });

  it("calcula a altura pela caixa da página", async () => {
    const { pages } = await readDocument(doc([page([], [], [0, 10, 612, 802])]), ops);
    expect(pages[0].height).toBe(792);
  });
});
