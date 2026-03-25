/* * POSTUREGUARD - TEST 10: Sensor Fusion (HC-SR04 + MPU-6050)
 * Project for Kyoto iUP Admission
 */

#include <Wire.h>
#include <MPU6050.h>

// Pins for ESP32
#define TRIG_PIN 5
#define ECHO_PIN 18
#define LED_RED 2
#define LED_YELLOW 4
#define LED_GREEN 15
#define CALIBRATION_BUTTON 13 // On simule un bouton physique

MPU6050 mpu;
float refAngle = 0;
float refDistance = 0;
bool isCalibrated = false;

// Time Management (Non-blocking)
unsigned long lastMeasureTime = 0;
const int measureInterval = 200; // 5 measures per second

void setup() {
  Serial.begin(115200); // ESP32 standard speed
  Wire.begin();
  mpu.initialize();
  
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(CALIBRATION_BUTTON, INPUT_PULLUP);

  Serial.println("System Ready. Sit straight and press Calibration Button.");
}

// --- MODULE: SENSOR READING ---
float getDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH);
  return duration * 0.034 / 2;
}

float getPitch() {
  return mpu.getRotationX() / 131.0; // Conversion simple pour la simulation
}

// --- MODULE: CALIBRATION ---
void calibrate() {
  Serial.println("Calibrating...");
  float sumD = 0, sumA = 0;
  for(int i=0; i<10; i++) {
    sumD += getDistance();
    sumA += getPitch();
    delay(50);
  }
  refDistance = sumD / 10.0;
  refAngle = sumA / 10.0;
  isCalibrated = true;
  Serial.println("Calibration Done!");
}

void loop() {
  // Check for Calibration Button (Active Low)
  if (digitalRead(CALIBRATION_BUTTON) == LOW) {
    calibrate();
  }

  if (!isCalibrated) {
    // Blink Yellow while waiting for calibration
    digitalWrite(LED_YELLOW, (millis()/500)%2);
    return;
  }

  // Measure every 200ms
  if (millis() - lastMeasureTime > measureInterval) {
    lastMeasureTime = millis();
    
    float currentDist = getDistance();
    float currentAngle = getPitch();
    float angleDiff = currentAngle - refAngle;

    // --- DECISION LOGIC ---
    // Rule: Alert if too close OR leaning too much forward
    if (currentDist < 25 || angleDiff > 15) {
      digitalWrite(LED_RED, HIGH);
      digitalWrite(LED_GREEN, LOW);
      Serial.println("CRITICAL: Bad Posture!");
    } 
    else if (currentDist < 35 || angleDiff > 8) {
      digitalWrite(LED_RED, LOW);
      digitalWrite(LED_YELLOW, HIGH);
      digitalWrite(LED_GREEN, LOW);
      Serial.println("WARNING: Adjust position.");
    }
    else {
      digitalWrite(LED_RED, LOW);
      digitalWrite(LED_YELLOW, LOW);
      digitalWrite(LED_GREEN, HIGH);
      Serial.println("OK: Good Posture.");
    }
  }
}
