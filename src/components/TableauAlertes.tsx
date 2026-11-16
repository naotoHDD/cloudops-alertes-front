
"use client";

import { useEffect, useMemo, useState } from "react";

import type { Alerte, StatutAlerte } from "../lib/types";

import { alertesInitiales, scenarios } from "../lib/demo-data";

import type { RoleUtilisateur } from "../lib/api";


import {
  recupererAlertes,
  modifierStatutAlerte,
  recupererHistorique,
  envoyerMetrique,
} from "../lib/api";


// Afficher une date au format français
function dateLisible(date: string) {
  return new Date(date).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Le JWT est transmis depuis page.tsx
interface TableauAlertesProps {
  token: string;
  role: RoleUtilisateur;
  onLogout: () => void;
}

export default function TableauAlertes({
  token,
  role,
  onLogout,
}: TableauAlertesProps) {
  // Données des alertes
  const [alertes, setAlertes] = useState<Alerte[]>([]);

  // Message d'erreur API
  const [erreurApi, setErreurApi] = useState("");
  const [messageSucces, setMessageSucces] = useState("");

  // Recherche et filtres
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState("Toutes");

  // Alerte sélectionnée
  const [selectionId, setSelectionId] = useState<number | null>(
    null,
  );

  const peutModifier = role === "ADMIN" || role === "DEVOPS";

  // Charger les alertes depuis NestJS
  useEffect(() => {
    let actif = true;

    async function chargerAlertes() {
      try {
        const donnees = await recupererAlertes(token);

        if (actif) {
          setAlertes(donnees);
          setErreurApi("");
          setSelectionId(donnees[0]?.id ?? null);
        }
      } catch {
        if (actif) {
          setErreurApi(
            "Impossible de récupérer les alertes du backend.",
          );
        }
      }
    }

    void chargerAlertes();

    return () => {
      actif = false;
    };
  }, [token]);

  // Charger l'historique réel de l'alerte sélectionnée
  useEffect(() => {
    if (selectionId === null) return;

    let actif = true;

    async function chargerHistorique() {
      try {
        const historique = await recupererHistorique(
          selectionId as number,
          token,
        );

        if (!actif) return;

        setAlertes((ancien) =>
          ancien.map((alerte) =>
            alerte.id === selectionId
              ? { ...alerte, historique }
              : alerte,
          ),
        );
      } catch {
        if (actif) {
          setErreurApi(
            "Impossible de récupérer l'historique de l'incident.",
          );
        }
      }
    }

    void chargerHistorique();

    return () => {
      actif = false;
    };
  }, [selectionId, token]);

  // Filtrer les alertes par recherche et statut
  const visibles = useMemo(
    () =>
      alertes.filter((alerte) => {
        const correspond = (
          alerte.titre +
          " " +
          alerte.serveur
        )
          .toLowerCase()
          .includes(recherche.toLowerCase());

        return (
          correspond &&
          (filtre === "Toutes" || alerte.statut === filtre)
        );
      }),
    [alertes, filtre, recherche],
  );

  // Alerte sélectionnée dans le tableau
  const selection =
    alertes.find((alerte) => alerte.id === selectionId) ??
    null;

  // Calcul des statistiques
  const nouvelles = alertes.filter(
    (a) => a.statut === "Nouvelle",
  ).length;

  const enCours = alertes.filter(
    (a) => a.statut === "En cours",
  ).length;

  const resolues = alertes.filter(
    (a) => a.statut === "Résolue",
  ).length;

  const critiques = alertes.filter(
    (a) =>
      a.gravite === "Critique" &&
      a.statut !== "Résolue",
  ).length;

  
  // Envoyer une simulation au backend NestJS
  async function simuler(index: number) {
    try {
      setMessageSucces("");
      setErreurApi("");

      // Serveur de démonstration existant dans PostgreSQL
      const serverId = 1;

      // Choisir la métrique selon le bouton
      if (index === 0) {
        // Simulation CPU élevé
        await envoyerMetrique(
          serverId, 95, 40, true, token,
        );
      } else if (index === 1) {
        // Simulation RAM élevée
        await envoyerMetrique(
          serverId, 30, 96, true, token,
        );
      } else if (index === 2) {
        // Simulation serveur indisponible
        await envoyerMetrique(
          serverId, 0, 0, false, token,
        );
      }

      // Recharger les vraies alertes depuis PostgreSQL
      const donnees = await recupererAlertes(token);
      const messages = [
        "Simulation CPU enregistrée dans PostgreSQL.",
        "Simulation RAM enregistrée dans PostgreSQL.",
        "Simulation serveur indisponible enregistrée dans PostgreSQL.",
      ];

setMessageSucces(
  messages[index] +
  " Les alertes déjà ouvertes ne sont pas dupliquées.",
);

      setAlertes(donnees);
      setFiltre("Toutes");
      setRecherche("");

      // Sélectionner la première alerte
      setSelectionId(donnees[0]?.id ?? null);

    } catch (erreur) {
      console.error("Erreur simulation :", erreur);

      setErreurApi(
        "Impossible d'envoyer la simulation au backend.",
      );
    }
  }


  // Modifier le statut dans PostgreSQL
  async function changerStatut(
    id: number,
    nouveauStatut: StatutAlerte,
  ) {
    try {
      setErreurApi("");

      // Envoyer le changement à NestJS
      const alerteModifiee = await modifierStatutAlerte(
        id,
        nouveauStatut,
        token,
      );

      // Récupérer le nouvel historique
      const historique = await recupererHistorique(
        id,
        token,
      );

      // Actualiser l'interface
      setAlertes((ancien) =>
        ancien.map((alerte) =>
          alerte.id === id
            ? {
                ...alerte,
                ...alerteModifiee,
                historique,
              }
            : alerte,
        ),
      );
    } catch (erreur) {
      console.error(
        "Erreur de modification :",
        erreur,
      );

      setErreurApi(
        "Impossible de modifier le statut de l'alerte.",
      );
    }
  }

  // Recharger les alertes réelles depuis PostgreSQL
  async function reinitialiser() {
    try {
      setErreurApi("");

      const donnees = await recupererAlertes(token);

      setAlertes(donnees);
      setSelectionId(donnees[0]?.id ?? null);
      setFiltre("Toutes");
      setRecherche("");
    } catch {
      setErreurApi(
        "Impossible de recharger les alertes.",
      );
    }
  }

  return (
    <div className="application">
      {/* Navigation latérale */}
      <aside className="navigation">
        <div className="marque">
          <span className="symbole">☁</span>
          <span>
            CloudOps
            <small>MANAGER</small>
          </span>
        </div>

        <div className="nav-title">
          ESPACE DE TRAVAIL
        </div>

        <div className="nav-item actif">
          ◉ &nbsp; Alertes & incidents
        </div>

        <div className="nav-item desactive">
          ▦ &nbsp; Dashboard
          <small>Bientôt</small>
        </div>

        <div className="nav-item desactive">
          ▣ &nbsp; Serveurs
          <small>Bientôt</small>
        </div>

        <div className="nav-item desactive">
          ⚙ &nbsp; Paramètres
          <small>Bientôt</small>
        </div>

        
<div className="navigation-bas">
  <span className="point-vert" />
  <span>Connecté : {role}</span>

  <p>CloudOps Manager</p>

  <button
    type="button"
    onClick={onLogout}
    style={{
      width: "100%",
      marginTop: 12,
      padding: 10,
      backgroundColor: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
    }}
  >
    Se déconnecter
  </button>
</div>

      </aside>

      {/* Contenu principal */}
      <main className="contenu">
        <header className="entete">
          <div>
            <p className="fil-ariane">
              CloudOps / Supervision / Alertes
            </p>

            <h1>Alertes & incidents</h1>

            <p className="sous-titre">
              Détecter un problème, le prendre en
              charge et suivre sa résolution.
            </p>
          </div>

          <span className="etiquette-demo">
            ● API NestJS connectée
          </span>
        </header>

        {/* Afficher les erreurs éventuelles */}
        {messageSucces && (
          <p
          role="status"
          style={{
            color: "#15803d",
            padding: 12,
            marginBottom: 12,
          }}
        >
          {messageSucces}
          </p>
        )}
        {erreurApi && (
          <p
            role="alert"
            style={{
              color: "#dc2626",
              padding: 12,
            }}
          >
            {erreurApi}
          </p>
        )}

        {/* Statistiques */}
        <section
          className="statistiques"
          aria-label="Résumé des alertes"
        >
          <div className="stat">
            <span>Nouvelles</span>
            <strong>{nouvelles}</strong>
            <small>À examiner</small>
          </div>

          <div className="stat">
            <span>En cours</span>
            <strong>{enCours}</strong>
            <small>Prises en charge</small>
          </div>

          <div className="stat">
            <span>Résolues</span>
            <strong>{resolues}</strong>
            <small>Terminées</small>
          </div>

          <div className="stat">
            <span>Critiques actives</span>
            <strong className="rouge">
              {critiques}
            </strong>
            <small>Priorité élevée</small>
          </div>
        </section>

        {/* Simulations existantes */}
        <section className="panneau simulation">
          <div className="section-entete">
            <div>
              <h2>Simuler un incident</h2>
              <p>Choisis un scénario pour envoyer une métrique de test au backend.</p>
            </div>
          </div>

          <div className="scenarios">
            {scenarios.map((scenario, index) => (
              <button
              key={scenario.titre}
              type="button"
              className="scenario"
              onClick={() => void simuler(index)}
              disabled={!peutModifier}
              >
                <span className="scenario-icone">
                  {index === 0
                    ? "◴"
                    : index === 1
                      ? "▥"
                      : "⚠"}
                </span>

                <span>
                  <strong>{scenario.titre}</strong>
                  <small>
                    {scenario.serveur} ·{" "}
                    {scenario.valeur}
                  </small>
                </span>

                <span className="plus">+</span>
              </button>
            ))}
          </div>
        </section>

        {/* Liste des alertes */}
        <section className="panneau">
          <div className="section-entete">
            <div>
              <h2>Liste des alertes</h2>
              <p>
                {visibles.length} résultat(s)
                trouvé(s)
              </p>
            </div>

            <button
              type="button"
              className="bouton-secondaire"
              onClick={() => void reinitialiser()}
            >
              Actualiser les alertes
            </button>
          </div>

          {/* Recherche et filtres */}
          <div className="outils">
            <input
              aria-label="Rechercher une alerte"
              placeholder="Rechercher une alerte ou un serveur..."
              value={recherche}
              onChange={(e) =>
                setRecherche(e.target.value)
              }
            />

            <select
              aria-label="Filtrer les alertes"
              value={filtre}
              onChange={(e) =>
                setFiltre(e.target.value)
              }
            >
              {[
                "Toutes",
                "Nouvelle",
                "En cours",
                "Résolue",
              ].map((statut) => (
                <option
                  key={statut}
                  value={statut}
                >
                  {statut === "Toutes"
                    ? "Tous les statuts"
                    : statut}
                </option>
              ))}
            </select>
          </div>

          {/* Tableau */}
          <div className="tableau-conteneur">
            <table>
              <thead>
                <tr>
                  <th>ALERTE</th>
                  <th>SERVEUR</th>
                  <th>GRAVITÉ</th>
                  <th>STATUT</th>
                  <th>DATE</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {visibles.map((a) => (
                  <tr
                    key={a.id}
                    className={
                      selectionId === a.id
                        ? "ligne-active"
                        : ""
                    }
                  >
                    <td>
                      <strong>{a.titre}</strong>
                      <small>
                        INC-
                        {String(a.id).padStart(
                          3,
                          "0",
                        )}
                      </small>
                    </td>

                    <td>{a.serveur}</td>

                    <td>
                      <span
                        className={`pastille ${
                          a.gravite === "Critique"
                            ? "critique"
                            : a.gravite === "Élevée"
                              ? "elevee"
                              : "moyenne"
                        }`}
                      >
                        {a.gravite}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`pastille ${
                          a.statut === "Nouvelle"
                            ? "nouvelle"
                            : a.statut === "En cours"
                              ? "encours"
                              : "resolue"
                        }`}
                      >
                        {a.statut}
                      </span>
                    </td>

                    <td className="date">
                      {dateLisible(a.date)}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="bouton-lien"
                        onClick={() =>
                          setSelectionId(a.id)
                        }
                      >
                        Détails →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {visibles.length === 0 && (
              <p className="vide">
                Aucune alerte ne correspond à la
                recherche.
              </p>
            )}
          </div>
        </section>

        {/* Détails de l'incident */}
        <section className="panneau detail">
          <div className="section-entete">
            <div>
              <h2>Détails de l'incident</h2>
              <p>
                Sélectionne une alerte dans le
                tableau pour la consulter.
              </p>
            </div>
          </div>

          {selection ? (
            <div className="detail-grille">
              <div>
                <p className="reference">
                  INC-
                  {String(selection.id).padStart(
                    3,
                    "0",
                  )}
                </p>

                <h3>{selection.titre}</h3>

                <p>{selection.description}</p>

                <div className="infos">
                  <span>
                    Serveur :{" "}
                    <strong>
                      {selection.serveur}
                    </strong>
                  </span>

                  <span>
                    Statut :{" "}
                    <strong>
                      {selection.statut}
                    </strong>
                  </span>

                  <span>
                    Gravité :{" "}
                    <strong>
                      {selection.gravite}
                    </strong>
                  </span>
                </div>

                {/* Actions sur les alertes */}
                <div className="actions">
                  {peutModifier && selection.statut === "Nouvelle" && (
                    <button
                      className="bouton-principal"
                      onClick={() =>
                        void changerStatut(
                          selection.id,
                          "En cours",
                        )
                      }
                    >
                      Prendre en charge
                    </button>
                  )}

                  {peutModifier && selection.statut === "En cours" && (
                    <button
                      className="bouton-principal"
                      onClick={() =>
                        void changerStatut(
                          selection.id,
                          "Résolue",
                        )
                      }
                    >
                      Marquer comme résolue
                    </button>
                  )}

                  {selection.statut ===
                    "Résolue" && (
                    <span className="terminee">
                      ✓ Cet incident est résolu
                    </span>
                  )}
                </div>
              </div>

              {/* Historique réel */}
              <div className="historique">
                <h3>Historique de l'incident</h3>

                {selection.historique.length > 0 ? (
                  <ol>
                    {selection.historique.map(
                      (evenement, index) => (
                        <li key={index}>
                          <span className="histoire-point" />

                          <strong>
                            {evenement.message}
                          </strong>

                          <small>
                            {dateLisible(
                              evenement.date,
                            )}
                          </small>
                        </li>
                      ),
                    )}
                  </ol>
                ) : (
                  <p>
                    Aucun changement de statut
                    enregistré.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="vide">
              Aucun incident sélectionné.
            </p>
          )}
        </section>

        <footer>
          CloudOps Manager · Frontend pédagogique
          Next.js · API NestJS et PostgreSQL
        </footer>
      </main>
    </div>
  );
}
