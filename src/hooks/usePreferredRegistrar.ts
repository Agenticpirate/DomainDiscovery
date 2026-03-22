'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_REGISTRAR,
  PREFERRED_REGISTRAR_EVENT,
  REGISTRARS,
  REGISTRAR_STORAGE_KEY,
  isRegistrarName,
  type RegistrarName,
} from '@/lib/registrars';

function readPreferredRegistrar(): RegistrarName {
  if (typeof window === 'undefined') {
    return DEFAULT_REGISTRAR;
  }

  const stored = window.localStorage.getItem(REGISTRAR_STORAGE_KEY);
  return stored && isRegistrarName(stored) ? stored : DEFAULT_REGISTRAR;
}

function persistPreferredRegistrar(nextRegistrar: RegistrarName) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(REGISTRAR_STORAGE_KEY, nextRegistrar);
  window.dispatchEvent(new Event(PREFERRED_REGISTRAR_EVENT));
}

export function usePreferredRegistrar() {
  const [selectedRegistrar, setSelectedRegistrarState] = useState<RegistrarName>(DEFAULT_REGISTRAR);

  useEffect(() => {
    const syncPreferredRegistrar = () => {
      setSelectedRegistrarState(readPreferredRegistrar());
    };

    syncPreferredRegistrar();
    window.addEventListener('storage', syncPreferredRegistrar);
    window.addEventListener(PREFERRED_REGISTRAR_EVENT, syncPreferredRegistrar);

    return () => {
      window.removeEventListener('storage', syncPreferredRegistrar);
      window.removeEventListener(PREFERRED_REGISTRAR_EVENT, syncPreferredRegistrar);
    };
  }, []);

  const setSelectedRegistrar = useCallback((nextRegistrar: RegistrarName | string) => {
    if (!isRegistrarName(nextRegistrar)) {
      return;
    }

    setSelectedRegistrarState(nextRegistrar);
    persistPreferredRegistrar(nextRegistrar);
  }, []);

  return {
    selectedRegistrar,
    setSelectedRegistrar,
    registrarOptions: REGISTRARS,
  };
}
