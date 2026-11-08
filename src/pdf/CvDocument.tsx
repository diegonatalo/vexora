import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { TITULOS_SECAO, type CvModel } from "@/lib/pdf/cv-model";

// O hifenizador padrão é inglês: partiria palavras em português ("pro-gramação").
Font.registerHyphenationCallback((palavra) => [palavra]);

// Helvetica é uma das 14 fontes padrão do PDF (equivalente ao Arial): não
// precisa ser embutida e mantém o texto real, selecionável e legível por ATS.
const FONTE = "Helvetica";
const FONTE_NEGRITO = "Helvetica-Bold";

const COR_TEXTO = "#000000";
const COR_SECUNDARIA = "#333333";

const s = StyleSheet.create({
  pagina: {
    fontFamily: FONTE,
    fontSize: 10.5,
    lineHeight: 1.35,
    color: COR_TEXTO,
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 56,
  },
  nome: { fontFamily: FONTE_NEGRITO, fontSize: 26, lineHeight: 1.15 },
  cargo: {
    fontFamily: FONTE_NEGRITO,
    fontSize: 13,
    color: COR_SECUNDARIA,
    marginTop: 4,
  },
  contato: { fontSize: 9.5, color: COR_SECUNDARIA, marginTop: 5 },
  secao: { marginTop: 14 },
  tituloSecao: {
    fontFamily: FONTE_NEGRITO,
    fontSize: 10,
    letterSpacing: 1,
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
  item: { marginBottom: 6 },
  itemCompacto: { marginBottom: 2 },
  topico: { flexDirection: "row", paddingLeft: 4, marginTop: 1 },
  marcador: { width: 12 },
  textoTopico: { flex: 1 },
  negrito: { fontFamily: FONTE_NEGRITO },
});

function Secao({
  titulo,
  children,
}: {
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

function Topico({ texto }: { texto: string }) {
  return (
    <View style={s.topico} wrap={false}>
      <Text style={s.marcador}>•</Text>
      <Text style={s.textoTopico}>{texto}</Text>
    </View>
  );
}

/** Documento de 1 coluna, só texto: sem tabelas, imagens nem ícones. */
export function CvDocument({ cv }: { cv: CvModel }) {
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
            <Text style={s.contato}>{cv.contato.join(" · ")}</Text>
          ) : null}
        </View>

        {cv.resumo ? (
          <Secao titulo={TITULOS_SECAO.resumo}>
            <Text>{cv.resumo}</Text>
          </Secao>
        ) : null}

        {cv.experiencias.length > 0 ? (
          <Secao titulo={TITULOS_SECAO.experiencia}>
            {cv.experiencias.map((e, i) => (
              <View key={i} style={s.item}>
                <View style={s.linhaCabecalho} wrap={false}>
                  <Text style={s.tituloItem}>{e.titulo}</Text>
                  <Text style={s.periodo}>{e.periodo}</Text>
                </View>
                {e.topicos.map((t, j) => (
                  <Topico key={j} texto={t} />
                ))}
              </View>
            ))}
          </Secao>
        ) : null}

        {cv.formacoes.length > 0 ? (
          <Secao titulo={TITULOS_SECAO.formacao}>
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
          <Secao titulo={TITULOS_SECAO.certificacoes}>
            {cv.certificacoes.map((c, i) => (
              <Topico key={i} texto={c} />
            ))}
          </Secao>
        ) : null}

        {cv.habilidades.length > 0 ? (
          <Secao titulo={TITULOS_SECAO.habilidades}>
            {cv.habilidades.map((h, i) => (
              <Text key={i} style={s.itemCompacto}>
                <Text style={s.negrito}>{h.rotulo}</Text> {h.itens}
              </Text>
            ))}
          </Secao>
        ) : null}

        {cv.idiomas.length > 0 ? (
          <Secao titulo={TITULOS_SECAO.idiomas}>
            <Text>{cv.idiomas.join(" · ")}</Text>
          </Secao>
        ) : null}
      </Page>
    </Document>
  );
}
