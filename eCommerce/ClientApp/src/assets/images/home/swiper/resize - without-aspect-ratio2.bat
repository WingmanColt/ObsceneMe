@echo off
setlocal enabledelayedexpansion

rem Define sizes based on device types
set "sizes[mobile]=540x864 720x1152 1080x1728 1296x2074 1728x2765"
set "sizes[desktop]=720x500 1512x1047 1950x1350 2700x1870"

rem Set counter for generated files
set "fileCount=0"

rem Loop through each device type
for %%d in (mobile tablet desktop) do (
  for %%s in (!sizes[%%d]!) do (
    rem Check if the file count has reached 9
    if !fileCount! geq 9 (
      exit /b
    )
    rem Resize WEBP images with strict sizing
    for /F "tokens=1 delims=x" %%w in ("%%s") do (
      magick convert slide1-default.webp -resize %%s^! -quality 100 "slide1_%%d_%%wx.webp"
    )
    set /a "fileCount+=1"
  )
)