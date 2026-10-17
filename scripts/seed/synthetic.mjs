// Synthetic data generator and validator (Section 3: synthetic data only; criterion 14).
//
// Every person is fictional: surnames come from an obviously invented list, email addresses use the
// reserved example domains (RFC 2606), phone numbers use the 555-0100 to 555-0199 range reserved
// for fiction, and avatars are generated initials, never photographs. The validator rejects any
// dataset that breaks these rules, so a real record cannot be slipped into seed data.

export const RESERVED_EMAIL_DOMAINS = ['example.com', 'example.org', 'example.net'];
export const RESERVED_TLDS = ['.test', '.example', '.invalid'];

const GIVEN_NAMES = ['Avery', 'Blake', 'Casey', 'Devon', 'Emery', 'Finley', 'Harper', 'Jules', 'Kai', 'Logan', 'Morgan', 'Quinn', 'Reese', 'Rowan', 'Sage', 'Taylor'];
// Invented surnames that read as placeholders.
export const SYNTHETIC_SURNAMES = ['Testperson', 'Sampleton', 'Placeholder', 'Fictionalis', 'Demoworth', 'Mockridge', 'Seedling', 'Exampleby'];
const ORGANIZATIONS = ['Example Home Care Agency', 'Sample Family Caregivers'];

/** Small deterministic PRNG (mulberry32) so the same seed always yields the same dataset. */
function random(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(next, list) {
  return list[Math.floor(next() * list.length)];
}

function person(next, index, role, domain) {
  const given = pick(next, GIVEN_NAMES);
  const surname = pick(next, SYNTHETIC_SURNAMES);
  return {
    synthetic: true,
    role,
    givenName: given,
    familyName: surname,
    email: `${given}.${surname}.${index}@${domain}`.toLowerCase(),
    phone: `+1-202-555-01${String(index % 100).padStart(2, '0')}`,
    avatar: { kind: 'generated-initials', initials: `${given[0]}${surname[0]}` },
  };
}

export function generate({ seed = 20261017, caregiversPerOrg = 4, clientsPerOrg = 6 } = {}) {
  const next = random(seed);
  let index = 0;
  const organizations = ORGANIZATIONS.map((name, orgIndex) => {
    const domain = RESERVED_EMAIL_DOMAINS[orgIndex % RESERVED_EMAIL_DOMAINS.length];
    return {
      synthetic: true,
      name,
      timeZone: 'America/New_York',
      administrators: [person(next, index++, 'OrganizationAdministrator', domain)],
      caregivers: Array.from({ length: caregiversPerOrg }, () => person(next, index++, 'Caregiver', domain)),
      clients: Array.from({ length: clientsPerOrg }, () => {
        const p = person(next, index++, 'Client', domain);
        const year = 1935 + Math.floor(next() * 80);
        return { ...p, dateOfBirth: `${year}-0${1 + Math.floor(next() * 9)}-1${Math.floor(next() * 9)}` };
      }),
    };
  });
  return { synthetic: true, generator: 'kindred-seed/1', seed, organizations };
}

/** Returns a list of problems; empty means the dataset is synthetic by construction. */
export function validateSynthetic(dataset) {
  const problems = [];
  if (dataset?.synthetic !== true) problems.push('dataset is not marked synthetic');
  const people = (dataset?.organizations ?? []).flatMap((o) => [
    ...(o.synthetic === true ? [] : [{ problem: `organization "${o.name}" is not marked synthetic` }]),
    ...o.administrators,
    ...o.caregivers,
    ...o.clients,
  ]);
  for (const entry of people) {
    if (entry.problem) {
      problems.push(entry.problem);
      continue;
    }
    const label = `${entry.givenName} ${entry.familyName}`;
    if (entry.synthetic !== true) problems.push(`${label} is not marked synthetic`);
    if (!SYNTHETIC_SURNAMES.includes(entry.familyName)) problems.push(`${label} does not use a synthetic surname`);
    const domain = entry.email?.split('@')[1] ?? '';
    if (!RESERVED_EMAIL_DOMAINS.includes(domain) && !RESERVED_TLDS.some((tld) => domain.endsWith(tld))) {
      problems.push(`${label} has a non-reserved email domain: ${domain}`);
    }
    if (!/^\+1-\d{3}-555-01\d{2}$/.test(entry.phone ?? '')) problems.push(`${label} has a phone number outside 555-0100..0199`);
    if (entry.avatar?.kind !== 'generated-initials') problems.push(`${label} has an avatar that is not a generated placeholder`);
  }
  return problems;
}
