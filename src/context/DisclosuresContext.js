import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { initialDisclosures, REGULATION_OPTIONS } from '../data/disclosures';

const STORAGE_KEY = 'lodr_disclosures';

const DisclosuresContext = createContext();

const loadInitialDisclosures = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to parse stored disclosures', error);
  }
  return initialDisclosures;
};

const getRandomRegulations = () => {
  const count = Math.floor(Math.random() * 2) + 1; // 1 or 2 entries
  const shuffled = [...REGULATION_OPTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const getRandomComplianceScore = () => Math.floor(Math.random() * 51) + 45; // 45 - 95

const getComplianceStatus = (score) => {
  if (score >= 80) return 'Compliant';
  if (score >= 50) return 'Pending Review';
  return 'Non-Compliant';
};

export const DisclosuresProvider = ({ children }) => {
  const [disclosures, setDisclosures] = useState(loadInitialDisclosures);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(disclosures));
    } catch (error) {
      console.error('Failed to persist disclosures', error);
    }
  }, [disclosures]);

  const addDisclosure = ({ announcementTitle, dateOfEvent, fileName }) => {
    const newEntry = {
      id: Date.now(),
      announcementTitle,
      dateOfEvent,
      uploadedDate: new Date().toISOString().split('T')[0],
      regulations: getRandomRegulations(),
      complianceScore: null,
      complianceStatus: 'Pending Review',
      fileStatus: 'Processing',
      fileName,
    };

    setDisclosures((prev) => [newEntry, ...prev]);

    const delayMs = (Math.floor(Math.random() * 6) + 5) * 1000; // 5-10 seconds
    setTimeout(() => {
      setDisclosures((current) =>
        current.map((item) => {
          if (item.id !== newEntry.id) {
            return item;
          }
          const complianceScore = getRandomComplianceScore();
          return {
            ...item,
            fileStatus: 'Completed',
            complianceScore,
            complianceStatus: getComplianceStatus(complianceScore),
          };
        })
      );
    }, delayMs);

    return newEntry.id;
  };

  const sortedDisclosures = useMemo(
    () => [...disclosures].sort((a, b) => new Date(b.uploadedDate) - new Date(a.uploadedDate)),
    [disclosures]
  );

  return (
    <DisclosuresContext.Provider
      value={{
        disclosures: sortedDisclosures,
        addDisclosure,
      }}
    >
      {children}
    </DisclosuresContext.Provider>
  );
};

export const useDisclosures = () => {
  const context = useContext(DisclosuresContext);
  if (!context) {
    throw new Error('useDisclosures must be used within a DisclosuresProvider');
  }
  return context;
};

