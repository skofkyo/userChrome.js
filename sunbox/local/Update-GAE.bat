@Echo Off
Title �Զ������������ά���� Goagent ���¿��� IP ��
cd /d %~dp0
del "goagent\proxy.ini"
wget --ca-certificate=ca-bundle.crt -c http://sunbox.cc/goagentip/proxy.ini
copy /y "%~dp0proxy.ini" goagent\proxy.ini
del "%~dp0proxy.ini"
taskkill /f /t /im goagent.exe
taskkill /f /t /im python27.exe
goagent\startgoa.exe
ECHO.&ECHO.�������,������goagent���,����������˳�! &PAUSE >NUL 2>NUL