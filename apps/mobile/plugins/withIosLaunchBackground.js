// Plain JavaScript (CommonJS): app.config.ts can load a local plugin only in this form.
const { withMod } = require('expo/config-plugins');

/** The splash-screen plugin's storyboard mod (expo-splash-screen `withIosSplashScreenStoryboard`). */
const STORYBOARD_MOD = 'splashScreenStoryboard';

/** The named colour the splash-screen plugin writes to `Images.xcassets/SplashScreenBackground.colorset`. */
const LAUNCH_BACKGROUND_COLOR_NAME = 'SplashScreenBackground';

/** @typedef {{ $?: Record<string, string>, [child: string]: any }} XmlNode */

/** @param {XmlNode | undefined} node @param {string} key @returns {XmlNode | undefined} */
const first = (node, key) => node?.[key]?.[0];

/**
 * "#RRGGBB" to the 0–1 components Interface Builder stores.
 * @param {string} hex
 */
function components(hex) {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!match) throw new Error(`withIosLaunchBackground: expected a #RRGGBB colour, got "${hex}"`);
  /** @param {string} value */
  const channel = (value) => String(parseInt(value, 16) / 255);
  return { red: channel(match[1]), green: channel(match[2]), blue: channel(match[3]) };
}

/**
 * Points the launch storyboard's background at the `SplashScreenBackground` named colour.
 *
 * expo-splash-screen (SDK 58) applies that colour only when a splash image is configured; with no image
 * it leaves the template's `systemBackgroundColor` (white), so iOS showed a white launch screen before
 * the Warm White splash. Android is unaffected.
 *
 * @param {{ document: XmlNode }} xml parsed storyboard (xml2js)
 * @param {string} backgroundColor "#RRGGBB"
 */
function applyLaunchBackground(xml, backgroundColor) {
  const color = components(backgroundColor);
  const view = first(first(first(first(first(xml.document, 'scenes'), 'scene'), 'objects'), 'viewController'), 'view');
  if (!view) throw new Error('withIosLaunchBackground: the launch storyboard has no view');
  view.color = [{ $: { key: 'backgroundColor', name: LAUNCH_BACKGROUND_COLOR_NAME } }];

  const resources = first(xml.document, 'resources') ?? {};
  xml.document.resources = [resources];
  resources.systemColor = (resources.systemColor ?? []).filter(
    (/** @type {XmlNode} */ entry) => entry.$?.name !== 'systemBackgroundColor',
  );
  resources.namedColor = [
    {
      $: { name: LAUNCH_BACKGROUND_COLOR_NAME },
      color: [{ $: { ...color, alpha: '1.000', colorSpace: 'custom', customColorSpace: 'sRGB' } }],
    },
  ];
  return xml;
}

/**
 * List before `expo-splash-screen` in `plugins`: that plugin registers the storyboard's base mod last,
 * and a mod registered earlier runs after its storyboard changes.
 *
 * @type {import('expo/config-plugins').ConfigPlugin<{ backgroundColor: string }>}
 */
const withIosLaunchBackground = (config, { backgroundColor }) =>
  withMod(config, {
    platform: 'ios',
    mod: STORYBOARD_MOD,
    action: (modConfig) => {
      modConfig.modResults = applyLaunchBackground(modConfig.modResults, backgroundColor);
      return modConfig;
    },
  });

// Expo loads a local plugin from its default export; the helpers are attached for the unit test.
module.exports = withIosLaunchBackground;
module.exports.applyLaunchBackground = applyLaunchBackground;
module.exports.LAUNCH_BACKGROUND_COLOR_NAME = LAUNCH_BACKGROUND_COLOR_NAME;
