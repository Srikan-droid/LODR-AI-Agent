import { VALIDATION_RULES } from '../constants/validationRules';

const DETAIL_SNIPPETS = [
  'Timestamp extracted from PDF metadata',
  'Matched clause reference in section 3.2',
  'Detected board resolution ID BR-2024-17',
  'Located CRA confirmation letter attachment',
  'Found website screenshot within submission',
  'Detected debenture trustee acknowledgement note',
  'Parsed event summary paragraph on page 2',
  'Extracted net impact table from appendix',
  'Matched investor communication snippet',
  'Validated compliance officer sign-off section',
];

const pickDetail = (index) => DETAIL_SNIPPETS[index % DETAIL_SNIPPETS.length];

export const generateRuleResults = (score) => {
  if (score == null) {
    return [];
  }

  const ruleCount = Math.min(
    VALIDATION_RULES.length,
    Math.max(3, Math.floor(Math.random() * 3) + 3)
  );

  const shuffled = [...VALIDATION_RULES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, ruleCount);
  const targetPasses = Math.max(1, Math.round((score / 100) * ruleCount));

  return selected.map((rule, index) => ({
    id: `${rule}-${index}`,
    name: rule,
    status: index < targetPasses ? 'Pass' : 'Fail',
    detail: pickDetail(index),
  }));
};

