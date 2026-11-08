import { readFileSync } from 'fs';
import { join } from 'path';
import { XML } from 'expo/config-plugins';

import { colors } from '@/design/theme';
import appConfig from '../../app.config';
import { applyLaunchBackground, LAUNCH_BACKGROUND_COLOR_NAME } from '../withIosLaunchBackground';

// The storyboard expo-splash-screen generates when no splash image is configured (SDK 58).
const TEMPLATE = `<?xml version="1.0" encoding="UTF-8"?>
<document type="com.apple.InterfaceBuilder3.CocoaTouch.Storyboard.XIB" version="3.0" launchScreen="YES">
  <scenes><scene sceneID="EXPO-SCENE-1"><objects>
    <viewController id="EXPO-VIEWCONTROLLER-1" sceneMemberID="viewController">
      <view key="view" id="EXPO-ContainerView" userLabel="ContainerView">
        <subviews/>
        <color key="backgroundColor" systemColor="systemBackgroundColor"/>
      </view>
    </viewController>
  </objects></scene></scenes>
  <resources>
    <systemColor name="systemBackgroundColor"><color white="1" alpha="1" colorSpace="custom" customColorSpace="genericGamma22GrayColorSpace"/></systemColor>
  </resources>
</document>`;

const parse = (xml: string) => XML.parseXMLAsync(xml) as Promise<any>;

describe('withIosLaunchBackground', () => {
  it('REQ-MOB-001 points the iOS launch screen at the Warm White splash colour, not system white', async () => {
    const out = XML.format(applyLaunchBackground(await parse(TEMPLATE), colors.splash));

    expect(out).toContain(`<color key="backgroundColor" name="${LAUNCH_BACKGROUND_COLOR_NAME}"/>`);
    expect(out).not.toContain('systemBackgroundColor');

    const named = (await parse(out)).document.resources[0].namedColor[0];
    expect(named.$.name).toBe(LAUNCH_BACKGROUND_COLOR_NAME);
    const { red, green, blue } = named.color[0].$;
    const hex = [red, green, blue].map((c: string) =>
      Math.round(Number(c) * 255)
        .toString(16)
        .padStart(2, '0'),
    );
    expect(`#${hex.join('')}`.toUpperCase()).toBe(colors.splash.toUpperCase());
  });

  it('REQ-MOB-001 is listed before expo-splash-screen so it runs after that plugin', () => {
    const source = readFileSync(join(__dirname, '../../app.config.ts'), 'utf8');
    expect(source.indexOf("['./plugins/withIosLaunchBackground'")).toBeGreaterThan(-1);
    expect(source.indexOf("['./plugins/withIosLaunchBackground'")).toBeLessThan(
      source.indexOf("['expo-splash-screen'"),
    );
  });

  it('rejects a colour that is not #RRGGBB', async () => {
    expect(() => applyLaunchBackground({ document: {} }, 'warm white')).toThrow(/#RRGGBB/);
  });
});

describe('iOS root view background', () => {
  it('REQ-MOB-001 is Warm White, so no white frame shows between the launch screen and the splash', () => {
    expect(appConfig.ios?.backgroundColor).toBe(colors.splash);
  });
});
