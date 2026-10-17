// Design token pipeline (Section 3, Refinement 4; ADR 0022).
// Reads design/tokens/tokens.json (DTCG), resolves aliases, renders src/design/tokens.ts and checks
// every declared text/background pair against WCAG 2.2 AA.

const ALIAS = /^\{([^}]+)\}$/;

/** Flattens the token tree into { "color.text.primary": { value, type, status } }. */
export function flatten(tree) {
  const tokens = {};
  const walk = (node, path, inheritedType) => {
    const type = node.$type ?? inheritedType;
    if (Object.hasOwn(node, '$value')) {
      tokens[path.join('.')] = { value: node.$value, type, status: node.$extensions?.kindred?.status };
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (!key.startsWith('$') && child && typeof child === 'object') walk(child, [...path, key], type);
    }
  };
  walk(tree, [], undefined);
  return tokens;
}

/** Resolves aliases. A token is a placeholder if it, or anything it points to, is not approved. */
export function resolve(tokens) {
  const resolved = {};
  const visit = (name, seen = []) => {
    if (resolved[name]) return resolved[name];
    const token = tokens[name];
    if (!token) throw new Error(`Unknown token reference: ${name}${seen.length ? ` (from ${seen.at(-1)})` : ''}`);
    if (seen.includes(name)) throw new Error(`Circular token reference: ${[...seen, name].join(' -> ')}`);
    const alias = typeof token.value === 'string' ? ALIAS.exec(token.value) : null;
    if (alias) {
      const target = visit(alias[1], [...seen, name]);
      const status = token.status === 'approved' && target.status === 'approved' ? 'approved' : 'placeholder';
      return (resolved[name] = { ...target, status, aliasOf: alias[1] });
    }
    return (resolved[name] = { value: token.value, type: token.type, status: token.status === 'approved' ? 'approved' : 'placeholder' });
  };
  for (const name of Object.keys(tokens)) visit(name);
  return resolved;
}

function channel(hex, offset) {
  const c = parseInt(hex.slice(offset, offset + 2), 16) / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex) {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) throw new Error(`Expected a #RRGGBB color, got ${hex}`);
  return 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5);
}

/** WCAG 2.x contrast ratio. */
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function checkContrast(tree, resolved) {
  const pairs = tree.$extensions?.kindred?.contrastPairs ?? [];
  return pairs.map((pair) => {
    const fg = resolved[pair.foreground];
    const bg = resolved[pair.background];
    if (!fg || !bg) return { ...pair, ratio: 0, passes: false, error: 'unknown token' };
    const ratio = contrast(fg.value, bg.value);
    return { ...pair, ratio, passes: ratio >= pair.minimum, placeholder: fg.status !== 'approved' || bg.status !== 'approved' };
  });
}

function setPath(target, path, value) {
  let node = target;
  for (const key of path.slice(0, -1)) node = node[key] ??= {};
  node[path.at(-1)] = value;
}

function toRuntimeValue(token) {
  if (token.type === 'dimension' && typeof token.value === 'string' && token.value.endsWith('px')) {
    return Number(token.value.slice(0, -2));
  }
  return token.value;
}

/** Renders the generated TypeScript module. Output is deterministic for a given input. */
export function renderTypeScript(resolved) {
  const values = {};
  for (const [name, token] of Object.entries(resolved)) setPath(values, name.split('.'), toRuntimeValue(token));
  const placeholders = Object.entries(resolved).filter(([, t]) => t.status !== 'approved').map(([n]) => n).sort();
  return [
    '// GENERATED FILE. Do not edit by hand.',
    '// Source: design/tokens/tokens.json. Regenerate with `npm run codegen`.',
    '// CI fails if this file differs from what the generator produces.',
    '',
    `export const tokens = ${JSON.stringify(values, null, 2)} as const;`,
    '',
    '/** Tokens still awaiting approved values from Figma. Visual acceptance is Provisional while non-empty. */',
    `export const placeholderTokens: readonly string[] = ${JSON.stringify(placeholders, null, 2)};`,
    '',
    `export const tokensArePlaceholders = ${placeholders.length > 0};`,
    '',
  ].join('\n');
}
