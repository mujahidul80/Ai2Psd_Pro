/*
  Ai2Psd_Pro.jsx for Adobe Illustrator
  Description: Fast vector path preparation & export from AI to layered PSD.
  Requirements: Adobe Illustrator CS6 and later
  Edition: Pro Licensed Version (Self-Registration + HWID + 7-Day Auto Check)
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false);
$.localize = true;

// ==========================================
// GOOGLE SCRIPT LICENSE CONFIGURATION
// ==========================================
var LICENSE_CFG = {
  apiUrl: 'https://script.google.com/macros/s/AKfycby9-GyRG5SWyUvoUHuEhtX_DY0n8KjEH_M8TYMAF3eCYpRnED9mJXNyE5hrIZ-FwCQr/exec',
  supportUrl: 'https://mujahidulib.blogspot.com',
  licFile: Folder.myDocuments + '/Adobe Scripts/Ai2Psd_Pro_lic.json',
  checkIntervalDays: 7 // প্রতি ৭ দিন পর পর অনলাইনে চেক করবে
};

/**
 * কাস্টম ভেক্টর মনোগ্রাম লোগো ড্রয়িং (MI - Brand Emblem)
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
 * ইন্টারঅ্যাক্টিভ টেক্সট স্টাইলিং (সাধারণ ও মিনিমাল মোডসহ)
 */
