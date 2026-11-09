# Face Feeling Atlas

Build a complete, polished, responsive AI web application for my college final-year project.

PROJECT TITLE:

“Improved Facial Emotion Recognition using Swin Transformer and YOLOv8 in Comparison with CNN”

I want a COMPLETE working application, not a landing page and not a static UI.

The application is an academic prototype/demo for Facial Emotion Recognition.

==================================================

1. CORE PROJECT IDEA

==================================================

The application should demonstrate this workflow:

WEBCAM

↓

VIDEO FRAME CAPTURE

↓

YOLOv8 FACE DETECTION

↓

FACE CROPPING

↓

IMAGE PREPROCESSING

↓

SWIN TRANSFORMER

↓

FEATURE EXTRACTION

↓

EMOTION CLASSIFICATION

↓

EMOTION + CONFIDENCE

↓

EMOTION HISTORY

↓

OPTIONAL ALERT

The UI must make this workflow visually clear.

IMPORTANT:

Do not falsely claim that YOLOv8 or Swin Transformer is actually running if no trained model/inference backend is connected.

Create two modes:

1. DEMO MODE

2. MODEL MODE / READY FOR MODEL INTEGRATION

Demo Mode may use simulated/browser-compatible predictions for presentation purposes, but it MUST clearly display:

“DEMO MODE — Simulated Predictions”

Do not present simulated values as real model accuracy.

==================================================

2. TECHNOLOGY

==================================================

Use:

- React

- TypeScript

- Tailwind CSS

- Modern component architecture

- Lucide icons or another clean icon library

- Browser MediaDevices/WebRTC API for webcam access

- Local state for prototype data

- Responsive design

Do not require a backend just to run the basic demo.

Structure the application so a real Python/FastAPI inference backend can later be connected for:

YOLOv8 face detection

+

Swin Transformer emotion classification

Create a clean service/API abstraction for future model integration.

==================================================

3. APPLICATION NAME

==================================================

Header:

AI Facial Emotion Recognition

Subtitle:

YOLOv8 Face Detection • Swin Transformer • CNN Baseline

Add a small badge:

ACADEMIC PROJECT PROTOTYPE

==================================================

4. MAIN NAVIGATION

==================================================

Create a professional sidebar/navigation with:

Dashboard

Live Analysis

Emotion History

Model Architecture

Workflow

Evaluation Metrics

Applications

Settings

On mobile, convert this into a responsive navigation menu.

==================================================

5. DASHBOARD

==================================================

Create a professional AI dashboard.

Top cards:

System Status

Camera Status

Face Detection

Current Emotion

Example:

System Status:

READY

Camera:

INACTIVE / ACTIVE

Face:

DETECTED / NOT DETECTED

Current Emotion:

NEUTRAL

Do not hardcode fake final results.

==================================================

6. LIVE ANALYSIS PAGE

==================================================

This is the MAIN DEMO SCREEN.

Create a large webcam panel.

Buttons:

START CAMERA

STOP CAMERA

CAPTURE FRAME

ANALYZE

DEMO MODE ON/OFF

When START CAMERA is clicked:

- Ask for browser camera permission.

- Open the user's webcam.

- Show live video.

- Show:

  “Camera Active”

When STOP CAMERA is clicked:

- Stop all webcam tracks.

- Release the camera.

- Show:

  “Camera Stopped”

If permission is denied:

Show:

“Camera permission is required for live facial analysis.”

==================================================

7. CAMERA UI

==================================================

Create a professional camera frame.

Inside the video area:

- Show a face bounding box when a face is available.

- Show corner markers.

- Show scanning animation while analysis is active.

- Show small label:

“YOLOv8 • FACE DETECTION”

If no face:

“No Face Detected”

If multiple faces are detected:

“Multiple Faces Detected”

For DEMO MODE, simulate the bounding box position around the center face area.

Make the simulation visually realistic but clearly label:

DEMO MODE

==================================================

8. FACE DETECTION PANEL

==================================================

Create a card:

