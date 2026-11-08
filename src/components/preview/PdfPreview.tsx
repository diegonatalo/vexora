"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icons";
import { carregarPdfjs } from "@/lib/pdf/pdfjs";

/** Largura de renderização do canvas (nítido em telas 2x/3x). */
const LARGURA_PX = 1000;

type Props = {
  /** PDF já gerado e ajustado (o mesmo que será baixado). */
  bytes: Uint8Array | null;
  paginas: number | null;
  gerando: boolean;
  erro: boolean;
};

/**
 * Desenha a página 1 do PDF em um canvas com pdfjs (funciona também em
 * celulares, onde <iframe> com PDF não funciona).
 */
export default function PdfPreview({ bytes, paginas, gerando, erro }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [falhouAoDesenhar, setFalhouAoDesenhar] = useState(false);

  useEffect(() => {
    if (!bytes) return;
    let cancelado = false;

    (async () => {
      const pdfjs = await carregarPdfjs();
      // O pdfjs entrega o buffer ao worker (e o esvazia): passa uma cópia.
      const tarefa = pdfjs.getDocument({ data: bytes.slice() });
      try {
        const doc = await tarefa.promise;
        const pagina = await doc.getPage(1);
        const base = pagina.getViewport({ scale: 1 });
        const viewport = pagina.getViewport({ scale: LARGURA_PX / base.width });

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
        setFalhouAoDesenhar(false);
      } finally {
        void tarefa.destroy();
      }
    })().catch(() => {
      if (!cancelado) setFalhouAoDesenhar(true);
    });

    return () => {
      cancelado = true;
    };
  }, [bytes]);

  const comErro = erro || falhouAoDesenhar;
  return (
    <div className="bg-stage border-line rounded-card border p-4 sm:p-6">
      <div className="relative">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Pré-visualização do CV em A4"
          className="shadow-sheet aspect-[1/1.4142] h-auto w-full rounded-[3px] bg-white"
        />
        {!bytes && !comErro && (
          <p
            role="status"
            className="text-muted absolute inset-0 grid place-items-center text-sm"
          >
            Gerando pré-visualização…
          </p>
        )}
      </div>
      <p className="text-muted mt-4 text-center text-sm" role="status">
        {comErro ? (
          <span className="text-warn-ink inline-flex items-center gap-1.5">
            <Icon name="alert" size={16} className="text-warn-icon" />
            Não foi possível gerar a pré-visualização.
          </span>
        ) : (
          <>
            Pré-visualização em tempo real · A4
            {paginas !== null &&
              ` · ${paginas} ${paginas === 1 ? "página" : "páginas"}`}
            {gerando && bytes ? " · atualizando…" : ""}
          </>
        )}
      </p>
    </div>
  );
}
