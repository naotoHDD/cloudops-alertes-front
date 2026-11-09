import type { Alerte } from "./types";

// Données fictives : elles permettent de tester le frontend sans backend.
export const alertesInitiales: Alerte[] = [
  {
    id: 1, titre: "CPU élevé", serveur: "web-prod-01",
    description: "Le processeur dépasse le seuil de démonstration de 85 %.",
    gravite: "Critique", statut: "Nouvelle", date: "2026-11-09T08:20:00.000Z",
    historique: [{ date: "2026-11-09T08:20:00.000Z", message: "Alerte détectée" }],
  },
  {
    id: 2, titre: "Mémoire RAM élevée", serveur: "db-test-02",
    description: "L'utilisation de la mémoire dépasse 90 %.",
    gravite: "Élevée", statut: "En cours", date: "2026-11-09T07:40:00.000Z",
    historique: [{ date: "2026-11-09T07:40:00.000Z", message: "Alerte détectée" },
      { date: "2026-11-09T08:00:00.000Z", message: "Incident pris en charge" }],
  },
  {
    id: 3, titre: "Serveur indisponible", serveur: "api-dev-03",
    description: "Le serveur a été signalé hors ligne dans la simulation.",
    gravite: "Critique", statut: "Résolue", date: "2026-11-08T14:30:00.000Z",
    historique: [{ date: "2026-11-08T14:30:00.000Z", message: "Alerte détectée" },
      { date: "2026-11-08T14:45:00.000Z", message: "Incident pris en charge" },
      { date: "2026-11-08T15:10:00.000Z", message: "Incident résolu" }],
  },
];

// Trois scénarios contrôlés : aucune machine réelle n'est interrogée.
export const scenarios = [
  { titre: "CPU élevé", serveur: "web-prod-01", valeur: "92 %", gravite: "Critique" as const,
    description: "Simulation : utilisation CPU à 92 % (seuil > 85 %)." },
  { titre: "Mémoire RAM élevée", serveur: "db-test-02", valeur: "96 %", gravite: "Élevée" as const,
    description: "Simulation : utilisation RAM à 96 % (seuil > 90 %)." },
  { titre: "Serveur indisponible", serveur: "api-dev-03", valeur: "Hors ligne", gravite: "Critique" as const,
    description: "Simulation : disponibilité égale à 0 (serveur hors ligne)." },
];
