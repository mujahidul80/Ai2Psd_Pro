/*
  Ai2Psd_Pro.jsx for Adobe Illustrator
  Description: Ultra-fast vector path preparation & export from AI to layered PSD (Blur & Effects Preserved).
  Requirements: Adobe Illustrator CS6 and later
  Edition: Pro Licensed Version (Hardware-Bound + Tamper-Protected + Silent 7-Day Auto Update)
  Author: MI Creative Studio (https://github.com/mujahidul80)
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false);
$.localize = true;

// ==========================================
// GOOGLE SCRIPT & GITHUB CONFIGURATION
// ==========================================
var LICENSE_CFG = {
  currentVersion: '5.3',
  apiUrl: 'https://script.google.com/macros/s/AKfycby9-GyRG5SWyUvoUHuEhtX_DY0n8KjEH_M8TYMAF3eCYpRnED9mJXNyE5hrIZ-FwCQr/exec',
  versionUrl: 'https://raw.githubusercontent.com/mujahidul80/Ai2Psd_Pro/main/version.json',
  installCmd: 'powershell -NoProfile -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/mujahidul80/Ai2Psd_Pro/main/install.ps1 | iex"',
  profileUrl: 'https://github.com/mujahidul80',
  repoUrl: 'https://github.com/mujahidul80/Ai2Psd_Pro',
  licFile: Folder.myDocuments + '/Adobe Scripts/.ai2psd_pro_sys.dat',
  updFile: Folder.myDocuments + '/Adobe Scripts/.ai2psd_pro_upd.dat',
  checkIntervalDays: 7,
  offlineGraceDays: 3
};

/**
 * Illustrator উইন্ডো যেন মিনিমাইজ বা ব্যাকগ্রাউন্ডে চলে না যায় তার জন্য ফোকাস রিস্টোর
 */
function keepIllustratorFocused() {
  try {
    app.activate();
  } catch (e) { }
}

/**
 * কাস্টম ভেক্টর মনোগ্রাম লোগো ড্রয়িং (MI - Brand Emblem)
 */
function drawBrandLogo(container, size) {
  var logoBox = container.add('group');
  logoBox.preferredSize = [size, size];

  logoBox.onDraw = function () {
    var g = this.graphics;
    var w = this.size[0];
    var h = this.size[1];

    var bgBrush = g.newBrush(g.BrushType.SOLID_COLOR, [0.11, 0.42, 0.88, 1]);
    var borderPen = g.newPen(g.PenType.SOLID_COLOR, [0.35, 0.68, 1.0, 1], 1.5);
    var accentBrush = g.newBrush(g.BrushType.SOLID_COLOR, [0.0, 0.85, 0.72, 1]);
    var whitePen = g.newPen(g.PenType.SOLID_COLOR, [1, 1, 1, 1], 2.2);

    g.newPath();
    g.rectPath(1, 1, w - 2, h - 2);
    g.fillPath(bgBrush);
    g.strokePath(borderPen);

    var pad = w * 0.24;
    var topY = h * 0.30;
    var botY = h * 0.72;
    var midX = w * 0.45;
    var midY = h * 0.52;
    var rightM = w * 0.66;

    g.newPath();
    g.moveTo(pad, botY);
    g.lineTo(pad, topY);
    g.lineTo(midX, midY);
    g.lineTo(rightM, topY);
    g.lineTo(rightM, botY);
    g.strokePath(whitePen);

    var iX = w * 0.77;
    g.newPath();
    g.moveTo(iX, topY + (h * 0.12));
    g.lineTo(iX, botY);
    g.strokePath(whitePen);

    g.newPath();
    g.ellipsePath(iX - 2.2, topY - 1, 4.4, 4.4);
    g.fillPath(accentBrush);
  };

  return logoBox;
}

/**
 * ইন্টারঅ্যাক্টিভ টেক্সট লিংক স্টাইলিং
 */
function setupActionLink(textCtrl, onClickFn, isSubtle) {
  var isDarkUI = app.preferences.getRealPreference('uiBrightness') <= 0.5;
  var gfx = textCtrl.graphics;
  var colNormal, colHover;

  if (isSubtle) {
    colNormal = gfx.newPen(gfx.PenType.SOLID_COLOR, isDarkUI ? [0.52, 0.57, 0.64] : [0.45, 0.48, 0.54], 1);
    colHover = gfx.newPen(gfx.PenType.SOLID_COLOR, isDarkUI ? [0.30, 0.72, 0.96] : [0.08, 0.45, 0.90], 1);
  } else {
    colNormal = gfx.newPen(gfx.PenType.SOLID_COLOR, isDarkUI ? [0.25, 0.78, 0.96] : [0.06, 0.44, 0.88], 1);
    colHover = gfx.newPen(gfx.PenType.SOLID_COLOR, isDarkUI ? [0.45, 0.92, 0.82] : [0.02, 0.30, 0.68], 1);
  }

  gfx.foregroundColor = colNormal;

  textCtrl.addEventListener('mouseover', function () {
    gfx.foregroundColor = colHover;
    textCtrl.notify('onDraw');
  });

  textCtrl.addEventListener('mouseout', function () {
    gfx.foregroundColor = colNormal;
    textCtrl.notify('onDraw');
  });

  textCtrl.addEventListener('mousedown', function () {
    if (typeof onClickFn === 'function') onClickFn();
  });
}

/**
 * যেকোনো URL থেকে ফাস্ট GET রিকোয়েস্ট পাঠিয়ে টেক্সট আনা
 */
