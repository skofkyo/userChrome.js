@Echo Off
cd /d %~dp0
set urlC=https://github.com/jiayiming/FireLocalSWF/archive/
wget.exe -N --no-check-certificate %urlC%master.zip
7z.exe e master.zip -o..\swf FireLocalSWF-master\swf -aoa