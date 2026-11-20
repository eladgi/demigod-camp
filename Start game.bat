@echo off
rem Double-click to play: starts the local game server and opens the camp menu in the browser.
cd /d "%~dp0"
start "" http://localhost:8123/index.html
python tools\serve.py 8123
