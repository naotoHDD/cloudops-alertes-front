
"use client";

import { useEffect, useState } from "react";

import Connexion from "../components/Connexion";
import TableauAlertes from "../components/TableauAlertes";

import {
  recupererProfil,
  type ProfilUtilisateur,
} from "../lib/api";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);

  const [profil, setProfil] =
    useState<ProfilUtilisateur | null>(null);

  const [erreur, setErreur] = useState("");

  // Déconnexion manuelle
  function seDeconnecter() {
    setToken(null);
    setProfil(null);
    setErreur("");
  }

  // Vérifier le profil après connexion
  useEffect(() => {
    if (!token) return;

    let actif = true;

    async function chargerProfil() {
      try {
        const donnees = await recupererProfil(token as string);

        if (actif) {
          setProfil(donnees);
          setErreur("");
        }
      } catch {
        if (actif) {
          setProfil(null);
          setToken(null);
          setErreur(
            "Session invalide. Reconnecte-toi.",
          );
        }
      }
    }

    void chargerProfil();

    return () => {
      actif = false;
    };
  }, [token]);

  // Déconnexion automatique à l'expiration du JWT
  useEffect(() => {
    if (!token || !profil) return;

    // exp est exprimé en secondes
    const expiration = profil.exp * 1000;
    const tempsRestant = expiration - Date.now();

    if (tempsRestant <= 0) {
      setToken(null);
      setProfil(null);
      setErreur("Session expirée. Reconnecte-toi.");
      return;
    }

    const minuterie = setTimeout(() => {
      setToken(null);
      setProfil(null);
      setErreur("Session expirée. Reconnecte-toi.");
    }, tempsRestant);

    return () => clearTimeout(minuterie);
  }, [token, profil]);

  // Formulaire de connexion
  if (!token) {
    return (
      <>
        {erreur && (
          <p
            role="alert"
            style={{ color: "#dc2626", padding: 12 }}
          >
            {erreur}
          </p>
        )}

        <Connexion onConnect={setToken} />
      </>
    );
  }

  // Chargement du profil
  if (!profil) {
    return (
      <p style={{ padding: 24 }}>
        Chargement du profil...
      </p>
    );
  }

  // Interface principale
  return (
    <TableauAlertes
      token={token}
      role={profil.role}
      onLogout={seDeconnecter}
    />
  );
}
