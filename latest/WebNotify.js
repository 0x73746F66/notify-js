/**
 * @class WebNotify
 * @version 0.2.0
 */
(function(window, undefined){
  /**
   * @class WebNotify constructor
   * @returns WebNotify
   */
  var WebNotify = function WebNotify(options)
  {
    if (window === this){ return new WebNotify(options); }
    if ('undefined' === typeof options) options = {};
    this.icon = options.icon||false;
    this.isSupported = false;
    this.hasPermission = false;
    this.hasUnity = false;
    this.disableNotifications = !!options.disableNotifications||false;
    this.disabledOnTabFocussed = !!options.disabledOnTabFocussed||false;
    this.inFocus = true;
    var that = this;

    if ('undefined' !== typeof external.getUnityObject) {
      this.Unity = external.getUnityObject(options.unityVersion||1.0);
      this.Unity.init({
        name: options.appName||"Javascript.WebNotify",
        iconUrl: options.icon||null,
        onInit: function(){that.hasUnity = true;}
      });
    }

    try {
      var hidden, visibilityChange;
      if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
        hidden = "hidden";
        visibilityChange = "visibilitychange";
      } else if (typeof document.mozHidden !== "undefined") {
        hidden = "mozHidden";
        visibilityChange = "mozvisibilitychange";
      } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
      } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
      }
      if (typeof document.addEventListener !== 'undefined' && typeof document[hidden] !== 'undefined') {
        document.addEventListener(visibilityChange, function(){
          that.inFocus = !document[hidden];
        }, false);
      }
      this.isSupported = !!(/* Safari, Chrome */window.Notification || /* Chrome & ff-html5notifications plugin */window.webkitNotifications || /* Firefox Mobile */navigator.mozNotification || /* IE9+ */(window.external && window.external.msIsSiteMode() !== undefined));
    } catch (e) {}

    return this;
  };
  WebNotify.fn = WebNotify.prototype = {
    /**
     * setConfig
     * @returns WebNotify
     */
    setConfig: function setConfig(options){
      if ('undefined' === typeof options) options = {};
      this.icon = options.icon||false;
      this.disableNotifications = !!options.disableNotifications||false;
      this.disabledOnTabFocussed = !!options.disabledOnTabFocussed||false;

      return this;
    },
    /**
     * getWindowsBadge
     * @param url string
     * @param polling integer Allowed:  30, 60, 360 (6 hours), 720 (12 hours), and 1440 (1 day)
     * @returns string
     */
    getWindowsBadgeMetaTag: function getWindowsBadgeMetaTag(url, polling) { //for badge schema see: https://msdn.microsoft.com/en-us/library/ie/br212849.aspx
      url = url || 'https://www.domain.com/windows-polling-icon-state.xml';
      polling = polling || 30;
      return '<meta name="msapplication-badge" content="frequency='+polling+'; polling-uri='+url+'"/>';
    },
    /**
     * refreshWindowsBadge
     * @returns WebNotify
     */
    refreshWindowsBadge: function refreshWindowsBadge(){
      if (window.external && window.external.msSiteModeRefreshBadge)
        window.external.msSiteModeRefreshBadge();
      return this;
    },
    /**
     * requestPermission
     * @returns WebNotify
     */
    requestPermission: function requestPermission() {
      if (this.isSupported && this.checkPermission() && !this.hasPermission){
        if (window.webkitNotifications && window.webkitNotifications.checkPermission) {
          window.webkitNotifications.requestPermission();
        } else if (window.Notification && window.Notification.requestPermission) {
          window.Notification.requestPermission();
        }
      }
      return this;
    },
    /**
     * checkPermission
     * @returns string
     */
    checkPermission: function checkPermission() {
      var PERMISSION_DEFAULT = "default",
          PERMISSION_GRANTED = "granted",
          PERMISSION_DENIED = "denied",
          PERMISSIONS = [PERMISSION_GRANTED, PERMISSION_DEFAULT, PERMISSION_DENIED],
          permission = PERMISSION_DENIED;

      if (window.webkitNotifications && window.webkitNotifications.checkPermission) {
        permission = PERMISSIONS[window.webkitNotifications.checkPermission()];
      } else if (this.hasUnity) {
        permission = PERMISSION_GRANTED;
      } else if (navigator.mozNotification) {
        permission = PERMISSION_GRANTED;
      } else if (window.Notification && window.Notification.permission) {
        permission = window.Notification.permission; }

      this.hasPermission = (permission === PERMISSION_GRANTED);
      return permission;
    },
    /**
     * createNotification
     * @param title string required
     * @param options object optional
     * @returns WebNotify
     */
    createNotification: function createNotification(title, options) {
      if ('undefined' === typeof options) options = {};
      if (this.isSupported && this.checkPermission() && this.hasPermission && !this.disableNotifications && (!this.disabledOnTabFocussed || (this.disabledOnTabFocussed && !this.inFocus))) {
        var notification;
        if (this.hasUnity) {
          this.Unity.Notification.showNotification(title, options.body||'', options.icon||this.icon||null);
        } else if (window.Notification) {
          notification = new window.Notification(title, {
            icon: options.icon||this.icon||"",
            body: options.body||"",
            tag: options.tag||"",
            dir: options.dir||"ltr",
            lang: options.lang||"en-US"
          });
        } else if (window.webkitNotifications) {
          notification = window.webkitNotifications.createNotification(options.icon||this.icon||null, title, options.body||'');
          notification.show();
        } else if (navigator.mozNotification) {
          notification = navigator.mozNotification.createNotification(title, options.body||'', options.icon||this.icon||null);
          notification.show();
        }
        if ('function' === typeof options.onshow){
          notification.onshow = options.onshow;
        }
        if ('function' === typeof options.onclick){
          notification.onclick = options.onclick;
        }
        if ('function' === typeof options.onclose){
          notification.onclose = options.onclose;
        }
        if ('function' === typeof options.onerror){
          notification.onerror = options.onerror;
        }
      }
      return this;
    }
  };
  window.WebNotify = WebNotify;
})(window);