function setupActionLink(textCtrl, onClickFn, isSubtle) {
  var isDarkUI = app.preferences.getRealPreference('uiBrightness') <= 0.5;
  var gfx = textCtrl.graphics;
  var colNormal, colHover;

  if (isSubtle) {
    // চোখে কম পড়ে এমন মিনিমাল ও সফট কালার
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
 * পিসির ইউনিক হার্ডওয়্যার আইডি (HWID) বের করা
 */
function getMachineHWID() {
  var isMac = /mac/i.test($.os);
  var outFile = new File(Folder.temp + '/ai2psd_pro_hwid.txt');
  if (outFile.exists) outFile.remove();

  if (isMac) {
    var shFile = new File(Folder.temp + '/ai2psd_pro_hwid.sh');
    shFile.open('w');
    shFile.writeln('#!/bin/bash');
    shFile.writeln('ioreg -rd1 -c IOPlatformExpertDevice | awk \'/IOPlatformUUID/ { split($0, line, "\\""); printf("%s", line[4]); }\' > "' + outFile.fsName + '"');
    shFile.close();
    shFile.execute();
    $.sleep(1000);
    if (shFile.exists) shFile.remove();
  } else {
    var vbsFile = new File(Folder.temp + '/ai2psd_pro_hwid.vbs');
    vbsFile.open('w');
    vbsFile.writeln('Set objWMIService = GetObject("winmgmts:\\\\.\\root\\cimv2")');
    vbsFile.writeln('Set colItems = objWMIService.ExecQuery("Select * from Win32_ComputerSystemProduct")');
    vbsFile.writeln('For Each objItem in colItems');
    vbsFile.writeln('  uuid = objItem.UUID');
    vbsFile.writeln('Next');
    vbsFile.writeln('Set fso = CreateObject("Scripting.FileSystemObject")');
    vbsFile.writeln('Set f = fso.CreateTextFile("' + outFile.fsName + '", True)');
    vbsFile.writeln('f.Write uuid');
    vbsFile.writeln('f.Close');
    vbsFile.close();

    vbsFile.execute();

    for (var i = 0; i < 30; i++) {
      $.sleep(100);
      if (outFile.exists && outFile.length > 0) break;
    }
    if (vbsFile.exists) vbsFile.remove();
  }

  var hwid = '';
  if (outFile.exists) {
    outFile.open('r');
    hwid = outFile.read().replace(/^\uFEFF/, '').replace(/^\s+|\s+$/g, '');
    outFile.close();
    outFile.remove();
  }

  if (!hwid || hwid.length < 5) {
    var comp = $.getenv('COMPUTERNAME') || $.getenv('HOSTNAME') || 'PC';
    var usr = $.getenv('USERNAME') || $.getenv('USER') || 'USER';
    hwid = comp + '-' + usr;
  }
  return hwid;
}

function readLicenseData() {
  var f = new File(LICENSE_CFG.licFile);
  if (!f.exists) return null;
  try {
    f.encoding = 'UTF-8';
    f.open('r');
    var str = f.read();
    f.close();
    return new Function('return (' + str + ')')();
  } catch (e) {
    return null;
  }
}

function saveLicenseData(key, timestamp) {
  var dir = Folder(Folder.myDocuments + '/Adobe Scripts/');
  if (!dir.exists) dir.create();
  var f = new File(LICENSE_CFG.licFile);
  f.encoding = 'UTF-8';
  f.open('w');
  f.write(stringify({
    key: key,
    lastCheck: timestamp.toString()
  }));
  f.close();
}

function removeLicenseData() {
  var f = new File(LICENSE_CFG.licFile);
  if (f.exists) f.remove();
}

/**
 * সেলফ-রেজিস্ট্রেশন ডায়ালগ (ছোট Support বাটন ও MI Creative Studio লিংকসহ)
 */
function showRegistrationDialog() {
  var isMac = /mac/i.test($.os);
  var isDarkUI = app.preferences.getRealPreference('uiBrightness') <= 0.5;
  var regName = null;

  var regDlg = new Window('dialog', 'Ai2Psd_Pro — Get License');
      regDlg.orientation = 'column';
      regDlg.alignChildren = ['fill', 'top'];
      regDlg.spacing = 12;
      regDlg.margins = [18, 18, 18, 14];

  // HEADER + SMALL SUPPORT BUTTON
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

  var appTitle = titleCol.add('statictext', undefined, 'Instant Registration');
      appTitle.graphics.font = ScriptUI.newFont(appTitle.graphics.font.name, 'BOLD', 13.5);

  var appSub = titleCol.add('statictext', undefined, 'WORKSTATION LICENSE');
      appSub.graphics.font = ScriptUI.newFont(appSub.graphics.font.name, 'REGULAR', 8.5);
      var subPen = appSub.graphics.newPen(appSub.graphics.PenType.SOLID_COLOR, isDarkUI ? [0.55, 0.65, 0.78] : [0.40, 0.45, 0.52], 1);
      appSub.graphics.foregroundColor = subPen;

  // চোখে কম পড়ে এমন ছোট Support বাটন
  var supBtn = headerGrp.add('button', undefined, 'Support');
      supBtn.preferredSize = [54, 20];
      supBtn.graphics.font = ScriptUI.newFont(supBtn.graphics.font.name, 'REGULAR', 9);
      supBtn.onClick = function () { openURL(LICENSE_CFG.supportUrl); };

  // REGISTRATION CARD
  var regPnl = regDlg.add('panel', undefined, 'Workstation Details');
      regPnl.orientation = 'column';
      regPnl.alignChildren = ['fill', 'top'];
      regPnl.margins = [14, 18, 14, 14];
      regPnl.spacing = 10;

  var descTxt = regPnl.add('statictext', undefined, 'Enter your full name below to generate an instant license key bound to this PC:', { multiline: true });
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

  var hintTxt = regPnl.add('statictext', undefined, '\u2713 Instant activation  |  1 License per workstation');
      hintTxt.graphics.font = ScriptUI.newFont(hintTxt.graphics.font.name, 'ITALIC', 9.5);
      var mutedPen = hintTxt.graphics.newPen(hintTxt.graphics.PenType.SOLID_COLOR, isDarkUI ? [0.55, 0.60, 0.68] : [0.45, 0.48, 0.54], 1);
      hintTxt.graphics.foregroundColor = mutedPen;

  // BUTTONS
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

  // FOOTER (MI Creative Studio clickable -> Blogspot)
  var footGrp = regDlg.add('group');
      footGrp.orientation = 'row';
      footGrp.alignChildren = ['fill', 'center'];

  var brandTag = footGrp.add('statictext', undefined, 'MI Creative Studio');
      brandTag.justify = 'left';
      brandTag.graphics.font = ScriptUI.newFont(brandTag.graphics.font.name, 'BOLD', 9.5);
      setupActionLink(brandTag, function () { openURL(LICENSE_CFG.supportUrl); }, true);

  var supLink = footGrp.add('statictext', undefined, 'Support');
      supLink.justify = 'right';
      supLink.graphics.font = ScriptUI.newFont(supLink.graphics.font.name, 'REGULAR', 9);
      setupActionLink(supLink, function () { openURL(LICENSE_CFG.supportUrl); }, true);

  genBtn.onClick = function () {
    var val = nameInp.text.replace(/^\s+|\s+$/g, '');
    if (val.length < 2) {
      alert('Please enter your valid name (at least 2 characters).', 'Ai2Psd_Pro');
      return;
    }
    genBtn.text = 'Generating Key...';
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
  return regName;
}

/**
 * প্রিমিয়াম ও প্রফেশনাল অ্যাক্টিভেশন ডায়ালগ (ছোট Support বাটন ও MI Creative Studio লিংকসহ)
 */
function showActivationDialog(statusMsg, isError) {
  var isMac = /mac/i.test($.os);
  var isDarkUI = app.preferences.getRealPreference('uiBrightness') <= 0.5;
  var actionResult = null;

  var dlg = new Window('dialog', 'Ai2Psd_Pro — License Activation');
      dlg.orientation = 'column';
      dlg.alignChildren = ['fill', 'top'];
      dlg.spacing = 12;
      dlg.margins = [18, 18, 18, 14];

  // 1. TOP BRAND HEADER + SMALL SUPPORT BUTTON
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

  var appSub = titleCol.add('statictext', undefined, 'VECTOR-TO-PSD ENGINE');
      appSub.graphics.font = ScriptUI.newFont(appSub.graphics.font.name, 'REGULAR', 8.5);
      var subPen = appSub.graphics.newPen(appSub.graphics.PenType.SOLID_COLOR, isDarkUI ? [0.55, 0.65, 0.78] : [0.40, 0.45, 0.52], 1);
      appSub.graphics.foregroundColor = subPen;

  // ছোট ও মিনিমাল Support বাটন (চোখে কম পড়বে)
  var supBtn = headerGrp.add('button', undefined, 'Support');
      supBtn.preferredSize = [54, 20];
      supBtn.graphics.font = ScriptUI.newFont(supBtn.graphics.font.name, 'REGULAR', 9);
      supBtn.onClick = function () { openURL(LICENSE_CFG.supportUrl); };

  // 2. LICENSE INPUT CARD
  var cardPnl = dlg.add('panel', undefined, 'Product Activation');
      cardPnl.orientation = 'column';
      cardPnl.alignChildren = ['fill', 'top'];
      cardPnl.margins = [14, 18, 14, 14];
      cardPnl.spacing = 10;

  var msgTxt = cardPnl.add('statictext', undefined, statusMsg || 'Enter your License Key to unlock Ai2Psd_Pro, or click "Get License" below to register instantly.', { multiline: true });
      msgTxt.preferredSize.width = 315;
      if (isError) {
        var errPen = msgTxt.graphics.newPen(msgTxt.graphics.PenType.SOLID_COLOR, isDarkUI ? [1.0, 0.45, 0.45] : [0.80, 0.12, 0.12], 1);
        msgTxt.graphics.foregroundColor = errPen;
      }

  var inputBoxGrp = cardPnl.add('group');
      inputBoxGrp.orientation = 'column';
      inputBoxGrp.alignChildren = ['fill', 'top'];
      inputBoxGrp.spacing = 4;

  var keyLbl = inputBoxGrp.add('statictext', undefined, 'LICENSE KEY');
      keyLbl.graphics.font = ScriptUI.newFont(keyLbl.graphics.font.name, 'BOLD', 9);

  var keyInp = inputBoxGrp.add('edittext', undefined, '');
      keyInp.preferredSize = [315, 28];
      keyInp.active = true;

  var infoRow = cardPnl.add('group');
      infoRow.orientation = 'row';
      infoRow.alignChildren = ['fill', 'center'];

  var shieldTxt = infoRow.add('statictext', undefined, '\u25CF Hardware-Bound  |  7-Day Auto Sync');
      shieldTxt.graphics.font = ScriptUI.newFont(shieldTxt.graphics.font.name, 'ITALIC', 9.5);
      var mutedPen = shieldTxt.graphics.newPen(shieldTxt.graphics.PenType.SOLID_COLOR, isDarkUI ? [0.55, 0.60, 0.68] : [0.45, 0.48, 0.54], 1);
      shieldTxt.graphics.foregroundColor = mutedPen;

  // 3. ACTION BUTTONS
  var btnGrp = dlg.add('group');
      btnGrp.orientation = 'row';
      btnGrp.alignChildren = ['fill', 'center'];
      btnGrp.spacing = 8;

  var cancelBtn, getLicBtn, actBtn;
  if (isMac) {
    cancelBtn = btnGrp.add('button', undefined, 'Exit', { name: 'cancel' });
    getLicBtn = btnGrp.add('button', undefined, 'Get License');
    actBtn = btnGrp.add('button', undefined, 'Activate', { name: 'ok' });
  } else {
    actBtn = btnGrp.add('button', undefined, 'Activate', { name: 'ok' });
    getLicBtn = btnGrp.add('button', undefined, 'Get License');
    cancelBtn = btnGrp.add('button', undefined, 'Exit', { name: 'cancel' });
  }
  actBtn.preferredSize.height = 28;
  getLicBtn.preferredSize.height = 28;
  cancelBtn.preferredSize.height = 28;

  // 4. FOOTER (MI Creative Studio ক্লিক করলে Blogspot ওপেন হবে)
  var footGrp = dlg.add('group');
      footGrp.orientation = 'row';
      footGrp.alignChildren = ['fill', 'center'];

  var brandTag = footGrp.add('statictext', undefined, 'MI Creative Studio');
      brandTag.justify = 'left';
      brandTag.graphics.font = ScriptUI.newFont(brandTag.graphics.font.name, 'BOLD', 9.5);
      setupActionLink(brandTag, function () { openURL(LICENSE_CFG.supportUrl); }, true);

  var getLicLink = footGrp.add('statictext', undefined, 'Get License Key \u2726');
      getLicLink.justify = 'right';
      getLicLink.graphics.font = ScriptUI.newFont(getLicLink.graphics.font.name, 'BOLD', 9.5);

  function triggerGetLicense() {
    dlg.close();
    var userName = showRegistrationDialog();
    if (userName) {
      actionResult = { mode: 'register', value: userName };
    } else {
      actionResult = { mode: 'reopen' };
    }
  }

  setupActionLink(getLicLink, triggerGetLicense, false);
  getLicBtn.onClick = triggerGetLicense;

  actBtn.onClick = function () {
    var val = keyInp.text.replace(/^\s+|\s+$/g, '');
    if (!val) {
      alert('Please enter your License Key or click "Get License".', 'Ai2Psd_Pro');
      return;
    }
    actBtn.text = 'Verifying...';
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
  return actionResult;
}

/**
 * অনলাইন সার্ভার কমিউনিকেশন
 */
function callLicenseServer(queryParams) {
  var isMac = /mac/i.test($.os);
  var outFile = new File(Folder.temp + '/ai2psd_pro_res.json');
  var doneFile = new File(Folder.temp + '/ai2psd_pro_done.flag');
  if (outFile.exists) outFile.remove();
  if (doneFile.exists) doneFile.remove();

  var fullUrl = LICENSE_CFG.apiUrl + '?' + queryParams;

  if (isMac) {
    var shFile = new File(Folder.temp + '/ai2psd_pro_req.sh');
    shFile.open('w');
    shFile.writeln('#!/bin/bash');
    shFile.writeln('curl -s -L "' + fullUrl + '" -o "' + outFile.fsName + '"');
    shFile.writeln('echo "done" > "' + doneFile.fsName + '"');
    shFile.close();
    shFile.execute();

    for (var m = 0; m < 100; m++) {
      $.sleep(150);
      if (doneFile.exists) break;
    }
    if (shFile.exists) shFile.remove();
    if (doneFile.exists) doneFile.remove();
  } else {
    var vbsFile = new File(Folder.temp + '/ai2psd_pro_req.vbs');
    vbsFile.open('w');
    vbsFile.writeln('On Error Resume Next');
    vbsFile.writeln('Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")');
    vbsFile.writeln('http.setTimeouts 5000, 5000, 10000, 15000');
    vbsFile.writeln('http.Open "GET", "' + fullUrl + '", False');
    vbsFile.writeln('http.Send');
    vbsFile.writeln('Set fso = CreateObject("Scripting.FileSystemObject")');
    vbsFile.writeln('Set f = fso.CreateTextFile("' + outFile.fsName + '", True, True)');
    vbsFile.writeln('If Err.Number = 0 And http.Status = 200 Then');
    vbsFile.writeln('  f.Write http.responseText');
    vbsFile.writeln('Else');
    vbsFile.writeln('  f.Write "{""status"":""net_error"",""message"":""Connection Error (" & http.Status & "): " & Replace(Err.Description, """", "") & """}"');
    vbsFile.writeln('End If');
    vbsFile.writeln('f.Close');
    vbsFile.writeln('Set flag = fso.CreateTextFile("' + doneFile.fsName + '", True)');
    vbsFile.writeln('flag.Write "1"');
    vbsFile.writeln('flag.Close');
    vbsFile.close();

    vbsFile.execute();

    for (var w = 0; w < 150; w++) {
      $.sleep(100);
      if (doneFile.exists) break;
    }
    if (vbsFile.exists) vbsFile.remove();
    if (doneFile.exists) doneFile.remove();
  }

  if (outFile.exists) {
    outFile.encoding = isMac ? 'UTF-8' : 'UTF-16';
    outFile.open('r');
    var raw = outFile.read().replace(/^\uFEFF/, '').replace(/^\s+|\s+$/g, '');
    outFile.close();
    outFile.remove();

    try {
      var parsed = new Function('return (' + raw + ')')();
      if (parsed && parsed.status) {
        return parsed;
      }
    } catch (e) {
      return {
        status: 'net_error',
        message: 'Unexpected response from license server.'
      };
    }
  }

  return {
    status: 'net_error',
    message: 'Unable to reach activation server. Please check your internet connection.'
  };
}

/**
 * লাইসেন্স ম্যানেজার (৭ দিন অটো-চেক + সেলফ-রেজিস্ট্রেশন)
 */
function verifyLicense() {
  var saved = readLicenseData();
  var now = new Date().getTime();
  var sevenDaysMs = LICENSE_CFG.checkIntervalDays * 24 * 60 * 60 * 1000;

  if (saved && saved.key && saved.lastCheck) {
    var lastTime = parseFloat(saved.lastCheck);
    if (!isNaN(lastTime) && (now - lastTime) < sevenDaysMs) {
      return true;
    }
  }

  var hwid = getMachineHWID();

  if (saved && saved.key) {
    var recheckRes = callLicenseServer('action=verify&key=' + encodeURIComponent(saved.key) + '&hwid=' + encodeURIComponent(hwid));
    if (recheckRes.status === 'valid') {
      saveLicenseData(saved.key, now);
      return true;
    } else if (recheckRes.status === 'error') {
      removeLicenseData();
      return handleActivationFlow('7-Day Verification Failed: ' + recheckRes.message + '\nPlease enter a valid/renewed key:', true, hwid, now);
    } else {
      alert('7-Day Periodic Verification Required:\n' + recheckRes.message, 'Ai2Psd_Pro');
      return false;
    }
  }

  return handleActivationFlow(null, false, hwid, now);
}

function handleActivationFlow(initialMsg, isError, hwid, now) {
  var msg = initialMsg;
  var errState = isError;

  while (true) {
    var action = showActivationDialog(msg, errState);
    if (!action) return false;

    if (action.mode === 'reopen') {
      continue;
    }

    if (action.mode === 'register') {
      var regRes = callLicenseServer('action=register&name=' + encodeURIComponent(action.value) + '&hwid=' + encodeURIComponent(hwid));
      if (regRes.status === 'valid' && regRes.key) {
        saveLicenseData(regRes.key, now);
        alert(regRes.message || ('Activated! Your License Key: ' + regRes.key), 'Ai2Psd_Pro');
        return true;
      } else {
        msg = regRes.message || 'Registration failed. Please try again.';
        errState = true;
      }
    } else if (action.mode === 'activate') {
      var verRes = callLicenseServer('action=verify&key=' + encodeURIComponent(action.value) + '&hwid=' + encodeURIComponent(hwid));
      if (verRes.status === 'valid') {
        saveLicenseData(action.value, now);
        alert(verRes.message || 'Ai2Psd_Pro has been activated successfully!', 'Ai2Psd_Pro');
        return true;
      } else {
        removeLicenseData();
        msg = verRes.message || 'Invalid License Key. Please try again.';
        errState = true;
      }
    }
  }
}
// ==========================================

function main() {
  if (!verifyLicense()) {
    return;
  }

  var SCRIPT = {
    name: 'Ai2Psd_Pro',
    version: 'v4.5'
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
    errApp: { en: 'Wrong application\nRun script from Adobe Illustrator',
              ru: 'Неправильная программа\nЗапустите скрипт в Adobe Illustrator' },
    errVer: { en: 'Wrong app version\nSorry, script only works in Illustrator CS6 and later',
              ru: 'Неподходящая версия\nСкрипт работает в Illustrator CS6 и выше' },
    errScale: { en: 'UI Scaling\nDue to scaling Preferences > User Interface > UI Scaling ' + 
                    'the Resolution dropdown list will not display correctly',
              ru: 'UI Scaling\nИз-за масштабирования Preferences > User Interface > UI Scaling ' + 
                  'выпадающий список Resolution отобразится некорректно' },
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
    opts: { en: 'Shape Options', ru: 'Настройки фигур' },
    expandComp: { en: 'Expand Compound Shapes to Solid (No extra merge needed)', ru: 'Разобрать составные фигуры в сплошные' },
    of: { en: ' of ', ru: ' из ' },
    cancel: { en: 'Cancel', ru: 'Закрыть' },
    ok: { en: 'Export', ru: 'Экспортировать' },
    brand: { en: 'MI Creative Studio', ru: 'MI Creative Studio' },
    licStatus: { en: 'Pro Licensed \u2713', ru: 'Pro Licensed \u2713' },
    done: { en: 'Exporting process is complete!\n'
          + 'Open documents have been changed. To restore the last save select File > Revert.',
          ru: 'Экспорт завершен!\n'
          + 'Открытые документы были изменены. Для восстановления выберите Файл > Восстановить.' }
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

  // BRAND HEADER IN MAIN WINDOW + SMALL SUPPORT BUTTON
  var topBrandGrp = win.add('group');
      topBrandGrp.orientation = 'row';
      topBrandGrp.alignChildren = ['fill', 'center'];
      topBrandGrp.spacing = 8;

  var topLeft = topBrandGrp.add('group');
      topLeft.orientation = 'row';
      topLeft.alignChildren = ['left', 'center'];
      topLeft.spacing = 8;

  drawBrandLogo(topLeft, 26);

  var topTitle = topLeft.add('statictext', undefined, 'Ai2Psd_Pro  |  PSD Exporter');
      topTitle.graphics.font = ScriptUI.newFont(topTitle.graphics.font.name, 'BOLD', 11);

  var mainSupBtn = topBrandGrp.add('button', undefined, 'Support');
      mainSupBtn.preferredSize = [52, 20];
      mainSupBtn.graphics.font = ScriptUI.newFont(mainSupBtn.graphics.font.name, 'REGULAR', 8.5);
      mainSupBtn.onClick = function () { openURL(LICENSE_CFG.supportUrl); };

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

  // TWO COLUMN LAYOUT
  var row = win.add('group');
      row.alignChildren = ['fill', 'fill'];

  // RESOLUTION PANEL
  var resPnl = row.add('panel', undefined, LANG.res);
      resPnl.alignChildren = 'fill';
      resPnl.margins = CFG.mgns;

  var ppiList = resPnl.add('dropdownlist', undefined, [LANG.low, LANG.mid, LANG.high, '-', LANG.other]);
      ppiList.selection = 0;

  var ppiInp = resPnl.add('edittext', undefined, '96');
      ppiInp.characters = 5;
  resPnl.add('statictext', undefined, LANG.rangeTip);

  // COLOR MODEL PANEL
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

  // ENHANCED PROGRESS BAR PANEL
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

  // FOOTER (MI Creative Studio clickable -> Blogspot)
  var copyGrp = win.add('group');
      copyGrp.orientation = 'row';
      copyGrp.alignChildren = ['fill', 'center'];

  var brandLbl = copyGrp.add('statictext', undefined, '\u00A9 ' + LANG.brand);
      brandLbl.justify = 'left';
      setupActionLink(brandLbl, function () { openURL(LICENSE_CFG.supportUrl); }, true);

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
  }

  allDocRb.onClick = function () {
    if (!this.enabled) return;
    if (!rangeAbRb.value) allAbRb.value = true;
    actAbRb.enabled = false;
    folRb.value = false;
    isSubfol.enabled = false;
    progLbl.text = 'Doc: 1' + LANG.of + app.documents.length;
  }

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
  }

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
  }

  isSubfol.onClick = function () {
    if (!folPath.length) return;
    srcFiles = getFolderFiles(folPath, ['ai', 'eps', 'svg'], isSubfol.enabled && isSubfol.value);
    progLbl.text = 'Doc: 1' + LANG.of + srcFiles.length;
  }

  isSaveAbs.onClick = function () { 
    abGrp.enabled = this.value;
    actAbRb.enabled = abGrp.enabled && actDocRb.value;
    rangeInp.enabled = rangeAbRb.value;
  }

  allAbRb.onClick = actAbRb.onClick = function () {
    if (!this.enabled) return;
    rangeAbRb.value = rangeInp.enabled = false;
  }

  rangeAbRb.onClick = function () { 
    allAbRb.value = actAbRb.value = false;
    rangeInp.enabled = true;
  }

  ppiList.onChange = function () {
    ppiInp.enabled = (/other|другое/i.test(this.selection.text));
  }

  cancel.onClick = win.close;
  ok.onClick = okClick;

  loadSettings(SETTINGS);

  function okClick() {
    saveSettings(SETTINGS);

    var docs = [];
    var currDoc;
    var isSuccess = false;

    if (folRb.value) {
      docs = [].concat(srcFiles);
    } else if (allDocRb.value) {
      docs = get(app.documents);
    } else {
      docs = [app.activeDocument];
    }

    progLbl.text = 'Doc: 1' + LANG.of + docs.length;
    addCompShapeAction(CFG.actSet, CFG.actName, CFG.actPath);

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

        try { 
          process(currDoc, win, progBar, pctLbl, CFG, isExpandComp.value); 
        } catch (err) {}

        currDoc.activate();

        var psdOpts = setExportOptions(currDoc);
        isSuccess = exportAsPsd(currDoc, psdOpts);

        if (folRb.value) {
          app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
        }
      }
    } catch (err) {}

    try {
      app.unloadAction(CFG.actSet, '');
    } catch (err) {}

    if (isSuccess) alert(LANG.done, 'Ai2Psd_Pro');
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
    data.res = ppiList.selection.index;
    data.ppi = ppiInp.text;
    data.color = origColRb.value ? 0 : (rgbRb.value ? 1 : 2);
    data.expand = isExpandComp.value;

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
        try { var data = new Function('return (' + json + ')')(); }
        catch (err) {}
        f.close();

        if (typeof data != 'undefined') {
          win.location = [
            data.win_x && !isNaN(parseInt(data.win_x)) ? parseInt(data.win_x) : 300,
            data.win_y && !isNaN(parseInt(data.win_y)) ? parseInt(data.win_y) : 300
          ];
          if (data.src == 0) actDocRb.notify('onClick');
          else if (data.src == 1) allDocRb.notify('onClick');
          else folRb.notify('onClick');
          isSubfol.value = data.subfol === 'true';
          isSaveAbs.value = data.multi === 'true';
          if (data.abs == 0) allAbRb.notify('onClick');
          else if (data.abs == 1) actAbRb.notify('onClick');
          else rangeAbRb.notify('onClick');
          rangeInp.text = data.range;
          ppiList.selection = parseInt(data.res) || 0;
          ppiInp.text = data.ppi;
          if (data.color == 0) origColRb.value = true;
          else if (data.color == 1) rgbRb.value = true;
          else cmykRb.value = true;
          if (data.expand !== undefined) isExpandComp.value = data.expand === 'true';
        }
      } catch (err) {}
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
    var range = actAbRb.enabled && actAbRb.value ? actAbIdx + 1 : '';

    var opts = new ExportOptionsPhotoshop();
    opts.antiAliasing = CFG.aa;
    opts.editableText = CFG.editTxt;
    opts.embedICCProfile = CFG.embedIcc;
    opts.maximumEditability = true;
    opts.resolution = ppi;
    opts.saveMultipleArtboards = isSaveAbs.value;
    opts.warnings = false;
    opts.writeLayers = true;

    var imgCol;
    if (origColRb.value) {
      imgCol = /rgb/i.test(doc.documentColorSpace) ? ImageColorSpace.RGB : ImageColorSpace.CMYK;
    } else if (rgbRb.value) {
      app.executeMenuCommand('doc-color-rgb');
      imgCol = ImageColorSpace.RGB;
    } else {
      app.executeMenuCommand('doc-color-cmyk');
      imgCol = ImageColorSpace.CMYK;
    }

    opts.imageColorSpace = imgCol;

    if (rangeAbRb.value) {
      range = parseAndFilterIndexes(rangeInp.text, doc.artboards.length);
      for (var i = 0; i < range.length; i++) {
        range[i] = (range[i] < 9 ? '0' : '') + (range[i] + 1).toString();
      }
      range = '' + range.join();
    }

    opts.artboardRange = range;
    return opts;
  }

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
  try {
    var filesArr = folder.getFiles();
  } catch(err) {
    return [];
  }

  var currFile = null;
  var regex = new RegExp(extensions.join('|'));

  for (var i = 0, len = filesArr.length; i < len; i++) {
    currFile = filesArr[i];
    try {
      if (isDeep && currFile instanceof Folder) {
        results = results.concat(getFolderFiles(currFile, extensions, isDeep));
      } else if (currFile instanceof File) {
        if (!/^\._|ds_store/.test(currFile.name) &&
            regex.test(/\.[^\.]+$/g.exec(currFile.name.toLowerCase())[0])) {
          results.push(currFile);
        }
      }
    } catch(err) {}
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
    '}'].join('');

  try { app.unloadAction(set, ''); } catch (err) {}
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
  return hex.replace(/./g, function(a) {
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

  app.executeMenuCommand('selectall');
  var docItems = getItems(app.selection);
  var len = docItems.length;

  var updateStep = Math.max(1, Math.floor(len / 20)); 

  for (var i = len - 1; i >= 0; i--) {
    var item = docItems[i];
    convertItem(item, pref.actName, pref.actSet, expandToSolid);

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

function unlockAll(doc) {
  unlockLayers(doc.layers);
  app.executeMenuCommand('unlockAll');
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
    if (layers[i].layers.length) {
      limitGroupDepth(layers[i], depth);
    }
  }
}

function groupNormalize(groups, max, counter, dest) {
  var i = groups.length;
  var counter = (counter || 0) + 1;
  if (i > 0) {
    while (i--) {
      if (counter > max) {
        try { var dest = groups[i]; } catch (err) {}
        try {
          if (!groups[i].clipped) {
            moveItems(groups[i].pageItems, dest);
          } else {
            ungroupAll(groups[i]);
          }
        } catch (err) {}
        groupNormalize(groups, max, counter - 1, dest);
      } else {
        try {
          groupNormalize(groups[i].groupItems, max, counter, dest);
        } catch (err) {}
      }
    }
  }
}

function ungroupAll(obj) {
  var childs = getGroupChilds(obj);
  if (!childs.length) obj.remove();

  for (var i = 0, len = childs.length; i < len; i++) {
    var item = childs[i];
    try {
      if (!obj.clipped && isType(item.parent, 'layer')) {
        item.move(obj, ElementPlacement.PLACEBEFORE);
      }
      if (isType(item, 'group|layer')) {
        ungroupAll(item);
      }
    } catch (err) {}
  }
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

function getItems(coll) {
  var results = [];
  for (var i = 0, len = coll.length; i < len; i++) {
    var item = coll[i];
    if (item.pageItems && item.pageItems.length) {
      results = [].concat(results, getItems(item.pageItems));
    } else if (isType(item, 'compound')) {
      if (item.pathItems.length && item.pathItems[0].clipping) continue;
      results.push(item);
    } else if (!item.clipping) {
      results.push(item);
    }
  }
  return results;
}

function isType(item, type) {
  var regexp = new RegExp(type, 'i');
  return regexp.test(item.typename);
}

function convertItem(item, actName, actSet, expandToSolid) {
  var props = {
    name: transliterate(getName(item)),
    opa: item.opacity,
    blend: item.blendingMode
  };
  var prnt = item.parent;
  prnt.name = transliterate(getName(prnt));

  if (isType(prnt, 'group') && prnt.pageItems.length === 1) {
    props.opa = prnt.opacity;
    props.blend = prnt.blendingMode;
  }

  if (isType(item, 'text')) {
    if (!isEmpty(props.name)) item.name = props.name;
    return;
  }

  var tmpPath;
  if (isType(item, 'compound')) {
    if (item.pathItems.length) {
      item = item.pathItems[0];
    } else {
      tmpPath = item.pathItems.add();
      item = tmpPath;
    }
  }

  item.fillOverprint = false;
  item.strokeOverprint = false;

  try {
    if (!isProblemType(item) && isSolidFill(item) && !item.stroked) {
      if (isType(item.parent, 'compound')) {
        item = item.parent;
        if (tmpPath) tmpPath.remove();
      }

      app.selection = [item];
      app.doScript(actName, actSet);

      if (!app.selection.length) {
        try { app.selection = [item]; } catch (err) {}
      }

      if (expandToSolid && app.selection.length) {
        try {
          app.executeMenuCommand('expandStyle');
        } catch (err) {}
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

      var safeGrp = item.layer.groupItems.add();
      safeGrp.move(item, ElementPlacement.PLACEBEFORE);
      item.move(safeGrp, ElementPlacement.PLACEATEND);
      if (!isEmpty(props.name)) safeGrp.name = props.name;
    }
  } catch (err) {}
}

function transliterate(str) {
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

function exportAsPsd(doc, opts) {
  var fol = (doc.path == '' || doc.path.toString().length < 1) ? Folder.desktop : doc.path;
  try {
    var name = doc.name.replace(/\.[^\.]+$/, '') + '.psd';
    var f = new File(decodeURI(fol) + '/' + name);
    doc.exportFile(f, ExportType.PHOTOSHOP, opts);
    return true;
  } catch (err) {
    return false;
  }
}

function openURL(url) {
  var html = new File(Folder.temp.absoluteURI + '/aisLink.html');
  html.open('w');
  var htmlBody = '<html><head><META HTTP-EQUIV=Refresh CONTENT="0; URL=' + url + '"></head><body> <p></body></html>';
  html.write(htmlBody);
  html.close();
  html.execute();
}

function stringify(obj) {
  var json = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var value = obj[key].toString()
        .replace(/\t/g, "\\t")
        .replace(/\r/g, "\\r")
        .replace(/\n/g, "\\n")
        .replace(/"/g, '\\"');
      json.push('"' + key + '":"' + value + '"');
    }
  }
  return "{" + json.join(",") + "}";
}

try {
  main();
} catch (err) {
  alert('Script Error: ' + err.message + ' (Line: ' + err.line + ')', 'Ai2Psd_Pro Error');
}