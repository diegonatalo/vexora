### 🔎 SEO e compartilhamento

- `sitemap.xml` e `robots.txt` vêm de `app/sitemap.ts` e `app/robots.ts`.
- Open Graph e Twitter Card (título, descrição e imagem de 1200x630) são definidos em `app/layout.tsx`. A landing (`/`) apresenta o projeto, e o editor mora em `/app`, com título próprio. O endereço antigo `/editor` redireciona para `/app` (308, em `lib/redirects.ts`), então links antigos continuam valendo.
- O endereço público vem de `lib/site.ts`: `NEXT_PUBLIC_SITE_URL` se definida, `http://localhost:3000` em desenvolvimento e `https://vexoradn.vercel.app` nos demais casos.
- Favicon: `icon.svg`, `favicon.ico` e `apple-icon.png` em `app/`.