FACE DETECTION

Detector:

YOLOv8

Status:

Face Detected

Bounding Box:

x: —

y: —

width: —

height: —

Confidence:

—%

IMPORTANT:

Do not invent an actual YOLOv8 confidence score when using demo mode.

If demo mode:

Display:

“Simulated Detection”

==================================================

9. IMAGE PREPROCESSING

==================================================

Create a processing pipeline card:

1. Face Crop

2. Resize

3. Normalization

4. Input Preparation

Show live processing states:

WAITING

PROCESSING

COMPLETED

Do NOT hardcode 48×48 as the Swin Transformer input.

Add a small note:

“Base-paper CNN input: 48 × 48 × 1 grayscale”

This is only for comparison/reference.

==================================================

10. SWIN TRANSFORMER PANEL

==================================================

Create a model card:

SWIN TRANSFORMER

Purpose:

“Feature extraction and emotion classification”

Show:

Status:

READY

Feature Extraction:

WAITING / ACTIVE / COMPLETE

Use a visual transformer-style representation.

Do not claim that actual Swin inference is running unless a real model API is connected.

If Demo Mode:

Show:

“Demo inference”

==================================================

11. EMOTION CLASSIFICATION

==================================================

Support these seven emotions:

Happy

Sad

Angry

Fear

Surprise

Disgust

Neutral

Create a large result card.

Example:

CURRENT EMOTION

HAPPY

Confidence:

92%

Use an emotion icon.

In demo mode, rotate through realistic emotions periodically.

IMPORTANT:

Confidence is NOT model accuracy.

Clearly label:

“Prediction Confidence”

Do not call this:

“Model Accuracy”

==================================================

12. EMOTION PROBABILITIES

==================================================

Create a beautiful probability panel.

Show:

Happy

Sad

Angry

Fear

Surprise

Disgust

Neutral

Each must have:

- emotion name

- percentage

- progress bar

Values must approximately total 100%.

When demo mode is active, generate plausible simulated probabilities.

Clearly display:

DEMO MODE

Do not imply that these are actual measured results.

==================================================

13. EMOTION HISTORY

==================================================

Create a live history table.

Columns:

Timestamp

Emotion

Confidence

Status

Example structure:

12:45:10

Neutral

86%

Detected

Keep the latest 20 observations.

Allow:

Clear History

Do not use fake history before the user starts the demo.

==================================================

14. EMOTION TIMELINE

==================================================

Create a clean chart/timeline.

X-axis:

Time

Y-axis:

Emotion / confidence

Display emotion transitions such as:

Neutral → Happy → Neutral → Fear

Only display observations generated during the current session.

==================================================

15. ALERT SYSTEM

==================================================

Create an Alert/Monitoring card.

Settings:

Confidence Threshold:

80%

Consecutive Observations:

3

If the same emotion is detected above the threshold for the configured number of consecutive observations, show an alert.

Example:

⚠ Emotion Monitoring Alert

“Fear-like expression detected consistently.”

IMPORTANT:

NEVER display:

“Cheating detected”

“Candidate is cheating”

“Candidate is lying”

Facial emotion alone cannot prove cheating or lying.

The alert must only describe the detected expression.

Examples:

“Fear-like expression detected consistently.”

“Angry expression detected consistently.”

“Sad expression detected consistently.”

Add:

Dismiss Alert

==================================================

16. ONLINE ASSESSMENT DEMO

==================================================

Create an optional page called:

Assessment Monitoring Demo

This is only a conceptual application demonstration.

Display:

Candidate Camera

Current Emotion

Confidence

Emotion Timeline

Monitoring Alerts

Add a prominent disclaimer:

“Facial emotion recognition is an additional observation signal and cannot independently determine cheating, lying, or misconduct.”

==================================================

17. MODEL ARCHITECTURE PAGE

==================================================

Create a professional architecture diagram.

BASE PAPER:

FER Image Dataset

↓

Haar Cascade

↓

CNN

↓

Feature Extraction

↓

Classification

