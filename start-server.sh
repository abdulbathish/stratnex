#!/bin/bash
# Simple script to start a local development server
echo "Starting local server on http://localhost:8000"
echo "Open your browser and go to: http://localhost:8000/index.html"
echo "Press Ctrl+C to stop the server"
python3 -m http.server 8000

