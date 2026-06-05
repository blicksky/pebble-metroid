import Poco from "commodetto/Poco";
import Battery from "embedded:sensor/Battery";
import Message from "pebble/message";

const render = new Poco(screen);

// Setup HUD Colors (Super Metroid theme)
const energyBlue = render.makeColor(0, 240, 255);     // Neon cyan/blue for HUD elements
const samusOrange = render.makeColor(240, 110, 0);     // Classic Samus power-suit orange
const energyGreen = render.makeColor(57, 255, 20);      // High-visibility energy tank green
const textWhite = render.makeColor(255, 255, 255);
const blackColor = render.makeColor(0, 0, 0);

// Load built-in watch fonts (Leco-Bold is a sleek monospace font available in Alloy at size 20)
const timeFont = new render.Font("Leco-Bold", 20);
const labelFont = new render.Font("Gothic-Regular", 14);
const stepsFont = new render.Font("Gothic-Bold", 18);
const titleFont = new render.Font("Gothic-Regular", 9);

// Load the custom Super Metroid status HUD PNG image from resources (Resource ID 1)
const statusHudBitmap = new Poco.PebbleBitmap(1);
// Load the custom battery sprites PNG image from resources (Resource ID 2)
const batterySpritesBitmap = new Poco.PebbleBitmap(2);
// Load the custom box sprites PNG image from resources (Resource ID 3)
const boxSpritesBitmap = new Poco.PebbleBitmap(3);

// Initialize Sensors
let battery;
let steps = 0;

// TODO consider moving this into an object with other similar state
let lastBatteryPercent = 0;

function drawBox(x, y, width, height, title, titleColor = textWhite) {
    // 2. Draw the four corners (4x4 pixels each)
    // Top-Left Corner (Slot 0: X=0, Y=0)
    render.drawBitmap(boxSpritesBitmap, x, y, 0, 0, 4, 4);
    // Top-Right Corner (Slot 1: X=5, Y=0)
    render.drawBitmap(boxSpritesBitmap, x + width - 4, y, 5, 0, 4, 4);
    // Bottom-Left Corner (Slot 2: X=10, Y=0)
    render.drawBitmap(boxSpritesBitmap, x, y + height - 4, 10, 0, 4, 4);
    // Bottom-Right Corner (Slot 3: X=15, Y=0)
    render.drawBitmap(boxSpritesBitmap, x + width - 4, y + height - 4, 15, 0, 4, 4);

    // 3. Draw the vertical borders (Left and Right sides)
    // Slot 4 (X=20, Y=0) is a 3x1 horizontal sprite, repeated vertically to make 3-pixel wide solid lines
    for (let dy = 4; dy < height - 4; dy++) {
        render.drawBitmap(boxSpritesBitmap, x, y + dy, 20, 0, 3, 1);
        render.drawBitmap(boxSpritesBitmap, x + width - 3, y + dy, 20, 0, 3, 1);
    }

    // 4. Draw the bottom border
    // Slot 5 (X=25, Y=0) is a 1x3 vertical sprite, repeated horizontally to make a 3-pixel high solid line
    for (let dx = 4; dx < width - 4; dx++) {
        render.drawBitmap(boxSpritesBitmap, x + dx, y + height - 3, 25, 0, 1, 3);
    }

    // 5. Draw the top border (with or without title)
    let drawTitle = false;
    let titleX, termLeftX, termRightX;
    if (title) {
        let titleWidth = render.getTextWidth(title, titleFont);
        let centerX = x + (width / 2);
        titleX = Math.round(centerX - (titleWidth / 2));
        const pad = 3;
        termLeftX = titleX - pad - 2;
        termRightX = titleX + titleWidth + pad;
        // Ensure the title and its terminators fit within the box corners
        if (termLeftX >= x + 4 && termRightX + 2 <= x + width - 4) {
            drawTitle = true;
        }
    }

    if (drawTitle) {
        // Draw left terminator (Slot 6: X=30, Y=0, W=2, H=3)
        render.drawBitmap(boxSpritesBitmap, termLeftX, y, 30, 0, 2, 3);
        // Draw right terminator (Slot 7: X=35, Y=0, W=2, H=3)
        render.drawBitmap(boxSpritesBitmap, termRightX, y, 35, 0, 2, 3);

        // Draw left top border segment (from x + 4 to termLeftX)
        for (let dx = 4; dx < termLeftX - x; dx++) {
            render.drawBitmap(boxSpritesBitmap, x + dx, y, 25, 0, 1, 3);
        }

        // Draw right top border segment (from termRightX + 2 to width - 4)
        for (let dx = termRightX + 2 - x; dx < width - 4; dx++) {
            render.drawBitmap(boxSpritesBitmap, x + dx, y, 25, 0, 1, 3);
        }

        // Draw title text centered in the gap (moved up 1px to y - 4)
        render.drawText(title, titleFont, titleColor, titleX, y - 4);
    } else {
        // Draw solid top border all the way across
        for (let dx = 4; dx < width - 4; dx++) {
            render.drawBitmap(boxSpritesBitmap, x + dx, y, 25, 0, 1, 3);
        }
    }
}

