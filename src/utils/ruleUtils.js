import { VALIDATION_RULES, findRuleMetadata, getRandomRuleMetadata } from '../constants/validationRules';

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

const buildRuleResult = (rule, index) => ({
  id: `${rule.id}-${index}-${Math.random().toString(36).slice(2, 6)}`,
  ruleId: rule.id,
  name: rule.regulation,
  check: rule.check,
  status: Math.random() > 0.5 ? 'Pass' : 'Fail',
  detail: pickDetail(index),
});

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
  return selected.map((rule, index) => buildRuleResult(rule, index));
};

const enrichRuleResult = (rule) => {
  if (!rule) return rule;
  const metadata =
    findRuleMetadata(rule.ruleId || rule.name || rule.check) || getRandomRuleMetadata();
  return {
    ...rule,
    ruleId: rule.ruleId || metadata?.id || `CR_${Math.floor(Math.random() * 90 + 10)}`,
    name: rule.name || metadata?.regulation || 'Regulation reference unavailable',
    check: rule.check || metadata?.check || 'Validation criteria unavailable',
  };
};

export const normalizeRuleResults = (ruleResults = []) => ruleResults.map(enrichRuleResult);

