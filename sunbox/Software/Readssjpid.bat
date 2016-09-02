@if (0)==(0) echo off
:: 感谢批处理之家跟ezibo的批处理
taskkill /f /im Shadowsocks.exe
type templates\untrusted.ini | cscript //nologo //e:jscript "%~f0" > gui-config.json
start Shadowsocks.exe
exit
@end

var getContent = function(body){
    var ado = new ActiveXObject('ADODB.Stream');
    ado.Type = 1;
    ado.Open();
    ado.Write(body);
    ado.Position = 0;
    ado.Type = 2;
    ado.Charset = 'utf-8';
    var arr = ado.ReadText(-1).replace(/\r?\n/g, '\n').split('\n');
    return arr.slice(230, 234);
}

var http = new ActiveXObject('MSXML2.XMLHTTP');
http.open('GET', 'http://www.ishadowsocks.org/', false);
http.send();

var a = getContent(http.responseBody);
var b = ['"server"', '"server_port"', '"password"', '"method"'];
var s = WSH.StdIn.ReadAll();

for(var i=0; i<b.length; i++){
    a[i] = a[i].split(':')[1].split(/<\/h4>/i)[0];
    s = s.replace(
        new RegExp('^(' + b[i] + ')([^\r\n]*)', 'im'),
        function(s0, s1, s2){
            return s1 + ' : ' + (s2.indexOf('"')>=0 ? '"' + a[i] + '",' : a[i] + ',');
        }
    )
}
WSH.Echo(s)