function drawBackground() {
    render.drawBitmap(statusHudBitmap, 0, 0);
}

function drawTime(now) {
    const boxX = 6;
    const boxY = 97;
    const boxWidth = 64;
    const boxHeight = 32;

    drawBox(boxX, boxY, boxWidth, boxHeight, "TIME");

    const hours = now.getHours();
    const formattedHours = String(hours).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const timeString = `${formattedHours}:${minutes}`;

    const timeWidth = render.getTextWidth(timeString, timeFont);
    const clockX = boxX + (boxWidth - timeWidth) / 2;
    const clockY = boxY + Math.round((boxHeight - 20) / 2);

    render.drawText(timeString, timeFont, textWhite, clockX, clockY);
}

function drawSteps() {
    const boxX = 130;
    const boxY = 148;
    const boxWidth = 64;
    const boxHeight = 32;

    drawBox(boxX, boxY, boxWidth, boxHeight, "STEPS");

    const stepsString = String(steps);
    const stepsWidth = render.getTextWidth(stepsString, stepsFont);
    const stepsX = boxX + (boxWidth - stepsWidth) / 2;
    const stepsY = boxY + Math.round((boxHeight - 18) / 2);

    render.drawText(stepsString, stepsFont, textWhite, stepsX, stepsY);
}

function drawBattery() {
    let batteryPercent = lastBatteryPercent;
    if (batteryPercent > 100) batteryPercent = 100;

    // --- DRAW ENERGY TANKS ---
    const filledTanksCount = Math.floor(batteryPercent * 14 / 100);
    const tankWidth = 8;
    const spacer = 0;
    const startX = 8;
    const bottomY = 8;
    const topY = 1;

    for (let i = 0; i < filledTanksCount; i++) {
        const isTopRow = i >= 7;
        const col = isTopRow ? (i - 7) : i;
        const x = startX + col * (tankWidth + spacer);
        const y = isTopRow ? topY : bottomY;

        render.drawBitmap(batterySpritesBitmap, x, y, 90, 0, 8, 8);
    }

    // --- DRAW BATTERY PERCENTAGE DIGITS ---
    const hundreds = Math.floor(batteryPercent / 100);
    const tens = Math.floor((batteryPercent % 100) / 10);
    const ones = batteryPercent % 10;

    if (hundreds > 0) {
        render.drawBitmap(batterySpritesBitmap, 49 - 8, 15, hundreds * 9, 0, 8, 8);
    }
    render.drawBitmap(batterySpritesBitmap, 49, 15, tens * 9, 0, 8, 8);
    render.drawBitmap(batterySpritesBitmap, 49 + 8, 15, ones * 9, 0, 8, 8);
}

function drawFooter(now) {
    const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    const dayName = DAYS[now.getDay()];
    const monthName = MONTHS[now.getMonth()];
    const dateString = `${dayName}, ${monthName} ${now.getDate()}`;

    render.drawText(dateString, labelFont, samusOrange, 10, render.height - 25);
    render.drawText("MISSION ACTIVE", labelFont, energyBlue, render.width - 110, render.height - 25);
}

function draw(e) {
    const now = (e && e.date) ? e.date : new Date();

    render.begin();
    drawBackground();
    drawBattery();
    drawTime(now);
    drawSteps();
    drawFooter(now);
    render.end();
}

// Initialize Battery Sensor
try {
    battery = new Battery({
        onSample() {
            const sample = this.sample();
            if (sample && sample.percent !== undefined) {
                lastBatteryPercent = sample.percent;
                draw();
            }
        }
    });

    // Populate initial state immediately
    const initialSample = battery.sample();
    if (initialSample && initialSample.percent !== undefined) {
        lastBatteryPercent = initialSample.percent;
    }
} catch (err) {
    // Fail-silent if hardware/sensor is not available during start
}



watch.addEventListener("minutechange", draw);

try {
    const msg = new Message({
        keys: ["steps"],
        onReadable() {
            try {
                const data = this.read();
                if (data.has("steps")) {
                    steps = data.get("steps");
                    console.log("JS received steps: " + steps);
                    draw();
                }
            } catch (e) {
                console.log("Error reading steps message: " + e);
            }
        }
    });
} catch (err) {
    console.log("Error starting AppMessage listener: " + err);
}

