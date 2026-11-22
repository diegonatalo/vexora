import type { Metadata } from "next";
import { EditorScreen } from "@/components/editor-screen";

export const metadata: Metadata = { alternates: { canonical: "/app" } };

export default function Page() {
  return <EditorScreen />;
}
