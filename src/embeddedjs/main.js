import Poco from "commodetto/Poco";
import Battery from "embedded:sensor/Battery";

const render = new Poco(screen);

// Setup HUD Colors (Super Metroid theme)
const energyBlue = render.makeColor(0, 240, 255);     // Neon cyan/blue for HUD elements
const samusOrange = render.makeColor(240, 110, 0);     // Classic Samus power-suit orange
const energyGreen = render.makeColor(57, 255, 20);      // High-visibility energy tank green
const textWhite = render.makeColor(255, 255, 255);

// Load built-in watch fonts (Leco-Bold is a sleek monospace font available in Alloy at size 26)
const timeFont = new render.Font("Leco-Bold", 26);
const labelFont = new render.Font("Gothic-Regular", 14);

// Load the custom Super Metroid status HUD PNG image from resources (Resource ID 1)
const statusHudBitmap = new Poco.PebbleBitmap(1);
// Load the custom battery sprites PNG image from resources (Resource ID 2)
const batterySpritesBitmap = new Poco.PebbleBitmap(2);

// Initialize Battery Sensor
let battery;

// TODO consider moving this into an object with other similar state
let lastBatteryPercent = 0;

function drawBackground() {
    render.drawBitmap(statusHudBitmap, 0, 0);
}

function drawTime(now) {
    const hours = now.getHours();
    const formattedHours = String(hours).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const timeString = `${formattedHours}:${minutes}`;

    const timeWidth = render.getTextWidth(timeString, timeFont);
    const clockX = (render.width - timeWidth) / 2;
    const clockY = 4; // Moved even closer to the top edge!

    render.drawText(timeString, timeFont, textWhite, clockX, clockY);
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
    drawTime(now);
    drawBattery();
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

