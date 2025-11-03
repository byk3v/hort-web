"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import Keycloak from "keycloak-js";
// Fehlendes Interface für den Cast, behebt TS2304
interface KeycloakEnvConfigInitConfig { url: string; realm: string; clientId: string; }
import { setAuthToken } from "@/src/lib/axios";

interface AuthContextValue {
  keycloak: Keycloak | null;
  initialized: boolean;
  authenticated: boolean;
  token: string | undefined;
  login: () => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface KeycloakEnvConfig { url?: string; realm?: string; clientId?: string; }
interface Props { children: React.ReactNode; config: KeycloakEnvConfig; }

export function KeycloakProvider({ children, config }: Props) {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);

  const isValidConfig = Boolean(config.url && config.realm && config.clientId);

  useEffect(() => {
    let active = true;
    if (!isValidConfig) {
      console.warn("Keycloak-Konfiguration unvollständig (url/realm/clientId fehlen). Überspringe Initialisierung.");
      setInitialized(true);
      return () => { active = false; };
    }

    // Konstruktion absichern (Types casten, da keycloak-js ggf. generische OIDC Config erwartet)
    const kc = new Keycloak({
      url: config.url!,
      realm: config.realm!,
      clientId: config.clientId!
    } as KeycloakEnvConfigInitConfig);
    setKeycloak(kc);

    kc.init({ onLoad: "login-required", checkLoginIframe: false })
      .then((auth) => {
        if (!active) return;
        setAuthenticated(Boolean(auth));
        setInitialized(true);
        if (auth && kc.token) {
          setToken(kc.token);
          setAuthToken(kc.token);
        }
      })
      .catch((err) => {
        console.error("Keycloak init error", err);
        setInitialized(true);
      });

    const interval = setInterval(() => {
      if (!kc.token) return;
      kc.updateToken(60)
        .then((refreshed) => {
          if (refreshed && kc.token) {
            setToken(kc.token);
            setAuthToken(kc.token);
          }
        })
        .catch((err) => console.error("Token refresh failed", err));
    }, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isValidConfig, config.url, config.realm, config.clientId]);

  const login = () => { if (keycloak) keycloak.login(); };
  const logout = () => { if (keycloak) keycloak.logout(); };
  const refreshToken = async () => {
    if (!keycloak) return;
    try {
      const refreshed = await keycloak.updateToken(60);
      if (refreshed && keycloak.token) {
        setToken(keycloak.token);
        setAuthToken(keycloak.token);
      }
    } catch (e) {
      console.error("Manual refresh error", e);
    }
  };

  return (
    <AuthContext.Provider value={{ keycloak, initialized, authenticated, token, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

// Dummy Hook Nutzung für Entwicklung um Unused-Warnung zu vermeiden (wird tree-shaken in Prod)
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  (() => {})();
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth muss innerhalb KeycloakProvider verwendet werden");
  return ctx;
}
