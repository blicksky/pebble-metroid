# Pebble Super Metroid Watchface

A Super Metroid status HUD watchface for the Pebble Time 2 (Emery platform), built with Pebble Alloy and Moddable JavaScript.

## Development Steps

### 1. Build the App
Compile the project to package both C and JavaScript sources:
```bash
pebble build
```
This generates the watchapp bundle at `build/pebble-app.pbw`.

### 2. Run the Emulator
Build and launch the watchface in the Pebble QEMU emulator:
```bash
pebble install --emulator emery
```

*Tip: Append `--logs` to the install command to automatically start viewing logs, or run:*
```bash
pebble logs
```

### 3. Install on a Watch

#### Via Phone IP (Developer Connection)
1. Enable the **Developer Connection** in the Pebble mobile app settings.
2. Install directly using your phone's IP (you can also append `--logs` to view logs immediately):
```bash
pebble install --phone <PHONE_IP_ADDRESS>
```

#### Via CloudPebble Router Connection
You can install wirelessly through the CloudPebble proxy without entering an IP address, provided both your phone and CLI are logged into the same account:
1. Log in on your CLI:
   ```bash
   pebble login
   ```
2. Ensure you are signed in using the same Rebble/Pebble account in the Pebble app on your paired phone.
3. Enable the **Developer Connection** in the app settings.
4. Deploy the app (optionally appending `--logs`):
   ```bash
   pebble install --cloudpebble
   ```

#### Via Rebble Web Tools (Browser)
1. Run `pebble build` to produce `build/pebble-app.pbw`.
2. Open **Rebble Web Tools** (or modern CloudPebble/Rebble Developer browser interface).
3. Upload/drag-and-drop the `.pbw` file to install it on your connected device.

## Planned Features / Todo List

Below is the feature list to track implementation progress:

- [ ] **Battery HUD ("Energy"):**
  - Show "Energy" followed by the battery percentage in the top left.
  - Render filled-in energy tank squares corresponding to the current percentage.
  - Replace the "Auto" arrows with `"Chrg"` when the device is charging / plugged in.
- [ ] **HUD Date Display:**
  - Display the date info (3-letter day, 3-letter month, and date) in the boxes typically reserved for missile, super missile, and power bomb counts.
- [ ] **Watch Time (Reserve Tank Box):**
  - Render the time in the top-left reserve tank box. Ensure proper font selection for high visibility.
  - Remove the arrow connecting the reserve tank box to the energy section from the background graphic.
- [ ] **Suit Theme Swapping:**
  - Support selection between:
    - Power Suit theme
    - Varia Suit theme
    - Dynamic suit change (Power Suit during AM, Varia Suit during PM).
- [ ] **Sensor Display (Requires custom C-bindings):**
  - Display Step Count in the HUD box pointing to Samus' boots.
  - Display Heart Rate in the HUD box pointing to Samus' chest.
