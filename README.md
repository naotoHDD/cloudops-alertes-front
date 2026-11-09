# CloudOps Manager — Frontend « Alertes & incidents »

Première étape du projet CloudOps Manager : **uniquement le frontend Next.js**.
Le but est de comprendre comment afficher des alertes et suivre le traitement d'un incident.

> ⚠️ **Démo / prototype.** Pas de connexion à un serveur réel, de base de données, de backend NestJS ni d'authentification. Les incidents sont simulés. Ne pas utiliser ce prototype pour surveiller une infrastructure de production.

## Démarrer le projet

Avoir **Node.js** et **npm** installés.

```bash
npm install
npm run dev
```

Ouvrir **http://localhost:3000**.

Vérifier TypeScript :

```bash
npm run typecheck
```

Préparer une version de production :

```bash
npm run build
npm run start
```

## Fonctionnalités déjà codées

1. Voir les alertes et les statistiques (nouvelles, en cours, résolues).
2. Rechercher par titre ou serveur et filtrer par état.
3. Simuler trois problèmes : CPU élevé, RAM élevée, serveur hors ligne.
4. Lire le détail d'un incident et son historique.
5. Passer de **Nouvelle → En cours → Résolue**.
6. Conserver les changements dans `localStorage` (dans ce navigateur seulement).
7. Réinitialiser les données de démonstration.

## Comprendre les fichiers

```text
src/
├── app/
│   ├── page.tsx            # Ouvre la page principale
│   ├── layout.tsx          # Structure générale HTML
│   └── globals.css         # Apparence / responsive
├── components/
│   └── TableauAlertes.tsx  # Interface et boutons interactifs
└── lib/
    ├── types.ts           # Types TypeScript
    └── demo-data.ts       # Seuils, scénarios et données fictives
```

Les commentaires dans le code expliquent les idées principales.

## Comment fonctionne la simulation ?

- CPU : une alerte si la valeur est **strictement supérieure à 85 %**.
- RAM : une alerte si la valeur est **strictement supérieure à 90 %**.
- Disponibilité : une alerte si la valeur est **0** (hors ligne).

Ces seuils ont été choisis **pour la démo**, pas pour une surveillance réelle.
Cliquer sur un des trois scénarios ajoute une alerte dans la liste. Elle peut ensuite être prise en charge et résolue.

## Étapes suivantes (non réalisées)

- Créer l'API **NestJS** (`GET /alerts`, `POST /alerts`, `PATCH /alerts/:id`).
- Connecter **PostgreSQL + Prisma** pour enregistrer les alertes.
- Ajouter l'authentification **JWT** et les rôles (Admin / DevOps / Viewer).
- Connecter le frontend à l'API, puis intégrer du monitoring côté backend.
- Ajouter les tests et Docker.

## GitHub

Ce dépôt contient la **version initiale du frontend**, avec données simulées et commentaires pédagogiques.
