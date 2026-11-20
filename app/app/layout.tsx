import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editor de CV",
  alternates: { canonical: "/app" },
};

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
