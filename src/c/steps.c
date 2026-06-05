#include <pebble.h>

#define KEY_STEPS 10000

static void send_steps(void) {
    HealthValue steps = health_service_sum_today(HealthMetricStepCount);
    APP_LOG(APP_LOG_LEVEL_INFO, "Steps value today: %d", (int)steps);

    DictionaryIterator *iter;
    AppMessageResult result = app_message_outbox_begin(&iter);
    if (result == APP_MSG_OK) {
        dict_write_int32(iter, KEY_STEPS, (int)steps);
        result = app_message_outbox_send();
        if (result != APP_MSG_OK) {
            APP_LOG(APP_LOG_LEVEL_ERROR, "Failed to send AppMessage: %d", (int)result);
        }
    } else {
        APP_LOG(APP_LOG_LEVEL_DEBUG, "AppMessage outbox begin failed: %d", (int)result);
    }
}

static void health_handler(HealthEventType event, void *context) {
    if (event == HealthEventSignificantUpdate || event == HealthEventMovementUpdate) {
        send_steps();
    }
}

static void timer_callback(void *data) {
    send_steps();
    app_timer_register(20000, timer_callback, NULL); // Repeat every 20 seconds
}

void init_health_service(void) {
    // Subscribe to health events
    health_service_events_subscribe(health_handler, NULL);

    // Also set up a periodic timer to update step count (and handle initial display)
    app_timer_register(2000, timer_callback, NULL); // Start 2 seconds after boot
}
