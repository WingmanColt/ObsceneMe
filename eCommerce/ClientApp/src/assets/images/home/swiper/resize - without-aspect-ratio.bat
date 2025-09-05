@echo off
setlocal enabledelayedexpansion

rem Define sizes based on device types
set "sizes[mobile]=320x480 480x800 640x1136"
set "sizes[tablet]=768x1024 1024x768 1536x2048"
set "sizes[desktop]=1280x800 1920x1080 2560x1440"

rem Set counter for generated files
set "fileCount=0"

rem Get current directory
set "currentDir=%CD%"

rem Loop through each device type
for %%d in (mobile tablet desktop) do (
  for %%s in (!sizes[%%d]!) do (
    rem Check if the file count has reached 9
    if !fileCount! geq 9 (
      exit /b
    )
    rem Resize WEBP images with strict sizing
    magick convert slide1-default.webp -resize %%s^! -quality 100 "slide1-%%d-%%s.webp"
    set /a "fileCount+=1"
  )
)

rem Pause to keep command prompt open
pause
