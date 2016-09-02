@echo off
cd /d %~dp0
set urlC=https://github.com/jiayiming/FireLocalSWF/archive/
set urlP=https://127.0.0.1:1080
wget -N --no-check-certificate -t 3 -e "https_proxy=%urlP%" %urlC%master.zip
7z.exe e master.zip -o..\swf FireLocalSWF-master\swf -aoa
exit