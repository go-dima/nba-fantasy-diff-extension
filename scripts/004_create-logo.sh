#!/bin/bash
#
# # Create NBA-style logo SVG
# cat > logo.svg << EOF
# <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
#   <rect width="512" height="512" fill="none"/>
#   <circle cx="256" cy="256" r="240" fill="#1d428a"/>
#   <path d="M160 400 C 160 400 200 300 256 256 C 312 212 352 112 352 112 C 352 112 312 212 256 256 C 200 300 160 400 160 400" stroke="white" stroke-width="48" fill="none"/>
# </svg>
# EOF
#
# # First convert SVG to a large PNG using Safari's WebKit
# /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --headless --screenshot --window-size=512,512 --default-background-color=0 file://$(pwd)/logo.svg
#
# # Rename the screenshot
# mv screenshot.png logo.png
#
# # Create icons directory if it doesn't exist
# mkdir -p public/icons
#
# # Use sips to resize
# sips -z 16 16 logo.png --out public/icons/icon16.png
# sips -z 48 48 logo.png --out public/icons/icon48.png
# sips -z 128 128 logo.png --out public/icons/icon128.png
#
# # Clean up
# rm logo.png
#
# echo "Icons generated successfully!"

# Then use rsvg-convert
rsvg-convert -h 16 nba-6.svg > public/icons/icon16.png
rsvg-convert -h 48 nba-6.svg > public/icons/icon48.png
rsvg-convert -h 128 nba-6.svg > public/icons/icon128.png