import { Fragment } from "react";
import {
  Document,
  Font,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { NIVEIS, type Ajuste } from "@/lib/fit";
import { TITULOS_SECAO, type CvModel } from "@/lib/pdf/cv-model";
import { FONTE, FONTE_NEGRITO } from "@/lib/pdf/fontes";

// O hifenizador padrão é inglês: partiria palavras em português ("pro-gramação").
Font.registerHyphenationCallback((palavra) => [palavra]);

const COR_TEXTO = "#000000";
const COR_SECUNDARIA = "#333333";

function criarEstilos(a: Ajuste) {
  return StyleSheet.create({
    pagina: {
      fontFamily: FONTE,
      fontSize: a.fonte,
      lineHeight: a.lineHeight,
      color: COR_TEXTO,
      paddingTop: a.margemV,
      paddingBottom: a.margemV,
      paddingHorizontal: a.margemH,
    },
    nome: { fontFamily: FONTE_NEGRITO, fontSize: 26, lineHeight: 1.15 },
    cargo: {
      fontFamily: FONTE_NEGRITO,
      fontSize: a.fonte + 2,
      color: COR_SECUNDARIA,
      marginTop: 4,
    },
    contato: {
      fontSize: a.fonte - 1.5,
      color: COR_SECUNDARIA,
      marginTop: 5,
    },
    // Clicável, mas com a mesma aparência do texto (layout limpo para ATS).
    link: { color: COR_SECUNDARIA, textDecoration: "none" },
    secao: { marginTop: a.espacoSecao },
    tituloSecao: {
      fontFamily: FONTE_NEGRITO,
      fontSize: Math.max(a.fonte - 1, 9),
      // Espaçamento entre letras acima de ~0,05em faz o pdfjs (e leitores de
      // ATS) lerem "R E S U M O"; a checagem de títulos pega essa regressão.
      letterSpacing: 0.5,
      textTransform: "uppercase",
      borderBottomWidth: 0.75,
      borderBottomColor: COR_TEXTO,
      paddingBottom: 2,
      marginBottom: 5,
    },
    linhaCabecalho: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
    },
    tituloItem: { flex: 1, fontFamily: FONTE_NEGRITO },
    periodo: { flexShrink: 0 },
    item: { marginBottom: a.espacoItem },
    itemCompacto: { marginBottom: 2 },
    topico: { flexDirection: "row", paddingLeft: 4, marginTop: 1 },
    marcador: { width: 12 },
    textoTopico: { flex: 1 },
    negrito: { fontFamily: FONTE_NEGRITO },
  });
}

type Estilos = ReturnType<typeof criarEstilos>;

function Secao({
  s,
  titulo,
  children,
}: {
  s: Estilos;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.secao}>
      <Text style={s.tituloSecao}>{titulo}</Text>
      {children}
    </View>
  );
}

function Topico({ s, texto }: { s: Estilos; texto: string }) {
  return (
    <View style={s.topico} wrap={false}>
      <Text style={s.marcador}>•</Text>
      <Text style={s.textoTopico}>{texto}</Text>
    </View>
  );
}

/** Documento de 1 coluna, só texto: sem tabelas, imagens nem ícones. */
export function CvDocument({
  cv,
  ajuste = NIVEIS[0],
}: {
  cv: CvModel;
  ajuste?: Ajuste;
}) {
  const s = criarEstilos(ajuste);
  return (
    <Document
      title={cv.nome ? `CV — ${cv.nome}` : "CV"}
      author={cv.nome}
      language="pt-BR"
    >
      <Page size="A4" style={s.pagina}>
        <View>
          <Text style={s.nome}>{cv.nome}</Text>
          {cv.cargo ? <Text style={s.cargo}>{cv.cargo}</Text> : null}
          {cv.contato.length > 0 ? (
            <Text style={s.contato}>
              {cv.contato.map((c, i) => (
                <Fragment key={i}>
                  {i > 0 ? " · " : ""}
                  {c.href ? (
                    <Link src={c.href} style={s.link}>
                      {c.texto}
                    </Link>
                  ) : (
                    c.texto
                  )}
                </Fragment>
              ))}
            </Text>
          ) : null}
        </View>

        {cv.resumo ? (
          <Secao s={s} titulo={TITULOS_SECAO.resumo}>
            <Text>{cv.resumo}</Text>
          </Secao>
        ) : null}

        {cv.experiencias.length > 0 ? (
          <Secao s={s} titulo={TITULOS_SECAO.experiencia}>
            {cv.experiencias.map((e, i) => (
              <View key={i} style={s.item}>
                <View style={s.linhaCabecalho} wrap={false}>
                  <Text style={s.tituloItem}>{e.titulo}</Text>
                  <Text style={s.periodo}>{e.periodo}</Text>
                </View>
                {e.topicos.map((t, j) => (
                  <Topico key={j} s={s} texto={t} />
                ))}
              </View>
            ))}
          </Secao>
        ) : null}

        {cv.formacoes.length > 0 ? (
          <Secao s={s} titulo={TITULOS_SECAO.formacao}>
            {cv.formacoes.map((f, i) => (
              <View key={i} style={s.linhaCabecalho} wrap={false}>
                <Text style={{ flex: 1 }}>
                  <Text style={s.negrito}>{f.curso}</Text>
                  {f.curso && f.instituicao ? " — " : ""}
                  {f.instituicao}
                </Text>
                <Text style={s.periodo}>{f.periodo}</Text>
              </View>
            ))}
          </Secao>
        ) : null}

        {cv.certificacoes.length > 0 ? (
          <Secao s={s} titulo={TITULOS_SECAO.certificacoes}>
            {cv.certificacoes.map((c, i) => (
              <Topico key={i} s={s} texto={c} />
            ))}
          </Secao>
        ) : null}

        {cv.habilidades.length > 0 ? (
          <Secao s={s} titulo={TITULOS_SECAO.habilidades}>
            {cv.habilidades.map((h, i) => (
              <Text key={i} style={s.itemCompacto}>
                <Text style={s.negrito}>{h.rotulo}</Text> {h.itens}
              </Text>
            ))}
          </Secao>
        ) : null}

        {cv.idiomas.length > 0 ? (
          <Secao s={s} titulo={TITULOS_SECAO.idiomas}>
            <Text>{cv.idiomas.join(" · ")}</Text>
          </Secao>
        ) : null}
      </Page>
    </Document>
  );
}
