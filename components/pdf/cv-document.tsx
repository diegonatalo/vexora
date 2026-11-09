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
import { FIT_LEVELS } from "@/lib/fit";
import type { LayoutFit } from "@/types/pdf";
import { SECTION_TITLES, type CvModel } from "@/lib/pdf/cv-model";
import { FONT, FONT_BOLD } from "@/lib/pdf/fonts";

// O hifenizador padrão é inglês: partiria palavras em português ("pro-gramação").
Font.registerHyphenationCallback((word) => [word]);

const TEXT_COLOR = "#000000";
const SECONDARY_COLOR = "#333333";

function createStyles(a: LayoutFit) {
  return StyleSheet.create({
    page: {
      fontFamily: FONT,
      fontSize: a.font,
      lineHeight: a.lineHeight,
      color: TEXT_COLOR,
      paddingTop: a.marginV,
      paddingBottom: a.marginV,
      paddingHorizontal: a.marginH,
    },
    name: { fontFamily: FONT_BOLD, fontSize: 26, lineHeight: 1.15 },
    jobTitle: {
      fontFamily: FONT_BOLD,
      fontSize: a.font + 2,
      color: SECONDARY_COLOR,
      marginTop: 4,
    },
    contact: {
      fontSize: a.font - 1.5,
      color: SECONDARY_COLOR,
      marginTop: 5,
    },
    // Clicável, mas com a mesma aparência do texto (layout limpo para ATS).
    link: { color: SECONDARY_COLOR, textDecoration: "none" },
    section: { marginTop: a.sectionSpacing },
    sectionTitle: {
      fontFamily: FONT_BOLD,
      fontSize: Math.max(a.font - 1, 9),
      // Espaçamento entre letras acima de ~0,05em faz o pdfjs (e leitores de
      // ATS) lerem "R E S U M O"; a checagem de títulos pega essa regressão.
      letterSpacing: 0.5,
      textTransform: "uppercase",
      borderBottomWidth: 0.75,
      borderBottomColor: TEXT_COLOR,
      paddingBottom: 2,
      marginBottom: 5,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
    },
    itemTitle: { flex: 1, fontFamily: FONT_BOLD },
    period: { flexShrink: 0 },
    item: { marginBottom: a.itemSpacing },
    compactItem: { marginBottom: 2 },
    bullet: { flexDirection: "row", paddingLeft: 4, marginTop: 1 },
    marker: { width: 12 },
    bulletText: { flex: 1 },
    bold: { fontFamily: FONT_BOLD },
  });
}

type Styles = ReturnType<typeof createStyles>;

const Section = ({
  s,
  title,
  children,
}: {
  s: Styles;
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
};

const Bullet = ({ s, text }: { s: Styles; text: string }) => {
  return (
    <View style={s.bullet} wrap={false}>
      <Text style={s.marker}>•</Text>
      <Text style={s.bulletText}>{text}</Text>
    </View>
  );
};

/** Documento de 1 coluna, só texto: sem tabelas, imagens nem ícones. */
export const CvDocument = ({
  cv,
  layoutFit = FIT_LEVELS[0],
}: {
  cv: CvModel;
  layoutFit?: LayoutFit;
}) => {
  const s = createStyles(layoutFit);
  return (
    <Document
      title={cv.name ? `CV — ${cv.name}` : "CV"}
      author={cv.name}
      language="pt-BR"
    >
      <Page size="A4" style={s.page}>
        <View>
          <Text style={s.name}>{cv.name}</Text>
          {cv.jobTitle ? <Text style={s.jobTitle}>{cv.jobTitle}</Text> : null}
          {cv.contact.length > 0 ? (
            <Text style={s.contact}>
              {cv.contact.map((c, i) => (
                <Fragment key={i}>
                  {i > 0 ? " · " : ""}
                  {c.href ? (
                    <Link src={c.href} style={s.link}>
                      {c.text}
                    </Link>
                  ) : (
                    c.text
                  )}
                </Fragment>
              ))}
            </Text>
          ) : null}
        </View>

        {cv.summary ? (
          <Section s={s} title={SECTION_TITLES.summary}>
            <Text>{cv.summary}</Text>
          </Section>
        ) : null}

        {cv.experiences.length > 0 ? (
          <Section s={s} title={SECTION_TITLES.experience}>
            {cv.experiences.map((e, i) => (
              <View key={i} style={s.item}>
                <View style={s.headerRow} wrap={false}>
                  <Text style={s.itemTitle}>{e.title}</Text>
                  <Text style={s.period}>{e.period}</Text>
                </View>
                {e.bullets.map((t, j) => (
                  <Bullet key={j} s={s} text={t} />
                ))}
              </View>
            ))}
          </Section>
        ) : null}

        {cv.educations.length > 0 ? (
          <Section s={s} title={SECTION_TITLES.education}>
            {cv.educations.map((f, i) => (
              <View key={i} style={s.headerRow} wrap={false}>
                <Text style={{ flex: 1 }}>
                  <Text style={s.bold}>{f.course}</Text>
                  {f.course && f.institution ? " — " : ""}
                  {f.institution}
                </Text>
                <Text style={s.period}>{f.period}</Text>
              </View>
            ))}
          </Section>
        ) : null}

        {cv.certifications.length > 0 ? (
          <Section s={s} title={SECTION_TITLES.certifications}>
            {cv.certifications.map((c, i) => (
              <Bullet key={i} s={s} text={c} />
            ))}
          </Section>
        ) : null}

        {cv.skills.length > 0 ? (
          <Section s={s} title={SECTION_TITLES.skills}>
            {cv.skills.map((h, i) => (
              <Text key={i} style={s.compactItem}>
                {h.label ? <Text style={s.bold}>{h.label} </Text> : null}
                {h.items}
              </Text>
            ))}
          </Section>
        ) : null}

        {cv.languages.length > 0 ? (
          <Section s={s} title={SECTION_TITLES.languages}>
            <Text>{cv.languages.join(" · ")}</Text>
          </Section>
        ) : null}
      </Page>
    </Document>
  );
};
