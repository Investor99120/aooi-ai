const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "../..");

const DEFAULT_OPTIONS = {
  brandId: "friendredlight",
  strictMode: true,
};

const FALLBACK_RISK_TERMS = {
  banned_medical_claim: [
    "cure",
    "cures",
    "treat",
    "treats",
    "heal disease",
    "diagnose",
    "prevent disease",
    "reverse disease",
    "medically proven to fix",
    "clinically guaranteed",
    "clinically proven to cure",
    "prescribed for",
    "treats pain",
    "cures insomnia",
    "heals inflammation",
  ],
  banned_result_claim: [
    "guaranteed pain relief",
    "guaranteed better sleep",
    "guaranteed sleep improvement",
    "guaranteed recovery",
    "guaranteed inflammation reduction",
    "guaranteed skin cure",
    "guaranteed anxiety relief",
    "guaranteed depression relief",
    "instant results",
    "permanent results",
    "guaranteed results",
  ],
  banned_condition_claim: [
    "insomnia treatment",
    "arthritis treatment",
    "eczema treatment",
    "chronic pain treatment",
    "depression treatment",
    "anxiety treatment",
    "injury healing",
    "wound healing",
    "sleep disorder treatment",
    "acne cure",
    "hormonal treatment",
    "anti-inflammatory cure",
    "chronic fatigue treatment",
    "seasonal affective disorder treatment",
    "cures insomnia",
  ],
  banned_trust_evidence_claim: [
    "fake trustpilot reviews",
    "fake reddit mentions",
    "fake youtube reviews",
    "fake tiktok testimonials",
    "fake customer testimonials",
    "invented before-and-after claims",
    "invented clinical endorsements",
    "invented doctor recommendations",
    "invented nhs association",
    "unverified certification claims",
    "unverified uk warehouse claims",
    "unverified delivery timelines",
    "unverified warranty promises",
    "unverified uk plug claims",
    "unverified warranty promise",
  ],
  banned_tone_positioning: [
    "miracle device",
    "medical breakthrough",
    "pain-fixing device",
    "hospital-grade cure",
    "cheap led cure",
    "biohacker secret",
    "guaranteed transformation",
    "no-risk health outcome",
    "disease solution",
    "medical brand",
  ],
};

const FALLBACK_ALLOWED_TERMS = [
  "supports",
  "helps create",
  "designed for",
  "can be used as part of",
  "gentle",
  "at-home",
  "routine",
  "self-care",
  "wellness",
  "comfort",
  "relaxation",
  "recovery routine",
  "evening routine",
  "consistency",
  "home wellness",
  "red and near-infrared light exposure",
  "results may vary",
  "follow the product manual",
];

const FALLBACK_REWRITE_PATTERNS = [
  {
    original: "treats pain",
    suggestion: "supports a calming self-care routine",
  },
  {
    original: "cures insomnia",
    suggestion: "can be used as part of an evening wind-down routine",
  },
  {
    original: "heals inflammation",
    suggestion: "designed for gentle red and near-infrared light exposure",
  },
  {
    original: "guaranteed results",
    suggestion: "results may vary depending on consistency and individual use",
  },
  {
    original: "clinically proven to fix",
    suggestion: "explained in conservative, evidence-aware wellness language",
  },
];

const MEDIUM_RISK_TERMS = [
  "clinically proven",
  "medical-grade",
  "therapeutic",
  "therapy result",
  "pain relief",
  "reduce inflammation",
  "improves sleep",
  "sleep improvement",
  "anxiety relief",
  "depression relief",
  "before-and-after",
];

function readOptionalFile(relativePath) {
  const fullPath = path.join(ROOT_DIR, relativePath);
  try {
    return {
      ok: true,
      path: fullPath,
      content: fs.readFileSync(fullPath, "utf8"),
    };
  } catch (error) {
    return {
      ok: false,
      path: fullPath,
      content: "",
      error: error.message,
    };
  }
}