↓

Evaluation

PROPOSED SYSTEM:

Image / Webcam

↓

YOLOv8

↓

Face Detection

↓

Face Crop

↓

Preprocessing

↓

Swin Transformer

↓

Feature Extraction

↓

Emotion Classification

↓

Evaluation

Make the proposed system visually highlighted.

==================================================

18. BASE PAPER COMPARISON

==================================================

Create a comparison table.

BASE PAPER:

Face Detection:

Haar Cascade

Emotion Model:

CNN

Dataset:

FER image dataset

Input:

48 × 48 × 1 grayscale

Evaluation:

Accuracy

Precision

Recall

F1-score

PROPOSED:

Face Detection:

YOLOv8

Emotion Model:

Swin Transformer

Dataset:

FER2013 / selected FER dataset

Evaluation:

Accuracy

Precision

Recall

F1-score

IMPORTANT:

Do not invent numerical performance values.

==================================================

19. WORKFLOW PAGE

==================================================

Create a large interactive workflow.

Step 1:

Webcam Input

Step 2:

Frame Capture

Step 3:

YOLOv8 Face Detection

Step 4:

Face Crop

Step 5:

Image Preprocessing

Step 6:

Swin Transformer

Step 7:

Emotion Classification

Step 8:

Confidence Score

Step 9:

History

Step 10:

Optional Alert

Each step should be clickable.

When clicked, show:

Purpose

Input

Output

==================================================

20. IMAGE PROCESSING PAGE

==================================================

Explain the preprocessing stages:

Noise Reduction

Resize

Grayscale / Color Conversion where required

Normalization

Input Preparation

Create cards explaining:

Noise:

Unwanted variation in image intensity.

Resize:

Converts images to the fixed dimensions required by the selected model.

Normalization:

Scales pixel values to a model-compatible range.

Important:

Do not claim a specific noise filter is implemented unless it actually is.

==================================================

21. EVALUATION METRICS PAGE

==================================================

Create four cards:

Accuracy

Precision

Recall

F1-Score

Definitions:

Accuracy:

Overall proportion of correct predictions.

Precision:

Among predicted positive cases, how many are actually positive.

Recall:

Among actual positive cases, how many are correctly identified.

F1-Score:

Harmonic mean of precision and recall.

Show formulas:

Accuracy = (TP + TN) / (TP + TN + FP + FN)

Precision = TP / (TP + FP)

Recall = TP / (TP + FN)

F1 = 2 × Precision × Recall / (Precision + Recall)

Do not show made-up project results.

Instead show:

“Results will be populated after model evaluation.”

==================================================

22. CONFUSION MATRIX

==================================================

Create a confusion matrix UI for the seven emotions.

Labels:

Happy

Sad

Angry

Fear

Surprise

Disgust

Neutral

For now, show an empty/placeholder matrix:

“Evaluation data required”

Do not fabricate experimental results.

==================================================

23. DATASET PAGE

==================================================

Create a dataset information page.

Show:

FER2013

Image size:

48 × 48

Channels:

Grayscale

Classes:

7

Classes:

Angry

Disgust

Fear

Happy

Sad

Surprise

Neutral

Add note:

“The final dataset configuration and train/test split will be defined during implementation.”

Do not invent a train/test percentage.

==================================================

24. APPLICATIONS PAGE

==================================================

Show cards:

Healthcare Support

Education

Human-Computer Interaction

Online Interview Support

Online Assessment Monitoring Support

Intelligent Interfaces

Each card should have:

Icon

Short description

Add disclaimer:

“Emotion recognition should be treated as an assistive signal and not as definitive evidence of a person's mental state, honesty, or behavior.”

==================================================

25. SETTINGS PAGE

==================================================

Create:

Camera Selection

Confidence Threshold

Consecutive Observation Count

Alert Toggle

Demo Mode Toggle

Default:

Confidence Threshold = 80%

Consecutive Observations = 3

Alert = ON

Demo Mode = ON initially

Allow users to modify settings.

