::ԭ����: dupontjoy
::2015.07.05 22:00  ���ɾ����
::2015.06.30 13:00  ����prefs.js
::2015.06.19 16:00  �������
::2015.06.12 20:00  �ȸ��ƺ�ɾ������Ӱ��ԭ�ļ�
::2015.06.08 14:00  ��ӿ�ʼ����ǰ����ʾ
::2015.06.01 20:00  ����ΪProfiles��ɾ��һЩ����Ҫ����Ŀ
::2015.05.27 18:00  ����Autoproxy�����ٱ���Foxy����
::2015.04.16 08:00  ���±�������˵��
::2015.01.26 12:00  �㶨��ʱ������

echo off
Title ����Firefox�����ļ���
ECHO.&ECHO.������ʼProfiles���ô������Ҫ�ر�Firefox�����뱣���Ҫ������! �������������&PAUSE >NUL 2>NUL

rem ���ñ���·���Լ���ʱ�ļ���
taskkill /im firefox.exe
@echo �رջ����������Զ���ʼ���ݡ���
cd /d %~dp0
::������������λ�õ������ļ��У�Profiles����������3��
set BackDir=..\..
set TempFolder=..\..\Temp\Profiles

taskkill /im firefox.exe

rem ����Ŀ���ļ�����ʱ�ļ���

::�������ļ���
xcopy "%BackDir%\autoproxy" %TempFolder%\autoproxy\  /s /y /i
xcopy "%BackDir%\bamboodata" %TempFolder%\bamboodata\  /s /y /i
xcopy "%BackDir%\chrome" %TempFolder%\chrome\  /s /y /i
xcopy "%BackDir%\extensions" %TempFolder%\extensions\ /s /y /i
xcopy "%BackDir%\extension-data" %TempFolder%\extension-data\ /s /y /i
xcopy "%BackDir%\gm_scripts" %TempFolder%\gm_scripts\ /s /y /i
xcopy "%BackDir%\ReadItLater" %TempFolder%\ReadItLater\ /s /y /i
xcopy "%BackDir%\searchplugins" %TempFolder%\searchplugins\ /s /y /i 


::��Ҫɾ������
::del %TempFolder%\extensions\support@lastpass.com\platform\Darwin\  /s /q

::�������ļ�

xcopy "%BackDir%\blocklist.xml" %TempFolder%\ /y
xcopy "%BackDir%\cert_override.txt" %TempFolder%\ /y
xcopy "%BackDir%\cert8.db" %TempFolder%\ /y
xcopy "%BackDir%\extensions.ini" %TempFolder%\ /y
xcopy "%BackDir%\extensions.json" %TempFolder%\ /y
xcopy "%BackDir%\firegestures.sqlite" %TempFolder%\ /y
xcopy "%BackDir%\instantFoxPlugins.js" %TempFolder%\ /y
xcopy "%BackDir%\key3.db" %TempFolder%\ /y
xcopy "%BackDir%\mimeTypes.rdf" %TempFolder%\ /y
xcopy "%BackDir%\localstore.rdf" %TempFolder%\ /y
xcopy "%BackDir%\permissions.sqlite" %TempFolder%\ /y
xcopy "%BackDir%\quicklaunch.sqlite %TempFolder%\ /y
xcopy "%BackDir%\pluginreg.dat" %TempFolder%\ /y
xcopy "%BackDir%\prefs.js" %TempFolder%\ /y
xcopy "%BackDir%\stylish.sqlite" %TempFolder%\ /y
xcopy "%BackDir%\user.js" %TempFolder%\ /y
xcopy "%BackDir%\xulstore.json" %TempFolder%\ /y


::��ȡ�汾�ź����ڼ�ʱ��
::������������λ�õ�Firefox�����ļ��У�firefox����������4��
for /f "usebackq eol=; tokens=1,2 delims==" %%i in ("..\..\..\..\Firefox\application.ini")do (if %%i==Version set ver=%%j)
::���ñ����ļ�·���Լ��ļ���

::�������ں�ʱ��
set tm1=%time:~0,2%
set tm2=%time:~3,2%
set tm3=%time:~6,2%
set tm4=%time:~0,8%
set da1=%date:~0,4%
set da2=%date:~5,2%
set da3=%date:~8,2%
set ArchiveName=C:\Users\Administrator\Desktop\Profiles_%da1%%da2%%da3%-%tm1%%tm2%%tm3%_%ver%.7z

::Сʱ��С��10��ʱ������
set /a tm1=%time:~0,2%*1
if %tm1% LSS 10 set tm1=0%tm1%
set ArchiveName=C:\Users\Administrator\Desktop\Profiles_%da1%%da2%%da3%-%tm1%%tm2%%tm3%_%ver%.7z

rem ��ʼ����
7z.exe u -up1q3r2x2y2z2w2 %ArchiveName% "%TempFolder%"
@echo ������ɣ���ɾ����ʱ�ļ��У�
rd "%TempFolder%" /s/q

ECHO.&ECHO.Firefox�����Ѵ����ɣ��밴����� ����Firefox ���˳���&PAUSE >NUL 2>NUL

@ping 127.0.0.1>nul
@start ..\..\..\..\Firefox\firefox.exe

@exit