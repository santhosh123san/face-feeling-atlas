@echo off
title Face Feeling Atlas - FER Inference Backend
echo ========================================================
echo Starting Face Feeling Atlas FER Backend (YOLOv8 + ViT)...
echo ========================================================
cd /d "%~dp0"
python server.py
pause
