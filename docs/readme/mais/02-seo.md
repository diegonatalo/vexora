### 🔎 SEO e compartilhamento

- `sitemap.xml` e `robots.txt` vêm de `src/app/sitemap.ts` e `src/app/robots.ts`.
- Open Graph e Twitter Card (título, descrição e imagem de 1200x630) são definidos em `src/app/layout.tsx`. A rota `/editor` tem título próprio.
- O endereço público vem de `src/lib/site.ts`: `NEXT_PUBLIC_SITE_URL` se definida, `http://localhost:3000` em desenvolvimento e `https://vexoradn.vercel.app` nos demais casos.
- Favicon: `icon.svg`, `favicon.ico` e `apple-icon.png` em `src/app/`.
