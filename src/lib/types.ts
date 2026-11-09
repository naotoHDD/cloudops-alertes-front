// Un type décrit la forme des données : TypeScript vérifie leurs propriétés.
export type StatutAlerte = "Nouvelle" | "En cours" | "Résolue";
export type Gravite = "Critique" | "Élevée" | "Moyenne";

export interface Evenement {
  date: string;
  message: string;
}

export interface Alerte {
  id: number;
  titre: string;
  serveur: string;
  description: string;
  gravite: Gravite;
  statut: StatutAlerte;
  date: string;
  historique: Evenement[];
}
