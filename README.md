# PostureGuard - IoT Solution for Spinal Health
**Target Project for Kyoto University (iUP) Admission 2026**

## 📌 Project Overview
PostureGuard is an integrated wearable/desk-mounted system designed to prevent musculoskeletal disorders (MSD) by monitoring real-time posture. Using an **ESP32**, an ultrasonic sensor (**HC-SR04**), and an IMU (**MPU-6050**), the device alerts users of poor sitting habits (slouching or leaning too close to the screen).

## 🎯 The "Kyoto Vision"
In Japan, 80% of office workers suffer from chronic back pain. PostureGuard addresses this by providing bio-mechanical feedback based on:
1. **Ocular Distance:** Keeping a safe distance from the monitor.
2. **Spinal Alignment:** Measuring the tilt angle of the back.

## 🛠 Technical Stack
- **Microcontroller:** ESP32 (Dual-core, Wi-Fi/Bluetooth integrated).
- **Sensors:** - HC-SR04 (Distance)
  - MPU-6050 (6-axis Accelerometer/Gyroscope)
- **Signal Processing:** Moving Average Filter (to stabilize sensor noise).
- **Simulation:** [Link to your Wokwi Project here]

## 📈 Current Development Status (March 2026)
- [x] Simulation of individual sensors (HC-SR04, MPU-6050).
- [x] Implementation of a 3-level alert logic (Green/Yellow/Red).
- [x] Outlier filtering algorithm (Software-based).
- [ ] Physical prototype assembly (Hardware Pending).
- [ ] Mobile App integration (MIT App Inventor).

## 📂 Repository Structure
- `/src`: Arduino/C++ source code.
- `/docs`: Schematics, flowcharts, and research log.
- `/media`: Demo videos and screenshots.
