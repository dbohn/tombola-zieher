#define BUTTON 3

uint8_t buttonState = 0;
uint8_t buttonPrevious = 0;

long lastDebounceTime = 0;
long debounceDelay = 50;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
}

void loop() {
  // put your main code here, to run repeatedly:
  int reading = digitalRead(BUTTON);

  if (reading != buttonPrevious) {
    lastDebounceTime = millis();
  }

  if ((millis() - lastDebounceTime) > debounceDelay) {
    if (reading != buttonState) {
      buttonState = reading;

      if (buttonState == HIGH) {
        Serial.println("Button closed");
      } else {
        Serial.println("Button opened");
      }
    }
  }

  buttonPrevious = reading;
}
