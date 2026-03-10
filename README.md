# Micro SaaS Gestor MEI

Micro SaaS para MEIs: organização financeira simples e emissão/registro de cobranças.

## Tecnologias
- Next.js (App Router, TypeScript)
- Tailwind CSS
- PostgreSQL no Neon
- Prisma para ORM
- Autenticação por e-mail/senha ou OAuth

## Ambientes
- **Desenvolvimento**: localhost:3000
- **Preview**: Vercel (por branch)
- **Produção**: Vercel

## Fluxo de trabalho (trunk-based)
- Branch `main`: produção
- Branch `develop`: desenvolvimento
- Feature branches: `feature/*`
- Hotfix branches: `hotfix/*`

## Configuração inicial
1. Clone o repositório
2. Instale dependências: `npm install`
3. Configure ambiente: `.env.local`
4. Rode migrações: `npx prisma migrate dev`
5. Inicie servidor: `npm run dev`