function fetchUrlContent(targetUrl) {
  var isMac = /mac/i.test($.os);
  var uid = new Date().getTime() + '_' + Math.floor(Math.random() * 1000);
  var outFile = new File(Folder.temp + '/ai2psd_res_' + uid + '.txt');
  var doneFile = new File(Folder.temp + '/ai2psd_done_' + uid + '.flag');
  if (outFile.exists) outFile.remove();
  if (doneFile.exists) doneFile.remove();

  if (isMac) {
    var shFile = new File(Folder.temp + '/ai2psd_req_' + uid + '.sh');
    shFile.open('w');
    shFile.writeln('#!/bin/bash');
    shFile.writeln('curl -s -L --connect-timeout 4 --max-time 6 "' + targetUrl + '" -o "' + outFile.fsName + '"');
    shFile.writeln('echo "done" > "' + doneFile.fsName + '"');
    shFile.close();
    shFile.execute();

    for (var m = 0; m < 60; m++) {
      $.sleep(100);
      if (doneFile.exists) break;
    }
    if (shFile.exists) shFile.remove();
    if (doneFile.exists) doneFile.remove();
  } else {
    var vbsFile = new File(Folder.temp + '/ai2psd_req_' + uid + '.vbs');
    vbsFile.open('w');
    vbsFile.writeln('On Error Resume Next');
    vbsFile.writeln('Set http = CreateObject("WinHttp.WinHttpRequest.5.1")');
    vbsFile.writeln('http.SetTimeouts 3000, 3000, 5000, 5000');
    vbsFile.writeln('http.Open "GET", "' + targetUrl.replace(/"/g, '""') + '", False');
    vbsFile.writeln('http.Send');
    vbsFile.writeln('Set fso = CreateObject("Scripting.FileSystemObject")');
    vbsFile.writeln('Set f = fso.CreateTextFile("' + outFile.fsName.replace(/\\/g, '\\\\') + '", True, True)');
    vbsFile.writeln('If Err.Number = 0 And http.Status = 200 Then');
    vbsFile.writeln('  f.Write http.responseText');
    vbsFile.writeln('End If');
    vbsFile.writeln('f.Close');
    vbsFile.writeln('Set flag = fso.CreateTextFile("' + doneFile.fsName.replace(/\\/g, '\\\\') + '", True)');
    vbsFile.writeln('flag.Write "1"');
    vbsFile.writeln('flag.Close');
    vbsFile.close();

    var batFile = new File(Folder.temp + '/ai2psd_req_' + uid + '.bat');
    batFile.open('w');
    batFile.writeln('@echo off');
    batFile.writeln('cscript //nologo "' + vbsFile.fsName + '" >nul 2>&1');
    batFile.close();
    batFile.execute();

    for (var w = 0; w < 50; w++) {
      $.sleep(100);
      if (doneFile.exists) break;
    }
    if (batFile.exists) batFile.remove();
    if (vbsFile.exists) vbsFile.remove();
    if (doneFile.exists) doneFile.remove();
    keepIllustratorFocused();
  }

  var content = '';
  if (outFile.exists) {
    try {
      outFile.encoding = isMac ? 'UTF-8' : 'UTF-16';
      outFile.open('r');
      content = outFile.read().replace(/^\uFEFF/, '').replace(/^\s+|\s+$/g, '');
      outFile.close();
      outFile.remove();
    } catch (e) { }
  }
  return content;
}

/**
 * ক্লিপবোর্ডে টেক্সট কপি করা
 */
function copyToClipboard(textStr) {
  var isMac = /mac/i.test($.os);
  try {
    if (isMac) {
      var sh = new File(Folder.temp + '/ai2psd_clip.sh');
      sh.open('w');
      sh.writeln('#!/bin/bash');
      sh.writeln('printf %s "' + textStr.replace(/"/g, '\"') + '" | pbcopy');
      sh.close();
      sh.execute();
      $.sleep(150);
      if (sh.exists) sh.remove();
    } else {
      var txtFile = new File(Folder.temp + '/ai2psd_clip.txt');
      txtFile.encoding = 'UTF-8';
      txtFile.open('w');
      txtFile.write(textStr);
      txtFile.close();

      var bat = new File(Folder.temp + '/ai2psd_clip.bat');
      bat.open('w');
      bat.writeln('@echo off');
      bat.writeln('chcp 65001 >nul');
      bat.writeln('clip < "' + txtFile.fsName + '"');
      bat.close();
      bat.execute();
      $.sleep(150);
      if (bat.exists) bat.remove();
      if (txtFile.exists) txtFile.remove();
      keepIllustratorFocused();
    }
  } catch (e) { }
}

/**
 * ভার্সন তুলনা ফাংশন (যেমন "5.3" > "5.2")
 */
function isNewerVersion(remoteVer, localVer) {
  var rParts = remoteVer.replace(/[^\d.]/g, '').split('.');
  var lParts = localVer.replace(/[^\d.]/g, '').split('.');
  var len = Math.max(rParts.length, lParts.length);
  for (var i = 0; i < len; i++) {
    var r = parseInt(rParts[i] || '0', 10);
    var l = parseInt(lParts[i] || '0', 10);
    if (r > l) return true;
    if (r < l) return false;
  }
  return false;
}

/**
 * ব্যাকগ্রাউন্ডে নীরবে আপডেট চেক (প্রতি ৭ দিন পর পর)
 */
function checkSoftwareUpdateSilent() {
  var now = new Date().getTime();
  var checkIntervalMs = LICENSE_CFG.checkIntervalDays * 24 * 60 * 60 * 1000;
  var uf = new File(LICENSE_CFG.updFile);

  if (uf.exists) {
    try {
      uf.open('r');
      var lastUpdCheck = parseFloat(uf.read().replace(/^\s+|\s+$/g, ''));
      uf.close();
      if (!isNaN(lastUpdCheck) && (now - lastUpdCheck) < checkIntervalMs) {
        return; // ৭ দিন পূর্ণ না হলে কিছুই করবে না
      }
    } catch (e) { }
  }

  var rawJson = fetchUrlContent(LICENSE_CFG.versionUrl + '?t=' + now);

  try {
    var dir = Folder(Folder.myDocuments + '/Adobe Scripts/');
    if (!dir.exists) dir.create();
    uf.open('w');
    uf.write(now.toString());
    uf.close();
  } catch (e) { }

  if (!rawJson) return;

  try {
    var info = new Function('return (' + rawJson + ')')();
    if (info && info.version && isNewerVersion(info.version, LICENSE_CFG.currentVersion)) {
      showUpdateDialog(info.version, info.notes || 'Performance improvements & new features.');
    }
  } catch (e) { }
}

/**
 * নতুন আপডেট পাওয়া গেলে পপ-আপ দেখাবে এবং GitHub-এ নিয়ে যাবে
 */
function showUpdateDialog(newVer, notes) {
  keepIllustratorFocused();
  var isDarkUI = app.preferences.getRealPreference('uiBrightness') <= 0.5;
  var uDlg = new Window('dialog', 'Ai2Psd_Pro — Update Available');
  uDlg.orientation = 'column';
  uDlg.alignChildren = ['fill', 'top'];
  uDlg.spacing = 12;
  uDlg.margins = [18, 18, 18, 14];

  var head = uDlg.add('group');
  head.orientation = 'row';
  head.alignChildren = ['left', 'center'];
  head.spacing = 12;

  drawBrandLogo(head, 38);

  var tCol = head.add('group');
  tCol.orientation = 'column';
  tCol.alignChildren = ['left', 'center'];
  tCol.spacing = 2;

  var title = tCol.add('statictext', undefined, 'New Update Available: v' + newVer);
  title.graphics.font = ScriptUI.newFont(title.graphics.font.name, 'BOLD', 14);

  var sub = tCol.add('statictext', undefined, 'Installed Version: v' + LICENSE_CFG.currentVersion);
  sub.graphics.font = ScriptUI.newFont(sub.graphics.font.name, 'REGULAR', 9);
  sub.graphics.foregroundColor = sub.graphics.newPen(sub.graphics.PenType.SOLID_COLOR, isDarkUI ? [0.55, 0.65, 0.78] : [0.40, 0.45, 0.52], 1);

  var pnl = uDlg.add('panel', undefined, 'Update Details');
  pnl.orientation = 'column';
  pnl.alignChildren = ['fill', 'top'];
  pnl.margins = [14, 16, 14, 14];
  pnl.spacing = 8;

  var noteTxt = pnl.add('statictext', undefined, 'What\'s New: ' + notes + '\n\nRun this 1-click command in CMD/PowerShell to replace old files automatically:', { multiline: true });
  noteTxt.preferredSize.width = 330;

  var cmdBox = pnl.add('edittext', undefined, LICENSE_CFG.installCmd, { readonly: true });
  cmdBox.preferredSize = [330, 26];

  var btnGrp = uDlg.add('group');
  btnGrp.orientation = 'row';
  btnGrp.alignChildren = ['fill', 'center'];
  btnGrp.spacing = 8;

  var laterBtn = btnGrp.add('button', undefined, 'Later', { name: 'cancel' });
  var goGitBtn = btnGrp.add('button', undefined, 'Copy CMD & Open GitHub \u2197', { name: 'ok' });
  laterBtn.preferredSize.height = 28;
  goGitBtn.preferredSize.height = 28;

  goGitBtn.onClick = function () {
    copyToClipboard(LICENSE_CFG.installCmd);
    openURL(LICENSE_CFG.repoUrl);
    uDlg.close();
  };

  laterBtn.onClick = function () {
    uDlg.close();
    keepIllustratorFocused();
  };

  uDlg.show();
}

/**
 * পিসির ইউনিক হার্ডওয়্যার আইডি (HWID) বের করা
 */
function getMachineHWID(savedData) {
  if (savedData && savedData.hwid && savedData.hwid.length >= 10 && savedData.hwid.indexOf('-') !== -1) {
    if (savedData.hwid.length === 36) return savedData.hwid;
  }

  var isMac = /mac/i.test($.os);
  var outFile = new File(Folder.temp + '/ai2psd_pro_hwid.txt');
  if (outFile.exists) outFile.remove();

  if (isMac) {
    var shFile = new File(Folder.temp + '/ai2psd_pro_hwid.sh');
    shFile.open('w');
    shFile.writeln('#!/bin/bash');
    shFile.writeln("ioreg -rd1 -c IOPlatformExpertDevice | awk '/IOPlatformUUID/ { split($0, line, \"\\\"\"); printf(\"%s\", line[4]); }' > \"" + outFile.fsName + "\"");
    shFile.close();
    shFile.execute();
    for (var m = 0; m < 25; m++) {
      $.sleep(80);
      if (outFile.exists && outFile.length > 0) break;
    }
    if (shFile.exists) shFile.remove();
  } else {
    var vbsFile = new File(Folder.temp + '/ai2psd_pro_hwid.vbs');
    vbsFile.open('w');
    vbsFile.writeln('On Error Resume Next');
    vbsFile.writeln('Set objWMIService = GetObject("winmgmts:\\\\.\\root\\cimv2")');
    vbsFile.writeln('Set colItems = objWMIService.ExecQuery("Select UUID from Win32_ComputerSystemProduct")');
    vbsFile.writeln('For Each objItem in colItems');
    vbsFile.writeln('  uuid = objItem.UUID');
    vbsFile.writeln('Next');
    vbsFile.writeln('Set fso = CreateObject("Scripting.FileSystemObject")');
    vbsFile.writeln('Set f = fso.CreateTextFile("' + outFile.fsName.replace(/\\/g, '\\\\') + '", True)');
    vbsFile.writeln('f.Write uuid');
    vbsFile.writeln('f.Close');
    vbsFile.close();

    var batFile = new File(Folder.temp + '/ai2psd_pro_hwid.bat');
    batFile.open('w');
    batFile.writeln('@echo off');
    batFile.writeln('cscript //nologo "' + vbsFile.fsName + '" >nul 2>&1');
    batFile.close();
    batFile.execute();

    for (var i = 0; i < 35; i++) {
      $.sleep(80);
      if (outFile.exists && outFile.length > 0) break;
    }
    if (batFile.exists) batFile.remove();
    if (vbsFile.exists) vbsFile.remove();
    keepIllustratorFocused();
  }

  var hwid = '';
  if (outFile.exists) {
    try {
      outFile.open('r');
      hwid = outFile.read().replace(/^\uFEFF/, '').replace(/^\s+|\s+$/g, '');
      outFile.close();
      outFile.remove();
    } catch (e) { }
  }

  if (!hwid || hwid.length < 5) {
    if (savedData && savedData.hwid) return savedData.hwid;
    var comp = $.getenv('COMPUTERNAME') || $.getenv('HOSTNAME') || 'PC';
    var usr = $.getenv('USERNAME') || $.getenv('USER') || 'USER';
    hwid = comp + '-' + usr;
  }
  return hwid;
}

/**
 * লাইসেন্স টেম্পার-প্রুফ সিগনেচার জেনারেটর ও এনকোডার
 */
function computeLicenseSig(key, ts, hwid) {
  var raw = 'MI_PRO_SALT_9921|' + key + '|' + ts + '|' + hwid;
  var hash = 5381;
  for (var i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash) + raw.charCodeAt(i);
    hash = hash & 0x7FFFFFFF;
  }
  return hash.toString(16).toUpperCase();
}

function encodePayload(str) {
  var out = [];
  for (var i = 0; i < str.length; i++) {
    var code = str.charCodeAt(i) ^ ((i % 13) + 42);
    var hex = code.toString(16);
    out.push(hex.length === 1 ? '0' + hex : hex);
  }
  return out.join('');
}

function decodePayload(hexStr) {
  var out = '';
  for (var i = 0; i < hexStr.length; i += 2) {
    var idx = i / 2;
    var code = parseInt(hexStr.substr(i, 2), 16) ^ ((idx % 13) + 42);
    out += String.fromCharCode(code);
  }
  return out;
}

function setFileProtection(fileObj, lock) {
  var isMac = /mac/i.test($.os);
  if (isMac) {
    fileObj.readonly = lock;
  } else {
    var bat = new File(Folder.temp + '/ai2psd_attr.bat');
    bat.open('w');
    if (lock) {
      bat.writeln('@echo off');
      bat.writeln('attrib +r +h "' + fileObj.fsName + '"');
    } else {
      bat.writeln('@echo off');
      bat.writeln('attrib -r -h "' + fileObj.fsName + '"');
    }
    bat.close();
    bat.execute();
    $.sleep(120);
    if (bat.exists) bat.remove();
    keepIllustratorFocused();
  }
}

function readLicenseData() {
  var f = new File(LICENSE_CFG.licFile);
  var oldLic = new File(Folder.myDocuments + '/Adobe Scripts/Ai2Psd_Pro_lic.json');
  var olderLic = new File(Folder.myDocuments + '/Adobe Scripts/Ai2Psd_pro.json');

  if (f.exists) {
    try {
      f.encoding = 'UTF-8';
      f.open('r');
      var hexStr = f.read().replace(/^\s+|\s+$/g, '');
      f.close();
      var jsonStr = decodePayload(hexStr);
      var obj = new Function('return (' + jsonStr + ')')();
      if (obj && obj.key && obj.lastCheck && obj.sig) {
        var expectedSig = computeLicenseSig(obj.key, obj.lastCheck, obj.hwid || '');
        if (obj.sig === expectedSig) {
          return obj;
        }
      }
    } catch (e) { }
  }

  // Auto-migration from plaintext JSON licenses
  var cand = oldLic.exists ? oldLic : (olderLic.exists ? olderLic : null);
  if (cand && cand.exists) {
    try {
      cand.encoding = 'UTF-8';
      cand.open('r');
      var content = cand.read().replace(/^\s+|\s+$/g, '');
      cand.close();
      var oldObj = new Function('return (' + content + ')')();
      if (oldObj && oldObj.key) {
        var currentHwid = getMachineHWID(null);
        var now = new Date().getTime();
        saveLicenseData(oldObj.key, oldObj.lastCheck || now, currentHwid);
        return {
          key: oldObj.key,
          lastCheck: (oldObj.lastCheck || now).toString(),
          hwid: currentHwid,
          sig: computeLicenseSig(oldObj.key, (oldObj.lastCheck || now).toString(), currentHwid)
        };
      }
    } catch (e) { }
  }

  return null;
}

function saveLicenseData(key, timestamp, hwid) {
  var dir = Folder(Folder.myDocuments + '/Adobe Scripts/');
  if (!dir.exists) dir.create();
  var f = new File(LICENSE_CFG.licFile);
  if (f.exists) {
    setFileProtection(f, false);
  }

  var tsStr = timestamp.toString();
  var sig = computeLicenseSig(key, tsStr, hwid);
  var jsonStr = stringify({
    key: key,
    lastCheck: tsStr,
    hwid: hwid,
    sig: sig
  });

  f.encoding = 'UTF-8';
  f.open('w');
  f.write(encodePayload(jsonStr));
  f.close();

  setFileProtection(f, true);
}

function removeLicenseData() {
  var f = new File(LICENSE_CFG.licFile);
  if (f.exists) {
    setFileProtection(f, false);
    try { f.remove(); } catch (e) { }
  }
}

/**
 * সেলফ-রেজিস্ট্রেশন ডায়ালগ
 */
function showRegistrationDialog() {
  keepIllustratorFocused();
  var isMac = /mac/i.test($.os);
  var isDarkUI = app.preferences.getRealPreference('uiBrightness') <= 0.5;
  var regName = null;

  var regDlg = new Window('dialog', 'Ai2Psd_Pro — License Registration');
  regDlg.orientation = 'column';
  regDlg.alignChildren = ['fill', 'top'];
  regDlg.spacing = 12;
  regDlg.margins = [18, 18, 18, 14];

  var headerGrp = regDlg.add('group');
  headerGrp.orientation = 'row';
  headerGrp.alignChildren = ['fill', 'center'];
  headerGrp.spacing = 10;

  var leftHead = headerGrp.add('group');
  leftHead.orientation = 'row';
  leftHead.alignChildren = ['left', 'center'];
  leftHead.spacing = 10;

  drawBrandLogo(leftHead, 38);

  var titleCol = leftHead.add('group');
  titleCol.orientation = 'column';
  titleCol.alignChildren = ['left', 'center'];
  titleCol.spacing = 2;

  var appTitle = titleCol.add('statictext', undefined, 'Workstation Registration');
  appTitle.graphics.font = ScriptUI.newFont(appTitle.graphics.font.name, 'BOLD', 13.5);

  var appSub = titleCol.add('statictext', undefined, 'PRO EDITION ACTIVATION');
  appSub.graphics.font = ScriptUI.newFont(appSub.graphics.font.name, 'REGULAR', 8.5);
  appSub.graphics.foregroundColor = appSub.graphics.newPen(appSub.graphics.PenType.SOLID_COLOR, isDarkUI ? [0.55, 0.65, 0.78] : [0.40, 0.45, 0.52], 1);

  var supBtn = headerGrp.add('button', undefined, 'GitHub');
  supBtn.preferredSize = [56, 20];
  supBtn.graphics.font = ScriptUI.newFont(supBtn.graphics.font.name, 'REGULAR', 9);
  supBtn.onClick = function () { openURL(LICENSE_CFG.repoUrl); };

  var regPnl = regDlg.add('panel', undefined, 'Workstation Details');
  regPnl.orientation = 'column';
  regPnl.alignChildren = ['fill', 'top'];
  regPnl.margins = [14, 18, 14, 14];
  regPnl.spacing = 10;

  var descTxt = regPnl.add('statictext', undefined, 'Enter your full name below to generate a permanent Pro license key bound to this workstation:', { multiline: true });
  descTxt.preferredSize.width = 310;

  var nameGrp = regPnl.add('group');
  nameGrp.orientation = 'column';
  nameGrp.alignChildren = ['fill', 'top'];
  nameGrp.spacing = 4;

  var nameLbl = nameGrp.add('statictext', undefined, 'YOUR FULL NAME');
  nameLbl.graphics.font = ScriptUI.newFont(nameLbl.graphics.font.name, 'BOLD', 9);

  var nameInp = nameGrp.add('edittext', undefined, '');
  nameInp.preferredSize = [310, 28];
  nameInp.active = true;

  var hintTxt = regPnl.add('statictext', undefined, '\u2713 Instant Pro Activation  |  1 License per Workstation');
  hintTxt.graphics.font = ScriptUI.newFont(hintTxt.graphics.font.name, 'ITALIC', 9.5);
  hintTxt.graphics.foregroundColor = hintTxt.graphics.newPen(hintTxt.graphics.PenType.SOLID_COLOR, isDarkUI ? [0.55, 0.60, 0.68] : [0.45, 0.48, 0.54], 1);

  var btnGrp = regDlg.add('group');
  btnGrp.orientation = 'row';
  btnGrp.alignChildren = ['fill', 'center'];
  btnGrp.spacing = 8;

  var backBtn, genBtn;
  if (isMac) {
    backBtn = btnGrp.add('button', undefined, 'Back', { name: 'cancel' });
    genBtn = btnGrp.add('button', undefined, 'Generate & Activate', { name: 'ok' });
  } else {
    genBtn = btnGrp.add('button', undefined, 'Generate & Activate', { name: 'ok' });
    backBtn = btnGrp.add('button', undefined, 'Back', { name: 'cancel' });
  }
  genBtn.preferredSize.height = 28;
  backBtn.preferredSize.height = 28;

  var footGrp = regDlg.add('group');
  footGrp.orientation = 'row';
  footGrp.alignChildren = ['fill', 'center'];

  var brandTag = footGrp.add('statictext', undefined, 'MI Creative Studio');
  brandTag.justify = 'left';
  brandTag.graphics.font = ScriptUI.newFont(brandTag.graphics.font.name, 'BOLD', 9.5);
  setupActionLink(brandTag, function () { openURL(LICENSE_CFG.profileUrl); }, true);

  var supLink = footGrp.add('statictext', undefined, 'Download / Updates');
  supLink.justify = 'right';
  supLink.graphics.font = ScriptUI.newFont(supLink.graphics.font.name, 'REGULAR', 9);
  setupActionLink(supLink, function () { openURL(LICENSE_CFG.repoUrl); }, true);

  genBtn.onClick = function () {
    var val = nameInp.text.replace(/^\s+|\s+$/g, '');
    if (val.length < 2) {
      alert('Please enter your valid name (at least 2 characters).', 'Ai2Psd_Pro');
      return;
    }
    genBtn.text = 'Activating...';
    genBtn.enabled = false;
    regDlg.update();
    regName = val;
    regDlg.close();
  };

  backBtn.onClick = function () {
    regName = null;
    regDlg.close();
  };

  regDlg.show();
  keepIllustratorFocused();
  return regName;
}

/**
 * প্রফেশনাল অ্যাক্টিভেশন ডায়ালগ
 */
function showActivationDialog(statusMsg, isError, hwid) {
  keepIllustratorFocused();
  var isMac = /mac/i.test($.os);
  var isDarkUI = app.preferences.getRealPreference('uiBrightness') <= 0.5;
  var actionResult = null;
  var currentHwid = hwid || getMachineHWID(null);

  var dlg = new Window('dialog', 'Ai2Psd_Pro — Pro License Activation');
  dlg.orientation = 'column';
  dlg.alignChildren = ['fill', 'top'];
  dlg.spacing = 12;
  dlg.margins = [18, 18, 18, 14];

  var headerGrp = dlg.add('group');
  headerGrp.orientation = 'row';
  headerGrp.alignChildren = ['fill', 'center'];
  headerGrp.spacing = 10;

  var leftHead = headerGrp.add('group');
  leftHead.orientation = 'row';
  leftHead.alignChildren = ['left', 'center'];
  leftHead.spacing = 12;

  drawBrandLogo(leftHead, 42);

  var titleCol = leftHead.add('group');
  titleCol.orientation = 'column';
  titleCol.alignChildren = ['left', 'center'];
  titleCol.spacing = 2;

  var appTitle = titleCol.add('statictext', undefined, 'Ai2Psd_Pro');
  appTitle.graphics.font = ScriptUI.newFont(appTitle.graphics.font.name, 'BOLD', 16);

  var appSub = titleCol.add('statictext', undefined, 'PRO HARDWARE-BOUND ENGINE');
  appSub.graphics.font = ScriptUI.newFont(appSub.graphics.font.name, 'REGULAR', 8.5);
  appSub.graphics.foregroundColor = appSub.graphics.newPen(appSub.graphics.PenType.SOLID_COLOR, isDarkUI ? [0.55, 0.65, 0.78] : [0.40, 0.45, 0.52], 1);

  var supBtn = headerGrp.add('button', undefined, 'Support');
  supBtn.preferredSize = [56, 20];
  supBtn.graphics.font = ScriptUI.newFont(supBtn.graphics.font.name, 'REGULAR', 9);
  supBtn.onClick = function () { openURL(LICENSE_CFG.repoUrl); };

  var cardPnl = dlg.add('panel', undefined, 'Workstation License Binding');
  cardPnl.orientation = 'column';
  cardPnl.alignChildren = ['fill', 'top'];
  cardPnl.margins = [14, 16, 14, 14];
  cardPnl.spacing = 10;

  var msgTxt = cardPnl.add('statictext', undefined, statusMsg || 'License is bound directly to your PC Hardware ID. Enter your Pro License Key below to unlock:', { multiline: true });
  msgTxt.preferredSize.width = 330;
  if (isError) {
    msgTxt.graphics.foregroundColor = msgTxt.graphics.newPen(msgTxt.graphics.PenType.SOLID_COLOR, isDarkUI ? [1.0, 0.45, 0.45] : [0.80, 0.12, 0.12], 1);
  }

  // PC ID Display Row
  var hwidGrp = cardPnl.add('group');
  hwidGrp.orientation = 'column';
  hwidGrp.alignChildren = ['fill', 'top'];
  hwidGrp.spacing = 4;

  var hwidLbl = hwidGrp.add('statictext', undefined, 'YOUR PC HARDWARE ID (DEVICE BOUND):');
  hwidLbl.graphics.font = ScriptUI.newFont(hwidLbl.graphics.font.name, 'BOLD', 9);

  var hwidRow = hwidGrp.add('group');
  hwidRow.orientation = 'row';
  hwidRow.alignChildren = ['fill', 'center'];
  hwidRow.spacing = 6;

  var hwidBox = hwidRow.add('edittext', undefined, currentHwid, { readonly: true });
  hwidBox.preferredSize = [250, 26];

  var copyIdBtn = hwidRow.add('button', undefined, 'Copy ID');
  copyIdBtn.preferredSize = [70, 26];
  copyIdBtn.onClick = function() {
    copyToClipboard(currentHwid);
    alert('PC Hardware ID copied to clipboard!\n\n' + currentHwid, 'Ai2Psd_Pro');
  };

  // License Key Row
  var inputBoxGrp = cardPnl.add('group');
  inputBoxGrp.orientation = 'column';
  inputBoxGrp.alignChildren = ['fill', 'top'];
  inputBoxGrp.spacing = 4;

  var keyLbl = inputBoxGrp.add('statictext', undefined, 'PRO LICENSE KEY:');
  keyLbl.graphics.font = ScriptUI.newFont(keyLbl.graphics.font.name, 'BOLD', 9);

  var keyInp = inputBoxGrp.add('edittext', undefined, '');
  keyInp.preferredSize = [330, 28];
  keyInp.active = true;

  var infoRow = cardPnl.add('group');
  infoRow.orientation = 'row';
  infoRow.alignChildren = ['fill', 'center'];

  var shieldTxt = infoRow.add('statictext', undefined, '\u25CF Bound to this PC ID only  |  No personal name required');
  shieldTxt.graphics.font = ScriptUI.newFont(shieldTxt.graphics.font.name, 'ITALIC', 9.5);
  shieldTxt.graphics.foregroundColor = shieldTxt.graphics.newPen(shieldTxt.graphics.PenType.SOLID_COLOR, isDarkUI ? [0.55, 0.60, 0.68] : [0.45, 0.48, 0.54], 1);

  var btnGrp = dlg.add('group');
  btnGrp.orientation = 'row';
  btnGrp.alignChildren = ['fill', 'center'];
  btnGrp.spacing = 8;

  var cancelBtn, actBtn;
  if (isMac) {
    cancelBtn = btnGrp.add('button', undefined, 'Exit', { name: 'cancel' });
    actBtn = btnGrp.add('button', undefined, 'Activate License', { name: 'ok' });
  } else {
    actBtn = btnGrp.add('button', undefined, 'Activate License', { name: 'ok' });
    cancelBtn = btnGrp.add('button', undefined, 'Exit', { name: 'cancel' });
  }
  actBtn.preferredSize.height = 28;
  cancelBtn.preferredSize.height = 28;

  var footGrp = dlg.add('group');
  footGrp.orientation = 'row';
  footGrp.alignChildren = ['fill', 'center'];

  var brandTag = footGrp.add('statictext', undefined, 'GitHub: mujahidul80');
  brandTag.justify = 'left';
  brandTag.graphics.font = ScriptUI.newFont(brandTag.graphics.font.name, 'BOLD', 9.5);
  setupActionLink(brandTag, function () { openURL(LICENSE_CFG.profileUrl); }, true);

  var getLicLink = footGrp.add('statictext', undefined, 'Copy PC ID for Key \u2726');
  getLicLink.justify = 'right';
  getLicLink.graphics.font = ScriptUI.newFont(getLicLink.graphics.font.name, 'BOLD', 9.5);
  setupActionLink(getLicLink, function() {
    copyToClipboard(currentHwid);
    alert('PC ID copied to clipboard! Send this ID to get your key:\n\n' + currentHwid, 'Ai2Psd_Pro');
  }, false);

  actBtn.onClick = function () {
    var val = keyInp.text.replace(/^\s+|\s+$/g, '');
    if (!val) {
      alert('Please enter your Pro License Key.', 'Ai2Psd_Pro');
      return;
    }
    actBtn.text = 'Verifying PC ID...';
    actBtn.enabled = false;
    dlg.update();
    actionResult = { mode: 'activate', value: val };
    dlg.close();
  };

  cancelBtn.onClick = function () {
    actionResult = null;
    dlg.close();
  };

  dlg.show();
  keepIllustratorFocused();
  return actionResult;
}

/**
 * ফাস্ট এবং হ্যাং-ফ্রি সার্ভার কমিউনিকেশন
 */
function callLicenseServer(queryParams) {
  var fullUrl = LICENSE_CFG.apiUrl + '?' + queryParams;
  var raw = fetchUrlContent(fullUrl);

  if (raw) {
    try {
      var parsed = new Function('return (' + raw + ')')();
      if (parsed && parsed.status) {
        return parsed;
      }
    } catch (e) {
      return { status: 'net_error', message: 'Invalid response from server.' };
    }
  }

  return { status: 'net_error', message: 'No internet connection.' };
}

/**
 * লাইসেন্স ভেরিফিকেশন (HWID ম্যাচিং + অফলাইন গ্রেস সাপোর্ট)
 */
function verifyLicense() {
  var saved = readLicenseData();
  var now = new Date().getTime();
  var checkIntervalMs = LICENSE_CFG.checkIntervalDays * 24 * 60 * 60 * 1000;
  var graceMs = LICENSE_CFG.offlineGraceDays * 24 * 60 * 60 * 1000;

  var currentHwid = getMachineHWID(saved);

  if (saved && saved.key && saved.lastCheck) {
    if (saved.hwid && saved.hwid !== currentHwid) {
      var verifySaved = callLicenseServer('action=verify&key=' + encodeURIComponent(saved.key) + '&hwid=' + encodeURIComponent(saved.hwid));
      if (verifySaved.status === 'valid') {
        saveLicenseData(saved.key, now, saved.hwid);
        return { valid: true, mode: 'online' };
      }
      var verifyCurrent = callLicenseServer('action=verify&key=' + encodeURIComponent(saved.key) + '&hwid=' + encodeURIComponent(currentHwid));
      if (verifyCurrent.status === 'valid') {
        saveLicenseData(saved.key, now, currentHwid);
        return { valid: true, mode: 'online' };
      }

      if (verifySaved.status === 'error' || verifyCurrent.status === 'error') {
        removeLicenseData();
        var reactivated = handleActivationFlow('Workstation mismatch detected. Please activate on this PC:', true, currentHwid, now);
        return { valid: reactivated, mode: 'online' };
      }
      return { valid: true, mode: 'offline' };
    }

    var lastTime = parseFloat(saved.lastCheck);
    if (!isNaN(lastTime) && (now - lastTime) < checkIntervalMs) {
      return { valid: true, mode: 'cached' };
    }

    var recheckRes = callLicenseServer('action=verify&key=' + encodeURIComponent(saved.key) + '&hwid=' + encodeURIComponent(currentHwid));
    if (recheckRes.status === 'valid') {
      saveLicenseData(saved.key, now, currentHwid);
      return { valid: true, mode: 'online' };
    } else if (recheckRes.status === 'error') {
      removeLicenseData();
      var renewed = handleActivationFlow('License Verification Failed: ' + recheckRes.message + '\nPlease enter a valid Pro key:', true, currentHwid, now);
      return { valid: renewed, mode: 'online' };
    } else {
      if ((now - lastTime) < (checkIntervalMs + graceMs)) {
        return { valid: true, mode: 'offline' };
      } else {
        alert('Online License Sync Required.\nPlease connect to the internet once to verify your Pro License.', 'Ai2Psd_Pro');
        return { valid: false, mode: 'offline_expired' };
      }
    }
  }

  var activated = handleActivationFlow(null, false, currentHwid, now);
  return { valid: activated, mode: 'online' };
}

function handleActivationFlow(initialMsg, isError, hwid, now) {
  var msg = initialMsg;
  var errState = isError;

  while (true) {
    var action = showActivationDialog(msg, errState, hwid);
    if (!action) return false;

    if (action.mode === 'activate') {
      var verRes = callLicenseServer('action=verify&key=' + encodeURIComponent(action.value) + '&hwid=' + encodeURIComponent(hwid));
      if (verRes.status === 'valid') {
        saveLicenseData(action.value, now, hwid);
        keepIllustratorFocused();
        alert(verRes.message || 'Ai2Psd_Pro activated successfully on this PC ID!', 'Ai2Psd_Pro');
        keepIllustratorFocused();
        return true;
      } else {
        if (verRes.status === 'error') removeLicenseData();
        msg = verRes.message || 'Invalid Pro License Key for this PC ID, or no internet.';
        errState = true;
      }
    }
  }
}

// ==========================================

function exitIsolationMode() {
  try {
    while (app.documents.length && app.activeDocument.hasIsolatedArtwork) {
      app.executeMenuCommand('exitIsolate');
    }
  } catch (e) { }
}

function main() {
  var licCheck = verifyLicense();
  if (!licCheck || !licCheck.valid) {
    return;
  }

  // ব্যাকগ্রাউন্ডে নীরবে আপডেট চেক করবে (প্রতি ৭ দিন পর পর)
  checkSoftwareUpdateSilent();

  // Illustrator উইন্ডো ফোকাসে রাখা
  keepIllustratorFocused();

  var SCRIPT = {
    name: 'Ai2Psd_Pro',
    version: 'v' + LICENSE_CFG.currentVersion
  };

  var CFG = {
    aa: true,
    editTxt: true,
    embedIcc: false,
    isMac: /mac/i.test($.os),
    isRU: /ru/i.test($.locale),
    aiVers: parseFloat(app.version),
    uiScale: app.preferences.getRealPreference('UIPreferences/appScaleFactor'),
    actSet: 'Ai2Psd_Pro',
    actName: 'Make_Compound_Shape',
    actPath: Folder.myDocuments + '/Adobe Scripts/',
    mgns: [10, 15, 10, 10]
  };

  var LANG = {
    errApp: {
      en: 'Wrong application\nRun script from Adobe Illustrator',
      ru: 'Неправильная программа\nЗапустите скрипт в Adobe Illustrator'
    },
    errVer: {
      en: 'Wrong app version\nSorry, script only works in Illustrator CS6 and later',
      ru: 'Неподходящая версия\nСкрипт работает в Illustrator CS6 и выше'
    },
    errScale: {
      en: 'UI Scaling\nDue to scaling Preferences > User Interface > UI Scaling ' +
        'the Resolution dropdown list will not display correctly',
      ru: 'UI Scaling\nИз-за масштабирования Preferences > User Interface > UI Scaling ' +
        'выпадающий список Resolution отобразится некорректно'
    },
    src: { en: 'Source', ru: 'Источник' },
    actDoc: { en: 'Active Document: ', ru: 'Текущий документ: ' },
    allDoc1: { en: 'All ', ru: 'Все ' },
    allDoc2: { en: ' open documents', ru: ' открытых документа' },
    noDoc: { en: 'No open documents', ru: 'Нет открытых документов' },
    fol: { en: 'From Folder:', ru: 'Из папки:' },
    selFol: { en: 'Select the source folder...', ru: 'Выберите папку...' },
    subfol: { en: 'Include Subfolders', ru: 'Включить подпапки' },
    sel: { en: 'Select', ru: 'Выбрать' },
    abs: { en: 'Artboards', ru: 'Артборды' },
    multiAbs: { en: 'Export Multiple Artboards', ru: 'Экспортировать отдельными артбордами' },
    allAbs: { en: 'All Artboards in a Document', ru: 'Все артборды документа' },
    actAb: { en: 'Active', ru: 'Активный' },
    range: { en: 'Range:', ru: 'Диапазон: ' },
    res: { en: 'Resolution, ppi', ru: 'Разрешение, ppi' },
    low: { en: 'Screen (72)', ru: 'Экранное (72)' },
    mid: { en: 'Medium (150)', ru: 'Среднее (150)' },
    high: { en: 'High (300)', ru: 'Высокое (300)' },
    other: { en: 'Other', ru: 'Другое' },
    rangeTip: { en: 'Range: 72-2400 ppi', ru: 'Диапазон: 72-2400 ppi' },
    model: { en: 'Color Space', ru: 'Цветовая модель' },
    docCol: { en: 'Doc color', ru: 'Документа' },
    opts: { en: 'Shape & Effect Options', ru: 'Настройки фигур' },
    expandComp: { en: 'Expand Solid Shapes (Preserves Blur & Effects)', ru: 'Разобрать составные фигуры в сплошные' },
    of: { en: ' of ', ru: ' из ' },
    cancel: { en: 'Cancel', ru: 'Закрыть' },
    ok: { en: 'Export', ru: 'Экспортировать' },
    brand: { en: 'MI Creative Studio', ru: 'MI Creative Studio' },
    licStatus: { en: 'Pro Licensed \u2713', ru: 'Pro Licensed \u2713' },
    done: {
      en: 'Exporting process is complete!\n'
        + 'Open documents have been changed. To restore the last save select File > Revert.',
      ru: 'Экспорт завершен!\n'
        + 'Открытые документы были изменены. Для восстановления выберите Файл > Восстановить.'
    }
  };

  var SETTINGS = {
    name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
    folder: Folder.myDocuments + '/Adobe Scripts/'
  };

  if (!/illustrator/i.test(app.name)) {
    alert(LANG.errApp, 'Ai2Psd_Pro Error');
    return false;
  }

  if (CFG.aiVers < 16) {
    alert(LANG.errVer, 'Ai2Psd_Pro Error');
    return false;
  }

  if (CFG.aiVers >= 23 && CFG.aiVers < 24 && CFG.uiScale > 1) {
    alert(LANG.errScale, 'Ai2Psd_Pro Warning');
  }

  var doc = hasOpenDoc() ? app.activeDocument : null;
  var actAbIdx = 0;
  var srcFiles = [];

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
  win.orientation = 'column';
  win.alignChildren = ['fill', 'top'];
  win.spacing = 10;

  var topBrandGrp = win.add('group');
  topBrandGrp.orientation = 'row';
  topBrandGrp.alignChildren = ['fill', 'center'];
  topBrandGrp.spacing = 8;

  var topLeft = topBrandGrp.add('group');
  topLeft.orientation = 'row';
  topLeft.alignChildren = ['left', 'center'];
  topLeft.spacing = 8;

  drawBrandLogo(topLeft, 26);

  var topTitle = topLeft.add('statictext', undefined, 'Ai2Psd_Pro  |  Pro PSD Engine');
  topTitle.graphics.font = ScriptUI.newFont(topTitle.graphics.font.name, 'BOLD', 11);

  var mainSupBtn = topBrandGrp.add('button', undefined, 'Support');
  mainSupBtn.preferredSize = [56, 20];
  mainSupBtn.graphics.font = ScriptUI.newFont(mainSupBtn.graphics.font.name, 'REGULAR', 8.5);
  mainSupBtn.onClick = function () { openURL(LICENSE_CFG.repoUrl); };

  // SOURCE PANEL
  var srcPnl = win.add('panel', undefined, LANG.src);
  srcPnl.alignChildren = 'fill';
  srcPnl.margins = CFG.mgns;

  var actDocRb = srcPnl.add('radiobutton', undefined, LANG.actDoc);
  actDocRb.text += hasOpenDoc() ? truncate(doc.name, 23) : LANG.noDoc;
  actDocRb.value = true;
  var allDocRb = srcPnl.add('radiobutton', undefined, LANG.allDoc1 + documents.length + LANG.allDoc2);
  allDocRb.text = hasOpenDoc() ? LANG.allDoc1 + documents.length + LANG.allDoc2 : LANG.noDoc;
  allDocRb.enabled = documents.length > 1;

  // FOLDER
  var folGrp = srcPnl.add('group');
  folGrp.alignChildren = ['left', 'center'];
  var folRb = folGrp.add('radiobutton', undefined, LANG.fol);
  var folBtn = folGrp.add('button', undefined, LANG.sel);
  folBtn.preferredSize.height = 24;
  var isSubfol = srcPnl.add('checkbox', undefined, LANG.subfol);
  isSubfol.enabled = folBtn.value;
  var folLbl = srcPnl.add('statictext', undefined, Folder.desktop);
  folLbl.preferredSize.width = 160;

  // ARTBOARDS PANEL
  var abPnl = win.add('panel', undefined, LANG.abs);
  abPnl.alignChildren = ['fill', 'center'];
  abPnl.margins = CFG.mgns;

  var isSaveAbs = abPnl.add('checkbox', undefined, LANG.multiAbs);
  isSaveAbs.value = true;

  var abGrp = abPnl.add('group');
  abGrp.alignChildren = ['fill', 'top'];
  abGrp.orientation = 'column';

  var allAbRb = abGrp.add('radiobutton', undefined, LANG.allAbs);
  allAbRb.value = true;
  var actAbRb = abGrp.add('radiobutton', undefined, LANG.actAb);

  // RANGE
  var rangeGrp = abGrp.add('group');
  rangeGrp.alignChildren = ['left', 'center'];

  var rangeAbRb = rangeGrp.add('radiobutton', undefined, LANG.range);
  rangeAbRb.preferredSize.width = CFG.isRU ? 85 : 60;
  var rangeInp = rangeGrp.add('edittext', undefined, '1,2');
  rangeInp.characters = 12;
  rangeInp.helpTip = '"1, 3-5" -> 1, 3, 4, 5';

  // DESTINATION PANEL
  var destPnl = win.add('panel', undefined, 'Save PSD Destination');
  destPnl.alignChildren = 'left';
  destPnl.margins = CFG.mgns;

  var destGrp = destPnl.add('group');
  destGrp.orientation = 'row';
  destGrp.alignChildren = ['left', 'center'];
  destGrp.spacing = 14;

  var destDeskRb = destGrp.add('radiobutton', undefined, 'Desktop (Instant Access)');
  destDeskRb.value = true;
  var destDocRb = destGrp.add('radiobutton', undefined, 'Original .ai Folder');
  destDocRb.enabled = hasOpenDoc() && (function(){ try { return doc && doc.path && doc.path.toString().length > 0; } catch(e){ return false; } })();

  var openFolCb = destPnl.add('checkbox', undefined, 'Open & highlight PSD in Explorer when finished');
  openFolCb.value = true;

  // TWO COLUMN LAYOUT
  var row = win.add('group');
  row.alignChildren = ['fill', 'fill'];

  var resPnl = row.add('panel', undefined, LANG.res);
  resPnl.alignChildren = 'fill';
  resPnl.margins = CFG.mgns;

  var ppiList = resPnl.add('dropdownlist', undefined, [LANG.low, LANG.mid, LANG.high, '-', LANG.other]);
  ppiList.selection = 0;

  var ppiInp = resPnl.add('edittext', undefined, '96');
  ppiInp.characters = 5;
  resPnl.add('statictext', undefined, LANG.rangeTip);

  var colPnl = row.add('panel', undefined, LANG.model);
  colPnl.alignChildren = 'left';
  colPnl.margins = CFG.mgns;

  var origColRb = colPnl.add('radiobutton', undefined, LANG.docCol);
  origColRb.value = true;
  var rgbRb = colPnl.add('radiobutton', undefined, 'RGB');
  var cmykRb = colPnl.add('radiobutton', undefined, 'CMYK');

  // SHAPE OPTIONS PANEL
  var optPnl = win.add('panel', undefined, LANG.opts);
  optPnl.alignChildren = 'left';
  optPnl.margins = CFG.mgns;

  var isExpandComp = optPnl.add('checkbox', undefined, LANG.expandComp);
  isExpandComp.value = true;

  // PROGRESS BAR PANEL
  var progPnl = win.add('panel', undefined, 'Progress');
  progPnl.alignChildren = ['fill', 'center'];
  progPnl.margins = [10, 12, 10, 10];

  var progTopGrp = progPnl.add('group');
  progTopGrp.orientation = 'row';
  progTopGrp.alignChildren = ['fill', 'center'];

  var progLbl = progTopGrp.add('statictext', undefined, 'Doc: 1' + LANG.of + '1');
  progLbl.justify = 'left';

  var pctLbl = progTopGrp.add('statictext', undefined, '0%');
  pctLbl.justify = 'right';
  pctLbl.preferredSize.width = 50;

  var progBar = progPnl.add('progressbar', undefined, 0, 100);
  progBar.preferredSize.width = 280;
  progBar.preferredSize.height = 12;

  // BUTTONS
  var btns = win.add('group');
  btns.alignChildren = ['fill', 'fill'];

  var cancel, ok;
  if (CFG.isMac) {
    cancel = btns.add('button', undefined, LANG.cancel, { name: 'cancel' });
    ok = btns.add('button', undefined, LANG.ok, { name: 'ok' });
  } else {
    ok = btns.add('button', undefined, LANG.ok, { name: 'ok' });
    cancel = btns.add('button', undefined, LANG.cancel, { name: 'cancel' });
  }

  // FOOTER (Clean Brand & Pro Badge — No Check Update button)
  var copyGrp = win.add('group');
  copyGrp.orientation = 'row';
  copyGrp.alignChildren = ['fill', 'center'];

  var brandLbl = copyGrp.add('statictext', undefined, '\u00A9 ' + LANG.brand);
  brandLbl.justify = 'left';
  setupActionLink(brandLbl, function () { openURL(LICENSE_CFG.profileUrl); }, true);

  var statusBadge = copyGrp.add('statictext', undefined, LANG.licStatus);
  statusBadge.justify = 'right';
  var isDark = app.preferences.getRealPreference('uiBrightness') <= 0.5;
  statusBadge.graphics.foregroundColor = statusBadge.graphics.newPen(
    statusBadge.graphics.PenType.SOLID_COLOR,
    isDark ? [0.25, 0.85, 0.55] : [0.08, 0.55, 0.28],
    1
  );

  // EVENTS
  actDocRb.onClick = function () {
    folRb.value = false;
    isSubfol.enabled = false;
    actAbRb.enabled = abGrp.enabled;
    progLbl.text = 'Doc: 1' + LANG.of + '1';
  };

  allDocRb.onClick = function () {
    if (!this.enabled) return;
    if (!rangeAbRb.value) allAbRb.value = true;
    actAbRb.enabled = false;
    folRb.value = false;
    isSubfol.enabled = false;
    progLbl.text = 'Doc: 1' + LANG.of + app.documents.length;
  };

  folRb.onClick = function () {
    if (actAbRb.value) {
      allAbRb.value = true;
      rangeAbRb.value = false;
      rangeInp.enabled = false;
    }
    isSubfol.enabled = true;
    actDocRb.value = allDocRb.value = false;
    actAbRb.enabled = false;
    progLbl.text = 'Doc: 1' + LANG.of + '?';
  };

  var folPath = '';
  folBtn.onClick = function () {
    var fol = Folder.selectDialog(LANG.selFol);
    var str = '';
    if (fol !== null) {
      folPath = decodeURI(fol);
      srcFiles = getFolderFiles(folPath, ['ai', 'eps', 'svg'], isSubfol.enabled && isSubfol.value);
      progLbl.text = 'Doc: 1' + LANG.of + srcFiles.length;
      str = '.../' + folPath.substr(folPath.lastIndexOf('/') + 1);
      folLbl.text = truncate(str, 40);
    }
  };

  isSubfol.onClick = function () {
    if (!folPath.length) return;
    srcFiles = getFolderFiles(folPath, ['ai', 'eps', 'svg'], isSubfol.enabled && isSubfol.value);
    progLbl.text = 'Doc: 1' + LANG.of + srcFiles.length;
  };

  isSaveAbs.onClick = function () {
    abGrp.enabled = this.value;
    actAbRb.enabled = abGrp.enabled && actDocRb.value;
    rangeInp.enabled = rangeAbRb.value;
  };

  allAbRb.onClick = actAbRb.onClick = function () {
    if (!this.enabled) return;
    rangeAbRb.value = rangeInp.enabled = false;
  };

  rangeAbRb.onClick = function () {
    allAbRb.value = actAbRb.value = false;
    rangeInp.enabled = true;
  };

  ppiList.onChange = function () {
    ppiInp.enabled = (/other|другое/i.test(this.selection.text));
  };

  cancel.onClick = win.close;
  ok.onClick = okClick;

  loadSettings(SETTINGS);

  function okClick() {
    saveSettings(SETTINGS);

    var docs = [];
    var currDoc;

    if (folRb.value) {
      docs = [].concat(srcFiles);
    } else if (allDocRb.value) {
      docs = get(app.documents);
    } else {
      if (!hasOpenDoc()) {
        alert(LANG.noDoc, 'Ai2Psd_Pro');
        return;
      }
      docs = [app.activeDocument];
    }

    if (!docs.length) {
      alert('No files found to process!', 'Ai2Psd_Pro');
      return;
    }

    var saveToDesktop = destDeskRb.value;
    var autoOpenExplorer = openFolCb.value;

    ok.enabled = false;
    progLbl.text = 'Doc: 1' + LANG.of + docs.length;
    addCompShapeAction(CFG.actSet, CFG.actName, CFG.actPath);

    var origInteraction = app.userInteractionLevel;
    app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

    var exportedItems = [];
    var lastError = '';

    try {
      for (var i = 0, len = docs.length; i < len; i++) {
        progLbl.text = 'Doc: ' + (i + 1) + LANG.of + docs.length;
        pctLbl.text = '0%';
        progBar.value = 0;
        win.update();

        if (folRb.value) {
          app.open(docs[i]);
        } else {
          docs[i].activate();
        }
        currDoc = app.activeDocument;

        exitIsolationMode();

        try {
          process(currDoc, win, progBar, pctLbl, CFG, isExpandComp.value);
        } catch (err) { }

        currDoc.activate();
        exitIsolationMode();

        var psdOpts = setExportOptions(currDoc);
        var res = exportAsPsd(currDoc, psdOpts, saveToDesktop);
        if (res && res.success) {
          exportedItems.push(res);
        } else {
          lastError = (res && res.error) ? res.error : 'Unknown export error';
        }

        if (folRb.value) {
          app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
        }
      }
    } catch (err) {
      lastError = err.message;
    }

    app.userInteractionLevel = origInteraction;

    try {
      app.unloadAction(CFG.actSet, '');
    } catch (err) { }

    if (exportedItems.length > 0) {
      var firstRes = exportedItems[0];
      var targetFol = firstRes.folder;
      var folPathStr = (targetFol && targetFol.fsName) ? targetFol.fsName : (Folder.desktop.fsName || 'Desktop');
      
      if (autoOpenExplorer && firstRes.file) {
        revealInExplorer(firstRes.file);
      }

      alert('PSD Export Completed Successfully!\n\nSaved File: ' + (firstRes.file ? firstRes.file.name : 'PSD') + '\nSaved Location:\n' + folPathStr, 'Ai2Psd_Pro');
    } else {
      alert('PSD Export Failed: ' + (lastError || 'Could not export file.') + '\nPlease ensure the document has visible vector artwork and try again.', 'Ai2Psd_Pro Error');
    }
    win.close();
  }

  function saveSettings(prefs) {
    if (!Folder(prefs.folder).exists) Folder(prefs.folder).create();
    var f = new File(prefs.folder + prefs.name);
    f.encoding = 'UTF-8';
    f.open('w');

    var data = {};
    data.win_x = win.location.x;
    data.win_y = win.location.y;
    data.src = actDocRb.value ? 0 : (allDocRb.value ? 1 : 2);
    data.subfol = isSubfol.value;
    data.multi = isSaveAbs.value;
    data.abs = allAbRb.value ? 0 : (actAbRb.value ? 1 : 2);
    data.range = rangeInp.text;
    data.res = ppiList.selection ? ppiList.selection.index : 0;
    data.ppi = ppiInp.text;
    data.color = origColRb.value ? 0 : (rgbRb.value ? 1 : 2);
    data.expand = isExpandComp.value;
    data.dest = destDeskRb.value ? 0 : 1;
    data.open_fol = openFolCb.value;

    f.write(stringify(data));
    f.close();
  }

  function loadSettings(prefs) {
    var f = File(prefs.folder + prefs.name);
    if (f.exists) {
      try {
        f.encoding = 'UTF-8';
        f.open('r');
        var json = f.readln();
        var data;
        try { data = new Function('return (' + json + ')')(); } catch (err) { }
        f.close();

        if (typeof data != 'undefined') {
          win.location = [
            data.win_x && !isNaN(parseInt(data.win_x)) ? parseInt(data.win_x) : 300,
            data.win_y && !isNaN(parseInt(data.win_y)) ? parseInt(data.win_y) : 300
          ];
          if (data.src == 0) actDocRb.notify('onClick');
          else if (data.src == 1) allDocRb.notify('onClick');
          else folRb.notify('onClick');
          isSubfol.value = String(data.subfol) === 'true';
          isSaveAbs.value = String(data.multi) === 'true';
          if (data.abs == 0) allAbRb.notify('onClick');
          else if (data.abs == 1) actAbRb.notify('onClick');
          else rangeAbRb.notify('onClick');
          rangeInp.text = data.range || '1,2';
          if (ppiList.items.length) {
            var sIdx = parseInt(data.res) || 0;
            if (sIdx >= 0 && sIdx < ppiList.items.length) ppiList.selection = sIdx;
          }
          ppiInp.text = data.ppi || '96';
          if (data.color == 0) origColRb.value = true;
          else if (data.color == 1) rgbRb.value = true;
          else cmykRb.value = true;
          if (data.expand !== undefined) isExpandComp.value = String(data.expand) === 'true';
          if (data.dest !== undefined && destDocRb.enabled) {
            if (parseInt(data.dest) === 1) destDocRb.value = true;
            else destDeskRb.value = true;
          }
          if (data.open_fol !== undefined) openFolCb.value = String(data.open_fol) === 'true';
        }
      } catch (err) { }
    }

    if (hasOpenDoc()) {
      actAbIdx = doc.artboards.getActiveArtboardIndex();
      actAbRb.text += ' [' + (actAbIdx + 1) + ']: ' + truncate(doc.artboards[actAbIdx].name, 32);
      if (actDocRb.value && /cmyk/i.test(doc.documentColorSpace)) cmykRb.value = true;
    } else {
      actDocRb.enabled = actDocRb.value = false;
      allDocRb.enabled = allDocRb.value = false;
      folRb.value = true;
      isSubfol.enabled = true;
      progLbl.text = 'Doc: 1' + LANG.of + '?';
      actAbRb.enabled = false;
    }

    rangeInp.enabled = rangeAbRb.value;
    abGrp.enabled = isSaveAbs.value;
    actAbRb.enabled = abGrp.enabled && actDocRb.value;
    ppiInp.enabled = (/other|другое/i.test(ppiList.selection.text));
  }

  function setExportOptions(doc) {
    var ppi = getPPI(ppiList.selection.text, ppiInp.text);

    var opts = new ExportOptionsPhotoshop();
    opts.antiAliasing = CFG.aa;
    opts.editableText = CFG.editTxt;
    opts.embedICCProfile = CFG.embedIcc;
    opts.maximumEditability = true;
    opts.resolution = ppi;
    opts.warnings = false;
    opts.writeLayers = true;

    var imgCol = /rgb/i.test(doc.documentColorSpace) ? ImageColorSpace.RGB : ImageColorSpace.CMYK;
    if (rgbRb.value) {
      try { app.executeMenuCommand('doc-color-rgb'); } catch (e) { }
      imgCol = ImageColorSpace.RGB;
    } else if (cmykRb.value) {
      try { app.executeMenuCommand('doc-color-cmyk'); } catch (e) { }
      imgCol = ImageColorSpace.CMYK;
    }
    opts.imageColorSpace = imgCol;

    var hasMulti = doc.artboards && doc.artboards.length > 1;
    var range = '';
    if (isSaveAbs.value && hasMulti) {
      opts.saveMultipleArtboards = true;
      if (actAbRb.value) {
        var currentAbIdx = doc.artboards.getActiveArtboardIndex();
        range = (currentAbIdx + 1).toString();
      } else if (rangeAbRb.value) {
        var parsedRange = parseAndFilterIndexes(rangeInp.text, doc.artboards.length);
        for (var i = 0; i < parsedRange.length; i++) {
          parsedRange[i] = (parsedRange[i] + 1).toString();
        }
        range = parsedRange.join(', ');
      }
    } else {
      opts.saveMultipleArtboards = false;
      range = '';
    }

    opts.artboardRange = range;
    return opts;
  }

  keepIllustratorFocused();
  win.show();
}

function hasOpenDoc() {
  return app.documents.length > 0;
}

function truncate(str, n) {
  if (typeof str !== 'string' || typeof n !== 'number' || n <= 0 || !isFinite(n)) return;
  return str.length > n ? str.slice(0, n - 1) + '...' : str;
}

function getFolderFiles(path, extensions, isDeep) {
  var folder = Folder(decodeURI(path));
  var results = [];
  var filesArr;
  try {
    filesArr = folder.getFiles();
  } catch (err) {
    return [];
  }

  var currFile = null;
  var regex = new RegExp('\\.(' + extensions.join('|') + ')$', 'i');

  for (var i = 0, len = filesArr.length; i < len; i++) {
    currFile = filesArr[i];
    try {
      if (isDeep && currFile instanceof Folder) {
        var subFiles = getFolderFiles(currFile, extensions, isDeep);
        for (var s = 0; s < subFiles.length; s++) results.push(subFiles[s]);
      } else if (currFile instanceof File) {
        if (!/^\._|ds_store/i.test(currFile.name) && regex.test(currFile.name)) {
          results.push(currFile);
        }
      }
    } catch (err) { }
  }
  return results;
}

function addCompShapeAction(set, name, path) {
  var str = [
    '/version 3',
    '/name [' + set.length + ' ' + ascii2Hex(set) + ']',
    '/isOpen 1',
    '/actionCount 1',
    '/action-1 {',
    '/name [' + name.length + ' ' + ascii2Hex(name) + ']',
    '/keyIndex 0',
    '/colorIndex 0',
    '/isOpen 1',
    '/eventCount 1',
    '/event-1 {',
    '/useRulersIn1stQuadrant 0',
    '/internalName (ai_make_compound_shape)',
    '/localizedName [ 19',
    '    4d616b6520436f6d706f756e64205368617065',
    ']',
    '/isOpen 0',
    '/isOn 1',
    '/hasDialog 0',
    '/parameterCount 1',
    '/parameter-1 {',
    '/key 1835101029',
    '/showInPalette 4294967295',
    '/type (integer)',
    '/value 0',
    '}',
    '}',
    '}'].join('\n');

  try { app.unloadAction(set, ''); } catch (err) { }
  createAction(str, set, path);
}

function createAction(str, set, path) {
  if (!Folder(path).exists) Folder(path).create();
  var f = new File('' + path + '/' + set + '.aia');
  f.open('w');
  f.write(str);
  f.close();
  app.loadAction(f);
  f.remove();
}

function ascii2Hex(hex) {
  return hex.replace(/./g, function (a) {
    return a.charCodeAt(0).toString(16);
  });
}

function get(coll) {
  var results = [];
  for (var i = 0, len = coll.length; i < len; i++) {
    results.push(coll[i]);
  }
  return results;
}

function process(doc, w, pb, pctLbl, pref, expandToSolid) {
  pb.value = 0;
  pctLbl.text = '0%';
  w.update();

  unlockAll(doc);
  limitGroupDepth(doc.layers, 2);

  app.selection = null;
  app.executeMenuCommand('selectall');

  var docItems = [];
  collectItemsFast(app.selection, docItems);
  app.selection = null;

  var len = docItems.length;
  if (len === 0) {
    pb.value = 100;
    pctLbl.text = '100%';
    w.update();
    return;
  }

  var updateStep = Math.max(1, Math.floor(len / 10));

  for (var i = len - 1; i >= 0; i--) {
    var item = docItems[i];
    if (item && item.typename) {
      convertItemFast(item, pref.actName, pref.actSet, expandToSolid);
    }

    var processedCount = len - i;
    if (processedCount % updateStep === 0 || i === 0) {
      var pct = Math.round((processedCount / len) * 100);
      pb.value = pct;
      pctLbl.text = pct + '%';
      w.update();
    }
  }

  pb.value = 100;
  pctLbl.text = '100%';
  docItems = null;
  app.selection = null;
  w.update();
}

function hasLiveEffect(item) {
  if (!item) return false;
  try {
    if (item.hasOwnProperty('isIsolated') && item.isIsolated) return true;
    if (item.artworkKnockout && item.artworkKnockout !== KnockoutState.DISABLED) return true;
    if (item.visibleBounds && item.geometricBounds) {
      var vb = item.visibleBounds;
      var gb = item.geometricBounds;
      var strokeWidth = 0;
      try {
        if (item.stroked && item.strokeWidth) strokeWidth = item.strokeWidth;
      } catch (e) { }
      var tol = (strokeWidth / 2) + 0.8;
      if (Math.abs(vb[0] - gb[0]) > tol ||
        Math.abs(vb[1] - gb[1]) > tol ||
        Math.abs(vb[2] - gb[2]) > tol ||
        Math.abs(vb[3] - gb[3]) > tol) {
        return true;
      }
    }
  } catch (e) { }
  return false;
}

function collectItemsFast(coll, results) {
  if (!coll || !coll.length) return;
  for (var i = 0, len = coll.length; i < len; i++) {
    var item = coll[i];
    if (!item || item.locked || item.hidden) continue;

    if (hasLiveEffect(item)) {
      results.push(item);
      continue;
    }

    if (item.pageItems && item.pageItems.length) {
      if (item.clipped) {
        results.push(item);
      } else {
        collectItemsFast(item.pageItems, results);
      }
    } else if (isType(item, 'compound')) {
      if (item.pathItems.length && item.pathItems[0].clipping) continue;
      results.push(item);
    } else if (!item.clipping) {
      results.push(item);
    }
  }
}

function unlockAll(doc) {
  unlockLayers(doc.layers);
  try { app.executeMenuCommand('unlockAll'); } catch (e) { }
  app.selection = null;
}

function unlockLayers(layers) {
  for (var i = 0, len = layers.length; i < len; i++) {
    layers[i].locked = false;
    if (layers[i].layers.length) {
      unlockLayers(layers[i].layers);
    }
  }
}

function limitGroupDepth(layers, depth) {
  depth = (isNaN(parseInt(depth)) ? 4 : parseInt(depth)) + 1;
  for (var i = 0; i < layers.length; i++) {
    groupNormalize(layers[i].groupItems, depth);
    if (layers[i].layers && layers[i].layers.length) {
      limitGroupDepth(layers[i].layers, depth);
    }
  }
}

function groupNormalize(groups, max, counter, dest) {
  var i = groups.length;
  counter = (counter || 0) + 1;
  if (i > 0) {
    while (i--) {
      if (counter > max) {
        try { dest = groups[i]; } catch (err) { }
        try {
          if (!groups[i].clipped && !hasLiveEffect(groups[i])) {
            moveItems(groups[i].pageItems, dest);
          } else {
            ungroupAll(groups[i]);
          }
        } catch (err) { }
        groupNormalize(groups, max, counter - 1, dest);
      } else {
        try {
          groupNormalize(groups[i].groupItems, max, counter, dest);
        } catch (err) { }
      }
    }
  }
}

function ungroupAll(obj) {
  if (hasLiveEffect(obj) || obj.clipped) return;
  var childs = getGroupChilds(obj);
  if (!childs.length) {
    try { obj.remove(); } catch (e) { }
    return;
  }

  for (var i = 0, len = childs.length; i < len; i++) {
    var item = childs[i];
    try {
      if (isType(item, 'group') && !item.clipped && !hasLiveEffect(item)) {
        ungroupAll(item);
      }
      item.move(obj, ElementPlacement.PLACEBEFORE);
    } catch (err) { }
  }
  try { if (!obj.pageItems.length) obj.remove(); } catch (e) { }
}

function getGroupChilds(obj) {
  var results = [];
  for (var i = 0, pi = obj.pageItems.length; i < pi; i++) {
    results.push(obj.pageItems[i]);
  }
  if (obj.layers) {
    for (var i = 0, len = obj.layers.length; i < len; i++) {
      results.push(obj.layers[i]);
    }
  }
  return results;
}

function moveItems(items, dest) {
  if (dest === undefined) return [];
  var groups = [];
  var i = items.length;
  while (i--) {
    var item = items[i];
    if (isType(item, 'group')) groups.push(item);
    item.move(dest, ElementPlacement.PLACEAFTER);
  }
  if (!dest.pageItems.length) dest.remove();
  return groups;
}

function isType(item, type) {
  if (!item || !item.typename) return false;
  var regexp = new RegExp(type, 'i');
  return regexp.test(item.typename);
}

function convertItemFast(item, actName, actSet, expandToSolid) {
  var props = {
    name: transliterate(getName(item)),
    opa: item.opacity,
    blend: item.blendingMode
  };
  var prnt = item.parent;
  if (prnt && prnt.name !== undefined) {
    prnt.name = transliterate(getName(prnt));
  }

  if (isType(prnt, 'group') && prnt.pageItems.length === 1) {
    props.opa = prnt.opacity;
    props.blend = prnt.blendingMode;
  }

  if (isType(item, 'text')) {
    if (!isEmpty(props.name)) item.name = props.name;
    return;
  }

  if (isType(item, 'group') && item.clipped) {
    if (!isEmpty(props.name)) item.name = props.name;
    return;
  }

  var itemHasBlurOrEffect = hasLiveEffect(item) || (isType(item.parent, 'compound') && hasLiveEffect(item.parent));

  var tmpPath;
  if (isType(item, 'compound')) {
    if (item.pathItems.length) {
      item = item.pathItems[0];
    } else {
      tmpPath = item.pathItems.add();
      item = tmpPath;
    }
  }

  try {
    item.fillOverprint = false;
    item.strokeOverprint = false;
  } catch (e) { }

  try {
    if (!itemHasBlurOrEffect && !isProblemType(item) && isSolidFill(item) && !item.stroked) {
      if (isType(item.parent, 'compound')) {
        item = item.parent;
        if (tmpPath) tmpPath.remove();
      }

      app.selection = [item];
      app.doScript(actName, actSet);

      if (!app.selection.length) {
        try { app.selection = [item]; } catch (err) { }
      }

      if (expandToSolid && app.selection.length) {
        try {
          app.executeMenuCommand('expandStyle');
        } catch (err) { }
      }

      if (app.selection.length) {
        if (!isEmpty(props.name)) app.selection[0].name = props.name;
        app.selection[0].opacity = props.opa;
        app.selection[0].blendingMode = props.blend;
      }
    } else {
      if (isType(item.parent, 'compound')) {
        item = item.parent;
        if (tmpPath) tmpPath.remove();
      }

      if (isType(item, 'group')) {
        if (!isEmpty(props.name)) item.name = props.name;
      } else {
        if (isType(item.parent, 'layer')) {
          var safeGrp = item.parent.groupItems.add();
          safeGrp.move(item, ElementPlacement.PLACEBEFORE);
          item.move(safeGrp, ElementPlacement.PLACEATEND);
          if (!isEmpty(props.name)) safeGrp.name = props.name;
        } else {
          if (!isEmpty(props.name)) item.name = props.name;
        }
      }
    }
  } catch (err) { }
}

function transliterate(str) {
  if (!str) return '';
  var tlStr = '';
  var cyrillicMap = {
    'Ё': 'YO', 'Й': 'I', 'Ц': 'TS', 'У': 'U', 'К': 'K', 'Е': 'E', 'Н': 'N', 'Г': 'G', 'Ґ': 'G', 'Ш': 'SH', 'Щ': 'SCH', 'З': 'Z', 'Х': 'H', 'Ъ': "'",
    'ё': 'yo', 'й': 'i', 'ц': 'ts', 'у': 'u', 'к': 'k', 'е': 'e', 'н': 'n', 'г': 'g', 'ґ': 'g', 'ш': 'sh', 'щ': 'sch', 'з': 'z', 'х': 'h', 'ъ': "'",
    'Ф': 'F', 'Ы': 'I', 'В': 'V', 'А': 'a', 'П': 'P', 'Р': 'R', 'О': 'O', 'Л': 'L', 'Д': 'D', 'Ж': 'ZH', 'Э': 'E', 'Є': 'Je',
    'ф': 'f', 'ы': 'i', 'в': 'v', 'а': 'a', 'п': 'p', 'р': 'r', 'о': 'o', 'л': 'l', 'д': 'd', 'ж': 'zh', 'э': 'e', 'є': 'je',
    'Я': 'Ya', 'Ч': 'CH', 'С': 'S', 'М': 'M', 'И': 'I', 'Ї': 'ш', 'Т': 'T', 'Ь': "'", 'Б': 'B', 'Ю': 'YU',
    'я': 'ya', 'ч': 'ch', 'с': 's', 'м': 'm', 'и': 'i', 'ї': 'i', 'т': 't', 'ь': "'", 'б': 'b', 'ю': 'yu'
  };

  for (var i = 0; i < str.length; i++) {
    tlStr += cyrillicMap[str[i]] || str[i];
  }
  return tlStr;
}

function getName(item) {
  if (!item || !item.typename) return item.name || '';
  var compound = getCompound(item);
  if (compound && !isEmpty(compound.name)) return compound.name;
  if (!isEmpty(item.name)) return item.name;
  if (item.typename === 'TextFrame' && !isEmpty(item.contents)) return item.contents;
  if (item.typename === 'SymbolItem') return item.symbol.name;
  if (item.typename === 'PlacedItem') return item.file && item.file.name ? item.file.name : '<Linked File>';

  switch (item.typename) {
    case 'PathItem': return '<Path>';
    case 'CompoundPathItem': return '<Compound Path>';
    case 'GraphItem': return '<Graph>';
    case 'GroupItem': return item.clipped ? '<Clipping Group>' : '<Group>';
    case 'MeshItem': return '<Mesh>';
    case 'NonNativeItem': return '<Non-Native Art>';
    case 'RasterItem': return '<Image>';
    case 'SymbolItem': return '<Symbol>';
    case 'PlacedItem': return '<Linked File>';
    case 'TextFrame': return '<Text>';
    default:
      if (isLegacyText(item)) return '<Legacy Text>';
      return '<' + item.typename + '>';
  }
}

function getCompound(item) {
  if (!item || !item.typename) return null;
  if (item.typename === 'Layer' || item.typename === 'Artboard' || item.typename === 'Document') return null;
  while (item && item.parent) {
    if (item.parent.typename === 'CompoundPathItem') return item.parent;
    item = item.parent;
  }
  return null;
}

function isLegacyText(item) {
  return item.typename === 'LegacyTextItem' ||
    (item.typename === 'TextFrame' && (!item.hasOwnProperty('contents') ||
      item.hasOwnProperty('converted')));
}

function isEmpty(str) {
  if (!str) return true;
  return str.replace(/\s/g, '').length === 0;
}

function isProblemType(item) {
  return isType(item, 'graph|group|mesh|nonnative|placed|plugin|raster|symbol');
}

function isSolidFill(item) {
  if (!item.filled) return false;
  return isType(item.fillColor, 'rgb|cmyk|gray|spot');
}

function strToIntNum(str, def) {
  if (arguments.length == 1 || def == undefined) def = 0;
  str = str.replace(/,/g, '.').replace(/[^\d.]/g, '');
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  return (isNaN(str) || !str.length) ? parseInt(def) : parseInt(str);
}

function getPPI(str, custom) {
  var ppi = 72;
  switch (true) {
    case /72/i.test(str): break;
    case /150/i.test(str): ppi = 150; break;
    case /300/i.test(str): ppi = 300; break;
    case /other|другое/i.test(str): ppi = custom ? strToIntNum(custom, 72) : 72; break;
  }
  return Math.max(72, Math.min(ppi, 2400));
}

function parseAndFilterIndexes(str, givenNumber) {
  var parsedNums = [];
  var chunks = str.split(/[,; ]+/);
  for (var i = 0; i < chunks.length; i++) {
    var chunk = chunks[i];
    var range = chunk.split('-');
    if (range.length === 2) {
      var start = parseInt(range[0], 10);
      var end = parseInt(range[1], 10);
      for (var j = start; j <= end; j++) parsedNums.push(j);
    } else {
      var num = parseInt(chunk, 10);
      if (!isNaN(num)) parsedNums.push(num);
    }
  }

  var filteredNums = [];
  for (var k = 0; k < parsedNums.length; k++) {
    var num = parsedNums[k] - 1;
    if (num >= 0 && num < givenNumber) filteredNums.push(num);
  }

  filteredNums = getUnique(filteredNums);
  filteredNums.sort(function (a, b) { return a - b; });
  return filteredNums;
}

function getUnique(arr) {
  var obj = {};
  var unique = [];
  for (var i = 0; i < arr.length; i++) obj[arr[i]] = arr[i];
  for (var i in obj) unique.push(obj[i]);
  return unique;
}

function exportAsPsd(doc, opts, saveToDesktop) {
  var fol;
  if (saveToDesktop) {
    fol = Folder.desktop;
  } else {
    try {
      fol = doc.path;
    } catch (e) {
      fol = Folder.desktop;
    }
    if (!fol || fol.toString().length < 1) {
      fol = Folder.desktop;
    }
  }

  var baseName = 'Untitled';
  try {
    baseName = doc.name.replace(/\.[^\.]+$/, '');
  } catch (e) { }
  if (!baseName || baseName.length === 0) baseName = 'Untitled';

  var targetFile;
  if (opts.saveMultipleArtboards) {
    targetFile = new File(decodeURI(fol) + '/' + baseName);
  } else {
    targetFile = new File(decodeURI(fol) + '/' + baseName + '.psd');
  }

  if (opts.writeLayers) {
    try {
      if (/rgb/i.test(doc.documentColorSpace)) {
        opts.imageColorSpace = ImageColorSpace.RGB;
      } else if (/cmyk/i.test(doc.documentColorSpace)) {
        opts.imageColorSpace = ImageColorSpace.CMYK;
      }
    } catch (csErr) { }
  }

  // Attempt 1: Full layered export
  try {
    doc.exportFile(targetFile, ExportType.PHOTOSHOP, opts);
    var savedFile = opts.saveMultipleArtboards ? new File(decodeURI(fol) + '/' + baseName + '_Artboard 1.psd') : targetFile;
    if (!savedFile.exists) savedFile = targetFile;
    return { success: true, file: savedFile, folder: fol };
  } catch (err1) {
    // Attempt 2: Try with maximumEditability = false (preserves layers)
    try {
      opts.maximumEditability = false;
      doc.exportFile(targetFile, ExportType.PHOTOSHOP, opts);
      var savedFile2 = opts.saveMultipleArtboards ? new File(decodeURI(fol) + '/' + baseName + '_Artboard 1.psd') : targetFile;
      if (!savedFile2.exists) savedFile2 = targetFile;
      return { success: true, file: savedFile2, folder: fol };
    } catch (err2) { }

    // Attempt 3: If multi-artboard failed, export single file
    try {
      if (opts.saveMultipleArtboards) {
        opts.saveMultipleArtboards = false;
        opts.artboardRange = '';
        var singleFile = new File(decodeURI(fol) + '/' + baseName + '.psd');
        doc.exportFile(singleFile, ExportType.PHOTOSHOP, opts);
        return { success: true, file: singleFile, folder: fol };
      }
    } catch (err3) { }

    // Attempt 4: Fallback to Desktop
    try {
      var deskFile = new File(Folder.desktop + '/' + baseName + '.psd');
      opts.saveMultipleArtboards = false;
      opts.artboardRange = '';
      opts.maximumEditability = false;
      doc.exportFile(deskFile, ExportType.PHOTOSHOP, opts);
      return { success: true, file: deskFile, folder: Folder.desktop };
    } catch (err4) { }

    return { success: false, error: err1.message };
  }
}

function openURL(url) {
  var isMac = /mac/i.test($.os);
  try {
    if (isMac) {
      var sh = new File(Folder.temp + '/ai2psd_open.sh');
      sh.open('w');
      sh.writeln('#!/bin/bash');
      sh.writeln('open "' + url + '"');
      sh.close();
      sh.execute();
      $.sleep(100);
      if (sh.exists) sh.remove();
    } else {
      var bat = new File(Folder.temp + '/ai2psd_open.bat');
      bat.open('w');
      bat.writeln('@echo off');
      bat.writeln('start "" "' + url + '"');
      bat.close();
      bat.execute();
      $.sleep(100);
      if (bat.exists) bat.remove();
    }
  } catch (e) { }
}

function stringify(obj) {
  if (obj === null || obj === undefined) return 'null';
  var json = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var val = obj[key];
      if (val === null || val === undefined) {
        json.push('"' + key + '":null');
      } else if (typeof val === 'number' || typeof val === 'boolean') {
        json.push('"' + key + '":' + val);
      } else {
        var strVal = val.toString()
          .replace(/\\/g, "\\\\")
          .replace(/\t/g, "\\t")
          .replace(/\r/g, "\\r")
          .replace(/\n/g, "\\n")
          .replace(/"/g, '\\"');
        json.push('"' + key + '":"' + strVal + '"');
      }
    }
  }
  return "{" + json.join(",") + "}";
}

try {
  main();
} catch (err) {
  alert('Script Error: ' + err.message + ' (Line: ' + err.line + ')', 'Ai2Psd_Pro Error');
}