function normaliseText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function includesPhrase(text, phrase) {
  const normalisedPhrase = normaliseText(phrase);
  if (!normalisedPhrase) return false;
  const startsWord = /^[a-z0-9]/i.test(normalisedPhrase);
  const endsWord = /[a-z0-9]$/i.test(normalisedPhrase);
  const prefix = startsWord ? "\\b" : "";
  const suffix = endsWord ? "\\b" : "";
  const pattern = new RegExp(`${prefix}${escapeRegExp(normalisedPhrase)}${suffix}`, "i");
  return pattern.test(text);
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function parseBulletsByHeading(markdown) {
  const sections = {};
  let currentHeading = "uncategorised";

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    const headingMatch = line.match(/^##\s+(.+)$/);
    if (headingMatch) {
      currentHeading = headingMatch[1].trim();
      sections[currentHeading] = sections[currentHeading] || [];
      continue;
    }

    const bulletMatch = line.match(/^-\s+(.+)$/);
    if (bulletMatch) {
      sections[currentHeading] = sections[currentHeading] || [];
      sections[currentHeading].push(bulletMatch[1].trim());
    }
  }

  return sections;
}

function categoryFromHeading(heading) {
  const normalised = normaliseText(heading);
  if (normalised.includes("medical claim")) return "banned_medical_claim";
  if (normalised.includes("result")) return "banned_result_claim";
  if (normalised.includes("condition")) return "banned_condition_claim";
  if (normalised.includes("trust") || normalised.includes("evidence")) {
    return "banned_trust_evidence_claim";
  }
  if (normalised.includes("tone") || normalised.includes("positioning")) {
    return "banned_tone_positioning";
  }
  return null;
}

function parseBlacklist(markdown) {
  const termsByCategory = { ...FALLBACK_RISK_TERMS };
  const sections = parseBulletsByHeading(markdown);

  for (const [heading, bullets] of Object.entries(sections)) {
    const category = categoryFromHeading(heading);
    if (!category) continue;
    termsByCategory[category] = unique([
      ...(termsByCategory[category] || []),
      ...bullets.map((bullet) => bullet.replace(/`/g, "")),
    ]);
  }

  return termsByCategory;
}

function parseWhitelist(markdown) {
  const allowed = [...FALLBACK_ALLOWED_TERMS];
  const sections = parseBulletsByHeading(markdown);

  for (const [heading, bullets] of Object.entries(sections)) {
    const normalisedHeading = normaliseText(heading);
    if (
      normalisedHeading.includes("allowed") ||
      normalisedHeading.includes("approved") ||
      normalisedHeading.includes("safety")
    ) {
      allowed.push(...bullets.map((bullet) => bullet.replace(/`/g, "")));
    }
  }

  return unique(allowed);
}

function parseRewritePatterns(...markdownSources) {
  const rewrites = [...FALLBACK_REWRITE_PATTERNS];
  const rewritePattern = /Replace\s+"([^"]+)"\s+with\s+"([^"]+)"/gi;

  for (const markdown of markdownSources) {
    let match;
    while ((match = rewritePattern.exec(markdown)) !== null) {
      rewrites.push({
        original: match[1],
        suggestion: match[2],
      });
    }
  }

  const seen = new Set();
  return rewrites.filter((rewrite) => {
    const key = `${normaliseText(rewrite.original)}=>${normaliseText(rewrite.suggestion)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function loadBrandRules(brandId) {
  const safeBrandId = String(brandId || DEFAULT_OPTIONS.brandId).replace(/[^a-zA-Z0-9_-]/g, "");
  const whitelistFile = readOptionalFile(`brands/${safeBrandId}/claim_whitelist.md`);
  const blacklistFile = readOptionalFile(`brands/${safeBrandId}/claim_blacklist.md`);
  const sourceStatusPolicy = readOptionalFile("docs/SOURCE_STATUS_POLICY.md");
  const validationRules = readOptionalFile("validation/rules.yml");

  const notes = [];
  if (!whitelistFile.ok) {
    notes.push(`Could not read brand claim whitelist at ${whitelistFile.path}.`);
  }
  if (!blacklistFile.ok) {
    notes.push(`Could not read brand claim blacklist at ${blacklistFile.path}.`);
  }
  if (!sourceStatusPolicy.ok) {
    notes.push("Could not read docs/SOURCE_STATUS_POLICY.md.");
  }
  if (!validationRules.ok) {
    notes.push("Could not read validation/rules.yml.");
  }

  return {
    brandId: safeBrandId,
    loadedAllRequiredFiles:
      whitelistFile.ok && blacklistFile.ok && sourceStatusPolicy.ok && validationRules.ok,
    allowedTerms: whitelistFile.ok ? parseWhitelist(whitelistFile.content) : FALLBACK_ALLOWED_TERMS,
    riskTermsByCategory: blacklistFile.ok
      ? parseBlacklist(blacklistFile.content)
      : FALLBACK_RISK_TERMS,
    rewritePatterns: parseRewritePatterns(whitelistFile.content, blacklistFile.content),
    notes,
  };
}

function getSuggestedRewrites(text, rewritePatterns) {
  const normalised = normaliseText(text);
  return rewritePatterns.filter((rewrite) => includesPhrase(normalised, rewrite.original));
}

function validateClaim(text, options = {}) {
  const settings = {
    ...DEFAULT_OPTIONS,
    ...options,
  };
  const rules = loadBrandRules(settings.brandId);
  const normalised = normaliseText(text);

  const result = {
    decision: "needs_review",
    risk_level: "medium",
    matched_terms: [],
    risk_categories: [],
    suggested_rewrites: [],
    manual_review_required: true,
    notes: [],
  };

  if (!normalised) {
    result.notes.push("Empty input cannot be validated.");
    return result;
  }

  if (!rules.loadedAllRequiredFiles) {
    result.notes.push(...rules.notes);
    result.notes.push("Brand claim rules or validation policy could not be fully loaded.");
  }

  for (const [category, terms] of Object.entries(rules.riskTermsByCategory)) {
    for (const term of terms) {
      if (includesPhrase(normalised, term)) {
        result.matched_terms.push(normaliseText(term));
        result.risk_categories.push(category);
      }
    }
  }

  result.suggested_rewrites = getSuggestedRewrites(normalised, rules.rewritePatterns);

  if (result.matched_terms.length > 0) {
    result.decision = "blocked";
    result.risk_level = "high";
    result.manual_review_required = true;
    result.matched_terms = unique(result.matched_terms);
    result.risk_categories = unique(result.risk_categories);
    result.notes.push("High-risk medical, trust, positioning, or guaranteed-result claims must be blocked before adapter export.");
    return result;
  }

  const mediumRiskMatches = MEDIUM_RISK_TERMS.filter((term) => includesPhrase(normalised, term));
  if (mediumRiskMatches.length > 0) {
    result.decision = "needs_review";
    result.risk_level = "medium";
    result.manual_review_required = true;
    result.matched_terms = unique(mediumRiskMatches);
    result.risk_categories = ["possible_overstated_wellness_claim"];
    result.notes.push("Potentially overstated wellness wording should be manually reviewed.");
    return result;
  }

  const matchedAllowedTerms = rules.allowedTerms.filter((term) => includesPhrase(normalised, term));
  if (matchedAllowedTerms.length > 0 && rules.loadedAllRequiredFiles) {
    result.decision = "pass";
    result.risk_level = matchedAllowedTerms.length >= 2 ? "none" : "low";
    result.manual_review_required = false;
    result.matched_terms = unique(matchedAllowedTerms.map(normaliseText));
    result.risk_categories = [];
    result.notes.push("No blocked claim patterns found; wording matches allowed wellness language.");
    return result;
  }

  result.notes.push("No blocked terms found, but wording does not clearly match the brand whitelist. Conservative review required.");
  return result;
}

function runCli() {
  const args = process.argv.slice(2);
  const text = args[0] || "";
  const brandId = args[1] || DEFAULT_OPTIONS.brandId;
  const result = validateClaim(text, { brandId, strictMode: true });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (require.main === module) {
  runCli();
}

module.exports = {
  validateClaim,
};
