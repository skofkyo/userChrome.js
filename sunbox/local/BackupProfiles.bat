@echo off
taskkill /im firefox.exe
@echo �رջ����������Զ���ʼ���ݡ���
ping -n 3 127.1>nul
::ȡ�õ�ǰ����������·��
cd /d %~dp0
::����Ҫ����Ŀ���·��
set ProfilesPath=..\..\
::���ñ��ݴ�ŵ�·���Լ�ѹ�����ļ�����ͨ��ʹ�õ��ǳ�������ô����%date:~5,2%%date:~8,2%��
set ArchiveName=..\..\..\Profiles_%date:~5,2%%date:~8,2%~sunbox.7z
::����Ҫ������ļ��Լ��ļ��У��������Լ����
7z.exe u -up1q3r2x2y2z2w2 %ArchiveName% "%ProfilesPath%*adblockplus*" "%ProfilesPath%*autoproxy*" "%ProfilesPath%xnotifier*" "%ProfilesPath%chrome" "%ProfilesPath%*extensions*" "%ProfilesPath%*extension-data*" "%ProfilesPath%Plugins" "%ProfilesPath%SimpleProxy" "%ProfilesPath%scriptish_scripts" "%ProfilesPath%gm_scripts" "%ProfilesPath%cert8.db" "%ProfilesPath%cert_override.txt" "%ProfilesPath%firegestures.sqlite" "%ProfilesPath%FlashGot.exe" "%ProfilesPath%localstore.rdf" "%ProfilesPath%places.sqlite" "%ProfilesPath%prefs.js" "%ProfilesPath%user.js" "%ProfilesPath%stylish.sqlite" "%ProfilesPath%xulstore.json" "%ProfilesPath%*search*"
@echo ��������ɣ�



