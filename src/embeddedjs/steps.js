import Message from "pebble/message";

function getTodayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
}

function loadCachedSteps() {
    try {
        const todayKey = getTodayKey();
        const cachedDate = localStorage.getItem("steps_date");
        if (cachedDate === todayKey) {
            const cachedSteps = localStorage.getItem("steps");
            if (cachedSteps !== null) {
                return parseInt(cachedSteps, 10);
            }
        }
    } catch (e) {
        // fail-silent
    }
    return 0;
}

function saveCachedSteps(val) {
    try {
        localStorage.setItem("steps", String(val));
        localStorage.setItem("steps_date", getTodayKey());
    } catch (e) {
        // fail-silent
    }
}

let steps = loadCachedSteps();
let msg;

function handleIncomingSteps(data, onUpdate) {
    if (!data.has("steps")) return;

    const receivedSteps = data.get("steps");
    const todayKey = getTodayKey();
    const cachedDate = localStorage.getItem("steps_date");
    const isNewDay = (cachedDate !== todayKey);

    if (isNewDay || receivedSteps >= steps) {
        steps = receivedSteps;
        saveCachedSteps(steps);
        if (onUpdate) {
            onUpdate(steps);
        }
    }
}

const Steps = {
    get count() {
        return steps;
    },

    init(onUpdate) {
        try {
            msg = new Message({
                keys: ["steps"],
                onReadable() {
                    try {
                        handleIncomingSteps(this.read(), onUpdate);
                    } catch (e) {
                        // fail-silent
                    }
                }
            });
        } catch (err) {
            // fail-silent
        }
    }
};

export default Steps;
