"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icons";
import { montarCv } from "@/lib/pdf/cv-model";
import { gerarPdfBlob } from "@/lib/pdf/gerar";
import type { Perfil } from "@/lib/schema";

const DEBOUNCE_MS = 400;
/** Largura de renderização do canvas (nítido em telas 2x/3x). */
const LARGURA_PX = 1000;

type Estado =
  { tipo: "gerando" } | { tipo: "pronto"; paginas: number } | { tipo: "erro" };

/**
 * Pré-visualização do PDF real: gera o mesmo documento do download e o
 * desenha em um canvas com pdfjs (funciona também em celulares, onde
 * <iframe> com PDF não funciona). Atualiza com debounce.
 */
export default function PdfPreview({ perfil }: { perfil: Perfil }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [estado, setEstado] = useState<Estado>({ tipo: "gerando" });

  useEffect(() => {
    let cancelado = false;
    const temporizador = setTimeout(async () => {
      try {
        const [pdfjs, blob] = await Promise.all([
          import("pdfjs-dist"),
          gerarPdfBlob(montarCv(perfil, { placeholders: true })),
        ]);
        if (cancelado) return;
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();

        const tarefa = pdfjs.getDocument({
          data: new Uint8Array(await blob.arrayBuffer()),
        });
        try {
          const doc = await tarefa.promise;
          const pagina = await doc.getPage(1);
          const base = pagina.getViewport({ scale: 1 });
          const viewport = pagina.getViewport({
            scale: LARGURA_PX / base.width,
          });

          // Desenha fora da tela e só então copia: evita piscar e conflito
          // entre renderizações que se sobrepõem.
          const fora = document.createElement("canvas");
          fora.width = Math.floor(viewport.width);
          fora.height = Math.floor(viewport.height);
          await pagina.render({ canvas: fora, viewport }).promise;
          if (cancelado) return;

          const destino = canvasRef.current;
          if (!destino) return;
          destino.width = fora.width;
          destino.height = fora.height;
          destino.getContext("2d")?.drawImage(fora, 0, 0);
          setEstado({ tipo: "pronto", paginas: doc.numPages });
        } finally {
          void tarefa.destroy();
        }
      } catch {
        if (!cancelado) setEstado({ tipo: "erro" });
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [perfil]);

  return (
    <div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Pré-visualização do CV em A4"
          className="border-line aspect-[1/1.4142] h-auto w-full border bg-white"
        />
        {estado.tipo === "gerando" && (
          <p
            role="status"
            className="text-muted absolute inset-0 grid place-items-center text-sm"
          >
            Gerando pré-visualização…
          </p>
        )}
      </div>
      <p className="text-muted mt-3 text-center text-sm" role="status">
        {estado.tipo === "erro" ? (
          <span className="text-warn-ink inline-flex items-center gap-1.5">
            <Icon name="alert" size={16} className="text-warn-icon" />
            Não foi possível gerar a pré-visualização.
          </span>
        ) : estado.tipo === "pronto" ? (
          `Pré-visualização em tempo real · A4 · ${estado.paginas} ${
            estado.paginas === 1 ? "página" : "páginas"
          }`
        ) : (
          "Pré-visualização em tempo real · A4"
        )}
      </p>
    </div>
  );
}
