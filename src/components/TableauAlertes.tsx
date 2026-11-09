"use client";

import { useEffect, useMemo, useState } from "react";
import type { Alerte, StatutAlerte } from "../lib/types";
import { alertesInitiales, scenarios } from "../lib/demo-data";

const CLE_STOCKAGE = "cloudops-alertes-v1";

// Transforme une date en texte facile à lire.
function dateLisible(date: string) {
  return new Date(date).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function TableauAlertes() {
  // useState mémorise les valeurs qui changent pendant l'utilisation.
  const [alertes, setAlertes] = useState<Alerte[]>(alertesInitiales);
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState("Toutes");
  const [selectionId, setSelectionId] = useState<number | null>(1);
  const [charge, setCharge] = useState(false);

  // Au premier affichage côté navigateur, on récupère les alertes sauvegardées.
  useEffect(() => {
    try {
      const valeur = localStorage.getItem(CLE_STOCKAGE);
      if (valeur) {
        const donnees: unknown = JSON.parse(valeur);
        if (Array.isArray(donnees)) setAlertes(donnees as Alerte[]);
      }
    } catch {
      // Si la sauvegarde est illisible, on garde les exemples.
    }
    setCharge(true);
  }, []);

  // Enregistrer automatiquement les changements dans ce navigateur.
  useEffect(() => {
    if (charge) localStorage.setItem(CLE_STOCKAGE, JSON.stringify(alertes));
  }, [alertes, charge]);

  // useMemo recalcule la liste seulement si les dépendances changent.
  const visibles = useMemo(() => alertes.filter((alerte) => {
    const correspond = (alerte.titre + " " + alerte.serveur).toLowerCase()
      .includes(recherche.toLowerCase());
    return correspond && (filtre === "Toutes" || alerte.statut === filtre);
  }), [alertes, filtre, recherche]);

  const selection = alertes.find((alerte) => alerte.id === selectionId) ?? null;

  const nouvelles = alertes.filter((a) => a.statut === "Nouvelle").length;
  const enCours = alertes.filter((a) => a.statut === "En cours").length;
  const resolues = alertes.filter((a) => a.statut === "Résolue").length;
  const critiques = alertes.filter((a) =>
    a.gravite === "Critique" && a.statut !== "Résolue").length;

  function simuler(index: number) {
    const scenario = scenarios[index];
    const maintenant = new Date().toISOString();
    const nouvelle: Alerte = {
      id: Math.max(0, ...alertes.map((a) => a.id)) + 1,
      titre: scenario.titre,
      serveur: scenario.serveur,
      description: scenario.description,
      gravite: scenario.gravite,
      statut: "Nouvelle",
      date: maintenant,
      historique: [{ date: maintenant, message: "Alerte détectée (simulation)" }],
    };
    setAlertes((ancien) => [nouvelle, ...ancien]);
    setSelectionId(nouvelle.id);
    setFiltre("Toutes");
    setRecherche("");
  }

  function changerStatut(id: number, nouveauStatut: StatutAlerte) {
    // On crée un nouveau tableau plutôt que de modifier l'ancien directement.
    setAlertes((ancien) => ancien.map((alerte) => {
      if (alerte.id !== id) return alerte;
      const message = nouveauStatut === "En cours"
        ? "Incident pris en charge" : "Incident résolu";
      return {
        ...alerte, statut: nouveauStatut,
        historique: [...alerte.historique, {
          date: new Date().toISOString(), message,
        }],
      };
    }));
  }

  function reinitialiser() {
    setAlertes(alertesInitiales);
    setSelectionId(1);
    setFiltre("Toutes");
    setRecherche("");
  }

  return (
    <div className="application">
      <aside className="navigation">
        <div className="marque"><span className="symbole">☁</span><span>CloudOps<small>MANAGER</small></span></div>
        <div className="nav-title">ESPACE DE TRAVAIL</div>
        <div className="nav-item actif">◉ &nbsp; Alertes & incidents</div>
        <div className="nav-item desactive">▦ &nbsp; Dashboard <small>Bientôt</small></div>
        <div className="nav-item desactive">▣ &nbsp; Serveurs <small>Bientôt</small></div>
        <div className="nav-item desactive">⚙ &nbsp; Paramètres <small>Bientôt</small></div>
        <div className="navigation-bas">
          <span className="point-vert" /> Mode démonstration
          <p>Aucun serveur réel connecté.</p>
        </div>
      </aside>

      <main className="contenu">
        <header className="entete">
          <div><p className="fil-ariane">CloudOps / Supervision / Alertes</p>
            <h1>Alertes & incidents</h1>
            <p className="sous-titre">Détecter un problème, le prendre en charge et suivre sa résolution.</p>
          </div>
          <span className="etiquette-demo">● Données simulées</span>
        </header>

        <section className="statistiques" aria-label="Résumé des alertes">
          <div className="stat"><span>Nouvelles</span><strong>{nouvelles}</strong><small>À examiner</small></div>
          <div className="stat"><span>En cours</span><strong>{enCours}</strong><small>Prises en charge</small></div>
          <div className="stat"><span>Résolues</span><strong>{resolues}</strong><small>Terminées</small></div>
          <div className="stat"><span>Critiques actives</span><strong className="rouge">{critiques}</strong><small>Priorité élevée</small></div>
        </section>

        <section className="panneau simulation">
          <div className="section-entete"><div>
            <h2>Simuler un incident</h2>
            <p>Choisis un scénario pour créer une nouvelle alerte fictive.</p>
          </div></div>
          <div className="scenarios">
            {scenarios.map((scenario, index) => (
              <button key={scenario.titre} type="button" className="scenario" onClick={() => simuler(index)}>
                <span className="scenario-icone">{index === 0 ? "◴" : index === 1 ? "▥" : "⚠"}</span>
                <span><strong>{scenario.titre}</strong><small>{scenario.serveur} · {scenario.valeur}</small></span>
                <span className="plus">+</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panneau">
          <div className="section-entete"><div>
            <h2>Liste des alertes</h2>
            <p>{visibles.length} résultat(s) trouvé(s)</p>
          </div><button type="button" className="bouton-secondaire" onClick={reinitialiser}>Réinitialiser la démo</button></div>

          <div className="outils">
            <input aria-label="Rechercher une alerte" placeholder="Rechercher une alerte ou un serveur..."
              value={recherche} onChange={(e) => setRecherche(e.target.value)} />
            <select aria-label="Filtrer les alertes" value={filtre} onChange={(e) => setFiltre(e.target.value)}>
              {["Toutes", "Nouvelle", "En cours", "Résolue"].map((statut) =>
                <option key={statut} value={statut}>{statut === "Toutes" ? "Tous les statuts" : statut}</option>)}
            </select>
          </div>

          <div className="tableau-conteneur">
            <table><thead><tr><th>ALERTE</th><th>SERVEUR</th><th>GRAVITÉ</th><th>STATUT</th><th>DATE</th><th></th></tr></thead>
              <tbody>
                {visibles.map((a) => <tr key={a.id} className={selectionId === a.id ? "ligne-active" : ""}>
                  <td><strong>{a.titre}</strong><small>INC-{String(a.id).padStart(3, "0")}</small></td>
                  <td>{a.serveur}</td>
                  <td><span className={`pastille ${a.gravite === "Critique" ? "critique" : a.gravite === "Élevée" ? "elevee" : "moyenne"}`}>{a.gravite}</span></td>
                  <td><span className={`pastille ${a.statut === "Nouvelle" ? "nouvelle" : a.statut === "En cours" ? "encours" : "resolue"}`}>{a.statut}</span></td>
                  <td className="date">{dateLisible(a.date)}</td>
                  <td><button type="button" className="bouton-lien" onClick={() => setSelectionId(a.id)}>Détails →</button></td>
                </tr>)}
              </tbody>
            </table>
            {visibles.length === 0 && <p className="vide">Aucune alerte ne correspond à la recherche.</p>}
          </div>
        </section>

        <section className="panneau detail">
          <div className="section-entete"><div><h2>Détails de l'incident</h2>
            <p>Sélectionne une alerte dans le tableau pour la consulter.</p></div></div>
          {selection ? <div className="detail-grille">
            <div>
              <p className="reference">INC-{String(selection.id).padStart(3, "0")}</p>
              <h3>{selection.titre}</h3>
              <p>{selection.description}</p>
              <div className="infos"><span>Serveur : <strong>{selection.serveur}</strong></span>
                <span>Statut : <strong>{selection.statut}</strong></span>
                <span>Gravité : <strong>{selection.gravite}</strong></span></div>
              <div className="actions">
                {selection.statut === "Nouvelle" &&
                  <button className="bouton-principal" onClick={() => changerStatut(selection.id, "En cours")}>Prendre en charge</button>}
                {selection.statut === "En cours" &&
                  <button className="bouton-principal" onClick={() => changerStatut(selection.id, "Résolue")}>Marquer comme résolue</button>}
                {selection.statut === "Résolue" && <span className="terminee">✓ Cet incident est résolu</span>}
              </div>
            </div>
            <div className="historique"><h3>Historique de l'incident</h3>
              <ol>{selection.historique.map((evenement, index) =>
                <li key={index}><span className="histoire-point" />
                  <strong>{evenement.message}</strong><small>{dateLisible(evenement.date)}</small></li>)}</ol>
            </div>
          </div> : <p className="vide">Aucun incident sélectionné.</p>}
        </section>
        <footer>CloudOps Manager · Frontend pédagogique Next.js · Stockage local uniquement</footer>
      </main>
    </div>
  );
}
