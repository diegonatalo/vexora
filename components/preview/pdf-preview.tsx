"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icons";
import { loadPdfjs } from "@/lib/pdf/pdfjs";

/** Largura de renderização do canvas (nítido em telas 2x/3x). */
const WIDTH_PX = 1000;

type Props = {
  /** PDF já gerado e ajustado (o mesmo que será baixado). */
  bytes: Uint8Array | null;
  pages: number | null;
  generating: boolean;
  error: boolean;
};

/**
 * Desenha a página 1 do PDF em um canvas com pdfjs (funciona também em
 * celulares, onde <iframe> com PDF não funciona).
 */
export const PdfPreview = ({ bytes, pages, generating, error }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderFailed, setRenderFailed] = useState(false);

  useEffect(() => {
    if (!bytes) return;
    let cancelled = false;

    (async () => {
      const pdfjs = await loadPdfjs();
      // O pdfjs entrega o buffer ao worker (e o esvazia): passa uma cópia.
      const task = pdfjs.getDocument({ data: bytes.slice() });
      try {
        const doc = await task.promise;
        const page = await doc.getPage(1);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: WIDTH_PX / base.width });

        // Desenha fora da tela e só então copia: evita piscar e conflito
        // entre renderizações que se sobrepõem.
        const outside = document.createElement("canvas");
        outside.width = Math.floor(viewport.width);
        outside.height = Math.floor(viewport.height);
        await page.render({ canvas: outside, viewport }).promise;
        if (cancelled) return;

        const destination = canvasRef.current;
        if (!destination) return;
        destination.width = outside.width;
        destination.height = outside.height;
        destination.getContext("2d")?.drawImage(outside, 0, 0);
        setRenderFailed(false);
      } finally {
        void task.destroy();
      }
    })().catch(() => {
      if (!cancelled) setRenderFailed(true);
    });

    return () => {
      cancelled = true;
    };
  }, [bytes]);

  const withError = error || renderFailed;
  return (
    <div className="bg-stage border-line rounded-card border p-4 sm:p-6">
      <div className="relative">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Pré-visualização do CV em A4"
          className="shadow-sheet aspect-[1/1.4142] h-auto w-full rounded-[3px] bg-white"
        />
        {!bytes && !withError && (
          <p
            role="status"
            className="text-muted absolute inset-0 grid place-items-center text-sm"
          >
            Gerando pré-visualização…
          </p>
        )}
      </div>
      <p className="text-muted mt-4 text-center text-sm" role="status">
        {withError ? (
          <span className="text-warn-ink inline-flex items-center gap-1.5">
            <Icon name="alert" size={16} className="text-warn-icon" />
            Não foi possível gerar a pré-visualização.
          </span>
        ) : (
          <>
            Pré-visualização em tempo real · A4
            {pages !== null &&
              ` · ${pages} ${pages === 1 ? "página" : "páginas"}`}
            {generating && bytes ? " · atualizando…" : ""}
          </>
        )}
      </p>
    </div>
  );
};
