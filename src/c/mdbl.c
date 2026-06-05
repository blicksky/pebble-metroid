#include <pebble.h>

void init_health_service(void);

int main(void) {
  Window *w = window_create();
  window_stack_push(w, true);

  // Initialize health/steps service
  init_health_service();

  moddable_createMachine(NULL);

  window_destroy(w);
}
