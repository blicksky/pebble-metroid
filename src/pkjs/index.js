Pebble.addEventListener("ready", function(e) {
    console.log("PebbleKit JS (Phone Companion) ready for Super Metroid Watchface!");
});

Pebble.addEventListener("appmessage", function(e) {
    console.log("PKJS received message: " + JSON.stringify(e.payload));
    if (e.payload && e.payload[10000] !== undefined) {
        Pebble.sendAppMessage({ 10000: e.payload[10000] });
    }
});
