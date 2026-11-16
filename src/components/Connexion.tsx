
"use client";

import { useState } from "react";
import { connecter } from "../lib/api";

interface ConnexionProps {
  onConnect: (token: string) => void;
}

export default function Connexion({ onConnect }: ConnexionProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function seConnecter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur("");
    setChargement(true);

    try {
      const token = await connecter(email, password);
      onConnect(token);
    } catch {
      setErreur("Connexion impossible. Vérifie tes identifiants.");
    } finally {
      setChargement(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f6fb",
        padding: 20,
      }}
    >
      <form
        onSubmit={seConnecter}
        style={{
          width: "100%",
          maxWidth: 400,
          padding: 32,
          backgroundColor: "white",
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ color: "#14284b", marginBottom: 8 }}>
          CloudOps Manager
        </h1>

        <p style={{ color: "#64748b", marginBottom: 24 }}>
          Connecte-toi pour consulter les alertes.
        </p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="username"
          style={{
            display: "block",
            width: "100%",
            padding: 12,
            marginTop: 6,
            marginBottom: 18,
            border: "1px solid #cbd5e1",
            borderRadius: 6,
          }}
        />

        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          autoComplete="current-password"
          style={{
            display: "block",
            width: "100%",
            padding: 12,
            marginTop: 6,
            marginBottom: 18,
            border: "1px solid #cbd5e1",
            borderRadius: 6,
          }}
        />

        {erreur && (
          <p role="alert" style={{ color: "#dc2626", marginBottom: 12 }}>
            {erreur}
          </p>
        )}

        <button
          type="submit"
          disabled={chargement}
          style={{
            width: "100%",
            padding: 13,
            border: "none",
            borderRadius: 6,
            backgroundColor: "#2563eb",
            color: "white",
            cursor: chargement ? "wait" : "pointer",
          }}
        >
          {chargement ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
