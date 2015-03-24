/**
 * Class WebNotify
 * Usage:
     var noti = new WebNotify();
     noti.requestPermission();
     $(document).on('visibilitychange',function(){
        if (document.hidden) { //web page is no longer active
          noti.createNotification('We will be ready when you come back back');
          console.log('not in focus');
        } else  {
          console.log('in focus');
        }
      });
 *
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

    if ('undefined' !== typeof external.getUnityObject) {
      var that = this;
      this.Unity = external.getUnityObject(options.unityVersion||1.0);
      this.Unity.init({
        name: options.appName||"Javascript.WebNotify",
        iconUrl: options.icon||null,
        onInit: function(){that.hasUnity = true;}
      });
    }

    try {
      this.isSupported = !!(/* Safari, Chrome */window.Notification || /* Chrome & ff-html5notifications plugin */window.webkitNotifications || /* Firefox Mobile */navigator.mozNotification || /* IE9+ */(window.external && window.external.msIsSiteMode() !== undefined));
    } catch (e) {}

    return this;
  };
  WebNotify.fn = WebNotify.prototype = {
    /**
     * getWindowsBadge
     * @param url string
     * @param polling integer Allowed:  30, 60, 360 (6 hours), 720 (12 hours), and 1440 (1 day)
     * @returns string
     */
    getWindowsBadgeMetaTag: function (url, polling) { //for badge schema see: https://msdn.microsoft.com/en-us/library/ie/br212849.aspx
      url = url || 'http://www.punters.com.au/windows-polling-icon-state.xml'; // could show when an event is in running??
      polling = polling || 30;
      return '<meta name="msapplication-badge" content="frequency='+polling+'; polling-uri='+url+'"/>';
    },
    /**
     * refreshWindowsBadge
     * @returns WebNotify
     */
    refreshWindowsBadge: function(){
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
      if (this.isSupported && this.checkPermission() && this.hasPermission) {
        var notification;
        if (this.hasUnity) {
          this.Unity.Notification.showNotification(title, options.body||'', options.icon||null);
        } else if (window.Notification) {
          notification = new window.Notification(title, {
            icon: options.icon || "",
            body: options.body || "",
            tag: options.tag || "",
            dir: options.dir || "ltr",
            lang: options.lang || "en-US"
          });
        } else if (window.webkitNotifications) {
          notification = window.webkitNotifications.createNotification(options.icon||null, title, options.body||'');
          notification.show();
        } else if (navigator.mozNotification) {
          notification = navigator.mozNotification.createNotification(title, options.body||'', options.icon||null);
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