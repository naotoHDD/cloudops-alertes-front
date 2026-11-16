
import type { Alerte } from "./types";
import type { Evenement } from "./types";

// Adresse du backend NestJS
const API_URL = "http://localhost:3001";

// Structure des alertes provenant de NestJS
interface AlerteBackend {
  id: number;
  title: string;
  description: string | null;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "NEW" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
  server: {
    id: number;
    name: string;
  };
}

// Convertir une alerte NestJS vers le format du frontend
export function convertirAlerte(a: AlerteBackend): Alerte {
  const gravite =
    a.severity === "CRITICAL" ? "Critique" :
    a.severity === "HIGH" ? "Élevée" :
    "Moyenne";

  const statut =
    a.status === "NEW" ? "Nouvelle" :
    a.status === "IN_PROGRESS" ? "En cours" :
    "Résolue";

  return {
    id: a.id,
    titre: a.title,
    serveur: a.server.name,
    description: a.description ?? "",
    gravite,
    statut,
    date: a.createdAt,
    historique: [],
  };
}

// Récupérer les alertes depuis le backend
export async function recupererAlertes(
  token: string,
): Promise<Alerte[]> {
  const response = await fetch(`${API_URL}/alerts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Erreur API : HTTP ${response.status}`,
    );
  }

  const donnees: AlerteBackend[] = await response.json();

  return donnees.map(convertirAlerte);
}

// Structure de la réponse du backend
interface ReponseConnexion {
  accessToken: string;
}

// Connexion à NestJS avec email et mot de passe
export async function connecter(
  email: string,
  password: string,
): Promise<string> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Email ou mot de passe incorrect.");
  }

  const donnees: ReponseConnexion = await response.json();

  return donnees.accessToken;
}

export async function modifierStatutAlerte(
  id: number,
  statut: "Nouvelle" | "En cours" | "Résolue",
  token: string,
): Promise<Alerte> {
  // Convertir le statut français vers le format NestJS
  const status =
    statut === "Nouvelle" ? "NEW" :
    statut === "En cours" ? "IN_PROGRESS" :
    "RESOLVED";

  const response = await fetch(`${API_URL}/alerts/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(`Modification impossible : HTTP ${response.status}`);
  }

  const alerteBackend: AlerteBackend = await response.json();

  return convertirAlerte(alerteBackend);
}

interface HistoriqueBackend {
  id: number;
  action: string;
  oldStatus: string | null;
  newStatus: string;
  createdAt: string;
}

// Charger l'historique réel d'une alerte
export async function recupererHistorique(
  alertId: number,
  token: string,
): Promise<Evenement[]> {
  const response = await fetch(
    `${API_URL}/incident-history/alert/${alertId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Erreur historique : HTTP ${response.status}`);
  }

  const historique: HistoriqueBackend[] = await response.json();

  // Convertir les événements au format du frontend
  return historique.map((event) => {
    let message = event.action;

    if (event.action === "STATUS_CHANGED") {
      if (event.newStatus === "IN_PROGRESS") {
        message = "Incident pris en charge";
      } else if (event.newStatus === "RESOLVED") {
        message = "Incident résolu";
      } else {
        message = "Statut modifié";
      }
    }

    return {
      date: event.createdAt,
      message,
    };
  });
}

/**
 * Envoyer une métrique au backend NestJS.
 * NestJS vérifie ensuite les seuils et crée
 * automatiquement les alertes nécessaires.
 */
export async function envoyerMetrique(
  serverId: number,
  cpu: number,
  ram: number,
  available: boolean,
  token: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/metrics`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      serverId,
      cpu,
      ram,
      available,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Erreur lors de la simulation : HTTP ${response.status}`,
    );
  }
}

export type RoleUtilisateur = "ADMIN" | "DEVOPS" | "VIEWER";

export interface ProfilUtilisateur {
  sub: number;
  email: string;
  role: RoleUtilisateur;
  iat: number;
  exp: number;
}

// Récupérer le profil authentifié depuis NestJS
export async function recupererProfil(
  token: string,
): Promise<ProfilUtilisateur> {
  const response = await fetch(`${API_URL}/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Profil inaccessible : HTTP ${response.status}`);
  }

  return response.json() as Promise<ProfilUtilisateur>;
}



