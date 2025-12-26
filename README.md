# Martial arts movies

A martial arts movie catalog where users can discover movies by **martial arts style**, **genre**, **country** and **decade**.

## Key features

- Minimalistic and responsive design that covers mobile/tablet/desktop
- Hybrid rendering strategy: SSG where possible, SSR otherwise for performance and SEO
- Shareable, SEO-friendly filters with state persisted in the URL

## ETL data pipeline (where i get my data)

1. Fetches raw movie data from **TMDb API**
2. Creates and sends batch requests to **OpenAI API** to classify movies by martial arts style
3. Normalises and seeds the **SQLite** database with movies

## Automated CI/CD pipeline:

- **ESLint** for code quality and consistency
- **TypeScript** type checking for compile-time safety
- **Vitest** unit and integration tests
- **Playwright** E2E tests
- Automated deployment to **Vercel**

## Stack

#### framework & language

[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white&style=for-the-badge)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge)](#)

#### ui

[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-black?logo=shadcnui&logoColor=white&style=for-the-badge)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-%2338B2AC.svg?logo=tailwind-css&logoColor=white&style=for-the-badge)](#)

#### db

[![SQLite](https://img.shields.io/badge/SQLite-%2307405e.svg?logo=sqlite&logoColor=white&style=for-the-badge)](#)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white&style=for-the-badge)](#)

#### tests

[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white&style=for-the-badge)](#)
[![Playwright](https://custom-icon-badges.demolab.com/badge/Playwright-2EAD33?logo=playwright&logoColor=white&style=for-the-badge)](#)
[![Testing Library](https://img.shields.io/badge/Testing%20Library-E33332?logo=testinglibrary&logoColor=white&style=for-the-badge)](#)

#### ci/cd

[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?logo=github-actions&logoColor=white&style=for-the-badge)](#)
[![Vercel](https://img.shields.io/badge/Vercel-%23000000.svg?logo=vercel&logoColor=white&style=for-the-badge)](#)

#### analytics

[![Umami](https://img.shields.io/badge/Umami-black?&logo=umami&logoColor=white&style=for-the-badge)](#)
