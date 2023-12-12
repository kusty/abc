(function (window) {
  'use strict';
  var qMod = {};

  var qmLoader = {};
  var qmodScriptEl = document.getElementById('qmod') || console.log('QMOD: Error. Unable to find QMOD Script ID.');
  var wmid = qmodScriptEl.getAttribute('data-qmod-wmid') || console.log('QMOD: Error. Unable to find Webmaster ID on, QMOD Script ID.');
  var qTools = document.getElementsByClassName('qtool') || console.log('QMOD: Error. No QMOD tools found.');

  var qNonce = qmodScriptEl.getAttribute('data-qmod-nonce') || false;

  var qmodCheckSID = qmodScriptEl.getAttribute('data-qmod-validatesid') || false;
  var qmodOTP = qmodScriptEl.getAttribute('data-qmod-otp') || false;

  var qmodVersion = qmodScriptEl.getAttribute('data-qmod-version') || 'latest';
  var qModVersionType = testVersion(qmodVersion);

  function testVersion(inputVersion) {
    var qTestVersion = inputVersion.substr(1).split('.');
    var qMajor = qTestVersion[0];
    var qMinor = qTestVersion[1];
    var qPatch = parseInt(qTestVersion[2]);

    var qReturn;


    if (inputVersion === 'next' || inputVersion === 'latest') return 2;

    if (qMinor >= 35) {
      qReturn = 2;
    }
    else if (qMinor >= 13) {
      qReturn = 1;
    } else if (qMinor >= 1) {
      qReturn = 0;
    } else {
      if (qPatch < 9) {
        qReturn = -1;
      } else {
        qReturn = 0;
      }
    }
    return qReturn;
  };

  qmLoader.init = function () {
    qMod.toolsetId = Math.random().toString(36).substr(2, 9)
    _getTools();
  };

  function _getTools() {
    var qToolsParam = [];
    for (var i = 0; i < qTools.length; i++) {
      var obj = qTools[i];
      var qTool = obj.getAttribute('data-qmod-tool');
      var tpl = true;

      if (obj.firstChild && obj.firstChild.nodeName == "SCRIPT") {
        tpl = false;
      }
      qMod.tools.push({
        name: qTool,
        tpl: tpl
      });
      qToolsParam.push(qTool);
    }
    if (qModVersionType == 1 || qModVersionType == 2) {
      qToolsParam.sort().filter(function (elem, index, self) {
        return index == self.indexOf(elem);
      }).forEach(function (toolname) {
        _loadAsset('/static/' + qmodVersion + '/' + toolname + '.js');
      })
    } else {
      var qString = qToolsParam.sort().filter(function (elem, index, self) {
        return index == self.indexOf(elem);
      }).join(',');
      if (qModVersionType == 0) {
        _loadAsset('/static/' + qmodVersion + '/' + qString + '.js');
      } else {
        _loadAsset('/script/qmod.js?t=' + qString, qmodVersion);
        _loadAsset('/script/qmod.css?t=' + qString, qmodVersion);
      }
    }
  }

  function _loadTool(toolDiv) {
    var qToolsParam = [];
    var obj = document.getElementById(toolDiv);
    var qTool = obj.getAttribute('data-qmod-tool');
    var tpl = true;

    if (obj.firstChild && obj.firstChild.nodeName == "SCRIPT") {
      tpl = false;
    }
    qMod.tools.push({
      name: qTool,
      tpl: tpl
    });
    qToolsParam.push(qTool);

    if (qModVersionType == 1 || qModVersionType == 2) {
      qToolsParam.sort().filter(function (elem, index, self) {
        return index == self.indexOf(elem);
      }).forEach(function (toolname) {
        _loadAsset('/static/' + qmodVersion + '/' + toolname + '.js');
      })
    } else {
      var qString = qToolsParam.sort().filter(function (elem, index, self) {
        return index == self.indexOf(elem);
      }).join(',');
      if (qModVersionType == 0) {
        _loadAsset('/static/' + qmodVersion + '/' + qString + '.js');
      } else {
        _loadAsset('/script/qmod.js?t=' + qString, qmodVersion);
        _loadAsset('/script/qmod.css?t=' + qString, qmodVersion);
      }
    }
  }

  function _loadAsset(assetName, version) {
    var fRef;
    var fType = assetName.split('.').pop().split('?').shift(); //.split('.')[1].split('?')[0];
    var qmURL = qmodScriptEl.getAttribute('src').replace('/static/js/qmodLoader.js', '').replace('/js/qmodLoader.js', '');


    if (version) {
      assetName = assetName + '&v=' + version;
    }

    if (fType == "js") { //if filename is a external JavaScript file
      fRef = document.createElement('script');
      fRef.setAttribute("type", "text/javascript");
      fRef.setAttribute("src", qmURL + assetName + '?cs='+ qmodVersion);
    } else if (fType == "css") { //if filename is an external CSS file
      fRef = document.createElement("link");
      fRef.setAttribute("rel", "stylesheet");
      fRef.setAttribute("type", "text/css");
      fRef.setAttribute("href", qmURL + assetName+ '?cs='+ qmodVersion);
    }
    if ("undefined" != typeof fRef) {
      if (qNonce) {
        fRef.setAttribute("nonce", qNonce);
      }
      document.getElementsByTagName("head")[0].appendChild(fRef);
    }
      
  }

  function _checkSID() {
    var qmENV = qmodScriptEl.getAttribute('data-qmod-env');
    var qmSID = qmodScriptEl.getAttribute('data-qmod-sid') || false;
    var qmSessionURL = `//${qmENV}.quotemedia.com/auth/v0/session${qmSID ? '?sid='+qmSID : ''}`
    fetch(qmSessionURL, {
      credentials: 'include',
    })
      .then(
        function(response) {
          if (response.status !== 200) {
            document.dispatchEvent(new CustomEvent('QMOD', {
              detail: {
                type: 'VALIDATE:SID',
                value: false
              }
            }))
            return;
          }
        }
      )
      .catch(function(err) {
      });

  }

  if (qmodCheckSID) {
    _checkSID();
  }

  if (qmodOTP) {
    var qmENV = qmodScriptEl.getAttribute('data-qmod-env');
    fetch('//'+qmENV+'.quotemedia.com/auth/authorize/oauth/otp', {
      credentials: 'include',
      headers: {"otp": `${qmodOTP}`}
    })
      .then(
        function(response) {
          if (response.status !== 200) {
            qmodScriptEl.setAttribute('data-qmod-otp', '');
            return;
          }
        }
      );
  }

  qMod.loaderElement = qmodScriptEl;
  qMod.WMID = wmid;
  qMod.version = qmodVersion;
  qMod.tools = [];
  qMod.tooltemplates = [];
  qMod.toolsetId = 'qmInitial';

  qMod.nonce = qNonce ? qNonce : 'QMOD_NOONCE';

  qMod.loadTools = qmLoader.init;
  qMod.loadTool = _loadTool;
  window.qMod = qMod;

  if (qModVersionType == 1 || qModVersionType == 2) {
    _loadAsset('/static/' + qmodVersion + '/vendors.js');
    _loadAsset('/static/' + qmodVersion + '/commons.js');
    if (qModVersionType == 2) {
      _loadAsset('/static/' + qmodVersion + '/lang.js');
    }
  }

  if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive") {
    qmLoader.init();
  } else {
    document.addEventListener("DOMContentLoaded", function (event) {
      qmLoader.init();
    });
  }
})(window);
