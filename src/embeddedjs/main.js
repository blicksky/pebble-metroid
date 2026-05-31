import Poco from "commodetto/Poco";

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

function draw(e) {
    const now = (e && e.date) ? e.date : new Date();

    render.begin();
    // --- SUPER METROID HUD STRUCTURE ---
    
    // Draw the custom status HUD bitmap from resources (fits full 200x228 screen)
    render.drawBitmap(statusHudBitmap, 0, 0);
    
    // --- TIME DISPLAY AT THE TOP ---
    const hours = now.getHours();
    const formattedHours = String(hours).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const timeString = `${formattedHours}:${minutes}`;
    
    // Center-align the full time string horizontally at the top of the screen
    const timeWidth = render.getTextWidth(timeString, timeFont);
    const clockX = (render.width - timeWidth) / 2;
    const clockY = 4; // Moved even closer to the top edge!
    
    render.drawText(timeString, timeFont, textWhite, clockX, clockY);

    // --- BOTTOM HUD SECTION (Date and Mission Status) ---
    
    // Draw Date String (e.g. "SAT, MAY 30")
    const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    
    const dayName = DAYS[now.getDay()];
    const monthName = MONTHS[now.getMonth()];
    const dateString = `${dayName}, ${monthName} ${now.getDate()}`;
    
    render.drawText(dateString, labelFont, samusOrange, 10, render.height - 25);
    render.drawText("MISSION ACTIVE", labelFont, energyBlue, render.width - 110, render.height - 25);

    render.end();
}

// Register the event listener and trigger the initial draw safely inside the event loop!
// Deferring this to the event loop prevents graphics engine freezes and watchdog crashes
// when loading/drawing large bitmap resources during engine startup.
setTimeout(() => {
    watch.addEventListener("minutechange", draw);
}, 0);

