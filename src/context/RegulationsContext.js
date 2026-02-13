import React, { createContext, useContext, useCallback, useState } from 'react';

const RegulationsContext = createContext();

// Generate next id from timestamp to avoid collisions
const nextId = () => Date.now() + Math.floor(Math.random() * 1000);

export function RegulationsProvider({ children, initialRegulations }) {
  const [regulations, setRegulations] = useState(initialRegulations || []);

  const addRegulation = useCallback((regulation) => {
    const id = regulation.id != null ? regulation.id : nextId();
    setRegulations((prev) => [...prev, { ...regulation, id }]);
    return id;
  }, []);

  const removeRegulation = useCallback((regulationId) => {
    setRegulations((prev) => prev.filter((r) => r.id !== regulationId));
  }, []);

  const addEventToRegulation = useCallback((regulationId, event) => {
    const eventId = event.id != null ? event.id : nextId();
    setRegulations((prev) =>
      prev.map((r) => {
        if (r.id !== regulationId) return r;
        const events = r.events || [];
        return { ...r, events: [...events, { ...event, id: eventId }] };
      })
    );
    return eventId;
  }, []);

  const removeEvent = useCallback((regulationId, eventId) => {
    setRegulations((prev) => {
      const updated = prev.map((r) => {
        if (r.id !== regulationId) return r;
        const events = (r.events || []).filter((e) => e.id !== eventId);
        return { ...r, events };
      });
      
      // Check if the regulation now has no events, and remove it if so
      return updated.filter((r) => {
        if (r.id === regulationId) {
          // Keep the regulation only if it has at least one event
          return r.events && r.events.length > 0;
        }
        return true;
      });
    });
  }, []);

  const updateEventToRegulation = useCallback((regulationId, eventId, updates) => {
    setRegulations((prev) =>
      prev.map((r) => {
        if (r.id !== regulationId) return r;
        const events = (r.events || []).map((e) =>
          e.id === eventId ? { ...e, ...updates } : e
        );
        return { ...r, events };
      })
    );
  }, []);

  const updateEventRegulations = useCallback((regulationId, eventId, regulations) => {
    setRegulations((prev) =>
      prev.map((r) => {
        if (r.id !== regulationId) return r;
        const events = (r.events || []).map((e) =>
          e.id === eventId ? { ...e, regulations } : e
        );
        return { ...r, events };
      })
    );
  }, []);

  const updateRegulation = useCallback((regulationId, updates) => {
    setRegulations((prev) =>
      prev.map((r) => (r.id === regulationId ? { ...r, ...updates } : r))
    );
  }, []);

  const value = {
    regulations,
    addRegulation,
    removeRegulation,
    addEventToRegulation,
    removeEvent,
    updateEventToRegulation,
    updateEventRegulations,
    updateRegulation,
  };

  return (
    <RegulationsContext.Provider value={value}>
      {children}
    </RegulationsContext.Provider>
  );
}

export function useRegulations() {
  const context = useContext(RegulationsContext);
  if (!context) {
    throw new Error('useRegulations must be used within a RegulationsProvider');
  }
  return context;
}
