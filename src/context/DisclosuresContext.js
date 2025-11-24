import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { initialDisclosures, REGULATION_OPTIONS } from '../data/disclosures';
import { generateRuleResults, normalizeRuleResults } from '../utils/ruleUtils';

const STORAGE_KEY = 'lodr_disclosures';
const LAST_UPLOAD_KEY = 'lodr_last_upload';

const DisclosuresContext = createContext();

const decorateEntry = (entry) => {
  if (entry.fileStatus === 'Completed' && entry.complianceScore != null) {
    const hasRules = Array.isArray(entry.ruleResults) && entry.ruleResults.length > 0;
    if (hasRules) {
      // Recalculate score based on existing rules to ensure consistency
      const passCount = entry.ruleResults.filter(r => r.status === 'Pass').length;
      const totalCount = entry.ruleResults.length;
      const recalculatedScore = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : entry.complianceScore;
      return {
        ...entry,
        complianceScore: recalculatedScore,
        complianceStatus: getComplianceStatus(recalculatedScore),
        ruleResults: normalizeRuleResults(entry.ruleResults),
      };
    } else {
      // Generate new rules and calculate score
      const { ruleResults, calculatedScore } = generateRuleResults();
      return {
        ...entry,
        complianceScore: calculatedScore,
        complianceStatus: getComplianceStatus(calculatedScore),
        ruleResults: normalizeRuleResults(ruleResults),
      };
    }
  }

  return {
    ...entry,
    ruleResults: normalizeRuleResults(entry.ruleResults || []),
  };
};

const loadInitialDisclosures = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored).map(decorateEntry);
    }
  } catch (error) {
    console.error('Failed to parse stored disclosures', error);
  }
  return initialDisclosures.map(decorateEntry);
};

const getRandomRegulations = () => {
  const count = Math.floor(Math.random() * 2) + 1; // 1 or 2 entries
  const shuffled = [...REGULATION_OPTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

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
    // Save last upload data for quick upload pre-filling
    try {
      localStorage.setItem(LAST_UPLOAD_KEY, JSON.stringify({ announcementTitle, dateOfEvent }));
    } catch (error) {
      console.error('Failed to save last upload data', error);
    }

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
      ruleResults: [],
    };

    // Generate rule results first, then calculate score based on pass/fail ratio
    const { ruleResults, calculatedScore } = generateRuleResults();
    const complianceScore = calculatedScore;
    const completedEntry = {
      ...newEntry,
      fileStatus: 'Completed',
      complianceScore,
      complianceStatus: getComplianceStatus(complianceScore),
      ruleResults,
    };

    setDisclosures((prev) => [completedEntry, ...prev]);

    return { id: newEntry.id, complianceScore };
  };

  const sortedDisclosures = useMemo(
    () => [...disclosures].sort((a, b) => new Date(b.uploadedDate) - new Date(a.uploadedDate)),
    [disclosures]
  );

  const getLastUploadData = () => {
    try {
      const stored = localStorage.getItem(LAST_UPLOAD_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load last upload data', error);
    }
    return { announcementTitle: '', dateOfEvent: '' };
  };

  return (
    <DisclosuresContext.Provider
      value={{
        disclosures: sortedDisclosures,
        addDisclosure,
        getLastUploadData,
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

