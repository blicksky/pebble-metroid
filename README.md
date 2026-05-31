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
