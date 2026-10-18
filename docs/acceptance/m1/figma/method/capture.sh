#!/usr/bin/env bash
# Capture the Kindred splash and Log In at an exact point size on the emulator (3 px per pt).
# usage: capture.sh <width_pt> <height_pt> <out_dir>
set -e
ADB="$LOCALAPPDATA/Android/Sdk/platform-tools/adb"
export MSYS_NO_PATHCONV=1
W=$1; H=$2; OUT=$3
mkdir -p "$OUT"
"$ADB" shell wm density 480
"$ADB" shell wm size $((W * 3))x$((H * 3))
"$ADB" shell settings put system font_scale 1.0
"$ADB" reverse tcp:8081 tcp:8081 >/dev/null
"$ADB" shell am force-stop com.kindredcare.mobile
sleep 2
# __expo_disable_fab hides the development client's floating Tools button for clean captures.
"$ADB" shell am start -n com.kindredcare.mobile/.MainActivity   -d "exp+kindred://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081&__expo_disable_fab=1&__expo_disable_onboarding=1" >/dev/null
# Splash: rapid captures from launch; keep the last frame that shows the wordmark but no button.
mkdir -p "$OUT/frames"; rm -f "$OUT/frames"/*.png
for i in $(seq -w 1 60); do "$ADB" exec-out screencap -p > "$OUT/frames/f$i.png"; done
python "$(dirname "$0")/pick_splash.py" "$OUT/frames" "$OUT/splash-${W}.png"
sleep 4
# Tap empty space low on the screen: leaves keyboard-navigation mode, so no field starts focused.
"$ADB" shell input tap $((W * 3 / 2)) $((H * 3 - 300))
"$ADB" shell input keyevent 111
sleep 1
"$ADB" exec-out screencap -p > "$OUT/log-in-${W}.png"
"$ADB" shell uiautomator dump /sdcard/t.xml >/dev/null
"$ADB" pull /sdcard/t.xml "$OUT/log-in-${W}.xml" >/dev/null
echo "captured ${W}x${H} pt"