Persist settings using localStorage.

==================================================

26. DEMO MODE

==================================================

This is extremely important.

Create a working DEMO MODE so I can demonstrate the project even if the real trained YOLOv8 and Swin Transformer models are not connected.

When Demo Mode is ON:

- Camera can still be displayed.

- Simulate face detection.

- Simulate emotion probabilities.

- Update emotion every few seconds.

- Update confidence.

- Add observations to history.

- Trigger the configured alert condition.

- Update timeline.

- Show workflow animation.

At the top show a highly visible badge:

“DEMO MODE — SIMULATED AI OUTPUT”

Never hide this.

==================================================

27. REAL MODEL INTEGRATION ARCHITECTURE

==================================================

Create a service abstraction:

emotionService

Functions:

startCamera()

stopCamera()

detectFace()

preprocessFace()

predictEmotion()

getEmotionHistory()

generateAlert()

Prepare the code so later I can connect:

POST /api/detect-face

POST /api/predict-emotion

The frontend should be able to send a captured face image to a backend and receive:

{

  emotion: "Happy",

  confidence: 0.92

}

For face detection:

{

  detected: true,

  confidence: 0.91,

  box: {

    x: 100,

    y: 80,

    width: 220,

    height: 220

  }

}

Do not create a fake backend and call it YOLOv8/Swin inference.

==================================================

28. UI DESIGN

==================================================

Use a premium AI dashboard design.

Style:

- Dark professional dashboard

- Modern cards

- Subtle gradients

- Glass-like panels

- Rounded corners

- Clean typography

- Professional icons

- Smooth transitions

- Responsive layout

- Excellent spacing

Avoid excessive animations.

The application must look suitable for:

- College project review

- Faculty demonstration

- Final project presentation

==================================================

29. LANDING / HOME

==================================================

Home page should show:

Title:

Improved Facial Emotion Recognition

Subtitle:

Using Swin Transformer and YOLOv8 in Comparison with CNN

Short description:

“An AI-based facial emotion recognition system that detects faces and analyses facial expressions using a modern deep-learning pipeline.”

Buttons:

START LIVE ANALYSIS

VIEW WORKFLOW

==================================================

30. FOOTER

==================================================

Show:

“Academic Project Prototype”

“YOLOv8 + Swin Transformer + CNN Baseline”

==================================================

31. PERFORMANCE / UX

==================================================

The app must:

- Load quickly

- Not crash if camera unavailable

- Handle camera permissions

- Handle no-face condition

- Handle multiple-face condition

- Work on desktop and mobile

- Use clean reusable components

- Avoid unnecessary dependencies

- Keep code organized

- Use TypeScript types properly

==================================================

32. IMPORTANT HONESTY RULES

==================================================

Never invent:

- Model accuracy

- Precision

- Recall

- F1-score

- Dataset performance

- YOLOv8 benchmark

- Swin Transformer benchmark

- Webcam specifications

- Experimental results

Do not claim:

“95% accuracy”

unless real evaluation data is supplied.

Do not claim:

“Cheating detected”

from emotion alone.

Do not claim:

“Stress detected with medical certainty.”

Use:

“Fear-like expression detected.”

==================================================

33. FINAL OUTPUT

==================================================

Generate the complete application.

Do not stop after creating the landing page.

Implement every page and feature listed above.

Make all navigation buttons functional.

Make Start Camera and Stop Camera functional.

Make Demo Mode functional.

Make emotion history functional.

Make alerts functional.

Make settings functional.

Make workflow interactive.

Make presentation mode functional.

At the end, provide:

1. Project structure

2. How to run locally

3. How to connect a future YOLOv8 backend

4. How to connect a future Swin Transformer backend

5. Which files contain the model integration service

6. Which files contain webcam handling

7. Which files contain alert logic

Again:

This must be a REAL RUNNABLE WEB APPLICATION PROTOTYPE, not just a visual mockup.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://face-feeling-atlas.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8d034709-4b85-4c6e-95fd-9a6f57530965).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
