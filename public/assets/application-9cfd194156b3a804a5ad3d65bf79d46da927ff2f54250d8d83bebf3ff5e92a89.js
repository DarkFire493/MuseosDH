/*
Unobtrusive JavaScript
https://github.com/rails/rails/blob/master/actionview/app/assets/javascripts
Released under the MIT license
 */


;

(function() {
  (function() {
    (function() {
      this.Rails = {
        linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]',
        buttonClickSelector: {
          selector: 'button[data-remote]:not([form]), button[data-confirm]:not([form])',
          exclude: 'form button'
        },
        inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',
        formSubmitSelector: 'form',
        formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])',
        formDisableSelector: 'input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled',
        formEnableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled',
        fileInputSelector: 'input[name][type=file]:not([disabled])',
        linkDisableSelector: 'a[data-disable-with], a[data-disable]',
        buttonDisableSelector: 'button[data-remote][data-disable-with], button[data-remote][data-disable]'
      };

    }).call(this);
  }).call(this);

  var Rails = this.Rails;

  (function() {
    (function() {
      var expando, m;

      m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;

      Rails.matches = function(element, selector) {
        if (selector.exclude != null) {
          return m.call(element, selector.selector) && !m.call(element, selector.exclude);
        } else {
          return m.call(element, selector);
        }
      };

      expando = '_ujsData';

      Rails.getData = function(element, key) {
        var ref;
        return (ref = element[expando]) != null ? ref[key] : void 0;
      };

      Rails.setData = function(element, key, value) {
        if (element[expando] == null) {
          element[expando] = {};
        }
        return element[expando][key] = value;
      };

      Rails.$ = function(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
      };

    }).call(this);
    (function() {
      var $, csrfParam, csrfToken;

      $ = Rails.$;

      csrfToken = Rails.csrfToken = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-token]');
        return meta && meta.content;
      };

      csrfParam = Rails.csrfParam = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-param]');
        return meta && meta.content;
      };

      Rails.CSRFProtection = function(xhr) {
        var token;
        token = csrfToken();
        if (token != null) {
          return xhr.setRequestHeader('X-CSRF-Token', token);
        }
      };

      Rails.refreshCSRFTokens = function() {
        var param, token;
        token = csrfToken();
        param = csrfParam();
        if ((token != null) && (param != null)) {
          return $('form input[name="' + param + '"]').forEach(function(input) {
            return input.value = token;
          });
        }
      };

    }).call(this);
    (function() {
      var CustomEvent, fire, matches;

      matches = Rails.matches;

      CustomEvent = window.CustomEvent;

      if (typeof CustomEvent !== 'function') {
        CustomEvent = function(event, params) {
          var evt;
          evt = document.createEvent('CustomEvent');
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
        };
        CustomEvent.prototype = window.Event.prototype;
      }

      fire = Rails.fire = function(obj, name, data) {
        var event;
        event = new CustomEvent(name, {
          bubbles: true,
          cancelable: true,
          detail: data
        });
        obj.dispatchEvent(event);
        return !event.defaultPrevented;
      };

      Rails.stopEverything = function(e) {
        fire(e.target, 'ujs:everythingStopped');
        e.preventDefault();
        e.stopPropagation();
        return e.stopImmediatePropagation();
      };

      Rails.delegate = function(element, selector, eventType, handler) {
        return element.addEventListener(eventType, function(e) {
          var target;
          target = e.target;
          while (!(!(target instanceof Element) || matches(target, selector))) {
            target = target.parentNode;
          }
          if (target instanceof Element && handler.call(target, e) === false) {
            e.preventDefault();
            return e.stopPropagation();
          }
        });
      };

    }).call(this);
    (function() {
      var AcceptHeaders, CSRFProtection, createXHR, fire, prepareOptions, processResponse;

      CSRFProtection = Rails.CSRFProtection, fire = Rails.fire;

      AcceptHeaders = {
        '*': '*/*',
        text: 'text/plain',
        html: 'text/html',
        xml: 'application/xml, text/xml',
        json: 'application/json, text/javascript',
        script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript'
      };

      Rails.ajax = function(options) {
        var xhr;
        options = prepareOptions(options);
        xhr = createXHR(options, function() {
          var response;
          response = processResponse(xhr.response, xhr.getResponseHeader('Content-Type'));
          if (Math.floor(xhr.status / 100) === 2) {
            if (typeof options.success === "function") {
              options.success(response, xhr.statusText, xhr);
            }
          } else {
            if (typeof options.error === "function") {
              options.error(response, xhr.statusText, xhr);
            }
          }
          return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : void 0;
        });
        if (typeof options.beforeSend === "function") {
          options.beforeSend(xhr, options);
        }
        if (xhr.readyState === XMLHttpRequest.OPENED) {
          return xhr.send(options.data);
        } else {
          return fire(document, 'ajaxStop');
        }
      };

      prepareOptions = function(options) {
        options.url = options.url || location.href;
        options.type = options.type.toUpperCase();
        if (options.type === 'GET' && options.data) {
          if (options.url.indexOf('?') < 0) {
            options.url += '?' + options.data;
          } else {
            options.url += '&' + options.data;
          }
        }
        if (AcceptHeaders[options.dataType] == null) {
          options.dataType = '*';
        }
        options.accept = AcceptHeaders[options.dataType];
        if (options.dataType !== '*') {
          options.accept += ', */*; q=0.01';
        }
        return options;
      };

      createXHR = function(options, done) {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.open(options.type, options.url, true);
        xhr.setRequestHeader('Accept', options.accept);
        if (typeof options.data === 'string') {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        }
        if (!options.crossDomain) {
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
        CSRFProtection(xhr);
        xhr.withCredentials = !!options.withCredentials;
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            return done(xhr);
          }
        };
        return xhr;
      };

      processResponse = function(response, type) {
        var parser, script;
        if (typeof response === 'string' && typeof type === 'string') {
          if (type.match(/\bjson\b/)) {
            try {
              response = JSON.parse(response);
            } catch (error) {}
          } else if (type.match(/\b(?:java|ecma)script\b/)) {
            script = document.createElement('script');
            script.text = response;
            document.head.appendChild(script).parentNode.removeChild(script);
          } else if (type.match(/\b(xml|html|svg)\b/)) {
            parser = new DOMParser();
            type = type.replace(/;.+/, '');
            try {
              response = parser.parseFromString(response, type);
            } catch (error) {}
          }
        }
        return response;
      };

      Rails.href = function(element) {
        return element.href;
      };

      Rails.isCrossDomain = function(url) {
        var e, originAnchor, urlAnchor;
        originAnchor = document.createElement('a');
        originAnchor.href = location.href;
        urlAnchor = document.createElement('a');
        try {
          urlAnchor.href = url;
          return !(((!urlAnchor.protocol || urlAnchor.protocol === ':') && !urlAnchor.host) || (originAnchor.protocol + '//' + originAnchor.host === urlAnchor.protocol + '//' + urlAnchor.host));
        } catch (error) {
          e = error;
          return true;
        }
      };

    }).call(this);
    (function() {
      var matches, toArray;

      matches = Rails.matches;

      toArray = function(e) {
        return Array.prototype.slice.call(e);
      };

      Rails.serializeElement = function(element, additionalParam) {
        var inputs, params;
        inputs = [element];
        if (matches(element, 'form')) {
          inputs = toArray(element.elements);
        }
        params = [];
        inputs.forEach(function(input) {
          if (!input.name) {
            return;
          }
          if (matches(input, 'select')) {
            return toArray(input.options).forEach(function(option) {
              if (option.selected) {
                return params.push({
                  name: input.name,
                  value: option.value
                });
              }
            });
          } else if (input.checked || ['radio', 'checkbox', 'submit'].indexOf(input.type) === -1) {
            return params.push({
              name: input.name,
              value: input.value
            });
          }
        });
        if (additionalParam) {
          params.push(additionalParam);
        }
        return params.map(function(param) {
          if (param.name != null) {
            return (encodeURIComponent(param.name)) + "=" + (encodeURIComponent(param.value));
          } else {
            return param;
          }
        }).join('&');
      };

      Rails.formElements = function(form, selector) {
        if (matches(form, 'form')) {
          return toArray(form.elements).filter(function(el) {
            return matches(el, selector);
          });
        } else {
          return toArray(form.querySelectorAll(selector));
        }
      };

    }).call(this);
    (function() {
      var allowAction, fire, stopEverything;

      fire = Rails.fire, stopEverything = Rails.stopEverything;

      Rails.handleConfirm = function(e) {
        if (!allowAction(this)) {
          return stopEverything(e);
        }
      };

      allowAction = function(element) {
        var answer, callback, message;
        message = element.getAttribute('data-confirm');
        if (!message) {
          return true;
        }
        answer = false;
        if (fire(element, 'confirm')) {
          try {
            answer = confirm(message);
          } catch (error) {}
          callback = fire(element, 'confirm:complete', [answer]);
        }
        return answer && callback;
      };

    }).call(this);
    (function() {
      var disableFormElement, disableFormElements, disableLinkElement, enableFormElement, enableFormElements, enableLinkElement, formElements, getData, matches, setData, stopEverything;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, stopEverything = Rails.stopEverything, formElements = Rails.formElements;

      Rails.handleDisabledElement = function(e) {
        var element;
        element = this;
        if (element.disabled) {
          return stopEverything(e);
        }
      };

      Rails.enableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return enableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formEnableSelector)) {
          return enableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return enableFormElements(element);
        }
      };

      Rails.disableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return disableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formDisableSelector)) {
          return disableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return disableFormElements(element);
        }
      };

      disableLinkElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          setData(element, 'ujs:enable-with', element.innerHTML);
          element.innerHTML = replacement;
        }
        element.addEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', true);
      };

      enableLinkElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          element.innerHTML = originalText;
          setData(element, 'ujs:enable-with', null);
        }
        element.removeEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', null);
      };

      disableFormElements = function(form) {
        return formElements(form, Rails.formDisableSelector).forEach(disableFormElement);
      };

      disableFormElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          if (matches(element, 'button')) {
            setData(element, 'ujs:enable-with', element.innerHTML);
            element.innerHTML = replacement;
          } else {
            setData(element, 'ujs:enable-with', element.value);
            element.value = replacement;
          }
        }
        element.disabled = true;
        return setData(element, 'ujs:disabled', true);
      };

      enableFormElements = function(form) {
        return formElements(form, Rails.formEnableSelector).forEach(enableFormElement);
      };

      enableFormElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          if (matches(element, 'button')) {
            element.innerHTML = originalText;
          } else {
            element.value = originalText;
          }
          setData(element, 'ujs:enable-with', null);
        }
        element.disabled = false;
        return setData(element, 'ujs:disabled', null);
      };

    }).call(this);
    (function() {
      var stopEverything;

      stopEverything = Rails.stopEverything;

      Rails.handleMethod = function(e) {
        var csrfParam, csrfToken, form, formContent, href, link, method;
        link = this;
        method = link.getAttribute('data-method');
        if (!method) {
          return;
        }
        href = Rails.href(link);
        csrfToken = Rails.csrfToken();
        csrfParam = Rails.csrfParam();
        form = document.createElement('form');
        formContent = "<input name='_method' value='" + method + "' type='hidden' />";
        if ((csrfParam != null) && (csrfToken != null) && !Rails.isCrossDomain(href)) {
          formContent += "<input name='" + csrfParam + "' value='" + csrfToken + "' type='hidden' />";
        }
        formContent += '<input type="submit" />';
        form.method = 'post';
        form.action = href;
        form.target = link.target;
        form.innerHTML = formContent;
        form.style.display = 'none';
        document.body.appendChild(form);
        form.querySelector('[type="submit"]').click();
        return stopEverything(e);
      };

    }).call(this);
    (function() {
      var ajax, fire, getData, isCrossDomain, isRemote, matches, serializeElement, setData, stopEverything,
        slice = [].slice;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, fire = Rails.fire, stopEverything = Rails.stopEverything, ajax = Rails.ajax, isCrossDomain = Rails.isCrossDomain, serializeElement = Rails.serializeElement;

      isRemote = function(element) {
        var value;
        value = element.getAttribute('data-remote');
        return (value != null) && value !== 'false';
      };

      Rails.handleRemote = function(e) {
        var button, data, dataType, element, method, url, withCredentials;
        element = this;
        if (!isRemote(element)) {
          return true;
        }
        if (!fire(element, 'ajax:before')) {
          fire(element, 'ajax:stopped');
          return false;
        }
        withCredentials = element.getAttribute('data-with-credentials');
        dataType = element.getAttribute('data-type') || 'script';
        if (matches(element, Rails.formSubmitSelector)) {
          button = getData(element, 'ujs:submit-button');
          method = getData(element, 'ujs:submit-button-formmethod') || element.method;
          url = getData(element, 'ujs:submit-button-formaction') || element.getAttribute('action') || location.href;
          if (method.toUpperCase() === 'GET') {
            url = url.replace(/\?.*$/, '');
          }
          if (element.enctype === 'multipart/form-data') {
            data = new FormData(element);
            if (button != null) {
              data.append(button.name, button.value);
            }
          } else {
            data = serializeElement(element, button);
          }
          setData(element, 'ujs:submit-button', null);
          setData(element, 'ujs:submit-button-formmethod', null);
          setData(element, 'ujs:submit-button-formaction', null);
        } else if (matches(element, Rails.buttonClickSelector) || matches(element, Rails.inputChangeSelector)) {
          method = element.getAttribute('data-method');
          url = element.getAttribute('data-url');
          data = serializeElement(element, element.getAttribute('data-params'));
        } else {
          method = element.getAttribute('data-method');
          url = Rails.href(element);
          data = element.getAttribute('data-params');
        }
        ajax({
          type: method || 'GET',
          url: url,
          data: data,
          dataType: dataType,
          beforeSend: function(xhr, options) {
            if (fire(element, 'ajax:beforeSend', [xhr, options])) {
              return fire(element, 'ajax:send', [xhr]);
            } else {
              fire(element, 'ajax:stopped');
              return xhr.abort();
            }
          },
          success: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:success', args);
          },
          error: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:error', args);
          },
          complete: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:complete', args);
          },
          crossDomain: isCrossDomain(url),
          withCredentials: (withCredentials != null) && withCredentials !== 'false'
        });
        return stopEverything(e);
      };

      Rails.formSubmitButtonClick = function(e) {
        var button, form;
        button = this;
        form = button.form;
        if (!form) {
          return;
        }
        if (button.name) {
          setData(form, 'ujs:submit-button', {
            name: button.name,
            value: button.value
          });
        }
        setData(form, 'ujs:formnovalidate-button', button.formNoValidate);
        setData(form, 'ujs:submit-button-formaction', button.getAttribute('formaction'));
        return setData(form, 'ujs:submit-button-formmethod', button.getAttribute('formmethod'));
      };

      Rails.handleMetaClick = function(e) {
        var data, link, metaClick, method;
        link = this;
        method = (link.getAttribute('data-method') || 'GET').toUpperCase();
        data = link.getAttribute('data-params');
        metaClick = e.metaKey || e.ctrlKey;
        if (metaClick && method === 'GET' && !data) {
          return e.stopImmediatePropagation();
        }
      };

    }).call(this);
    (function() {
      var $, CSRFProtection, delegate, disableElement, enableElement, fire, formSubmitButtonClick, getData, handleConfirm, handleDisabledElement, handleMetaClick, handleMethod, handleRemote, refreshCSRFTokens;

      fire = Rails.fire, delegate = Rails.delegate, getData = Rails.getData, $ = Rails.$, refreshCSRFTokens = Rails.refreshCSRFTokens, CSRFProtection = Rails.CSRFProtection, enableElement = Rails.enableElement, disableElement = Rails.disableElement, handleDisabledElement = Rails.handleDisabledElement, handleConfirm = Rails.handleConfirm, handleRemote = Rails.handleRemote, formSubmitButtonClick = Rails.formSubmitButtonClick, handleMetaClick = Rails.handleMetaClick, handleMethod = Rails.handleMethod;

      if ((typeof jQuery !== "undefined" && jQuery !== null) && !jQuery.rails) {
        jQuery.rails = Rails;
        jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {
          if (!options.crossDomain) {
            return CSRFProtection(xhr);
          }
        });
      }

      Rails.start = function() {
        if (window._rails_loaded) {
          throw new Error('rails-ujs has already been loaded!');
        }
        window.addEventListener('pageshow', function() {
          $(Rails.formEnableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
          return $(Rails.linkDisableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
        });
        delegate(document, Rails.linkDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.linkDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.linkClickSelector, 'click', handleConfirm);
        delegate(document, Rails.linkClickSelector, 'click', handleMetaClick);
        delegate(document, Rails.linkClickSelector, 'click', disableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleRemote);
        delegate(document, Rails.linkClickSelector, 'click', handleMethod);
        delegate(document, Rails.buttonClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleConfirm);
        delegate(document, Rails.buttonClickSelector, 'click', disableElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleRemote);
        delegate(document, Rails.inputChangeSelector, 'change', handleDisabledElement);
        delegate(document, Rails.inputChangeSelector, 'change', handleConfirm);
        delegate(document, Rails.inputChangeSelector, 'change', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', handleDisabledElement);
        delegate(document, Rails.formSubmitSelector, 'submit', handleConfirm);
        delegate(document, Rails.formSubmitSelector, 'submit', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', function(e) {
          return setTimeout((function() {
            return disableElement(e);
          }), 13);
        });
        delegate(document, Rails.formSubmitSelector, 'ajax:send', disableElement);
        delegate(document, Rails.formSubmitSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleConfirm);
        delegate(document, Rails.formInputClickSelector, 'click', formSubmitButtonClick);
        document.addEventListener('DOMContentLoaded', refreshCSRFTokens);
        return window._rails_loaded = true;
      };

      if (window.Rails === Rails && fire(document, 'rails:attachBindings')) {
        Rails.start();
      }

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = Rails;
  } else if (typeof define === "function" && define.amd) {
    define(Rails);
  }
}).call(this);
/*
Turbolinks 5.0.3
Copyright © 2017 Basecamp, LLC
 */

(function(){(function(){(function(){this.Turbolinks={supported:function(){return null!=window.history.pushState&&null!=window.requestAnimationFrame&&null!=window.addEventListener}(),visit:function(e,r){return t.controller.visit(e,r)},clearCache:function(){return t.controller.clearCache()}}}).call(this)}).call(this);var t=this.Turbolinks;(function(){(function(){var e,r,n=[].slice;t.copyObject=function(t){var e,r,n;r={};for(e in t)n=t[e],r[e]=n;return r},t.closest=function(t,r){return e.call(t,r)},e=function(){var t,e;return t=document.documentElement,null!=(e=t.closest)?e:function(t){var e;for(e=this;e;){if(e.nodeType===Node.ELEMENT_NODE&&r.call(e,t))return e;e=e.parentNode}}}(),t.defer=function(t){return setTimeout(t,1)},t.throttle=function(t){var e;return e=null,function(){var r;return r=1<=arguments.length?n.call(arguments,0):[],null!=e?e:e=requestAnimationFrame(function(n){return function(){return e=null,t.apply(n,r)}}(this))}},t.dispatch=function(t,e){var r,n,o,i,s;return i=null!=e?e:{},s=i.target,r=i.cancelable,n=i.data,o=document.createEvent("Events"),o.initEvent(t,!0,r===!0),o.data=null!=n?n:{},(null!=s?s:document).dispatchEvent(o),o},t.match=function(t,e){return r.call(t,e)},r=function(){var t,e,r,n;return t=document.documentElement,null!=(e=null!=(r=null!=(n=t.matchesSelector)?n:t.webkitMatchesSelector)?r:t.msMatchesSelector)?e:t.mozMatchesSelector}(),t.uuid=function(){var t,e,r;for(r="",t=e=1;36>=e;t=++e)r+=9===t||14===t||19===t||24===t?"-":15===t?"4":20===t?(Math.floor(4*Math.random())+8).toString(16):Math.floor(15*Math.random()).toString(16);return r}}).call(this),function(){t.Location=function(){function t(t){var e,r;null==t&&(t=""),r=document.createElement("a"),r.href=t.toString(),this.absoluteURL=r.href,e=r.hash.length,2>e?this.requestURL=this.absoluteURL:(this.requestURL=this.absoluteURL.slice(0,-e),this.anchor=r.hash.slice(1))}var e,r,n,o;return t.wrap=function(t){return t instanceof this?t:new this(t)},t.prototype.getOrigin=function(){return this.absoluteURL.split("/",3).join("/")},t.prototype.getPath=function(){var t,e;return null!=(t=null!=(e=this.absoluteURL.match(/\/\/[^\/]*(\/[^?;]*)/))?e[1]:void 0)?t:"/"},t.prototype.getPathComponents=function(){return this.getPath().split("/").slice(1)},t.prototype.getLastPathComponent=function(){return this.getPathComponents().slice(-1)[0]},t.prototype.getExtension=function(){var t,e;return null!=(t=null!=(e=this.getLastPathComponent().match(/\.[^.]*$/))?e[0]:void 0)?t:""},t.prototype.isHTML=function(){return this.getExtension().match(/^(?:|\.(?:htm|html|xhtml))$/)},t.prototype.isPrefixedBy=function(t){var e;return e=r(t),this.isEqualTo(t)||o(this.absoluteURL,e)},t.prototype.isEqualTo=function(t){return this.absoluteURL===(null!=t?t.absoluteURL:void 0)},t.prototype.toCacheKey=function(){return this.requestURL},t.prototype.toJSON=function(){return this.absoluteURL},t.prototype.toString=function(){return this.absoluteURL},t.prototype.valueOf=function(){return this.absoluteURL},r=function(t){return e(t.getOrigin()+t.getPath())},e=function(t){return n(t,"/")?t:t+"/"},o=function(t,e){return t.slice(0,e.length)===e},n=function(t,e){return t.slice(-e.length)===e},t}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.HttpRequest=function(){function r(r,n,o){this.delegate=r,this.requestCanceled=e(this.requestCanceled,this),this.requestTimedOut=e(this.requestTimedOut,this),this.requestFailed=e(this.requestFailed,this),this.requestLoaded=e(this.requestLoaded,this),this.requestProgressed=e(this.requestProgressed,this),this.url=t.Location.wrap(n).requestURL,this.referrer=t.Location.wrap(o).absoluteURL,this.createXHR()}return r.NETWORK_FAILURE=0,r.TIMEOUT_FAILURE=-1,r.timeout=60,r.prototype.send=function(){var t;return this.xhr&&!this.sent?(this.notifyApplicationBeforeRequestStart(),this.setProgress(0),this.xhr.send(),this.sent=!0,"function"==typeof(t=this.delegate).requestStarted?t.requestStarted():void 0):void 0},r.prototype.cancel=function(){return this.xhr&&this.sent?this.xhr.abort():void 0},r.prototype.requestProgressed=function(t){return t.lengthComputable?this.setProgress(t.loaded/t.total):void 0},r.prototype.requestLoaded=function(){return this.endRequest(function(t){return function(){var e;return 200<=(e=t.xhr.status)&&300>e?t.delegate.requestCompletedWithResponse(t.xhr.responseText,t.xhr.getResponseHeader("Turbolinks-Location")):(t.failed=!0,t.delegate.requestFailedWithStatusCode(t.xhr.status,t.xhr.responseText))}}(this))},r.prototype.requestFailed=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.NETWORK_FAILURE)}}(this))},r.prototype.requestTimedOut=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.TIMEOUT_FAILURE)}}(this))},r.prototype.requestCanceled=function(){return this.endRequest()},r.prototype.notifyApplicationBeforeRequestStart=function(){return t.dispatch("turbolinks:request-start",{data:{url:this.url,xhr:this.xhr}})},r.prototype.notifyApplicationAfterRequestEnd=function(){return t.dispatch("turbolinks:request-end",{data:{url:this.url,xhr:this.xhr}})},r.prototype.createXHR=function(){return this.xhr=new XMLHttpRequest,this.xhr.open("GET",this.url,!0),this.xhr.timeout=1e3*this.constructor.timeout,this.xhr.setRequestHeader("Accept","text/html, application/xhtml+xml"),this.xhr.setRequestHeader("Turbolinks-Referrer",this.referrer),this.xhr.onprogress=this.requestProgressed,this.xhr.onload=this.requestLoaded,this.xhr.onerror=this.requestFailed,this.xhr.ontimeout=this.requestTimedOut,this.xhr.onabort=this.requestCanceled},r.prototype.endRequest=function(t){return this.xhr?(this.notifyApplicationAfterRequestEnd(),null!=t&&t.call(this),this.destroy()):void 0},r.prototype.setProgress=function(t){var e;return this.progress=t,"function"==typeof(e=this.delegate).requestProgressed?e.requestProgressed(this.progress):void 0},r.prototype.destroy=function(){var t;return this.setProgress(1),"function"==typeof(t=this.delegate).requestFinished&&t.requestFinished(),this.delegate=null,this.xhr=null},r}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.ProgressBar=function(){function t(){this.trickle=e(this.trickle,this),this.stylesheetElement=this.createStylesheetElement(),this.progressElement=this.createProgressElement()}var r;return r=300,t.defaultCSS=".turbolinks-progress-bar {\n  position: fixed;\n  display: block;\n  top: 0;\n  left: 0;\n  height: 3px;\n  background: #0076ff;\n  z-index: 9999;\n  transition: width "+r+"ms ease-out, opacity "+r/2+"ms "+r/2+"ms ease-in;\n  transform: translate3d(0, 0, 0);\n}",t.prototype.show=function(){return this.visible?void 0:(this.visible=!0,this.installStylesheetElement(),this.installProgressElement(),this.startTrickling())},t.prototype.hide=function(){return this.visible&&!this.hiding?(this.hiding=!0,this.fadeProgressElement(function(t){return function(){return t.uninstallProgressElement(),t.stopTrickling(),t.visible=!1,t.hiding=!1}}(this))):void 0},t.prototype.setValue=function(t){return this.value=t,this.refresh()},t.prototype.installStylesheetElement=function(){return document.head.insertBefore(this.stylesheetElement,document.head.firstChild)},t.prototype.installProgressElement=function(){return this.progressElement.style.width=0,this.progressElement.style.opacity=1,document.documentElement.insertBefore(this.progressElement,document.body),this.refresh()},t.prototype.fadeProgressElement=function(t){return this.progressElement.style.opacity=0,setTimeout(t,1.5*r)},t.prototype.uninstallProgressElement=function(){return this.progressElement.parentNode?document.documentElement.removeChild(this.progressElement):void 0},t.prototype.startTrickling=function(){return null!=this.trickleInterval?this.trickleInterval:this.trickleInterval=setInterval(this.trickle,r)},t.prototype.stopTrickling=function(){return clearInterval(this.trickleInterval),this.trickleInterval=null},t.prototype.trickle=function(){return this.setValue(this.value+Math.random()/100)},t.prototype.refresh=function(){return requestAnimationFrame(function(t){return function(){return t.progressElement.style.width=10+90*t.value+"%"}}(this))},t.prototype.createStylesheetElement=function(){var t;return t=document.createElement("style"),t.type="text/css",t.textContent=this.constructor.defaultCSS,t},t.prototype.createProgressElement=function(){var t;return t=document.createElement("div"),t.className="turbolinks-progress-bar",t},t}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.BrowserAdapter=function(){function r(r){this.controller=r,this.showProgressBar=e(this.showProgressBar,this),this.progressBar=new t.ProgressBar}var n,o,i,s;return s=t.HttpRequest,n=s.NETWORK_FAILURE,i=s.TIMEOUT_FAILURE,o=500,r.prototype.visitProposedToLocationWithAction=function(t,e){return this.controller.startVisitToLocationWithAction(t,e)},r.prototype.visitStarted=function(t){return t.issueRequest(),t.changeHistory(),t.loadCachedSnapshot()},r.prototype.visitRequestStarted=function(t){return this.progressBar.setValue(0),t.hasCachedSnapshot()||"restore"!==t.action?this.showProgressBarAfterDelay():this.showProgressBar()},r.prototype.visitRequestProgressed=function(t){return this.progressBar.setValue(t.progress)},r.prototype.visitRequestCompleted=function(t){return t.loadResponse()},r.prototype.visitRequestFailedWithStatusCode=function(t,e){switch(e){case n:case i:return this.reload();default:return t.loadResponse()}},r.prototype.visitRequestFinished=function(t){return this.hideProgressBar()},r.prototype.visitCompleted=function(t){return t.followRedirect()},r.prototype.pageInvalidated=function(){return this.reload()},r.prototype.showProgressBarAfterDelay=function(){return this.progressBarTimeout=setTimeout(this.showProgressBar,o)},r.prototype.showProgressBar=function(){return this.progressBar.show()},r.prototype.hideProgressBar=function(){return this.progressBar.hide(),clearTimeout(this.progressBarTimeout)},r.prototype.reload=function(){return window.location.reload()},r}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.History=function(){function r(t){this.delegate=t,this.onPageLoad=e(this.onPageLoad,this),this.onPopState=e(this.onPopState,this)}return r.prototype.start=function(){return this.started?void 0:(addEventListener("popstate",this.onPopState,!1),addEventListener("load",this.onPageLoad,!1),this.started=!0)},r.prototype.stop=function(){return this.started?(removeEventListener("popstate",this.onPopState,!1),removeEventListener("load",this.onPageLoad,!1),this.started=!1):void 0},r.prototype.push=function(e,r){return e=t.Location.wrap(e),this.update("push",e,r)},r.prototype.replace=function(e,r){return e=t.Location.wrap(e),this.update("replace",e,r)},r.prototype.onPopState=function(e){var r,n,o,i;return this.shouldHandlePopState()&&(i=null!=(n=e.state)?n.turbolinks:void 0)?(r=t.Location.wrap(window.location),o=i.restorationIdentifier,this.delegate.historyPoppedToLocationWithRestorationIdentifier(r,o)):void 0},r.prototype.onPageLoad=function(e){return t.defer(function(t){return function(){return t.pageLoaded=!0}}(this))},r.prototype.shouldHandlePopState=function(){return this.pageIsLoaded()},r.prototype.pageIsLoaded=function(){return this.pageLoaded||"complete"===document.readyState},r.prototype.update=function(t,e,r){var n;return n={turbolinks:{restorationIdentifier:r}},history[t+"State"](n,null,e)},r}()}.call(this),function(){t.Snapshot=function(){function e(t){var e,r;r=t.head,e=t.body,this.head=null!=r?r:document.createElement("head"),this.body=null!=e?e:document.createElement("body")}return e.wrap=function(t){return t instanceof this?t:this.fromHTML(t)},e.fromHTML=function(t){var e;return e=document.createElement("html"),e.innerHTML=t,this.fromElement(e)},e.fromElement=function(t){return new this({head:t.querySelector("head"),body:t.querySelector("body")})},e.prototype.clone=function(){return new e({head:this.head.cloneNode(!0),body:this.body.cloneNode(!0)})},e.prototype.getRootLocation=function(){var e,r;return r=null!=(e=this.getSetting("root"))?e:"/",new t.Location(r)},e.prototype.getCacheControlValue=function(){return this.getSetting("cache-control")},e.prototype.hasAnchor=function(t){try{return null!=this.body.querySelector("[id='"+t+"']")}catch(e){}},e.prototype.isPreviewable=function(){return"no-preview"!==this.getCacheControlValue()},e.prototype.isCacheable=function(){return"no-cache"!==this.getCacheControlValue()},e.prototype.getSetting=function(t){var e,r;return r=this.head.querySelectorAll("meta[name='turbolinks-"+t+"']"),e=r[r.length-1],null!=e?e.getAttribute("content"):void 0},e}()}.call(this),function(){var e=[].slice;t.Renderer=function(){function t(){}var r;return t.render=function(){var t,r,n,o;return n=arguments[0],r=arguments[1],t=3<=arguments.length?e.call(arguments,2):[],o=function(t,e,r){r.prototype=t.prototype;var n=new r,o=t.apply(n,e);return Object(o)===o?o:n}(this,t,function(){}),o.delegate=n,o.render(r),o},t.prototype.renderView=function(t){return this.delegate.viewWillRender(this.newBody),t(),this.delegate.viewRendered(this.newBody)},t.prototype.invalidateView=function(){return this.delegate.viewInvalidated()},t.prototype.createScriptElement=function(t){var e;return"false"===t.getAttribute("data-turbolinks-eval")?t:(e=document.createElement("script"),e.textContent=t.textContent,r(e,t),e)},r=function(t,e){var r,n,o,i,s,a,u;for(i=e.attributes,a=[],r=0,n=i.length;n>r;r++)s=i[r],o=s.name,u=s.value,a.push(t.setAttribute(o,u));return a},t}()}.call(this),function(){t.HeadDetails=function(){function t(t){var e,r,i,s,a,u,l;for(this.element=t,this.elements={},l=this.element.childNodes,s=0,u=l.length;u>s;s++)i=l[s],i.nodeType===Node.ELEMENT_NODE&&(a=i.outerHTML,r=null!=(e=this.elements)[a]?e[a]:e[a]={type:o(i),tracked:n(i),elements:[]},r.elements.push(i))}var e,r,n,o;return t.prototype.hasElementWithKey=function(t){return t in this.elements},t.prototype.getTrackedElementSignature=function(){var t,e;return function(){var r,n;r=this.elements,n=[];for(t in r)e=r[t].tracked,e&&n.push(t);return n}.call(this).join("")},t.prototype.getScriptElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("script",t)},t.prototype.getStylesheetElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("stylesheet",t)},t.prototype.getElementsMatchingTypeNotInDetails=function(t,e){var r,n,o,i,s,a;o=this.elements,s=[];for(n in o)i=o[n],a=i.type,r=i.elements,a!==t||e.hasElementWithKey(n)||s.push(r[0]);return s},t.prototype.getProvisionalElements=function(){var t,e,r,n,o,i,s;r=[],n=this.elements;for(e in n)o=n[e],s=o.type,i=o.tracked,t=o.elements,null!=s||i?t.length>1&&r.push.apply(r,t.slice(1)):r.push.apply(r,t);return r},o=function(t){return e(t)?"script":r(t)?"stylesheet":void 0},n=function(t){return"reload"===t.getAttribute("data-turbolinks-track")},e=function(t){var e;return e=t.tagName.toLowerCase(),"script"===e},r=function(t){var e;return e=t.tagName.toLowerCase(),"style"===e||"link"===e&&"stylesheet"===t.getAttribute("rel")},t}()}.call(this),function(){var e=function(t,e){function n(){this.constructor=t}for(var o in e)r.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},r={}.hasOwnProperty;t.SnapshotRenderer=function(r){function n(e,r){this.currentSnapshot=e,this.newSnapshot=r,this.currentHeadDetails=new t.HeadDetails(this.currentSnapshot.head),this.newHeadDetails=new t.HeadDetails(this.newSnapshot.head),this.newBody=this.newSnapshot.body}return e(n,r),n.prototype.render=function(t){return this.trackedElementsAreIdentical()?(this.mergeHead(),this.renderView(function(e){return function(){return e.replaceBody(),e.focusFirstAutofocusableElement(),t()}}(this))):this.invalidateView()},n.prototype.mergeHead=function(){return this.copyNewHeadStylesheetElements(),this.copyNewHeadScriptElements(),this.removeCurrentHeadProvisionalElements(),this.copyNewHeadProvisionalElements()},n.prototype.replaceBody=function(){return this.activateBodyScriptElements(),this.importBodyPermanentElements(),this.assignNewBody()},n.prototype.trackedElementsAreIdentical=function(){return this.currentHeadDetails.getTrackedElementSignature()===this.newHeadDetails.getTrackedElementSignature()},n.prototype.copyNewHeadStylesheetElements=function(){var t,e,r,n,o;for(n=this.getNewHeadStylesheetElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},n.prototype.copyNewHeadScriptElements=function(){var t,e,r,n,o;for(n=this.getNewHeadScriptElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(this.createScriptElement(t)));return o},n.prototype.removeCurrentHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getCurrentHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.removeChild(t));return o},n.prototype.copyNewHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getNewHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},n.prototype.importBodyPermanentElements=function(){var t,e,r,n,o,i;for(n=this.getNewBodyPermanentElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],(t=this.findCurrentBodyPermanentElement(o))?i.push(o.parentNode.replaceChild(t,o)):i.push(void 0);return i},n.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getNewBodyScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},n.prototype.assignNewBody=function(){return document.body=this.newBody},n.prototype.focusFirstAutofocusableElement=function(){var t;return null!=(t=this.findFirstAutofocusableElement())?t.focus():void 0},n.prototype.getNewHeadStylesheetElements=function(){return this.newHeadDetails.getStylesheetElementsNotInDetails(this.currentHeadDetails)},n.prototype.getNewHeadScriptElements=function(){return this.newHeadDetails.getScriptElementsNotInDetails(this.currentHeadDetails)},n.prototype.getCurrentHeadProvisionalElements=function(){return this.currentHeadDetails.getProvisionalElements()},n.prototype.getNewHeadProvisionalElements=function(){return this.newHeadDetails.getProvisionalElements()},n.prototype.getNewBodyPermanentElements=function(){return this.newBody.querySelectorAll("[id][data-turbolinks-permanent]")},n.prototype.findCurrentBodyPermanentElement=function(t){return document.body.querySelector("#"+t.id+"[data-turbolinks-permanent]")},n.prototype.getNewBodyScriptElements=function(){return this.newBody.querySelectorAll("script")},n.prototype.findFirstAutofocusableElement=function(){return document.body.querySelector("[autofocus]")},n}(t.Renderer)}.call(this),function(){var e=function(t,e){function n(){this.constructor=t}for(var o in e)r.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},r={}.hasOwnProperty;t.ErrorRenderer=function(t){function r(t){this.html=t}return e(r,t),r.prototype.render=function(t){return this.renderView(function(e){return function(){return e.replaceDocumentHTML(),e.activateBodyScriptElements(),t()}}(this))},r.prototype.replaceDocumentHTML=function(){return document.documentElement.innerHTML=this.html},r.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},r.prototype.getScriptElements=function(){return document.documentElement.querySelectorAll("script")},r}(t.Renderer)}.call(this),function(){t.View=function(){function e(t){this.delegate=t,this.element=document.documentElement}return e.prototype.getRootLocation=function(){return this.getSnapshot().getRootLocation()},e.prototype.getSnapshot=function(){return t.Snapshot.fromElement(this.element)},e.prototype.render=function(t,e){var r,n,o;return o=t.snapshot,r=t.error,n=t.isPreview,this.markAsPreview(n),null!=o?this.renderSnapshot(o,e):this.renderError(r,e)},e.prototype.markAsPreview=function(t){return t?this.element.setAttribute("data-turbolinks-preview",""):this.element.removeAttribute("data-turbolinks-preview")},e.prototype.renderSnapshot=function(e,r){return t.SnapshotRenderer.render(this.delegate,r,this.getSnapshot(),t.Snapshot.wrap(e))},e.prototype.renderError=function(e,r){return t.ErrorRenderer.render(this.delegate,r,e)},e}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.ScrollManager=function(){function r(r){this.delegate=r,this.onScroll=e(this.onScroll,this),this.onScroll=t.throttle(this.onScroll)}return r.prototype.start=function(){return this.started?void 0:(addEventListener("scroll",this.onScroll,!1),this.onScroll(),this.started=!0)},r.prototype.stop=function(){return this.started?(removeEventListener("scroll",this.onScroll,!1),this.started=!1):void 0},r.prototype.scrollToElement=function(t){return t.scrollIntoView()},r.prototype.scrollToPosition=function(t){var e,r;return e=t.x,r=t.y,window.scrollTo(e,r)},r.prototype.onScroll=function(t){return this.updatePosition({x:window.pageXOffset,y:window.pageYOffset})},r.prototype.updatePosition=function(t){var e;return this.position=t,null!=(e=this.delegate)?e.scrollPositionChanged(this.position):void 0},r}()}.call(this),function(){t.SnapshotCache=function(){function e(t){this.size=t,this.keys=[],this.snapshots={}}var r;return e.prototype.has=function(t){var e;return e=r(t),e in this.snapshots},e.prototype.get=function(t){var e;if(this.has(t))return e=this.read(t),this.touch(t),e},e.prototype.put=function(t,e){return this.write(t,e),this.touch(t),e},e.prototype.read=function(t){var e;return e=r(t),this.snapshots[e]},e.prototype.write=function(t,e){var n;return n=r(t),this.snapshots[n]=e},e.prototype.touch=function(t){var e,n;return n=r(t),e=this.keys.indexOf(n),e>-1&&this.keys.splice(e,1),this.keys.unshift(n),this.trim()},e.prototype.trim=function(){var t,e,r,n,o;for(n=this.keys.splice(this.size),o=[],t=0,r=n.length;r>t;t++)e=n[t],o.push(delete this.snapshots[e]);return o},r=function(e){return t.Location.wrap(e).toCacheKey()},e}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.Visit=function(){function r(r,n,o){this.controller=r,this.action=o,this.performScroll=e(this.performScroll,this),this.identifier=t.uuid(),this.location=t.Location.wrap(n),this.adapter=this.controller.adapter,this.state="initialized",this.timingMetrics={}}var n;return r.prototype.start=function(){return"initialized"===this.state?(this.recordTimingMetric("visitStart"),this.state="started",this.adapter.visitStarted(this)):void 0},r.prototype.cancel=function(){var t;return"started"===this.state?(null!=(t=this.request)&&t.cancel(),this.cancelRender(),this.state="canceled"):void 0},r.prototype.complete=function(){var t;return"started"===this.state?(this.recordTimingMetric("visitEnd"),this.state="completed","function"==typeof(t=this.adapter).visitCompleted&&t.visitCompleted(this),this.controller.visitCompleted(this)):void 0},r.prototype.fail=function(){var t;return"started"===this.state?(this.state="failed","function"==typeof(t=this.adapter).visitFailed?t.visitFailed(this):void 0):void 0},r.prototype.changeHistory=function(){var t,e;return this.historyChanged?void 0:(t=this.location.isEqualTo(this.referrer)?"replace":this.action,e=n(t),this.controller[e](this.location,this.restorationIdentifier),this.historyChanged=!0)},r.prototype.issueRequest=function(){return this.shouldIssueRequest()&&null==this.request?(this.progress=0,this.request=new t.HttpRequest(this,this.location,this.referrer),this.request.send()):void 0},r.prototype.getCachedSnapshot=function(){var t;return!(t=this.controller.getCachedSnapshotForLocation(this.location))||null!=this.location.anchor&&!t.hasAnchor(this.location.anchor)||"restore"!==this.action&&!t.isPreviewable()?void 0:t},r.prototype.hasCachedSnapshot=function(){return null!=this.getCachedSnapshot()},r.prototype.loadCachedSnapshot=function(){var t,e;return(e=this.getCachedSnapshot())?(t=this.shouldIssueRequest(),this.render(function(){var r;return this.cacheSnapshot(),this.controller.render({snapshot:e,isPreview:t},this.performScroll),"function"==typeof(r=this.adapter).visitRendered&&r.visitRendered(this),t?void 0:this.complete()})):void 0},r.prototype.loadResponse=function(){return null!=this.response?this.render(function(){var t,e;return this.cacheSnapshot(),this.request.failed?(this.controller.render({error:this.response},this.performScroll),"function"==typeof(t=this.adapter).visitRendered&&t.visitRendered(this),this.fail()):(this.controller.render({snapshot:this.response},this.performScroll),"function"==typeof(e=this.adapter).visitRendered&&e.visitRendered(this),this.complete())}):void 0},r.prototype.followRedirect=function(){return this.redirectedToLocation&&!this.followedRedirect?(this.location=this.redirectedToLocation,this.controller.replaceHistoryWithLocationAndRestorationIdentifier(this.redirectedToLocation,this.restorationIdentifier),this.followedRedirect=!0):void 0},r.prototype.requestStarted=function(){var t;return this.recordTimingMetric("requestStart"),"function"==typeof(t=this.adapter).visitRequestStarted?t.visitRequestStarted(this):void 0},r.prototype.requestProgressed=function(t){var e;return this.progress=t,"function"==typeof(e=this.adapter).visitRequestProgressed?e.visitRequestProgressed(this):void 0},r.prototype.requestCompletedWithResponse=function(e,r){return this.response=e,null!=r&&(this.redirectedToLocation=t.Location.wrap(r)),this.adapter.visitRequestCompleted(this)},r.prototype.requestFailedWithStatusCode=function(t,e){return this.response=e,this.adapter.visitRequestFailedWithStatusCode(this,t)},r.prototype.requestFinished=function(){var t;return this.recordTimingMetric("requestEnd"),"function"==typeof(t=this.adapter).visitRequestFinished?t.visitRequestFinished(this):void 0},r.prototype.performScroll=function(){return this.scrolled?void 0:("restore"===this.action?this.scrollToRestoredPosition()||this.scrollToTop():this.scrollToAnchor()||this.scrollToTop(),this.scrolled=!0)},r.prototype.scrollToRestoredPosition=function(){var t,e;return t=null!=(e=this.restorationData)?e.scrollPosition:void 0,null!=t?(this.controller.scrollToPosition(t),!0):void 0},r.prototype.scrollToAnchor=function(){return null!=this.location.anchor?(this.controller.scrollToAnchor(this.location.anchor),!0):void 0},r.prototype.scrollToTop=function(){return this.controller.scrollToPosition({x:0,y:0})},r.prototype.recordTimingMetric=function(t){var e;return null!=(e=this.timingMetrics)[t]?e[t]:e[t]=(new Date).getTime()},r.prototype.getTimingMetrics=function(){return t.copyObject(this.timingMetrics)},n=function(t){switch(t){case"replace":return"replaceHistoryWithLocationAndRestorationIdentifier";case"advance":case"restore":return"pushHistoryWithLocationAndRestorationIdentifier"}},r.prototype.shouldIssueRequest=function(){return"restore"===this.action?!this.hasCachedSnapshot():!0},r.prototype.cacheSnapshot=function(){return this.snapshotCached?void 0:(this.controller.cacheSnapshot(),this.snapshotCached=!0)},r.prototype.render=function(t){return this.cancelRender(),this.frame=requestAnimationFrame(function(e){return function(){return e.frame=null,t.call(e)}}(this))},r.prototype.cancelRender=function(){return this.frame?cancelAnimationFrame(this.frame):void 0},r}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.Controller=function(){function r(){this.clickBubbled=e(this.clickBubbled,this),this.clickCaptured=e(this.clickCaptured,this),this.pageLoaded=e(this.pageLoaded,this),this.history=new t.History(this),this.view=new t.View(this),this.scrollManager=new t.ScrollManager(this),this.restorationData={},this.clearCache()}return r.prototype.start=function(){return t.supported&&!this.started?(addEventListener("click",this.clickCaptured,!0),addEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.start(),this.startHistory(),this.started=!0,this.enabled=!0):void 0},r.prototype.disable=function(){return this.enabled=!1},r.prototype.stop=function(){return this.started?(removeEventListener("click",this.clickCaptured,!0),removeEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.stop(),this.stopHistory(),this.started=!1):void 0},r.prototype.clearCache=function(){return this.cache=new t.SnapshotCache(10)},r.prototype.visit=function(e,r){var n,o;return null==r&&(r={}),e=t.Location.wrap(e),this.applicationAllowsVisitingLocation(e)?this.locationIsVisitable(e)?(n=null!=(o=r.action)?o:"advance",this.adapter.visitProposedToLocationWithAction(e,n)):window.location=e:void 0},r.prototype.startVisitToLocationWithAction=function(e,r,n){var o;return t.supported?(o=this.getRestorationDataForIdentifier(n),this.startVisit(e,r,{restorationData:o})):window.location=e},r.prototype.startHistory=function(){return this.location=t.Location.wrap(window.location),this.restorationIdentifier=t.uuid(),this.history.start(),this.history.replace(this.location,this.restorationIdentifier)},r.prototype.stopHistory=function(){return this.history.stop()},r.prototype.pushHistoryWithLocationAndRestorationIdentifier=function(e,r){return this.restorationIdentifier=r,this.location=t.Location.wrap(e),this.history.push(this.location,this.restorationIdentifier)},r.prototype.replaceHistoryWithLocationAndRestorationIdentifier=function(e,r){return this.restorationIdentifier=r,this.location=t.Location.wrap(e),this.history.replace(this.location,this.restorationIdentifier)},r.prototype.historyPoppedToLocationWithRestorationIdentifier=function(e,r){var n;return this.restorationIdentifier=r,this.enabled?(n=this.getRestorationDataForIdentifier(this.restorationIdentifier),this.startVisit(e,"restore",{restorationIdentifier:this.restorationIdentifier,restorationData:n,historyChanged:!0}),this.location=t.Location.wrap(e)):this.adapter.pageInvalidated()},r.prototype.getCachedSnapshotForLocation=function(t){var e;return e=this.cache.get(t),e?e.clone():void 0},r.prototype.shouldCacheSnapshot=function(){return this.view.getSnapshot().isCacheable()},r.prototype.cacheSnapshot=function(){var t;return this.shouldCacheSnapshot()?(this.notifyApplicationBeforeCachingSnapshot(),t=this.view.getSnapshot(),this.cache.put(this.lastRenderedLocation,t.clone())):void 0},r.prototype.scrollToAnchor=function(t){var e;return(e=document.getElementById(t))?this.scrollToElement(e):this.scrollToPosition({x:0,y:0})},r.prototype.scrollToElement=function(t){return this.scrollManager.scrollToElement(t)},r.prototype.scrollToPosition=function(t){return this.scrollManager.scrollToPosition(t)},r.prototype.scrollPositionChanged=function(t){var e;return e=this.getCurrentRestorationData(),e.scrollPosition=t},r.prototype.render=function(t,e){return this.view.render(t,e)},r.prototype.viewInvalidated=function(){return this.adapter.pageInvalidated()},r.prototype.viewWillRender=function(t){return this.notifyApplicationBeforeRender(t)},r.prototype.viewRendered=function(){return this.lastRenderedLocation=this.currentVisit.location,this.notifyApplicationAfterRender()},r.prototype.pageLoaded=function(){return this.lastRenderedLocation=this.location,this.notifyApplicationAfterPageLoad()},r.prototype.clickCaptured=function(){return removeEventListener("click",this.clickBubbled,!1),addEventListener("click",this.clickBubbled,!1)},r.prototype.clickBubbled=function(t){var e,r,n;return this.enabled&&this.clickEventIsSignificant(t)&&(r=this.getVisitableLinkForNode(t.target))&&(n=this.getVisitableLocationForLink(r))&&this.applicationAllowsFollowingLinkToLocation(r,n)?(t.preventDefault(),e=this.getActionForLink(r),this.visit(n,{action:e})):void 0},r.prototype.applicationAllowsFollowingLinkToLocation=function(t,e){var r;return r=this.notifyApplicationAfterClickingLinkToLocation(t,e),!r.defaultPrevented},r.prototype.applicationAllowsVisitingLocation=function(t){var e;return e=this.notifyApplicationBeforeVisitingLocation(t),!e.defaultPrevented},r.prototype.notifyApplicationAfterClickingLinkToLocation=function(e,r){return t.dispatch("turbolinks:click",{target:e,data:{url:r.absoluteURL},cancelable:!0})},r.prototype.notifyApplicationBeforeVisitingLocation=function(e){return t.dispatch("turbolinks:before-visit",{data:{url:e.absoluteURL},cancelable:!0})},r.prototype.notifyApplicationAfterVisitingLocation=function(e){return t.dispatch("turbolinks:visit",{data:{url:e.absoluteURL}})},r.prototype.notifyApplicationBeforeCachingSnapshot=function(){return t.dispatch("turbolinks:before-cache")},r.prototype.notifyApplicationBeforeRender=function(e){
return t.dispatch("turbolinks:before-render",{data:{newBody:e}})},r.prototype.notifyApplicationAfterRender=function(){return t.dispatch("turbolinks:render")},r.prototype.notifyApplicationAfterPageLoad=function(e){return null==e&&(e={}),t.dispatch("turbolinks:load",{data:{url:this.location.absoluteURL,timing:e}})},r.prototype.startVisit=function(t,e,r){var n;return null!=(n=this.currentVisit)&&n.cancel(),this.currentVisit=this.createVisit(t,e,r),this.currentVisit.start(),this.notifyApplicationAfterVisitingLocation(t)},r.prototype.createVisit=function(e,r,n){var o,i,s,a,u;return i=null!=n?n:{},a=i.restorationIdentifier,s=i.restorationData,o=i.historyChanged,u=new t.Visit(this,e,r),u.restorationIdentifier=null!=a?a:t.uuid(),u.restorationData=t.copyObject(s),u.historyChanged=o,u.referrer=this.location,u},r.prototype.visitCompleted=function(t){return this.notifyApplicationAfterPageLoad(t.getTimingMetrics())},r.prototype.clickEventIsSignificant=function(t){return!(t.defaultPrevented||t.target.isContentEditable||t.which>1||t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)},r.prototype.getVisitableLinkForNode=function(e){return this.nodeIsVisitable(e)?t.closest(e,"a[href]:not([target]):not([download])"):void 0},r.prototype.getVisitableLocationForLink=function(e){var r;return r=new t.Location(e.getAttribute("href")),this.locationIsVisitable(r)?r:void 0},r.prototype.getActionForLink=function(t){var e;return null!=(e=t.getAttribute("data-turbolinks-action"))?e:"advance"},r.prototype.nodeIsVisitable=function(e){var r;return(r=t.closest(e,"[data-turbolinks]"))?"false"!==r.getAttribute("data-turbolinks"):!0},r.prototype.locationIsVisitable=function(t){return t.isPrefixedBy(this.view.getRootLocation())&&t.isHTML()},r.prototype.getCurrentRestorationData=function(){return this.getRestorationDataForIdentifier(this.restorationIdentifier)},r.prototype.getRestorationDataForIdentifier=function(t){var e;return null!=(e=this.restorationData)[t]?e[t]:e[t]={}},r}()}.call(this),function(){var e,r,n;t.start=function(){return r()?(null==t.controller&&(t.controller=e()),t.controller.start()):void 0},r=function(){return null==window.Turbolinks&&(window.Turbolinks=t),n()},e=function(){var e;return e=new t.Controller,e.adapter=new t.BrowserAdapter(e),e},n=function(){return window.Turbolinks===t},n()&&t.start()}.call(this)}).call(this),"object"==typeof module&&module.exports?module.exports=t:"function"==typeof define&&define.amd&&define(t)}).call(this);
$(function() {
  var currentTheme = '';
  $('#change-theme').on('click', 'a', function(e) {
    e.preventDefault();
    var theme = 'skitter-' +  $(this).data('theme')
    $('#change-theme a').removeClass('active');
    $(this).addClass('active');
    $('.skitter-large').removeClass(currentTheme).addClass(theme);
    currentTheme = theme;
  });

  $('#change-animation').on('click', 'a', function(e) {
    e.preventDefault();
    var animation = $(this).data('animation');
    $('#change-animation a').removeClass('active');
    $(this).addClass('active');
    $('.skitter-large').skitter('setAnimation', animation);
    $('.skitter-large').skitter('next');
  });

  var animations = $('.skitter-large').skitter('getAnimations');
  for (var i in animations) {
    var animation = animations[i];
    var item = '<li><a href="#" data-animation="' + animation + '">' + animation + '</a></li>';
    $('#change-animation ul').append(item);
  }
});
(function() {
  (function() {
    (function() {
      var slice = [].slice;

      this.ActionCable = {
        INTERNAL: {
          "message_types": {
            "welcome": "welcome",
            "ping": "ping",
            "confirmation": "confirm_subscription",
            "rejection": "reject_subscription"
          },
          "default_mount_path": "/cable",
          "protocols": ["actioncable-v1-json", "actioncable-unsupported"]
        },
        WebSocket: window.WebSocket,
        logger: window.console,
        createConsumer: function(url) {
          var ref;
          if (url == null) {
            url = (ref = this.getConfig("url")) != null ? ref : this.INTERNAL.default_mount_path;
          }
          return new ActionCable.Consumer(this.createWebSocketURL(url));
        },
        getConfig: function(name) {
          var element;
          element = document.head.querySelector("meta[name='action-cable-" + name + "']");
          return element != null ? element.getAttribute("content") : void 0;
        },
        createWebSocketURL: function(url) {
          var a;
          if (url && !/^wss?:/i.test(url)) {
            a = document.createElement("a");
            a.href = url;
            a.href = a.href;
            a.protocol = a.protocol.replace("http", "ws");
            return a.href;
          } else {
            return url;
          }
        },
        startDebugging: function() {
          return this.debugging = true;
        },
        stopDebugging: function() {
          return this.debugging = null;
        },
        log: function() {
          var messages, ref;
          messages = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          if (this.debugging) {
            messages.push(Date.now());
            return (ref = this.logger).log.apply(ref, ["[ActionCable]"].concat(slice.call(messages)));
          }
        }
      };

    }).call(this);
  }).call(this);

  var ActionCable = this.ActionCable;

  (function() {
    (function() {
      var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

      ActionCable.ConnectionMonitor = (function() {
        var clamp, now, secondsSince;

        ConnectionMonitor.pollInterval = {
          min: 3,
          max: 30
        };

        ConnectionMonitor.staleThreshold = 6;

        function ConnectionMonitor(connection) {
          this.connection = connection;
          this.visibilityDidChange = bind(this.visibilityDidChange, this);
          this.reconnectAttempts = 0;
        }

        ConnectionMonitor.prototype.start = function() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            document.addEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor started. pollInterval = " + (this.getPollInterval()) + " ms");
          }
        };

        ConnectionMonitor.prototype.stop = function() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            document.removeEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor stopped");
          }
        };

        ConnectionMonitor.prototype.isRunning = function() {
          return (this.startedAt != null) && (this.stoppedAt == null);
        };

        ConnectionMonitor.prototype.recordPing = function() {
          return this.pingedAt = now();
        };

        ConnectionMonitor.prototype.recordConnect = function() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          return ActionCable.log("ConnectionMonitor recorded connect");
        };

        ConnectionMonitor.prototype.recordDisconnect = function() {
          this.disconnectedAt = now();
          return ActionCable.log("ConnectionMonitor recorded disconnect");
        };

        ConnectionMonitor.prototype.startPolling = function() {
          this.stopPolling();
          return this.poll();
        };

        ConnectionMonitor.prototype.stopPolling = function() {
          return clearTimeout(this.pollTimeout);
        };

        ConnectionMonitor.prototype.poll = function() {
          return this.pollTimeout = setTimeout((function(_this) {
            return function() {
              _this.reconnectIfStale();
              return _this.poll();
            };
          })(this), this.getPollInterval());
        };

        ConnectionMonitor.prototype.getPollInterval = function() {
          var interval, max, min, ref;
          ref = this.constructor.pollInterval, min = ref.min, max = ref.max;
          interval = 5 * Math.log(this.reconnectAttempts + 1);
          return Math.round(clamp(interval, min, max) * 1000);
        };

        ConnectionMonitor.prototype.reconnectIfStale = function() {
          if (this.connectionIsStale()) {
            ActionCable.log("ConnectionMonitor detected stale connection. reconnectAttempts = " + this.reconnectAttempts + ", pollInterval = " + (this.getPollInterval()) + " ms, time disconnected = " + (secondsSince(this.disconnectedAt)) + " s, stale threshold = " + this.constructor.staleThreshold + " s");
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              return ActionCable.log("ConnectionMonitor skipping reopening recent disconnect");
            } else {
              ActionCable.log("ConnectionMonitor reopening");
              return this.connection.reopen();
            }
          }
        };

        ConnectionMonitor.prototype.connectionIsStale = function() {
          var ref;
          return secondsSince((ref = this.pingedAt) != null ? ref : this.startedAt) > this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.disconnectedRecently = function() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.visibilityDidChange = function() {
          if (document.visibilityState === "visible") {
            return setTimeout((function(_this) {
              return function() {
                if (_this.connectionIsStale() || !_this.connection.isOpen()) {
                  ActionCable.log("ConnectionMonitor reopening stale connection on visibilitychange. visbilityState = " + document.visibilityState);
                  return _this.connection.reopen();
                }
              };
            })(this), 200);
          }
        };

        now = function() {
          return new Date().getTime();
        };

        secondsSince = function(time) {
          return (now() - time) / 1000;
        };

        clamp = function(number, min, max) {
          return Math.max(min, Math.min(max, number));
        };

        return ConnectionMonitor;

      })();

    }).call(this);
    (function() {
      var i, message_types, protocols, ref, supportedProtocols, unsupportedProtocol,
        slice = [].slice,
        bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
        indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

      ref = ActionCable.INTERNAL, message_types = ref.message_types, protocols = ref.protocols;

      supportedProtocols = 2 <= protocols.length ? slice.call(protocols, 0, i = protocols.length - 1) : (i = 0, []), unsupportedProtocol = protocols[i++];

      ActionCable.Connection = (function() {
        Connection.reopenDelay = 500;

        function Connection(consumer) {
          this.consumer = consumer;
          this.open = bind(this.open, this);
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new ActionCable.ConnectionMonitor(this);
          this.disconnected = true;
        }

        Connection.prototype.send = function(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        };

        Connection.prototype.open = function() {
          if (this.isActive()) {
            ActionCable.log("Attempted to open WebSocket, but existing socket is " + (this.getState()));
            return false;
          } else {
            ActionCable.log("Opening WebSocket, current state is " + (this.getState()) + ", subprotocols: " + protocols);
            if (this.webSocket != null) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new ActionCable.WebSocket(this.consumer.url, protocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        };

        Connection.prototype.close = function(arg) {
          var allowReconnect, ref1;
          allowReconnect = (arg != null ? arg : {
            allowReconnect: true
          }).allowReconnect;
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isActive()) {
            return (ref1 = this.webSocket) != null ? ref1.close() : void 0;
          }
        };

        Connection.prototype.reopen = function() {
          var error;
          ActionCable.log("Reopening WebSocket, current state is " + (this.getState()));
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error1) {
              error = error1;
              return ActionCable.log("Failed to reopen WebSocket", error);
            } finally {
              ActionCable.log("Reopening WebSocket in " + this.constructor.reopenDelay + "ms");
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        };

        Connection.prototype.getProtocol = function() {
          var ref1;
          return (ref1 = this.webSocket) != null ? ref1.protocol : void 0;
        };

        Connection.prototype.isOpen = function() {
          return this.isState("open");
        };

        Connection.prototype.isActive = function() {
          return this.isState("open", "connecting");
        };

        Connection.prototype.isProtocolSupported = function() {
          var ref1;
          return ref1 = this.getProtocol(), indexOf.call(supportedProtocols, ref1) >= 0;
        };

        Connection.prototype.isState = function() {
          var ref1, states;
          states = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return ref1 = this.getState(), indexOf.call(states, ref1) >= 0;
        };

        Connection.prototype.getState = function() {
          var ref1, state, value;
          for (state in WebSocket) {
            value = WebSocket[state];
            if (value === ((ref1 = this.webSocket) != null ? ref1.readyState : void 0)) {
              return state.toLowerCase();
            }
          }
          return null;
        };

        Connection.prototype.installEventHandlers = function() {
          var eventName, handler;
          for (eventName in this.events) {
            handler = this.events[eventName].bind(this);
            this.webSocket["on" + eventName] = handler;
          }
        };

        Connection.prototype.uninstallEventHandlers = function() {
          var eventName;
          for (eventName in this.events) {
            this.webSocket["on" + eventName] = function() {};
          }
        };

        Connection.prototype.events = {
          message: function(event) {
            var identifier, message, ref1, type;
            if (!this.isProtocolSupported()) {
              return;
            }
            ref1 = JSON.parse(event.data), identifier = ref1.identifier, message = ref1.message, type = ref1.type;
            switch (type) {
              case message_types.welcome:
                this.monitor.recordConnect();
                return this.subscriptions.reload();
              case message_types.ping:
                return this.monitor.recordPing();
              case message_types.confirmation:
                return this.subscriptions.notify(identifier, "connected");
              case message_types.rejection:
                return this.subscriptions.reject(identifier);
              default:
                return this.subscriptions.notify(identifier, "received", message);
            }
          },
          open: function() {
            ActionCable.log("WebSocket onopen event, using '" + (this.getProtocol()) + "' subprotocol");
            this.disconnected = false;
            if (!this.isProtocolSupported()) {
              ActionCable.log("Protocol is unsupported. Stopping monitor and disconnecting.");
              return this.close({
                allowReconnect: false
              });
            }
          },
          close: function(event) {
            ActionCable.log("WebSocket onclose event");
            if (this.disconnected) {
              return;
            }
            this.disconnected = true;
            this.monitor.recordDisconnect();
            return this.subscriptions.notifyAll("disconnected", {
              willAttemptReconnect: this.monitor.isRunning()
            });
          },
          error: function() {
            return ActionCable.log("WebSocket onerror event");
          }
        };

        return Connection;

      })();

    }).call(this);
    (function() {
      var slice = [].slice;

      ActionCable.Subscriptions = (function() {
        function Subscriptions(consumer) {
          this.consumer = consumer;
          this.subscriptions = [];
        }

        Subscriptions.prototype.create = function(channelName, mixin) {
          var channel, params, subscription;
          channel = channelName;
          params = typeof channel === "object" ? channel : {
            channel: channel
          };
          subscription = new ActionCable.Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        };

        Subscriptions.prototype.add = function(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.sendCommand(subscription, "subscribe");
          return subscription;
        };

        Subscriptions.prototype.remove = function(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        };

        Subscriptions.prototype.reject = function(identifier) {
          var i, len, ref, results, subscription;
          ref = this.findAll(identifier);
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            this.forget(subscription);
            this.notify(subscription, "rejected");
            results.push(subscription);
          }
          return results;
        };

        Subscriptions.prototype.forget = function(subscription) {
          var s;
          this.subscriptions = (function() {
            var i, len, ref, results;
            ref = this.subscriptions;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              s = ref[i];
              if (s !== subscription) {
                results.push(s);
              }
            }
            return results;
          }).call(this);
          return subscription;
        };

        Subscriptions.prototype.findAll = function(identifier) {
          var i, len, ref, results, s;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            s = ref[i];
            if (s.identifier === identifier) {
              results.push(s);
            }
          }
          return results;
        };

        Subscriptions.prototype.reload = function() {
          var i, len, ref, results, subscription;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.sendCommand(subscription, "subscribe"));
          }
          return results;
        };

        Subscriptions.prototype.notifyAll = function() {
          var args, callbackName, i, len, ref, results, subscription;
          callbackName = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.notify.apply(this, [subscription, callbackName].concat(slice.call(args))));
          }
          return results;
        };

        Subscriptions.prototype.notify = function() {
          var args, callbackName, i, len, results, subscription, subscriptions;
          subscription = arguments[0], callbackName = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          results = [];
          for (i = 0, len = subscriptions.length; i < len; i++) {
            subscription = subscriptions[i];
            results.push(typeof subscription[callbackName] === "function" ? subscription[callbackName].apply(subscription, args) : void 0);
          }
          return results;
        };

        Subscriptions.prototype.sendCommand = function(subscription, command) {
          var identifier;
          identifier = subscription.identifier;
          return this.consumer.send({
            command: command,
            identifier: identifier
          });
        };

        return Subscriptions;

      })();

    }).call(this);
    (function() {
      ActionCable.Subscription = (function() {
        var extend;

        function Subscription(consumer, params, mixin) {
          this.consumer = consumer;
          if (params == null) {
            params = {};
          }
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }

        Subscription.prototype.perform = function(action, data) {
          if (data == null) {
            data = {};
          }
          data.action = action;
          return this.send(data);
        };

        Subscription.prototype.send = function(data) {
          return this.consumer.send({
            command: "message",
            identifier: this.identifier,
            data: JSON.stringify(data)
          });
        };

        Subscription.prototype.unsubscribe = function() {
          return this.consumer.subscriptions.remove(this);
        };

        extend = function(object, properties) {
          var key, value;
          if (properties != null) {
            for (key in properties) {
              value = properties[key];
              object[key] = value;
            }
          }
          return object;
        };

        return Subscription;

      })();

    }).call(this);
    (function() {
      ActionCable.Consumer = (function() {
        function Consumer(url) {
          this.url = url;
          this.subscriptions = new ActionCable.Subscriptions(this);
          this.connection = new ActionCable.Connection(this);
        }

        Consumer.prototype.send = function(data) {
          return this.connection.send(data);
        };

        Consumer.prototype.connect = function() {
          return this.connection.open();
        };

        Consumer.prototype.disconnect = function() {
          return this.connection.close({
            allowReconnect: false
          });
        };

        Consumer.prototype.ensureActiveConnection = function() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        };

        return Consumer;

      })();

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = ActionCable;
  } else if (typeof define === "function" && define.amd) {
    define(ActionCable);
  }
}).call(this);
// Action Cable provides the framework to deal with WebSockets in Rails.
// You can generate new channels where WebSocket features live using the `rails generate channel` command.
//




(function() {
  this.App || (this.App = {});

  App.cable = ActionCable.createConsumer();

}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
/*! jQuery v2.1.1 | (c) 2005, 2014 jQuery Foundation, Inc. | jquery.org/license */

!function(a,b){"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this,function(a,b){var c=[],d=c.slice,e=c.concat,f=c.push,g=c.indexOf,h={},i=h.toString,j=h.hasOwnProperty,k={},l=a.document,m="2.1.1",n=function(a,b){return new n.fn.init(a,b)},o=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,p=/^-ms-/,q=/-([\da-z])/gi,r=function(a,b){return b.toUpperCase()};n.fn=n.prototype={jquery:m,constructor:n,selector:"",length:0,toArray:function(){return d.call(this)},get:function(a){return null!=a?0>a?this[a+this.length]:this[a]:d.call(this)},pushStack:function(a){var b=n.merge(this.constructor(),a);return b.prevObject=this,b.context=this.context,b},each:function(a,b){return n.each(this,a,b)},map:function(a){return this.pushStack(n.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(d.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(0>a?b:0);return this.pushStack(c>=0&&b>c?[this[c]]:[])},end:function(){return this.prevObject||this.constructor(null)},push:f,sort:c.sort,splice:c.splice},n.extend=n.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||n.isFunction(g)||(g={}),h===i&&(g=this,h--);i>h;h++)if(null!=(a=arguments[h]))for(b in a)c=g[b],d=a[b],g!==d&&(j&&d&&(n.isPlainObject(d)||(e=n.isArray(d)))?(e?(e=!1,f=c&&n.isArray(c)?c:[]):f=c&&n.isPlainObject(c)?c:{},g[b]=n.extend(j,f,d)):void 0!==d&&(g[b]=d));return g},n.extend({expando:"jQuery"+(m+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===n.type(a)},isArray:Array.isArray,isWindow:function(a){return null!=a&&a===a.window},isNumeric:function(a){return!n.isArray(a)&&a-parseFloat(a)>=0},isPlainObject:function(a){return"object"!==n.type(a)||a.nodeType||n.isWindow(a)?!1:a.constructor&&!j.call(a.constructor.prototype,"isPrototypeOf")?!1:!0},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?h[i.call(a)]||"object":typeof a},globalEval:function(a){var b,c=eval;a=n.trim(a),a&&(1===a.indexOf("use strict")?(b=l.createElement("script"),b.text=a,l.head.appendChild(b).parentNode.removeChild(b)):c(a))},camelCase:function(a){return a.replace(p,"ms-").replace(q,r)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b,c){var d,e=0,f=a.length,g=s(a);if(c){if(g){for(;f>e;e++)if(d=b.apply(a[e],c),d===!1)break}else for(e in a)if(d=b.apply(a[e],c),d===!1)break}else if(g){for(;f>e;e++)if(d=b.call(a[e],e,a[e]),d===!1)break}else for(e in a)if(d=b.call(a[e],e,a[e]),d===!1)break;return a},trim:function(a){return null==a?"":(a+"").replace(o,"")},makeArray:function(a,b){var c=b||[];return null!=a&&(s(Object(a))?n.merge(c,"string"==typeof a?[a]:a):f.call(c,a)),c},inArray:function(a,b,c){return null==b?-1:g.call(b,a,c)},merge:function(a,b){for(var c=+b.length,d=0,e=a.length;c>d;d++)a[e++]=b[d];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;g>f;f++)d=!b(a[f],f),d!==h&&e.push(a[f]);return e},map:function(a,b,c){var d,f=0,g=a.length,h=s(a),i=[];if(h)for(;g>f;f++)d=b(a[f],f,c),null!=d&&i.push(d);else for(f in a)d=b(a[f],f,c),null!=d&&i.push(d);return e.apply([],i)},guid:1,proxy:function(a,b){var c,e,f;return"string"==typeof b&&(c=a[b],b=a,a=c),n.isFunction(a)?(e=d.call(arguments,2),f=function(){return a.apply(b||this,e.concat(d.call(arguments)))},f.guid=a.guid=a.guid||n.guid++,f):void 0},now:Date.now,support:k}),n.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(a,b){h["[object "+b+"]"]=b.toLowerCase()});function s(a){var b=a.length,c=n.type(a);return"function"===c||n.isWindow(a)?!1:1===a.nodeType&&b?!0:"array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a}var t=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+-new Date,v=a.document,w=0,x=0,y=gb(),z=gb(),A=gb(),B=function(a,b){return a===b&&(l=!0),0},C="undefined",D=1<<31,E={}.hasOwnProperty,F=[],G=F.pop,H=F.push,I=F.push,J=F.slice,K=F.indexOf||function(a){for(var b=0,c=this.length;c>b;b++)if(this[b]===a)return b;return-1},L="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",M="[\\x20\\t\\r\\n\\f]",N="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",O=N.replace("w","w#"),P="\\["+M+"*("+N+")(?:"+M+"*([*^$|!~]?=)"+M+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+O+"))|)"+M+"*\\]",Q=":("+N+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+P+")*)|.*)\\)|)",R=new RegExp("^"+M+"+|((?:^|[^\\\\])(?:\\\\.)*)"+M+"+$","g"),S=new RegExp("^"+M+"*,"+M+"*"),T=new RegExp("^"+M+"*([>+~]|"+M+")"+M+"*"),U=new RegExp("="+M+"*([^\\]'\"]*?)"+M+"*\\]","g"),V=new RegExp(Q),W=new RegExp("^"+O+"$"),X={ID:new RegExp("^#("+N+")"),CLASS:new RegExp("^\\.("+N+")"),TAG:new RegExp("^("+N.replace("w","w*")+")"),ATTR:new RegExp("^"+P),PSEUDO:new RegExp("^"+Q),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+M+"*(even|odd|(([+-]|)(\\d*)n|)"+M+"*(?:([+-]|)"+M+"*(\\d+)|))"+M+"*\\)|)","i"),bool:new RegExp("^(?:"+L+")$","i"),needsContext:new RegExp("^"+M+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+M+"*((?:-\\d)?\\d*)"+M+"*\\)|)(?=[^-]|$)","i")},Y=/^(?:input|select|textarea|button)$/i,Z=/^h\d$/i,$=/^[^{]+\{\s*\[native \w/,_=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,ab=/[+~]/,bb=/'|\\/g,cb=new RegExp("\\\\([\\da-f]{1,6}"+M+"?|("+M+")|.)","ig"),db=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:0>d?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)};try{I.apply(F=J.call(v.childNodes),v.childNodes),F[v.childNodes.length].nodeType}catch(eb){I={apply:F.length?function(a,b){H.apply(a,J.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function fb(a,b,d,e){var f,h,j,k,l,o,r,s,w,x;if((b?b.ownerDocument||b:v)!==n&&m(b),b=b||n,d=d||[],!a||"string"!=typeof a)return d;if(1!==(k=b.nodeType)&&9!==k)return[];if(p&&!e){if(f=_.exec(a))if(j=f[1]){if(9===k){if(h=b.getElementById(j),!h||!h.parentNode)return d;if(h.id===j)return d.push(h),d}else if(b.ownerDocument&&(h=b.ownerDocument.getElementById(j))&&t(b,h)&&h.id===j)return d.push(h),d}else{if(f[2])return I.apply(d,b.getElementsByTagName(a)),d;if((j=f[3])&&c.getElementsByClassName&&b.getElementsByClassName)return I.apply(d,b.getElementsByClassName(j)),d}if(c.qsa&&(!q||!q.test(a))){if(s=r=u,w=b,x=9===k&&a,1===k&&"object"!==b.nodeName.toLowerCase()){o=g(a),(r=b.getAttribute("id"))?s=r.replace(bb,"\\$&"):b.setAttribute("id",s),s="[id='"+s+"'] ",l=o.length;while(l--)o[l]=s+qb(o[l]);w=ab.test(a)&&ob(b.parentNode)||b,x=o.join(",")}if(x)try{return I.apply(d,w.querySelectorAll(x)),d}catch(y){}finally{r||b.removeAttribute("id")}}}return i(a.replace(R,"$1"),b,d,e)}function gb(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function hb(a){return a[u]=!0,a}function ib(a){var b=n.createElement("div");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function jb(a,b){var c=a.split("|"),e=a.length;while(e--)d.attrHandle[c[e]]=b}function kb(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||D)-(~a.sourceIndex||D);if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function lb(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function mb(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function nb(a){return hb(function(b){return b=+b,hb(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function ob(a){return a&&typeof a.getElementsByTagName!==C&&a}c=fb.support={},f=fb.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?"HTML"!==b.nodeName:!1},m=fb.setDocument=function(a){var b,e=a?a.ownerDocument||a:v,g=e.defaultView;return e!==n&&9===e.nodeType&&e.documentElement?(n=e,o=e.documentElement,p=!f(e),g&&g!==g.top&&(g.addEventListener?g.addEventListener("unload",function(){m()},!1):g.attachEvent&&g.attachEvent("onunload",function(){m()})),c.attributes=ib(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=ib(function(a){return a.appendChild(e.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=$.test(e.getElementsByClassName)&&ib(function(a){return a.innerHTML="<div class='a'></div><div class='a i'></div>",a.firstChild.className="i",2===a.getElementsByClassName("i").length}),c.getById=ib(function(a){return o.appendChild(a).id=u,!e.getElementsByName||!e.getElementsByName(u).length}),c.getById?(d.find.ID=function(a,b){if(typeof b.getElementById!==C&&p){var c=b.getElementById(a);return c&&c.parentNode?[c]:[]}},d.filter.ID=function(a){var b=a.replace(cb,db);return function(a){return a.getAttribute("id")===b}}):(delete d.find.ID,d.filter.ID=function(a){var b=a.replace(cb,db);return function(a){var c=typeof a.getAttributeNode!==C&&a.getAttributeNode("id");return c&&c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){return typeof b.getElementsByTagName!==C?b.getElementsByTagName(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){return typeof b.getElementsByClassName!==C&&p?b.getElementsByClassName(a):void 0},r=[],q=[],(c.qsa=$.test(e.querySelectorAll))&&(ib(function(a){a.innerHTML="<select msallowclip=''><option selected=''></option></select>",a.querySelectorAll("[msallowclip^='']").length&&q.push("[*^$]="+M+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||q.push("\\["+M+"*(?:value|"+L+")"),a.querySelectorAll(":checked").length||q.push(":checked")}),ib(function(a){var b=e.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&q.push("name"+M+"*[*^$|!~]?="),a.querySelectorAll(":enabled").length||q.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),q.push(",.*:")})),(c.matchesSelector=$.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&ib(function(a){c.disconnectedMatch=s.call(a,"div"),s.call(a,"[s!='']:x"),r.push("!=",Q)}),q=q.length&&new RegExp(q.join("|")),r=r.length&&new RegExp(r.join("|")),b=$.test(o.compareDocumentPosition),t=b||$.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},B=b?function(a,b){if(a===b)return l=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===e||a.ownerDocument===v&&t(v,a)?-1:b===e||b.ownerDocument===v&&t(v,b)?1:k?K.call(k,a)-K.call(k,b):0:4&d?-1:1)}:function(a,b){if(a===b)return l=!0,0;var c,d=0,f=a.parentNode,g=b.parentNode,h=[a],i=[b];if(!f||!g)return a===e?-1:b===e?1:f?-1:g?1:k?K.call(k,a)-K.call(k,b):0;if(f===g)return kb(a,b);c=a;while(c=c.parentNode)h.unshift(c);c=b;while(c=c.parentNode)i.unshift(c);while(h[d]===i[d])d++;return d?kb(h[d],i[d]):h[d]===v?-1:i[d]===v?1:0},e):n},fb.matches=function(a,b){return fb(a,null,null,b)},fb.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&&m(a),b=b.replace(U,"='$1']"),!(!c.matchesSelector||!p||r&&r.test(b)||q&&q.test(b)))try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return fb(b,n,null,[a]).length>0},fb.contains=function(a,b){return(a.ownerDocument||a)!==n&&m(a),t(a,b)},fb.attr=function(a,b){(a.ownerDocument||a)!==n&&m(a);var e=d.attrHandle[b.toLowerCase()],f=e&&E.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},fb.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},fb.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return k=null,a},e=fb.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=fb.selectors={cacheLength:50,createPseudo:hb,match:X,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(cb,db),a[3]=(a[3]||a[4]||a[5]||"").replace(cb,db),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||fb.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&fb.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&&a[2];return X.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&V.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(cb,db).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+" "];return b||(b=new RegExp("(^|"+M+")"+a+"("+M+"|$)"))&&y(a,function(a){return b.test("string"==typeof a.className&&a.className||typeof a.getAttribute!==C&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=fb.attr(d,a);return null==e?"!="===b:b?(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e+" ").indexOf(c)>-1:"|="===b?e===c||e.slice(0,c.length+1)===c+"-":!1):!0}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h;if(q){if(f){while(p){l=b;while(l=l[p])if(h?l.nodeName.toLowerCase()===r:1===l.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){k=q[u]||(q[u]={}),j=k[a]||[],n=j[0]===w&&j[1],m=j[0]===w&&j[2],l=n&&q.childNodes[n];while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if(1===l.nodeType&&++m&&l===b){k[a]=[w,n,m];break}}else if(s&&(j=(b[u]||(b[u]={}))[a])&&j[0]===w)m=j[1];else while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if((h?l.nodeName.toLowerCase()===r:1===l.nodeType)&&++m&&(s&&((l[u]||(l[u]={}))[a]=[w,m]),l===b))break;return m-=e,m===d||m%d===0&&m/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||fb.error("unsupported pseudo: "+a);return e[u]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?hb(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=K.call(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:hb(function(a){var b=[],c=[],d=h(a.replace(R,"$1"));return d[u]?hb(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),!c.pop()}}),has:hb(function(a){return function(b){return fb(a,b).length>0}}),contains:hb(function(a){return function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:hb(function(a){return W.test(a||"")||fb.error("unsupported lang: "+a),a=a.replace(cb,db).toLowerCase(),function(b){var c;do if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return Z.test(a.nodeName)},input:function(a){return Y.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:nb(function(){return[0]}),last:nb(function(a,b){return[b-1]}),eq:nb(function(a,b,c){return[0>c?c+b:c]}),even:nb(function(a,b){for(var c=0;b>c;c+=2)a.push(c);return a}),odd:nb(function(a,b){for(var c=1;b>c;c+=2)a.push(c);return a}),lt:nb(function(a,b,c){for(var d=0>c?c+b:c;--d>=0;)a.push(d);return a}),gt:nb(function(a,b,c){for(var d=0>c?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=lb(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=mb(b);function pb(){}pb.prototype=d.filters=d.pseudos,d.setFilters=new pb,g=fb.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){(!c||(e=S.exec(h)))&&(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=T.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(R," ")}),h=h.slice(c.length));for(g in d.filter)!(e=X[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?fb.error(a):z(a,i).slice(0)};function qb(a){for(var b=0,c=a.length,d="";c>b;b++)d+=a[b].value;return d}function rb(a,b,c){var d=b.dir,e=c&&"parentNode"===d,f=x++;return b.first?function(b,c,f){while(b=b[d])if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){var h,i,j=[w,f];if(g){while(b=b[d])if((1===b.nodeType||e)&&a(b,c,g))return!0}else while(b=b[d])if(1===b.nodeType||e){if(i=b[u]||(b[u]={}),(h=i[d])&&h[0]===w&&h[1]===f)return j[2]=h[2];if(i[d]=j,j[2]=a(b,c,g))return!0}}}function sb(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function tb(a,b,c){for(var d=0,e=b.length;e>d;d++)fb(a,b[d],c);return c}function ub(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;i>h;h++)(f=a[h])&&(!c||c(f,d,e))&&(g.push(f),j&&b.push(h));return g}function vb(a,b,c,d,e,f){return d&&!d[u]&&(d=vb(d)),e&&!e[u]&&(e=vb(e,f)),hb(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||tb(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:ub(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=ub(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?K.call(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=ub(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):I.apply(g,r)})}function wb(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=rb(function(a){return a===b},h,!0),l=rb(function(a){return K.call(b,a)>-1},h,!0),m=[function(a,c,d){return!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d))}];f>i;i++)if(c=d.relative[a[i].type])m=[rb(sb(m),c)];else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;f>e;e++)if(d.relative[a[e].type])break;return vb(i>1&&sb(m),i>1&&qb(a.slice(0,i-1).concat({value:" "===a[i-2].type?"*":""})).replace(R,"$1"),c,e>i&&wb(a.slice(i,e)),f>e&&wb(a=a.slice(e)),f>e&&qb(a))}m.push(c)}return sb(m)}function xb(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){var l,m,o,p=0,q="0",r=f&&[],s=[],t=j,u=f||e&&d.find.TAG("*",k),v=w+=null==t?1:Math.random()||.1,x=u.length;for(k&&(j=g!==n&&g);q!==x&&null!=(l=u[q]);q++){if(e&&l){m=0;while(o=a[m++])if(o(l,g,h)){i.push(l);break}k&&(w=v)}c&&((l=!o&&l)&&p--,f&&r.push(l))}if(p+=q,c&&q!==p){m=0;while(o=b[m++])o(r,s,g,h);if(f){if(p>0)while(q--)r[q]||s[q]||(s[q]=G.call(i));s=ub(s)}I.apply(i,s),k&&!f&&s.length>0&&p+b.length>1&&fb.uniqueSort(i)}return k&&(w=v,j=t),r};return c?hb(f):f}return h=fb.compile=function(a,b){var c,d=[],e=[],f=A[a+" "];if(!f){b||(b=g(a)),c=b.length;while(c--)f=wb(b[c]),f[u]?d.push(f):e.push(f);f=A(a,xb(e,d)),f.selector=a}return f},i=fb.select=function(a,b,e,f){var i,j,k,l,m,n="function"==typeof a&&a,o=!f&&g(a=n.selector||a);if(e=e||[],1===o.length){if(j=o[0]=o[0].slice(0),j.length>2&&"ID"===(k=j[0]).type&&c.getById&&9===b.nodeType&&p&&d.relative[j[1].type]){if(b=(d.find.ID(k.matches[0].replace(cb,db),b)||[])[0],!b)return e;n&&(b=b.parentNode),a=a.slice(j.shift().value.length)}i=X.needsContext.test(a)?0:j.length;while(i--){if(k=j[i],d.relative[l=k.type])break;if((m=d.find[l])&&(f=m(k.matches[0].replace(cb,db),ab.test(j[0].type)&&ob(b.parentNode)||b))){if(j.splice(i,1),a=f.length&&qb(j),!a)return I.apply(e,f),e;break}}}return(n||h(a,o))(f,b,!p,e,ab.test(a)&&ob(b.parentNode)||b),e},c.sortStable=u.split("").sort(B).join("")===u,c.detectDuplicates=!!l,m(),c.sortDetached=ib(function(a){return 1&a.compareDocumentPosition(n.createElement("div"))}),ib(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||jb("type|href|height|width",function(a,b,c){return c?void 0:a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&ib(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||jb("value",function(a,b,c){return c||"input"!==a.nodeName.toLowerCase()?void 0:a.defaultValue}),ib(function(a){return null==a.getAttribute("disabled")})||jb(L,function(a,b,c){var d;return c?void 0:a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),fb}(a);n.find=t,n.expr=t.selectors,n.expr[":"]=n.expr.pseudos,n.unique=t.uniqueSort,n.text=t.getText,n.isXMLDoc=t.isXML,n.contains=t.contains;var u=n.expr.match.needsContext,v=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,w=/^.[^:#\[\.,]*$/;function x(a,b,c){if(n.isFunction(b))return n.grep(a,function(a,d){return!!b.call(a,d,a)!==c});if(b.nodeType)return n.grep(a,function(a){return a===b!==c});if("string"==typeof b){if(w.test(b))return n.filter(b,a,c);b=n.filter(b,a)}return n.grep(a,function(a){return g.call(b,a)>=0!==c})}n.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?n.find.matchesSelector(d,a)?[d]:[]:n.find.matches(a,n.grep(b,function(a){return 1===a.nodeType}))},n.fn.extend({find:function(a){var b,c=this.length,d=[],e=this;if("string"!=typeof a)return this.pushStack(n(a).filter(function(){for(b=0;c>b;b++)if(n.contains(e[b],this))return!0}));for(b=0;c>b;b++)n.find(a,e[b],d);return d=this.pushStack(c>1?n.unique(d):d),d.selector=this.selector?this.selector+" "+a:a,d},filter:function(a){return this.pushStack(x(this,a||[],!1))},not:function(a){return this.pushStack(x(this,a||[],!0))},is:function(a){return!!x(this,"string"==typeof a&&u.test(a)?n(a):a||[],!1).length}});var y,z=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,A=n.fn.init=function(a,b){var c,d;if(!a)return this;if("string"==typeof a){if(c="<"===a[0]&&">"===a[a.length-1]&&a.length>=3?[null,a,null]:z.exec(a),!c||!c[1]&&b)return!b||b.jquery?(b||y).find(a):this.constructor(b).find(a);if(c[1]){if(b=b instanceof n?b[0]:b,n.merge(this,n.parseHTML(c[1],b&&b.nodeType?b.ownerDocument||b:l,!0)),v.test(c[1])&&n.isPlainObject(b))for(c in b)n.isFunction(this[c])?this[c](b[c]):this.attr(c,b[c]);return this}return d=l.getElementById(c[2]),d&&d.parentNode&&(this.length=1,this[0]=d),this.context=l,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):n.isFunction(a)?"undefined"!=typeof y.ready?y.ready(a):a(n):(void 0!==a.selector&&(this.selector=a.selector,this.context=a.context),n.makeArray(a,this))};A.prototype=n.fn,y=n(l);var B=/^(?:parents|prev(?:Until|All))/,C={children:!0,contents:!0,next:!0,prev:!0};n.extend({dir:function(a,b,c){var d=[],e=void 0!==c;while((a=a[b])&&9!==a.nodeType)if(1===a.nodeType){if(e&&n(a).is(c))break;d.push(a)}return d},sibling:function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c}}),n.fn.extend({has:function(a){var b=n(a,this),c=b.length;return this.filter(function(){for(var a=0;c>a;a++)if(n.contains(this,b[a]))return!0})},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=u.test(a)||"string"!=typeof a?n(a,b||this.context):0;e>d;d++)for(c=this[d];c&&c!==b;c=c.parentNode)if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&n.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length>1?n.unique(f):f)},index:function(a){return a?"string"==typeof a?g.call(n(a),this[0]):g.call(this,a.jquery?a[0]:a):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(n.unique(n.merge(this.get(),n(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function D(a,b){while((a=a[b])&&1!==a.nodeType);return a}n.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return n.dir(a,"parentNode")},parentsUntil:function(a,b,c){return n.dir(a,"parentNode",c)},next:function(a){return D(a,"nextSibling")},prev:function(a){return D(a,"previousSibling")},nextAll:function(a){return n.dir(a,"nextSibling")},prevAll:function(a){return n.dir(a,"previousSibling")},nextUntil:function(a,b,c){return n.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return n.dir(a,"previousSibling",c)},siblings:function(a){return n.sibling((a.parentNode||{}).firstChild,a)},children:function(a){return n.sibling(a.firstChild)},contents:function(a){return a.contentDocument||n.merge([],a.childNodes)}},function(a,b){n.fn[a]=function(c,d){var e=n.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=n.filter(d,e)),this.length>1&&(C[a]||n.unique(e),B.test(a)&&e.reverse()),this.pushStack(e)}});var E=/\S+/g,F={};function G(a){var b=F[a]={};return n.each(a.match(E)||[],function(a,c){b[c]=!0}),b}n.Callbacks=function(a){a="string"==typeof a?F[a]||G(a):n.extend({},a);var b,c,d,e,f,g,h=[],i=!a.once&&[],j=function(l){for(b=a.memory&&l,c=!0,g=e||0,e=0,f=h.length,d=!0;h&&f>g;g++)if(h[g].apply(l[0],l[1])===!1&&a.stopOnFalse){b=!1;break}d=!1,h&&(i?i.length&&j(i.shift()):b?h=[]:k.disable())},k={add:function(){if(h){var c=h.length;!function g(b){n.each(b,function(b,c){var d=n.type(c);"function"===d?a.unique&&k.has(c)||h.push(c):c&&c.length&&"string"!==d&&g(c)})}(arguments),d?f=h.length:b&&(e=c,j(b))}return this},remove:function(){return h&&n.each(arguments,function(a,b){var c;while((c=n.inArray(b,h,c))>-1)h.splice(c,1),d&&(f>=c&&f--,g>=c&&g--)}),this},has:function(a){return a?n.inArray(a,h)>-1:!(!h||!h.length)},empty:function(){return h=[],f=0,this},disable:function(){return h=i=b=void 0,this},disabled:function(){return!h},lock:function(){return i=void 0,b||k.disable(),this},locked:function(){return!i},fireWith:function(a,b){return!h||c&&!i||(b=b||[],b=[a,b.slice?b.slice():b],d?i.push(b):j(b)),this},fire:function(){return k.fireWith(this,arguments),this},fired:function(){return!!c}};return k},n.extend({Deferred:function(a){var b=[["resolve","done",n.Callbacks("once memory"),"resolved"],["reject","fail",n.Callbacks("once memory"),"rejected"],["notify","progress",n.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return n.Deferred(function(c){n.each(b,function(b,f){var g=n.isFunction(a[b])&&a[b];e[f[1]](function(){var a=g&&g.apply(this,arguments);a&&n.isFunction(a.promise)?a.promise().done(c.resolve).fail(c.reject).progress(c.notify):c[f[0]+"With"](this===d?c.promise():this,g?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?n.extend(a,d):d}},e={};return d.pipe=d.then,n.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=function(){return e[f[0]+"With"](this===e?d:this,arguments),this},e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b=0,c=d.call(arguments),e=c.length,f=1!==e||a&&n.isFunction(a.promise)?e:0,g=1===f?a:n.Deferred(),h=function(a,b,c){return function(e){b[a]=this,c[a]=arguments.length>1?d.call(arguments):e,c===i?g.notifyWith(b,c):--f||g.resolveWith(b,c)}},i,j,k;if(e>1)for(i=new Array(e),j=new Array(e),k=new Array(e);e>b;b++)c[b]&&n.isFunction(c[b].promise)?c[b].promise().done(h(b,k,c)).fail(g.reject).progress(h(b,j,i)):--f;return f||g.resolveWith(k,c),g.promise()}});var H;n.fn.ready=function(a){return n.ready.promise().done(a),this},n.extend({isReady:!1,readyWait:1,holdReady:function(a){a?n.readyWait++:n.ready(!0)},ready:function(a){(a===!0?--n.readyWait:n.isReady)||(n.isReady=!0,a!==!0&&--n.readyWait>0||(H.resolveWith(l,[n]),n.fn.triggerHandler&&(n(l).triggerHandler("ready"),n(l).off("ready"))))}});function I(){l.removeEventListener("DOMContentLoaded",I,!1),a.removeEventListener("load",I,!1),n.ready()}n.ready.promise=function(b){return H||(H=n.Deferred(),"complete"===l.readyState?setTimeout(n.ready):(l.addEventListener("DOMContentLoaded",I,!1),a.addEventListener("load",I,!1))),H.promise(b)},n.ready.promise();var J=n.access=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===n.type(c)){e=!0;for(h in c)n.access(a,b,h,c[h],!0,f,g)}else if(void 0!==d&&(e=!0,n.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(n(a),c)})),b))for(;i>h;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f};n.acceptData=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType};function K(){Object.defineProperty(this.cache={},0,{get:function(){return{}}}),this.expando=n.expando+Math.random()}K.uid=1,K.accepts=n.acceptData,K.prototype={key:function(a){if(!K.accepts(a))return 0;var b={},c=a[this.expando];if(!c){c=K.uid++;try{b[this.expando]={value:c},Object.defineProperties(a,b)}catch(d){b[this.expando]=c,n.extend(a,b)}}return this.cache[c]||(this.cache[c]={}),c},set:function(a,b,c){var d,e=this.key(a),f=this.cache[e];if("string"==typeof b)f[b]=c;else if(n.isEmptyObject(f))n.extend(this.cache[e],b);else for(d in b)f[d]=b[d];return f},get:function(a,b){var c=this.cache[this.key(a)];return void 0===b?c:c[b]},access:function(a,b,c){var d;return void 0===b||b&&"string"==typeof b&&void 0===c?(d=this.get(a,b),void 0!==d?d:this.get(a,n.camelCase(b))):(this.set(a,b,c),void 0!==c?c:b)},remove:function(a,b){var c,d,e,f=this.key(a),g=this.cache[f];if(void 0===b)this.cache[f]={};else{n.isArray(b)?d=b.concat(b.map(n.camelCase)):(e=n.camelCase(b),b in g?d=[b,e]:(d=e,d=d in g?[d]:d.match(E)||[])),c=d.length;while(c--)delete g[d[c]]}},hasData:function(a){return!n.isEmptyObject(this.cache[a[this.expando]]||{})},discard:function(a){a[this.expando]&&delete this.cache[a[this.expando]]}};var L=new K,M=new K,N=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,O=/([A-Z])/g;function P(a,b,c){var d;if(void 0===c&&1===a.nodeType)if(d="data-"+b.replace(O,"-$1").toLowerCase(),c=a.getAttribute(d),"string"==typeof c){try{c="true"===c?!0:"false"===c?!1:"null"===c?null:+c+""===c?+c:N.test(c)?n.parseJSON(c):c}catch(e){}M.set(a,b,c)}else c=void 0;return c}n.extend({hasData:function(a){return M.hasData(a)||L.hasData(a)},data:function(a,b,c){return M.access(a,b,c)},removeData:function(a,b){M.remove(a,b)
},_data:function(a,b,c){return L.access(a,b,c)},_removeData:function(a,b){L.remove(a,b)}}),n.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=M.get(f),1===f.nodeType&&!L.get(f,"hasDataAttrs"))){c=g.length;while(c--)g[c]&&(d=g[c].name,0===d.indexOf("data-")&&(d=n.camelCase(d.slice(5)),P(f,d,e[d])));L.set(f,"hasDataAttrs",!0)}return e}return"object"==typeof a?this.each(function(){M.set(this,a)}):J(this,function(b){var c,d=n.camelCase(a);if(f&&void 0===b){if(c=M.get(f,a),void 0!==c)return c;if(c=M.get(f,d),void 0!==c)return c;if(c=P(f,d,void 0),void 0!==c)return c}else this.each(function(){var c=M.get(this,d);M.set(this,d,b),-1!==a.indexOf("-")&&void 0!==c&&M.set(this,a,b)})},null,b,arguments.length>1,null,!0)},removeData:function(a){return this.each(function(){M.remove(this,a)})}}),n.extend({queue:function(a,b,c){var d;return a?(b=(b||"fx")+"queue",d=L.get(a,b),c&&(!d||n.isArray(c)?d=L.access(a,b,n.makeArray(c)):d.push(c)),d||[]):void 0},dequeue:function(a,b){b=b||"fx";var c=n.queue(a,b),d=c.length,e=c.shift(),f=n._queueHooks(a,b),g=function(){n.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return L.get(a,c)||L.access(a,c,{empty:n.Callbacks("once memory").add(function(){L.remove(a,[b+"queue",c])})})}}),n.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?n.queue(this[0],a):void 0===b?this:this.each(function(){var c=n.queue(this,a,b);n._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&n.dequeue(this,a)})},dequeue:function(a){return this.each(function(){n.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=n.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while(g--)c=L.get(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var Q=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,R=["Top","Right","Bottom","Left"],S=function(a,b){return a=b||a,"none"===n.css(a,"display")||!n.contains(a.ownerDocument,a)},T=/^(?:checkbox|radio)$/i;!function(){var a=l.createDocumentFragment(),b=a.appendChild(l.createElement("div")),c=l.createElement("input");c.setAttribute("type","radio"),c.setAttribute("checked","checked"),c.setAttribute("name","t"),b.appendChild(c),k.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,b.innerHTML="<textarea>x</textarea>",k.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue}();var U="undefined";k.focusinBubbles="onfocusin"in a;var V=/^key/,W=/^(?:mouse|pointer|contextmenu)|click/,X=/^(?:focusinfocus|focusoutblur)$/,Y=/^([^.]*)(?:\.(.+)|)$/;function Z(){return!0}function $(){return!1}function _(){try{return l.activeElement}catch(a){}}n.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=L.get(a);if(r){c.handler&&(f=c,c=f.handler,e=f.selector),c.guid||(c.guid=n.guid++),(i=r.events)||(i=r.events={}),(g=r.handle)||(g=r.handle=function(b){return typeof n!==U&&n.event.triggered!==b.type?n.event.dispatch.apply(a,arguments):void 0}),b=(b||"").match(E)||[""],j=b.length;while(j--)h=Y.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o&&(l=n.event.special[o]||{},o=(e?l.delegateType:l.bindType)||o,l=n.event.special[o]||{},k=n.extend({type:o,origType:q,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&n.expr.match.needsContext.test(e),namespace:p.join(".")},f),(m=i[o])||(m=i[o]=[],m.delegateCount=0,l.setup&&l.setup.call(a,d,p,g)!==!1||a.addEventListener&&a.addEventListener(o,g,!1)),l.add&&(l.add.call(a,k),k.handler.guid||(k.handler.guid=c.guid)),e?m.splice(m.delegateCount++,0,k):m.push(k),n.event.global[o]=!0)}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=L.hasData(a)&&L.get(a);if(r&&(i=r.events)){b=(b||"").match(E)||[""],j=b.length;while(j--)if(h=Y.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o){l=n.event.special[o]||{},o=(d?l.delegateType:l.bindType)||o,m=i[o]||[],h=h[2]&&new RegExp("(^|\\.)"+p.join("\\.(?:.*\\.|)")+"(\\.|$)"),g=f=m.length;while(f--)k=m[f],!e&&q!==k.origType||c&&c.guid!==k.guid||h&&!h.test(k.namespace)||d&&d!==k.selector&&("**"!==d||!k.selector)||(m.splice(f,1),k.selector&&m.delegateCount--,l.remove&&l.remove.call(a,k));g&&!m.length&&(l.teardown&&l.teardown.call(a,p,r.handle)!==!1||n.removeEvent(a,o,r.handle),delete i[o])}else for(o in i)n.event.remove(a,o+b[j],c,d,!0);n.isEmptyObject(i)&&(delete r.handle,L.remove(a,"events"))}},trigger:function(b,c,d,e){var f,g,h,i,k,m,o,p=[d||l],q=j.call(b,"type")?b.type:b,r=j.call(b,"namespace")?b.namespace.split("."):[];if(g=h=d=d||l,3!==d.nodeType&&8!==d.nodeType&&!X.test(q+n.event.triggered)&&(q.indexOf(".")>=0&&(r=q.split("."),q=r.shift(),r.sort()),k=q.indexOf(":")<0&&"on"+q,b=b[n.expando]?b:new n.Event(q,"object"==typeof b&&b),b.isTrigger=e?2:3,b.namespace=r.join("."),b.namespace_re=b.namespace?new RegExp("(^|\\.)"+r.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=d),c=null==c?[b]:n.makeArray(c,[b]),o=n.event.special[q]||{},e||!o.trigger||o.trigger.apply(d,c)!==!1)){if(!e&&!o.noBubble&&!n.isWindow(d)){for(i=o.delegateType||q,X.test(i+q)||(g=g.parentNode);g;g=g.parentNode)p.push(g),h=g;h===(d.ownerDocument||l)&&p.push(h.defaultView||h.parentWindow||a)}f=0;while((g=p[f++])&&!b.isPropagationStopped())b.type=f>1?i:o.bindType||q,m=(L.get(g,"events")||{})[b.type]&&L.get(g,"handle"),m&&m.apply(g,c),m=k&&g[k],m&&m.apply&&n.acceptData(g)&&(b.result=m.apply(g,c),b.result===!1&&b.preventDefault());return b.type=q,e||b.isDefaultPrevented()||o._default&&o._default.apply(p.pop(),c)!==!1||!n.acceptData(d)||k&&n.isFunction(d[q])&&!n.isWindow(d)&&(h=d[k],h&&(d[k]=null),n.event.triggered=q,d[q](),n.event.triggered=void 0,h&&(d[k]=h)),b.result}},dispatch:function(a){a=n.event.fix(a);var b,c,e,f,g,h=[],i=d.call(arguments),j=(L.get(this,"events")||{})[a.type]||[],k=n.event.special[a.type]||{};if(i[0]=a,a.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,a)!==!1){h=n.event.handlers.call(this,a,j),b=0;while((f=h[b++])&&!a.isPropagationStopped()){a.currentTarget=f.elem,c=0;while((g=f.handlers[c++])&&!a.isImmediatePropagationStopped())(!a.namespace_re||a.namespace_re.test(g.namespace))&&(a.handleObj=g,a.data=g.data,e=((n.event.special[g.origType]||{}).handle||g.handler).apply(f.elem,i),void 0!==e&&(a.result=e)===!1&&(a.preventDefault(),a.stopPropagation()))}return k.postDispatch&&k.postDispatch.call(this,a),a.result}},handlers:function(a,b){var c,d,e,f,g=[],h=b.delegateCount,i=a.target;if(h&&i.nodeType&&(!a.button||"click"!==a.type))for(;i!==this;i=i.parentNode||this)if(i.disabled!==!0||"click"!==a.type){for(d=[],c=0;h>c;c++)f=b[c],e=f.selector+" ",void 0===d[e]&&(d[e]=f.needsContext?n(e,this).index(i)>=0:n.find(e,this,null,[i]).length),d[e]&&d.push(f);d.length&&g.push({elem:i,handlers:d})}return h<b.length&&g.push({elem:this,handlers:b.slice(h)}),g},props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,b){var c,d,e,f=b.button;return null==a.pageX&&null!=b.clientX&&(c=a.target.ownerDocument||l,d=c.documentElement,e=c.body,a.pageX=b.clientX+(d&&d.scrollLeft||e&&e.scrollLeft||0)-(d&&d.clientLeft||e&&e.clientLeft||0),a.pageY=b.clientY+(d&&d.scrollTop||e&&e.scrollTop||0)-(d&&d.clientTop||e&&e.clientTop||0)),a.which||void 0===f||(a.which=1&f?1:2&f?3:4&f?2:0),a}},fix:function(a){if(a[n.expando])return a;var b,c,d,e=a.type,f=a,g=this.fixHooks[e];g||(this.fixHooks[e]=g=W.test(e)?this.mouseHooks:V.test(e)?this.keyHooks:{}),d=g.props?this.props.concat(g.props):this.props,a=new n.Event(f),b=d.length;while(b--)c=d[b],a[c]=f[c];return a.target||(a.target=l),3===a.target.nodeType&&(a.target=a.target.parentNode),g.filter?g.filter(a,f):a},special:{load:{noBubble:!0},focus:{trigger:function(){return this!==_()&&this.focus?(this.focus(),!1):void 0},delegateType:"focusin"},blur:{trigger:function(){return this===_()&&this.blur?(this.blur(),!1):void 0},delegateType:"focusout"},click:{trigger:function(){return"checkbox"===this.type&&this.click&&n.nodeName(this,"input")?(this.click(),!1):void 0},_default:function(a){return n.nodeName(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&a.originalEvent&&(a.originalEvent.returnValue=a.result)}}},simulate:function(a,b,c,d){var e=n.extend(new n.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?n.event.trigger(e,null,b):n.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},n.removeEvent=function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)},n.Event=function(a,b){return this instanceof n.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.returnValue===!1?Z:$):this.type=a,b&&n.extend(this,b),this.timeStamp=a&&a.timeStamp||n.now(),void(this[n.expando]=!0)):new n.Event(a,b)},n.Event.prototype={isDefaultPrevented:$,isPropagationStopped:$,isImmediatePropagationStopped:$,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=Z,a&&a.preventDefault&&a.preventDefault()},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=Z,a&&a.stopPropagation&&a.stopPropagation()},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=Z,a&&a.stopImmediatePropagation&&a.stopImmediatePropagation(),this.stopPropagation()}},n.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(a,b){n.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return(!e||e!==d&&!n.contains(d,e))&&(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),k.focusinBubbles||n.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){n.event.simulate(b,a.target,n.event.fix(a),!0)};n.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=L.access(d,b);e||d.addEventListener(a,c,!0),L.access(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=L.access(d,b)-1;e?L.access(d,b,e):(d.removeEventListener(a,c,!0),L.remove(d,b))}}}),n.fn.extend({on:function(a,b,c,d,e){var f,g;if("object"==typeof a){"string"!=typeof b&&(c=c||b,b=void 0);for(g in a)this.on(g,b,c,a[g],e);return this}if(null==c&&null==d?(d=b,c=b=void 0):null==d&&("string"==typeof b?(d=c,c=void 0):(d=c,c=b,b=void 0)),d===!1)d=$;else if(!d)return this;return 1===e&&(f=d,d=function(a){return n().off(a),f.apply(this,arguments)},d.guid=f.guid||(f.guid=n.guid++)),this.each(function(){n.event.add(this,a,d,c,b)})},one:function(a,b,c,d){return this.on(a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj)return d=a.handleObj,n(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this;if("object"==typeof a){for(e in a)this.off(e,b,a[e]);return this}return(b===!1||"function"==typeof b)&&(c=b,b=void 0),c===!1&&(c=$),this.each(function(){n.event.remove(this,a,c,b)})},trigger:function(a,b){return this.each(function(){n.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];return c?n.event.trigger(a,b,c,!0):void 0}});var ab=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,bb=/<([\w:]+)/,cb=/<|&#?\w+;/,db=/<(?:script|style|link)/i,eb=/checked\s*(?:[^=]|=\s*.checked.)/i,fb=/^$|\/(?:java|ecma)script/i,gb=/^true\/(.*)/,hb=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,ib={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};ib.optgroup=ib.option,ib.tbody=ib.tfoot=ib.colgroup=ib.caption=ib.thead,ib.th=ib.td;function jb(a,b){return n.nodeName(a,"table")&&n.nodeName(11!==b.nodeType?b:b.firstChild,"tr")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function kb(a){return a.type=(null!==a.getAttribute("type"))+"/"+a.type,a}function lb(a){var b=gb.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function mb(a,b){for(var c=0,d=a.length;d>c;c++)L.set(a[c],"globalEval",!b||L.get(b[c],"globalEval"))}function nb(a,b){var c,d,e,f,g,h,i,j;if(1===b.nodeType){if(L.hasData(a)&&(f=L.access(a),g=L.set(b,f),j=f.events)){delete g.handle,g.events={};for(e in j)for(c=0,d=j[e].length;d>c;c++)n.event.add(b,e,j[e][c])}M.hasData(a)&&(h=M.access(a),i=n.extend({},h),M.set(b,i))}}function ob(a,b){var c=a.getElementsByTagName?a.getElementsByTagName(b||"*"):a.querySelectorAll?a.querySelectorAll(b||"*"):[];return void 0===b||b&&n.nodeName(a,b)?n.merge([a],c):c}function pb(a,b){var c=b.nodeName.toLowerCase();"input"===c&&T.test(a.type)?b.checked=a.checked:("input"===c||"textarea"===c)&&(b.defaultValue=a.defaultValue)}n.extend({clone:function(a,b,c){var d,e,f,g,h=a.cloneNode(!0),i=n.contains(a.ownerDocument,a);if(!(k.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||n.isXMLDoc(a)))for(g=ob(h),f=ob(a),d=0,e=f.length;e>d;d++)pb(f[d],g[d]);if(b)if(c)for(f=f||ob(a),g=g||ob(h),d=0,e=f.length;e>d;d++)nb(f[d],g[d]);else nb(a,h);return g=ob(h,"script"),g.length>0&&mb(g,!i&&ob(a,"script")),h},buildFragment:function(a,b,c,d){for(var e,f,g,h,i,j,k=b.createDocumentFragment(),l=[],m=0,o=a.length;o>m;m++)if(e=a[m],e||0===e)if("object"===n.type(e))n.merge(l,e.nodeType?[e]:e);else if(cb.test(e)){f=f||k.appendChild(b.createElement("div")),g=(bb.exec(e)||["",""])[1].toLowerCase(),h=ib[g]||ib._default,f.innerHTML=h[1]+e.replace(ab,"<$1></$2>")+h[2],j=h[0];while(j--)f=f.lastChild;n.merge(l,f.childNodes),f=k.firstChild,f.textContent=""}else l.push(b.createTextNode(e));k.textContent="",m=0;while(e=l[m++])if((!d||-1===n.inArray(e,d))&&(i=n.contains(e.ownerDocument,e),f=ob(k.appendChild(e),"script"),i&&mb(f),c)){j=0;while(e=f[j++])fb.test(e.type||"")&&c.push(e)}return k},cleanData:function(a){for(var b,c,d,e,f=n.event.special,g=0;void 0!==(c=a[g]);g++){if(n.acceptData(c)&&(e=c[L.expando],e&&(b=L.cache[e]))){if(b.events)for(d in b.events)f[d]?n.event.remove(c,d):n.removeEvent(c,d,b.handle);L.cache[e]&&delete L.cache[e]}delete M.cache[c[M.expando]]}}}),n.fn.extend({text:function(a){return J(this,function(a){return void 0===a?n.text(this):this.empty().each(function(){(1===this.nodeType||11===this.nodeType||9===this.nodeType)&&(this.textContent=a)})},null,a,arguments.length)},append:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=jb(this,a);b.appendChild(a)}})},prepend:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=jb(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},remove:function(a,b){for(var c,d=a?n.filter(a,this):this,e=0;null!=(c=d[e]);e++)b||1!==c.nodeType||n.cleanData(ob(c)),c.parentNode&&(b&&n.contains(c.ownerDocument,c)&&mb(ob(c,"script")),c.parentNode.removeChild(c));return this},empty:function(){for(var a,b=0;null!=(a=this[b]);b++)1===a.nodeType&&(n.cleanData(ob(a,!1)),a.textContent="");return this},clone:function(a,b){return a=null==a?!1:a,b=null==b?a:b,this.map(function(){return n.clone(this,a,b)})},html:function(a){return J(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a&&1===b.nodeType)return b.innerHTML;if("string"==typeof a&&!db.test(a)&&!ib[(bb.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(ab,"<$1></$2>");try{for(;d>c;c++)b=this[c]||{},1===b.nodeType&&(n.cleanData(ob(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=arguments[0];return this.domManip(arguments,function(b){a=this.parentNode,n.cleanData(ob(this)),a&&a.replaceChild(b,this)}),a&&(a.length||a.nodeType)?this:this.remove()},detach:function(a){return this.remove(a,!0)},domManip:function(a,b){a=e.apply([],a);var c,d,f,g,h,i,j=0,l=this.length,m=this,o=l-1,p=a[0],q=n.isFunction(p);if(q||l>1&&"string"==typeof p&&!k.checkClone&&eb.test(p))return this.each(function(c){var d=m.eq(c);q&&(a[0]=p.call(this,c,d.html())),d.domManip(a,b)});if(l&&(c=n.buildFragment(a,this[0].ownerDocument,!1,this),d=c.firstChild,1===c.childNodes.length&&(c=d),d)){for(f=n.map(ob(c,"script"),kb),g=f.length;l>j;j++)h=c,j!==o&&(h=n.clone(h,!0,!0),g&&n.merge(f,ob(h,"script"))),b.call(this[j],h,j);if(g)for(i=f[f.length-1].ownerDocument,n.map(f,lb),j=0;g>j;j++)h=f[j],fb.test(h.type||"")&&!L.access(h,"globalEval")&&n.contains(i,h)&&(h.src?n._evalUrl&&n._evalUrl(h.src):n.globalEval(h.textContent.replace(hb,"")))}return this}}),n.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){n.fn[a]=function(a){for(var c,d=[],e=n(a),g=e.length-1,h=0;g>=h;h++)c=h===g?this:this.clone(!0),n(e[h])[b](c),f.apply(d,c.get());return this.pushStack(d)}});var qb,rb={};function sb(b,c){var d,e=n(c.createElement(b)).appendTo(c.body),f=a.getDefaultComputedStyle&&(d=a.getDefaultComputedStyle(e[0]))?d.display:n.css(e[0],"display");return e.detach(),f}function tb(a){var b=l,c=rb[a];return c||(c=sb(a,b),"none"!==c&&c||(qb=(qb||n("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement),b=qb[0].contentDocument,b.write(),b.close(),c=sb(a,b),qb.detach()),rb[a]=c),c}var ub=/^margin/,vb=new RegExp("^("+Q+")(?!px)[a-z%]+$","i"),wb=function(a){return a.ownerDocument.defaultView.getComputedStyle(a,null)};function xb(a,b,c){var d,e,f,g,h=a.style;return c=c||wb(a),c&&(g=c.getPropertyValue(b)||c[b]),c&&(""!==g||n.contains(a.ownerDocument,a)||(g=n.style(a,b)),vb.test(g)&&ub.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f)),void 0!==g?g+"":g}function yb(a,b){return{get:function(){return a()?void delete this.get:(this.get=b).apply(this,arguments)}}}!function(){var b,c,d=l.documentElement,e=l.createElement("div"),f=l.createElement("div");if(f.style){f.style.backgroundClip="content-box",f.cloneNode(!0).style.backgroundClip="",k.clearCloneStyle="content-box"===f.style.backgroundClip,e.style.cssText="border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;position:absolute",e.appendChild(f);function g(){f.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute",f.innerHTML="",d.appendChild(e);var g=a.getComputedStyle(f,null);b="1%"!==g.top,c="4px"===g.width,d.removeChild(e)}a.getComputedStyle&&n.extend(k,{pixelPosition:function(){return g(),b},boxSizingReliable:function(){return null==c&&g(),c},reliableMarginRight:function(){var b,c=f.appendChild(l.createElement("div"));return c.style.cssText=f.style.cssText="-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0",c.style.marginRight=c.style.width="0",f.style.width="1px",d.appendChild(e),b=!parseFloat(a.getComputedStyle(c,null).marginRight),d.removeChild(e),b}})}}(),n.swap=function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e};var zb=/^(none|table(?!-c[ea]).+)/,Ab=new RegExp("^("+Q+")(.*)$","i"),Bb=new RegExp("^([+-])=("+Q+")","i"),Cb={position:"absolute",visibility:"hidden",display:"block"},Db={letterSpacing:"0",fontWeight:"400"},Eb=["Webkit","O","Moz","ms"];function Fb(a,b){if(b in a)return b;var c=b[0].toUpperCase()+b.slice(1),d=b,e=Eb.length;while(e--)if(b=Eb[e]+c,b in a)return b;return d}function Gb(a,b,c){var d=Ab.exec(b);return d?Math.max(0,d[1]-(c||0))+(d[2]||"px"):b}function Hb(a,b,c,d,e){for(var f=c===(d?"border":"content")?4:"width"===b?1:0,g=0;4>f;f+=2)"margin"===c&&(g+=n.css(a,c+R[f],!0,e)),d?("content"===c&&(g-=n.css(a,"padding"+R[f],!0,e)),"margin"!==c&&(g-=n.css(a,"border"+R[f]+"Width",!0,e))):(g+=n.css(a,"padding"+R[f],!0,e),"padding"!==c&&(g+=n.css(a,"border"+R[f]+"Width",!0,e)));return g}function Ib(a,b,c){var d=!0,e="width"===b?a.offsetWidth:a.offsetHeight,f=wb(a),g="border-box"===n.css(a,"boxSizing",!1,f);if(0>=e||null==e){if(e=xb(a,b,f),(0>e||null==e)&&(e=a.style[b]),vb.test(e))return e;d=g&&(k.boxSizingReliable()||e===a.style[b]),e=parseFloat(e)||0}return e+Hb(a,b,c||(g?"border":"content"),d,f)+"px"}function Jb(a,b){for(var c,d,e,f=[],g=0,h=a.length;h>g;g++)d=a[g],d.style&&(f[g]=L.get(d,"olddisplay"),c=d.style.display,b?(f[g]||"none"!==c||(d.style.display=""),""===d.style.display&&S(d)&&(f[g]=L.access(d,"olddisplay",tb(d.nodeName)))):(e=S(d),"none"===c&&e||L.set(d,"olddisplay",e?c:n.css(d,"display"))));for(g=0;h>g;g++)d=a[g],d.style&&(b&&"none"!==d.style.display&&""!==d.style.display||(d.style.display=b?f[g]||"":"none"));return a}n.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=xb(a,"opacity");return""===c?"1":c}}}},cssNumber:{columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(a,b,c,d){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=n.camelCase(b),i=a.style;return b=n.cssProps[h]||(n.cssProps[h]=Fb(i,h)),g=n.cssHooks[b]||n.cssHooks[h],void 0===c?g&&"get"in g&&void 0!==(e=g.get(a,!1,d))?e:i[b]:(f=typeof c,"string"===f&&(e=Bb.exec(c))&&(c=(e[1]+1)*e[2]+parseFloat(n.css(a,b)),f="number"),null!=c&&c===c&&("number"!==f||n.cssNumber[h]||(c+="px"),k.clearCloneStyle||""!==c||0!==b.indexOf("background")||(i[b]="inherit"),g&&"set"in g&&void 0===(c=g.set(a,c,d))||(i[b]=c)),void 0)}},css:function(a,b,c,d){var e,f,g,h=n.camelCase(b);return b=n.cssProps[h]||(n.cssProps[h]=Fb(a.style,h)),g=n.cssHooks[b]||n.cssHooks[h],g&&"get"in g&&(e=g.get(a,!0,c)),void 0===e&&(e=xb(a,b,d)),"normal"===e&&b in Db&&(e=Db[b]),""===c||c?(f=parseFloat(e),c===!0||n.isNumeric(f)?f||0:e):e}}),n.each(["height","width"],function(a,b){n.cssHooks[b]={get:function(a,c,d){return c?zb.test(n.css(a,"display"))&&0===a.offsetWidth?n.swap(a,Cb,function(){return Ib(a,b,d)}):Ib(a,b,d):void 0},set:function(a,c,d){var e=d&&wb(a);return Gb(a,c,d?Hb(a,b,d,"border-box"===n.css(a,"boxSizing",!1,e),e):0)}}}),n.cssHooks.marginRight=yb(k.reliableMarginRight,function(a,b){return b?n.swap(a,{display:"inline-block"},xb,[a,"marginRight"]):void 0}),n.each({margin:"",padding:"",border:"Width"},function(a,b){n.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];4>d;d++)e[a+R[d]+b]=f[d]||f[d-2]||f[0];return e}},ub.test(a)||(n.cssHooks[a+b].set=Gb)}),n.fn.extend({css:function(a,b){return J(this,function(a,b,c){var d,e,f={},g=0;if(n.isArray(b)){for(d=wb(a),e=b.length;e>g;g++)f[b[g]]=n.css(a,b[g],!1,d);return f}return void 0!==c?n.style(a,b,c):n.css(a,b)},a,b,arguments.length>1)},show:function(){return Jb(this,!0)},hide:function(){return Jb(this)},toggle:function(a){return"boolean"==typeof a?a?this.show():this.hide():this.each(function(){S(this)?n(this).show():n(this).hide()})}});function Kb(a,b,c,d,e){return new Kb.prototype.init(a,b,c,d,e)}n.Tween=Kb,Kb.prototype={constructor:Kb,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||"swing",this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(n.cssNumber[c]?"":"px")},cur:function(){var a=Kb.propHooks[this.prop];return a&&a.get?a.get(this):Kb.propHooks._default.get(this)},run:function(a){var b,c=Kb.propHooks[this.prop];return this.pos=b=this.options.duration?n.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):Kb.propHooks._default.set(this),this}},Kb.prototype.init.prototype=Kb.prototype,Kb.propHooks={_default:{get:function(a){var b;return null==a.elem[a.prop]||a.elem.style&&null!=a.elem.style[a.prop]?(b=n.css(a.elem,a.prop,""),b&&"auto"!==b?b:0):a.elem[a.prop]},set:function(a){n.fx.step[a.prop]?n.fx.step[a.prop](a):a.elem.style&&(null!=a.elem.style[n.cssProps[a.prop]]||n.cssHooks[a.prop])?n.style(a.elem,a.prop,a.now+a.unit):a.elem[a.prop]=a.now}}},Kb.propHooks.scrollTop=Kb.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},n.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2}},n.fx=Kb.prototype.init,n.fx.step={};var Lb,Mb,Nb=/^(?:toggle|show|hide)$/,Ob=new RegExp("^(?:([+-])=|)("+Q+")([a-z%]*)$","i"),Pb=/queueHooks$/,Qb=[Vb],Rb={"*":[function(a,b){var c=this.createTween(a,b),d=c.cur(),e=Ob.exec(b),f=e&&e[3]||(n.cssNumber[a]?"":"px"),g=(n.cssNumber[a]||"px"!==f&&+d)&&Ob.exec(n.css(c.elem,a)),h=1,i=20;if(g&&g[3]!==f){f=f||g[3],e=e||[],g=+d||1;do h=h||".5",g/=h,n.style(c.elem,a,g+f);while(h!==(h=c.cur()/d)&&1!==h&&--i)}return e&&(g=c.start=+g||+d||0,c.unit=f,c.end=e[1]?g+(e[1]+1)*e[2]:+e[2]),c}]};function Sb(){return setTimeout(function(){Lb=void 0}),Lb=n.now()}function Tb(a,b){var c,d=0,e={height:a};for(b=b?1:0;4>d;d+=2-b)c=R[d],e["margin"+c]=e["padding"+c]=a;return b&&(e.opacity=e.width=a),e}function Ub(a,b,c){for(var d,e=(Rb[b]||[]).concat(Rb["*"]),f=0,g=e.length;g>f;f++)if(d=e[f].call(c,b,a))return d}function Vb(a,b,c){var d,e,f,g,h,i,j,k,l=this,m={},o=a.style,p=a.nodeType&&S(a),q=L.get(a,"fxshow");c.queue||(h=n._queueHooks(a,"fx"),null==h.unqueued&&(h.unqueued=0,i=h.empty.fire,h.empty.fire=function(){h.unqueued||i()}),h.unqueued++,l.always(function(){l.always(function(){h.unqueued--,n.queue(a,"fx").length||h.empty.fire()})})),1===a.nodeType&&("height"in b||"width"in b)&&(c.overflow=[o.overflow,o.overflowX,o.overflowY],j=n.css(a,"display"),k="none"===j?L.get(a,"olddisplay")||tb(a.nodeName):j,"inline"===k&&"none"===n.css(a,"float")&&(o.display="inline-block")),c.overflow&&(o.overflow="hidden",l.always(function(){o.overflow=c.overflow[0],o.overflowX=c.overflow[1],o.overflowY=c.overflow[2]}));for(d in b)if(e=b[d],Nb.exec(e)){if(delete b[d],f=f||"toggle"===e,e===(p?"hide":"show")){if("show"!==e||!q||void 0===q[d])continue;p=!0}m[d]=q&&q[d]||n.style(a,d)}else j=void 0;if(n.isEmptyObject(m))"inline"===("none"===j?tb(a.nodeName):j)&&(o.display=j);else{q?"hidden"in q&&(p=q.hidden):q=L.access(a,"fxshow",{}),f&&(q.hidden=!p),p?n(a).show():l.done(function(){n(a).hide()}),l.done(function(){var b;L.remove(a,"fxshow");for(b in m)n.style(a,b,m[b])});for(d in m)g=Ub(p?q[d]:0,d,l),d in q||(q[d]=g.start,p&&(g.end=g.start,g.start="width"===d||"height"===d?1:0))}}function Wb(a,b){var c,d,e,f,g;for(c in a)if(d=n.camelCase(c),e=b[d],f=a[c],n.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=n.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function Xb(a,b,c){var d,e,f=0,g=Qb.length,h=n.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=Lb||Sb(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;i>g;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),1>f&&i?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:n.extend({},b),opts:n.extend(!0,{specialEasing:{}},c),originalProperties:b,originalOptions:c,startTime:Lb||Sb(),duration:c.duration,tweens:[],createTween:function(b,c){var d=n.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;d>c;c++)j.tweens[c].run(1);return b?h.resolveWith(a,[j,b]):h.rejectWith(a,[j,b]),this}}),k=j.props;for(Wb(k,j.opts.specialEasing);g>f;f++)if(d=Qb[f].call(j,a,k,j.opts))return d;return n.map(k,Ub,j),n.isFunction(j.opts.start)&&j.opts.start.call(a,j),n.fx.timer(n.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}n.Animation=n.extend(Xb,{tweener:function(a,b){n.isFunction(a)?(b=a,a=["*"]):a=a.split(" ");for(var c,d=0,e=a.length;e>d;d++)c=a[d],Rb[c]=Rb[c]||[],Rb[c].unshift(b)},prefilter:function(a,b){b?Qb.unshift(a):Qb.push(a)}}),n.speed=function(a,b,c){var d=a&&"object"==typeof a?n.extend({},a):{complete:c||!c&&b||n.isFunction(a)&&a,duration:a,easing:c&&b||b&&!n.isFunction(b)&&b};return d.duration=n.fx.off?0:"number"==typeof d.duration?d.duration:d.duration in n.fx.speeds?n.fx.speeds[d.duration]:n.fx.speeds._default,(null==d.queue||d.queue===!0)&&(d.queue="fx"),d.old=d.complete,d.complete=function(){n.isFunction(d.old)&&d.old.call(this),d.queue&&n.dequeue(this,d.queue)},d},n.fn.extend({fadeTo:function(a,b,c,d){return this.filter(S).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=n.isEmptyObject(a),f=n.speed(b,c,d),g=function(){var b=Xb(this,n.extend({},a),f);(e||L.get(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return"string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=n.timers,g=L.get(this);if(e)g[e]&&g[e].stop&&d(g[e]);else for(e in g)g[e]&&g[e].stop&&Pb.test(e)&&d(g[e]);for(e=f.length;e--;)f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1));(b||!c)&&n.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=L.get(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=n.timers,g=d?d.length:0;for(c.finish=!0,n.queue(this,a,[]),e&&e.stop&&e.stop.call(this,!0),b=f.length;b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1));for(b=0;g>b;b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),n.each(["toggle","show","hide"],function(a,b){var c=n.fn[b];n.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(Tb(b,!0),a,d,e)}}),n.each({slideDown:Tb("show"),slideUp:Tb("hide"),slideToggle:Tb("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){n.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),n.timers=[],n.fx.tick=function(){var a,b=0,c=n.timers;for(Lb=n.now();b<c.length;b++)a=c[b],a()||c[b]!==a||c.splice(b--,1);c.length||n.fx.stop(),Lb=void 0},n.fx.timer=function(a){n.timers.push(a),a()?n.fx.start():n.timers.pop()},n.fx.interval=13,n.fx.start=function(){Mb||(Mb=setInterval(n.fx.tick,n.fx.interval))},n.fx.stop=function(){clearInterval(Mb),Mb=null},n.fx.speeds={slow:600,fast:200,_default:400},n.fn.delay=function(a,b){return a=n.fx?n.fx.speeds[a]||a:a,b=b||"fx",this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},function(){var a=l.createElement("input"),b=l.createElement("select"),c=b.appendChild(l.createElement("option"));a.type="checkbox",k.checkOn=""!==a.value,k.optSelected=c.selected,b.disabled=!0,k.optDisabled=!c.disabled,a=l.createElement("input"),a.value="t",a.type="radio",k.radioValue="t"===a.value}();var Yb,Zb,$b=n.expr.attrHandle;n.fn.extend({attr:function(a,b){return J(this,n.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){n.removeAttr(this,a)})}}),n.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(a&&3!==f&&8!==f&&2!==f)return typeof a.getAttribute===U?n.prop(a,b,c):(1===f&&n.isXMLDoc(a)||(b=b.toLowerCase(),d=n.attrHooks[b]||(n.expr.match.bool.test(b)?Zb:Yb)),void 0===c?d&&"get"in d&&null!==(e=d.get(a,b))?e:(e=n.find.attr(a,b),null==e?void 0:e):null!==c?d&&"set"in d&&void 0!==(e=d.set(a,c,b))?e:(a.setAttribute(b,c+""),c):void n.removeAttr(a,b))
},removeAttr:function(a,b){var c,d,e=0,f=b&&b.match(E);if(f&&1===a.nodeType)while(c=f[e++])d=n.propFix[c]||c,n.expr.match.bool.test(c)&&(a[d]=!1),a.removeAttribute(c)},attrHooks:{type:{set:function(a,b){if(!k.radioValue&&"radio"===b&&n.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}}}),Zb={set:function(a,b,c){return b===!1?n.removeAttr(a,c):a.setAttribute(c,c),c}},n.each(n.expr.match.bool.source.match(/\w+/g),function(a,b){var c=$b[b]||n.find.attr;$b[b]=function(a,b,d){var e,f;return d||(f=$b[b],$b[b]=e,e=null!=c(a,b,d)?b.toLowerCase():null,$b[b]=f),e}});var _b=/^(?:input|select|textarea|button)$/i;n.fn.extend({prop:function(a,b){return J(this,n.prop,a,b,arguments.length>1)},removeProp:function(a){return this.each(function(){delete this[n.propFix[a]||a]})}}),n.extend({propFix:{"for":"htmlFor","class":"className"},prop:function(a,b,c){var d,e,f,g=a.nodeType;if(a&&3!==g&&8!==g&&2!==g)return f=1!==g||!n.isXMLDoc(a),f&&(b=n.propFix[b]||b,e=n.propHooks[b]),void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a,b))?d:a[b]},propHooks:{tabIndex:{get:function(a){return a.hasAttribute("tabindex")||_b.test(a.nodeName)||a.href?a.tabIndex:-1}}}}),k.optSelected||(n.propHooks.selected={get:function(a){var b=a.parentNode;return b&&b.parentNode&&b.parentNode.selectedIndex,null}}),n.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){n.propFix[this.toLowerCase()]=this});var ac=/[\t\r\n\f]/g;n.fn.extend({addClass:function(a){var b,c,d,e,f,g,h="string"==typeof a&&a,i=0,j=this.length;if(n.isFunction(a))return this.each(function(b){n(this).addClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(E)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ac," "):" ")){f=0;while(e=b[f++])d.indexOf(" "+e+" ")<0&&(d+=e+" ");g=n.trim(d),c.className!==g&&(c.className=g)}return this},removeClass:function(a){var b,c,d,e,f,g,h=0===arguments.length||"string"==typeof a&&a,i=0,j=this.length;if(n.isFunction(a))return this.each(function(b){n(this).removeClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(E)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ac," "):"")){f=0;while(e=b[f++])while(d.indexOf(" "+e+" ")>=0)d=d.replace(" "+e+" "," ");g=a?n.trim(d):"",c.className!==g&&(c.className=g)}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):this.each(n.isFunction(a)?function(c){n(this).toggleClass(a.call(this,c,this.className,b),b)}:function(){if("string"===c){var b,d=0,e=n(this),f=a.match(E)||[];while(b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else(c===U||"boolean"===c)&&(this.className&&L.set(this,"__className__",this.className),this.className=this.className||a===!1?"":L.get(this,"__className__")||"")})},hasClass:function(a){for(var b=" "+a+" ",c=0,d=this.length;d>c;c++)if(1===this[c].nodeType&&(" "+this[c].className+" ").replace(ac," ").indexOf(b)>=0)return!0;return!1}});var bc=/\r/g;n.fn.extend({val:function(a){var b,c,d,e=this[0];{if(arguments.length)return d=n.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,n(this).val()):a,null==e?e="":"number"==typeof e?e+="":n.isArray(e)&&(e=n.map(e,function(a){return null==a?"":a+""})),b=n.valHooks[this.type]||n.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this,e,"value")||(this.value=e))});if(e)return b=n.valHooks[e.type]||n.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(bc,""):null==c?"":c)}}}),n.extend({valHooks:{option:{get:function(a){var b=n.find.attr(a,"value");return null!=b?b:n.trim(n.text(a))}},select:{get:function(a){for(var b,c,d=a.options,e=a.selectedIndex,f="select-one"===a.type||0>e,g=f?null:[],h=f?e+1:d.length,i=0>e?h:f?e:0;h>i;i++)if(c=d[i],!(!c.selected&&i!==e||(k.optDisabled?c.disabled:null!==c.getAttribute("disabled"))||c.parentNode.disabled&&n.nodeName(c.parentNode,"optgroup"))){if(b=n(c).val(),f)return b;g.push(b)}return g},set:function(a,b){var c,d,e=a.options,f=n.makeArray(b),g=e.length;while(g--)d=e[g],(d.selected=n.inArray(d.value,f)>=0)&&(c=!0);return c||(a.selectedIndex=-1),f}}}}),n.each(["radio","checkbox"],function(){n.valHooks[this]={set:function(a,b){return n.isArray(b)?a.checked=n.inArray(n(a).val(),b)>=0:void 0}},k.checkOn||(n.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})}),n.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){n.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),n.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)}});var cc=n.now(),dc=/\?/;n.parseJSON=function(a){return JSON.parse(a+"")},n.parseXML=function(a){var b,c;if(!a||"string"!=typeof a)return null;try{c=new DOMParser,b=c.parseFromString(a,"text/xml")}catch(d){b=void 0}return(!b||b.getElementsByTagName("parsererror").length)&&n.error("Invalid XML: "+a),b};var ec,fc,gc=/#.*$/,hc=/([?&])_=[^&]*/,ic=/^(.*?):[ \t]*([^\r\n]*)$/gm,jc=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,kc=/^(?:GET|HEAD)$/,lc=/^\/\//,mc=/^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,nc={},oc={},pc="*/".concat("*");try{fc=location.href}catch(qc){fc=l.createElement("a"),fc.href="",fc=fc.href}ec=mc.exec(fc.toLowerCase())||[];function rc(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(E)||[];if(n.isFunction(c))while(d=f[e++])"+"===d[0]?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function sc(a,b,c,d){var e={},f=a===oc;function g(h){var i;return e[h]=!0,n.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function tc(a,b){var c,d,e=n.ajaxSettings.flatOptions||{};for(c in b)void 0!==b[c]&&((e[c]?a:d||(d={}))[c]=b[c]);return d&&n.extend(!0,a,d),a}function uc(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while("*"===i[0])i.shift(),void 0===d&&(d=a.mimeType||b.getResponseHeader("Content-Type"));if(d)for(e in h)if(h[e]&&h[e].test(d)){i.unshift(e);break}if(i[0]in c)f=i[0];else{for(e in c){if(!i[0]||a.converters[e+" "+i[0]]){f=e;break}g||(g=e)}f=f||g}return f?(f!==i[0]&&i.unshift(f),c[f]):void 0}function vc(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while(f)if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if("*"===f)f=i;else if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g)for(e in j)if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&&a["throws"])b=g(b);else try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return{state:"success",data:b}}n.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:fc,type:"GET",isLocal:jc.test(ec[1]),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":pc,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":n.parseJSON,"text xml":n.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?tc(tc(a,n.ajaxSettings),b):tc(n.ajaxSettings,a)},ajaxPrefilter:rc(nc),ajaxTransport:rc(oc),ajax:function(a,b){"object"==typeof a&&(b=a,a=void 0),b=b||{};var c,d,e,f,g,h,i,j,k=n.ajaxSetup({},b),l=k.context||k,m=k.context&&(l.nodeType||l.jquery)?n(l):n.event,o=n.Deferred(),p=n.Callbacks("once memory"),q=k.statusCode||{},r={},s={},t=0,u="canceled",v={readyState:0,getResponseHeader:function(a){var b;if(2===t){if(!f){f={};while(b=ic.exec(e))f[b[1].toLowerCase()]=b[2]}b=f[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===t?e:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return t||(a=s[c]=s[c]||a,r[a]=b),this},overrideMimeType:function(a){return t||(k.mimeType=a),this},statusCode:function(a){var b;if(a)if(2>t)for(b in a)q[b]=[q[b],a[b]];else v.always(a[v.status]);return this},abort:function(a){var b=a||u;return c&&c.abort(b),x(0,b),this}};if(o.promise(v).complete=p.add,v.success=v.done,v.error=v.fail,k.url=((a||k.url||fc)+"").replace(gc,"").replace(lc,ec[1]+"//"),k.type=b.method||b.type||k.method||k.type,k.dataTypes=n.trim(k.dataType||"*").toLowerCase().match(E)||[""],null==k.crossDomain&&(h=mc.exec(k.url.toLowerCase()),k.crossDomain=!(!h||h[1]===ec[1]&&h[2]===ec[2]&&(h[3]||("http:"===h[1]?"80":"443"))===(ec[3]||("http:"===ec[1]?"80":"443")))),k.data&&k.processData&&"string"!=typeof k.data&&(k.data=n.param(k.data,k.traditional)),sc(nc,k,b,v),2===t)return v;i=k.global,i&&0===n.active++&&n.event.trigger("ajaxStart"),k.type=k.type.toUpperCase(),k.hasContent=!kc.test(k.type),d=k.url,k.hasContent||(k.data&&(d=k.url+=(dc.test(d)?"&":"?")+k.data,delete k.data),k.cache===!1&&(k.url=hc.test(d)?d.replace(hc,"$1_="+cc++):d+(dc.test(d)?"&":"?")+"_="+cc++)),k.ifModified&&(n.lastModified[d]&&v.setRequestHeader("If-Modified-Since",n.lastModified[d]),n.etag[d]&&v.setRequestHeader("If-None-Match",n.etag[d])),(k.data&&k.hasContent&&k.contentType!==!1||b.contentType)&&v.setRequestHeader("Content-Type",k.contentType),v.setRequestHeader("Accept",k.dataTypes[0]&&k.accepts[k.dataTypes[0]]?k.accepts[k.dataTypes[0]]+("*"!==k.dataTypes[0]?", "+pc+"; q=0.01":""):k.accepts["*"]);for(j in k.headers)v.setRequestHeader(j,k.headers[j]);if(k.beforeSend&&(k.beforeSend.call(l,v,k)===!1||2===t))return v.abort();u="abort";for(j in{success:1,error:1,complete:1})v[j](k[j]);if(c=sc(oc,k,b,v)){v.readyState=1,i&&m.trigger("ajaxSend",[v,k]),k.async&&k.timeout>0&&(g=setTimeout(function(){v.abort("timeout")},k.timeout));try{t=1,c.send(r,x)}catch(w){if(!(2>t))throw w;x(-1,w)}}else x(-1,"No Transport");function x(a,b,f,h){var j,r,s,u,w,x=b;2!==t&&(t=2,g&&clearTimeout(g),c=void 0,e=h||"",v.readyState=a>0?4:0,j=a>=200&&300>a||304===a,f&&(u=uc(k,v,f)),u=vc(k,u,v,j),j?(k.ifModified&&(w=v.getResponseHeader("Last-Modified"),w&&(n.lastModified[d]=w),w=v.getResponseHeader("etag"),w&&(n.etag[d]=w)),204===a||"HEAD"===k.type?x="nocontent":304===a?x="notmodified":(x=u.state,r=u.data,s=u.error,j=!s)):(s=x,(a||!x)&&(x="error",0>a&&(a=0))),v.status=a,v.statusText=(b||x)+"",j?o.resolveWith(l,[r,x,v]):o.rejectWith(l,[v,x,s]),v.statusCode(q),q=void 0,i&&m.trigger(j?"ajaxSuccess":"ajaxError",[v,k,j?r:s]),p.fireWith(l,[v,x]),i&&(m.trigger("ajaxComplete",[v,k]),--n.active||n.event.trigger("ajaxStop")))}return v},getJSON:function(a,b,c){return n.get(a,b,c,"json")},getScript:function(a,b){return n.get(a,void 0,b,"script")}}),n.each(["get","post"],function(a,b){n[b]=function(a,c,d,e){return n.isFunction(c)&&(e=e||d,d=c,c=void 0),n.ajax({url:a,type:b,dataType:e,data:c,success:d})}}),n.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){n.fn[b]=function(a){return this.on(b,a)}}),n._evalUrl=function(a){return n.ajax({url:a,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})},n.fn.extend({wrapAll:function(a){var b;return n.isFunction(a)?this.each(function(b){n(this).wrapAll(a.call(this,b))}):(this[0]&&(b=n(a,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstElementChild)a=a.firstElementChild;return a}).append(this)),this)},wrapInner:function(a){return this.each(n.isFunction(a)?function(b){n(this).wrapInner(a.call(this,b))}:function(){var b=n(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=n.isFunction(a);return this.each(function(c){n(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){n.nodeName(this,"body")||n(this).replaceWith(this.childNodes)}).end()}}),n.expr.filters.hidden=function(a){return a.offsetWidth<=0&&a.offsetHeight<=0},n.expr.filters.visible=function(a){return!n.expr.filters.hidden(a)};var wc=/%20/g,xc=/\[\]$/,yc=/\r?\n/g,zc=/^(?:submit|button|image|reset|file)$/i,Ac=/^(?:input|select|textarea|keygen)/i;function Bc(a,b,c,d){var e;if(n.isArray(b))n.each(b,function(b,e){c||xc.test(a)?d(a,e):Bc(a+"["+("object"==typeof e?b:"")+"]",e,c,d)});else if(c||"object"!==n.type(b))d(a,b);else for(e in b)Bc(a+"["+e+"]",b[e],c,d)}n.param=function(a,b){var c,d=[],e=function(a,b){b=n.isFunction(b)?b():null==b?"":b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if(void 0===b&&(b=n.ajaxSettings&&n.ajaxSettings.traditional),n.isArray(a)||a.jquery&&!n.isPlainObject(a))n.each(a,function(){e(this.name,this.value)});else for(c in a)Bc(c,a[c],b,e);return d.join("&").replace(wc,"+")},n.fn.extend({serialize:function(){return n.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=n.prop(this,"elements");return a?n.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!n(this).is(":disabled")&&Ac.test(this.nodeName)&&!zc.test(a)&&(this.checked||!T.test(a))}).map(function(a,b){var c=n(this).val();return null==c?null:n.isArray(c)?n.map(c,function(a){return{name:b.name,value:a.replace(yc,"\r\n")}}):{name:b.name,value:c.replace(yc,"\r\n")}}).get()}}),n.ajaxSettings.xhr=function(){try{return new XMLHttpRequest}catch(a){}};var Cc=0,Dc={},Ec={0:200,1223:204},Fc=n.ajaxSettings.xhr();a.ActiveXObject&&n(a).on("unload",function(){for(var a in Dc)Dc[a]()}),k.cors=!!Fc&&"withCredentials"in Fc,k.ajax=Fc=!!Fc,n.ajaxTransport(function(a){var b;return k.cors||Fc&&!a.crossDomain?{send:function(c,d){var e,f=a.xhr(),g=++Cc;if(f.open(a.type,a.url,a.async,a.username,a.password),a.xhrFields)for(e in a.xhrFields)f[e]=a.xhrFields[e];a.mimeType&&f.overrideMimeType&&f.overrideMimeType(a.mimeType),a.crossDomain||c["X-Requested-With"]||(c["X-Requested-With"]="XMLHttpRequest");for(e in c)f.setRequestHeader(e,c[e]);b=function(a){return function(){b&&(delete Dc[g],b=f.onload=f.onerror=null,"abort"===a?f.abort():"error"===a?d(f.status,f.statusText):d(Ec[f.status]||f.status,f.statusText,"string"==typeof f.responseText?{text:f.responseText}:void 0,f.getAllResponseHeaders()))}},f.onload=b(),f.onerror=b("error"),b=Dc[g]=b("abort");try{f.send(a.hasContent&&a.data||null)}catch(h){if(b)throw h}},abort:function(){b&&b()}}:void 0}),n.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function(a){return n.globalEval(a),a}}}),n.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET")}),n.ajaxTransport("script",function(a){if(a.crossDomain){var b,c;return{send:function(d,e){b=n("<script>").prop({async:!0,charset:a.scriptCharset,src:a.url}).on("load error",c=function(a){b.remove(),c=null,a&&e("error"===a.type?404:200,a.type)}),l.head.appendChild(b[0])},abort:function(){c&&c()}}}});var Gc=[],Hc=/(=)\?(?=&|$)|\?\?/;n.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=Gc.pop()||n.expando+"_"+cc++;return this[a]=!0,a}}),n.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(Hc.test(b.url)?"url":"string"==typeof b.data&&!(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&Hc.test(b.data)&&"data");return h||"jsonp"===b.dataTypes[0]?(e=b.jsonpCallback=n.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(Hc,"$1"+e):b.jsonp!==!1&&(b.url+=(dc.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||n.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,Gc.push(e)),g&&n.isFunction(f)&&f(g[0]),g=f=void 0}),"script"):void 0}),n.parseHTML=function(a,b,c){if(!a||"string"!=typeof a)return null;"boolean"==typeof b&&(c=b,b=!1),b=b||l;var d=v.exec(a),e=!c&&[];return d?[b.createElement(d[1])]:(d=n.buildFragment([a],b,e),e&&e.length&&n(e).remove(),n.merge([],d.childNodes))};var Ic=n.fn.load;n.fn.load=function(a,b,c){if("string"!=typeof a&&Ic)return Ic.apply(this,arguments);var d,e,f,g=this,h=a.indexOf(" ");return h>=0&&(d=n.trim(a.slice(h)),a=a.slice(0,h)),n.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(e="POST"),g.length>0&&n.ajax({url:a,type:e,dataType:"html",data:b}).done(function(a){f=arguments,g.html(d?n("<div>").append(n.parseHTML(a)).find(d):a)}).complete(c&&function(a,b){g.each(c,f||[a.responseText,b,a])}),this},n.expr.filters.animated=function(a){return n.grep(n.timers,function(b){return a===b.elem}).length};var Jc=a.document.documentElement;function Kc(a){return n.isWindow(a)?a:9===a.nodeType&&a.defaultView}n.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=n.css(a,"position"),l=n(a),m={};"static"===k&&(a.style.position="relative"),h=l.offset(),f=n.css(a,"top"),i=n.css(a,"left"),j=("absolute"===k||"fixed"===k)&&(f+i).indexOf("auto")>-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),n.isFunction(b)&&(b=b.call(a,c,h)),null!=b.top&&(m.top=b.top-h.top+g),null!=b.left&&(m.left=b.left-h.left+e),"using"in b?b.using.call(a,m):l.css(m)}},n.fn.extend({offset:function(a){if(arguments.length)return void 0===a?this:this.each(function(b){n.offset.setOffset(this,a,b)});var b,c,d=this[0],e={top:0,left:0},f=d&&d.ownerDocument;if(f)return b=f.documentElement,n.contains(b,d)?(typeof d.getBoundingClientRect!==U&&(e=d.getBoundingClientRect()),c=Kc(f),{top:e.top+c.pageYOffset-b.clientTop,left:e.left+c.pageXOffset-b.clientLeft}):e},position:function(){if(this[0]){var a,b,c=this[0],d={top:0,left:0};return"fixed"===n.css(c,"position")?b=c.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),n.nodeName(a[0],"html")||(d=a.offset()),d.top+=n.css(a[0],"borderTopWidth",!0),d.left+=n.css(a[0],"borderLeftWidth",!0)),{top:b.top-d.top-n.css(c,"marginTop",!0),left:b.left-d.left-n.css(c,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||Jc;while(a&&!n.nodeName(a,"html")&&"static"===n.css(a,"position"))a=a.offsetParent;return a||Jc})}}),n.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(b,c){var d="pageYOffset"===c;n.fn[b]=function(e){return J(this,function(b,e,f){var g=Kc(b);return void 0===f?g?g[c]:b[e]:void(g?g.scrollTo(d?a.pageXOffset:f,d?f:a.pageYOffset):b[e]=f)},b,e,arguments.length,null)}}),n.each(["top","left"],function(a,b){n.cssHooks[b]=yb(k.pixelPosition,function(a,c){return c?(c=xb(a,b),vb.test(c)?n(a).position()[b]+"px":c):void 0})}),n.each({Height:"height",Width:"width"},function(a,b){n.each({padding:"inner"+a,content:b,"":"outer"+a},function(c,d){n.fn[d]=function(d,e){var f=arguments.length&&(c||"boolean"!=typeof d),g=c||(d===!0||e===!0?"margin":"border");return J(this,function(b,c,d){var e;return n.isWindow(b)?b.document.documentElement["client"+a]:9===b.nodeType?(e=b.documentElement,Math.max(b.body["scroll"+a],e["scroll"+a],b.body["offset"+a],e["offset"+a],e["client"+a])):void 0===d?n.css(b,c,g):n.style(b,c,d,g)},b,f?d:void 0,f,null)}})}),n.fn.size=function(){return this.length},n.fn.andSelf=n.fn.addBack,"function"==typeof define&&define.amd&&define("jquery",[],function(){return n});var Lc=a.jQuery,Mc=a.$;return n.noConflict=function(b){return a.$===n&&(a.$=Mc),b&&a.jQuery===n&&(a.jQuery=Lc),n},typeof b===U&&(a.jQuery=a.$=n),n});
/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
  def: 'easeOutQuad',
  swing: function (x, t, b, c, d) {
    //alert(jQuery.easing.default);
    return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
  },
  easeInQuad: function (x, t, b, c, d) {
    return c*(t/=d)*t + b;
  },
  easeOutQuad: function (x, t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  },
  easeInOutQuad: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t + b;
    return -c/2 * ((--t)*(t-2) - 1) + b;
  },
  easeInCubic: function (x, t, b, c, d) {
    return c*(t/=d)*t*t + b;
  },
  easeOutCubic: function (x, t, b, c, d) {
    return c*((t=t/d-1)*t*t + 1) + b;
  },
  easeInOutCubic: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t + b;
    return c/2*((t-=2)*t*t + 2) + b;
  },
  easeInQuart: function (x, t, b, c, d) {
    return c*(t/=d)*t*t*t + b;
  },
  easeOutQuart: function (x, t, b, c, d) {
    return -c * ((t=t/d-1)*t*t*t - 1) + b;
  },
  easeInOutQuart: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
    return -c/2 * ((t-=2)*t*t*t - 2) + b;
  },
  easeInQuint: function (x, t, b, c, d) {
    return c*(t/=d)*t*t*t*t + b;
  },
  easeOutQuint: function (x, t, b, c, d) {
    return c*((t=t/d-1)*t*t*t*t + 1) + b;
  },
  easeInOutQuint: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
    return c/2*((t-=2)*t*t*t*t + 2) + b;
  },
  easeInSine: function (x, t, b, c, d) {
    return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
  },
  easeOutSine: function (x, t, b, c, d) {
    return c * Math.sin(t/d * (Math.PI/2)) + b;
  },
  easeInOutSine: function (x, t, b, c, d) {
    return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
  },
  easeInExpo: function (x, t, b, c, d) {
    return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
  },
  easeOutExpo: function (x, t, b, c, d) {
    return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
  },
  easeInOutExpo: function (x, t, b, c, d) {
    if (t==0) return b;
    if (t==d) return b+c;
    if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
    return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
  },
  easeInCirc: function (x, t, b, c, d) {
    return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
  },
  easeOutCirc: function (x, t, b, c, d) {
    return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
  },
  easeInOutCirc: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
    return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
  },
  easeInElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
  },
  easeOutElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
  },
  easeInOutElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
  },
  easeInBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c*(t/=d)*t*((s+1)*t - s) + b;
  },
  easeOutBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
  },
  easeInOutBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158; 
    if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
    return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
  },
  easeInBounce: function (x, t, b, c, d) {
    return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
  },
  easeOutBounce: function (x, t, b, c, d) {
    if ((t/=d) < (1/2.75)) {
      return c*(7.5625*t*t) + b;
    } else if (t < (2/2.75)) {
      return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
    } else if (t < (2.5/2.75)) {
      return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
    } else {
      return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
    }
  },
  easeInOutBounce: function (x, t, b, c, d) {
    if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
    return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
  }
});

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 */
;
/**
 * jQuery Skitter Slideshow
 * @name jquery.skitter.js
 * @description Slideshow
 * @author Thiago Silva Ferreira - http://thiagosf.net
 * @version 5.1.4
 * @created August 04, 2010
 * @updated May 26, 2017
 * @copyright (c) 2010 Thiago Silva Ferreira - http://thiagosf.net
 * @license Dual licensed under the MIT or GPL Version 2 licenses
 * @example http://thiagosf.net/projects/jquery/skitter/
 */

;(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(['jquery'], function ($) {
      return factory($);
    });
  } else if (typeof module === "object" && typeof module.exports === "object") {
    exports = factory(require('jquery'));
  } else {
    factory(jQuery);
  }
})(function($) {
  var number_skitter = 0;
  var skitters = [];

  $.fn.skitter = function(options) {
    if (typeof options == 'string') {
      var current_skitter = skitters[$(this).data('skitter_number')];
      return current_skitter[arguments[0]].call(current_skitter, arguments[1]);
    } else {
      return this.each(function() {
        if ( $(this).data('skitter_number') == undefined ) {
          $(this).data('skitter_number', number_skitter);
          skitters.push(new $sk(this, options, number_skitter));
          ++number_skitter;
        }
      });
    }
  };

  var defaults = {
    // Animation velocity
    velocity: 1,

    // Interval between transitions
    interval: 2500, 

    // Default animation
    animation: '',

    // Numbers display
    numbers: false,

    // Navigation display
    navigation: false,

    // Label display
    label: true,

    // Easing default
    easing_default: '',

    // The skitters box (internal)
    skitter_box: null,

    // @deprecated
    time_interval: null,

    // Image link (internal)
    images_links: null,

    // Actual image (internal)
    image_atual: null,

    // Actual link (internal)
    link_atual: null,

    // Actual label (internal)
    label_atual: null,

    // Actual target (internal)
    target_atual: '_self',

    // Skitter width (internal)
    width_skitter: null,

    // Skitter height (internal)
    height_skitter: null,

    // Image number loop (internal)
    image_i: 1,

    // Is animating (internal)
    is_animating: false,

    // Is hover skitter_box (internal)
    is_hover_skitter_box: false,

    // Smart randomly (internal)
    random_ia: null,

    // Randomly sliders
    show_randomly: false,

    // Navigation with thumbs
    thumbs: false,

    // Hide numbers and navigation
    hide_tools: false,

    // Fullscreen mode
    fullscreen: false,

    // Loading data from XML file
    xml: false,

    // Navigation with dots
    dots: true,

    // Final opacity of elements in hide_tools
    opacity_elements: 0.75,

    // Interval animation hover elements hide_tools 
    interval_in_elements: 200, 

    // Interval animation out elements hide_tools
    interval_out_elements: 300, 

    // Onload Callback
    onLoad: null,

    // Function call to change image
    imageSwitched: null,

    // @deprecated
    max_number_height: 20,

    // Alignment of numbers/dots/thumbs
    numbers_align: 'center',

    // Preview with dots
    preview: false,

    // Focus slideshow
    focus: false,

    // Focus active (internal)
    foucs_active: false,

    // Option play/pause manually
    controls: false,

    // Displays progress bar
    progressbar: false,

    // CSS progress bar
    progressbar_css: {},

    // Is paused (internal)
    is_paused: false,

    // Is blur (internal)
    is_blur: false,

    // Is paused time (internal)
    is_paused_time: false,

    // Time start (internal)
    time_start: 0,

    // Elapsed time (internal)
    elapsedTime: 0,

    // Stop animation to move mouse over it.
    stop_over: true,

    // Enable navigation keys
    enable_navigation_keys: false,

    // Specific animations
    with_animations: [],

    // Function call to go over the navigation buttons
    // mouseOverButton: function() { $(this).stop().animate({opacity:0.5}, 200); }, 
    mouseOverButton: null, 

    // Function call to go out the navigation buttons
    // mouseOutButton: function() { $(this).stop().animate({opacity:1}, 200); }, 
    mouseOutButton: null, 

    // Sets whether the slideshow will start automatically
    auto_play: true, 

    // Label animation type
    label_animation: 'slideUp', 

    // Theme
    theme: null, 

    // Structure (internal)
    structure:    '<a href="#" class="prev_button">prev</a>'
                + '<a href="#" class="next_button">next</a>'
                + '<span class="info_slide"></span>'
                + '<div class="container_skitter">'
                  + '<div class="image">'
                    + '<a href=""><img class="image_main" /></a>'
                    + '<div class="label_skitter"></div>'
                  + '</div>'
                + '</div>',
    
    // Responsive
    //  Example:
    //   responsive: {
    //     small: {
    //       animation: 'fade',
    //       max_width: 768,
    //       suffix: '-small'
    //     },
    //     medium: {
    //       animation: 'fadeFour',
    //       max_width: 1024,
    //       suffix: '-medium'
    //     }
    //   }
    responsive: {
      small: {
        animation: 'fade',
        max_width: 768
      },
      medium: {
        max_width: 1024
      }
    }
  };
  
  $.skitter = function(obj, options, number) {
    this.skitter_box = $(obj);
    this.timer = null;
    this.settings = $.extend({}, defaults, options || {});
    this.number_skitter = number;
    this.setup();
  };
  
  // Shortcut
  var $sk = $.skitter;
  
  $sk.fn = $sk.prototype = {};
  
  $sk.fn.extend = $.extend;

  $sk.fn.extend({
    // Available animations
    animations: [
      'cube', 
      'cubeRandom', 
      'block', 
      'cubeStop', 
      'cubeStopRandom', 
      'cubeHide', 
      'cubeSize', 
      'horizontal', 
      'showBars', 
      'showBarsRandom', 
      'tube',
      'fade',
      'fadeFour',
      'paralell',
      'blind',
      'blindHeight',
      'blindWidth',
      'directionTop',
      'directionBottom',
      'directionRight',
      'directionLeft',
      'cubeSpread',
      'glassCube',
      'glassBlock',
      'circles',
      'circlesInside',
      'circlesRotate',
      'cubeShow',
      'upBars', 
      'downBars', 
      'hideBars', 
      'swapBars', 
      'swapBarsBack', 
      'swapBlocks',
      'cut'
    ],
    
    /**
     * Init
     */
    setup: function() 
    {
      var self = this;

      // Fullscreen
      if (this.settings.fullscreen) {
        var width = $(window).width();
        var height = $(window).height();
        this.skitter_box.width(width).height(height);
        this.skitter_box.css({'position':'absolute', 'top':0, 'left':0, 'z-index':1000});
        this.settings.stop_over = false;
        $('body').css({'overflown':'hidden'});
      }
      
      this.settings.width_skitter   = parseFloat(this.skitter_box.css('width'));
      this.settings.height_skitter  = parseFloat(this.skitter_box.css('height'));
      
      this.settings.original_width_skitter   = this.settings.width_skitter;
      this.settings.original_height_skitter  = this.settings.height_skitter;

      if (!this.settings.width_skitter || !this.settings.height_skitter) {
        console.warn('Width or height size is null! - Skitter Slideshow');
        return false;
      }

      // Theme
      if ( this.settings.theme ) {
        this.skitter_box.addClass('skitter-' + this.settings.theme);
      }
      
      // Structure html
      this.skitter_box.append(this.settings.structure);
      
      // Settings
      this.settings.easing_default  = this.getEasing(this.settings.easing);
            
      if (this.settings.velocity >= 2) this.settings.velocity = 1.3;
      if (this.settings.velocity <= 0) this.settings.velocity = 1;
      
      this.skitter_box.find('.info_slide').hide();
      this.skitter_box.find('.label_skitter').hide();
      this.skitter_box.find('.prev_button').hide();
      this.skitter_box.find('.next_button').hide();
            
      this.skitter_box.find('.container_skitter').width(this.settings.width_skitter);
      this.skitter_box.find('.container_skitter').height(this.settings.height_skitter);
      
      var initial_select_class = ' image_number_select', u = 0;
      this.settings.images_links = [];
      
      // Add image, link, animation type and label
      var addImageLink = function (link, src, animation_type, label, target) {
        self.settings.images_links.push([src, link, animation_type, label, target]);
        if (self.settings.thumbs) {
          var dimension_thumb = '';
          if (self.settings.width_skitter > self.settings.height_skitter) {
            dimension_thumb = 'height="100"';
          } 
          else {
            dimension_thumb = 'width="100"';
          }
          self.skitter_box.find('.info_slide').append(
            '<span class="image_number'+initial_select_class+'" rel="'+(u - 1)+'" id="image_n_'+u+'_'+self.number_skitter+'" style="background-image: url(' + src + ');"></span> '
          );
        }
        else {
          self.skitter_box.find('.info_slide').append(
            '<span class="image_number'+initial_select_class+'" rel="'+(u - 1)+'" id="image_n_'+u+'_'+self.number_skitter+'">'+u+'</span> '
          );
        }
        initial_select_class = '';
      };

      // Load from XML
      if (this.settings.xml) {
        $.ajax({
          type: 'GET',
          url: this.settings.xml,
          async: false,
          dataType: 'xml',
          success: function(xml) {
            var ul = $('<ul></ul>');
            $(xml).find('skitter slide').each(function(){
              ++u;
              var link      = ($(this).find('link').text()) ? $(this).find('link').text() : '#';
              var src       = $(this).find('image').text();
              var animation_type  = $(this).find('image').attr('type');
              var label       = $(this).find('label').text();
              var target      = ($(this).find('target').text()) ? $(this).find('target').text() : '_self';
              addImageLink(link, src, animation_type, label, target);
            });
          }
        });
      }
      // Load from json
      else if (this.settings.json) {
        
      }
      // Load from HTML
      else {
        this.skitter_box.find('ul li').each(function(){
          ++u;
          var link      = ($(this).find('a').length) ? $(this).find('a').attr('href') : '#';
          var src       = $(this).find('img').attr('src');
          var animation_type  = $(this).find('img').attr('class');
          var label       = $(this).find('.label_text').html();
          var target      = ($(this).find('a').length && $(this).find('a').attr('target')) ? $(this).find('a').attr('target') : '_self';
          addImageLink(link, src, animation_type, label, target);
        });
      }
      
      // Thumbs
      if (self.settings.thumbs && !self.settings.fullscreen) 
      {
        self.skitter_box.find('.info_slide').addClass('info_slide_thumb');
        var width_info_slide = (u + 1) * self.skitter_box.find('.info_slide_thumb .image_number').width();
        self.skitter_box.find('.info_slide_thumb').width(width_info_slide);
        self.skitter_box.css({height:self.skitter_box.height() + self.skitter_box.find('.info_slide').height()});
        
        self.skitter_box.append('<div class="container_thumbs"></div>');
        var copy_info_slide = self.skitter_box.find('.info_slide').clone();
        self.skitter_box.find('.info_slide').remove();
        self.skitter_box.find('.container_thumbs')
          .width(self.settings.width_skitter)
          .append(copy_info_slide);
        
        // Scrolling with mouse movement
        var width_image = 0, 
          width_skitter = this.settings.width_skitter,
          height_skitter = this.settings.height_skitter, 
          w_info_slide_thumb = 0,
          info_slide_thumb = self.skitter_box.find('.info_slide_thumb'),
          x_value = 0,
          y_value = self.skitter_box.offset().top;
          
        info_slide_thumb.find('.image_number').each(function(){
          width_image += $(this).outerWidth();
        });
        
        info_slide_thumb.width(width_image+'px');
        w_info_slide_thumb = info_slide_thumb.width();
        width_value = this.settings.width_skitter;
        
        width_value = width_skitter - 100;
        
        if (width_info_slide > self.settings.width_skitter) {
          self.skitter_box.mousemove(function(e){
            x_value = self.skitter_box.offset().left + 90;
            
            var x = e.pageX, y = e.pageY, new_x = 0;
            
            x = x - x_value;
            y = y - y_value;
            novo_width = w_info_slide_thumb - width_value;
            new_x = -((novo_width * x) / width_value);
            
            if (new_x > 0) new_x = 0;
            if (new_x < -(w_info_slide_thumb - width_skitter)) new_x = -(w_info_slide_thumb - width_skitter);
            
            if (y > height_skitter) {
              info_slide_thumb.css({left: new_x});
            }
          });
        }
        
        self.skitter_box.find('.scroll_thumbs').css({'left':10});
        
        if (width_info_slide < self.settings.width_skitter) {
          self.skitter_box.find('.box_scroll_thumbs').hide();
          
          var class_info = '.info_slide';
          switch (self.settings.numbers_align) {
            case 'center' : 
              var _vleft = (self.settings.width_skitter - self.skitter_box.find(class_info).width()) / 2;
              self.skitter_box.find(class_info).css({'left': '50%', 'transform': 'translateX(-50%)'});
              break;
              
            case 'right' : 
              self.skitter_box.find(class_info).css({'left':'auto', 'right':'-5px'});
              break;
              
            case 'left' : 
              self.skitter_box.find(class_info).css({'left':'0px'});
              break;
          }
        }
        
      }
      else 
      {
        var class_info = '.info_slide';
        
        if (self.settings.dots) {
          self.skitter_box.find('.info_slide').addClass('info_slide_dots').removeClass('info_slide');
          class_info = '.info_slide_dots';
        }
        
        switch (self.settings.numbers_align) {
          case 'center' : 
            var _vleft = (self.settings.width_skitter - self.skitter_box.find(class_info).width()) / 2;
            self.skitter_box.find(class_info).css({'left': '50%', 'transform': 'translateX(-50%)'});
            break;
            
          case 'right' : 
            self.skitter_box.find(class_info).css({'left':'auto', 'right':'15px'});
            break;
            
          case 'left' : 
            self.skitter_box.find(class_info).css({'left':'15px'});
            break;
        }
        
        if (!self.settings.dots) {
          if (self.skitter_box.find('.info_slide').height() > 20) {
            self.skitter_box.find('.info_slide').hide();
          }
        }
      }
      
      this.skitter_box.find('ul').hide();
      
      if (this.settings.show_randomly)
      this.settings.images_links.sort(function(a,b) {return Math.random() - 0.5;});
      
      this.settings.image_atual   = this.settings.images_links[0][0];
      this.settings.link_atual  = this.settings.images_links[0][1];
      this.settings.label_atual   = this.settings.images_links[0][3];
      this.settings.target_atual  = this.settings.images_links[0][4];
      
      if (this.settings.images_links.length > 1) 
      {
        this.skitter_box.find('.prev_button').click(function() {
          if (self.settings.is_animating == false) {
            
            self.settings.image_i -= 2;
            
            if (self.settings.image_i == -2) {
              self.settings.image_i = self.settings.images_links.length - 2;
            } 
            else if (self.settings.image_i == -1) {
              self.settings.image_i = self.settings.images_links.length - 1;
            }
            
            self.jumpToImage(self.settings.image_i);
          }
          return false;
        });
        
        this.skitter_box.find('.next_button').click(function() {
          self.jumpToImage(self.settings.image_i);
          return false;
        });
        
        self.skitter_box.find('.next_button, .prev_button').bind('mouseover', self.settings.mouseOverButton);
        self.skitter_box.find('.next_button, .prev_button').bind('mouseleave', self.settings.mouseOutButton);
        
        this.skitter_box.find('.image_number').click(function(){
          if ($(this).attr('class') != 'image_number image_number_select') {
            var imageNumber = parseInt($(this).attr('rel'));
            self.jumpToImage(imageNumber);
          }
          return false;
        });
        
        // Preview with dots
        if (self.settings.preview && self.settings.dots) 
        {
          var preview = $('<div class="preview_slide"><ul></ul></div>');
          
          for (var i = 0; i < this.settings.images_links.length; i++) {
            var li = $('<li></li>');
            var img = $('<img />');
            img.attr('src', this.settings.images_links[i][0]);
            li.append(img);
            preview.find('ul').append(li);
          }
          
          var width_preview_ul = parseInt(this.settings.images_links.length * 100);
          preview.find('ul').width(width_preview_ul);
          $(class_info).append(preview);
          
          self.skitter_box.find(class_info).find('.image_number').mouseenter(function() {
            if (self.isLargeDevice()) {
              var _left_info = parseFloat(self.skitter_box.find(class_info).offset().left);
              var _left_image = parseFloat($(this).offset().left);
              var _left_preview = (_left_image - _left_info) - 43;
              
              var rel = parseInt($(this).attr('rel'));
              var image_current_preview = self.skitter_box.find('.preview_slide_current img').attr('src');
              var _left_ul = -(rel * 100);
              
              self.skitter_box.find('.preview_slide').find('ul').animate({left: _left_ul}, {duration:200, queue: false, easing: 'easeOutSine'});
              self.skitter_box.find('.preview_slide').fadeTo(1,1).animate({left: _left_preview}, {duration:200, queue: false});
            }
          });
          
          self.skitter_box.find(class_info).mouseleave(function() {
            if (self.isLargeDevice()) {
              $('.preview_slide').animate({opacity: 'hide'}, {duration: 200, queue: false});
            }
          });
        }
      }
      
      // Focus
      if (self.settings.focus) {
        self.focusSkitter();
      }
      
      // Constrols
      if (self.settings.controls) {
        self.setControls();
      }
      
      // Progressbar
      if (self.settings.progressbar && self.settings.auto_play) {
        self.addProgressBar();
      }

      // hide_tools
      if (self.settings.hide_tools) {
        self.hideTools();
      }

      // Navigation keys
      if (self.settings.enable_navigation_keys) {
        self.enableNavigationKeys();
      }
      
      this.loadImages();

      this.setResponsive();
      this.setTouchSupport();
    },
    
    /**
     * Load images
     */
    loadImages: function () 
    {
      var self = this;
      var loading = $('<div class="skitter-spinner"><div class="icon-sending"></div></div>');
      var total = this.settings.images_links.length;
      var u = 0;
      
      this.skitter_box.append(loading);
      
      for (var i in this.settings.images_links) {
        var self_il = this.settings.images_links[i];
        var src = self.getImageName(self_il[0]);
        var img = new Image();
        
        $(img).on('load', function () {
          ++u;
          if (u == total) {
            self.skitter_box.find('.skitter-spinner').remove();
            self.start();
          }
        }).on('error', function () {
          self.skitter_box.find('.skitter-spinner, .image_number, .next_button, .prev_button').remove();
          self.skitter_box.html('<p style="color:white;background:black;">Error loading images. One or more images were not found.</p>');
        }).attr('src', src);
      }
    }, 
    
    /**
     * Start skitter
     */
    start: function()
    {
      var self = this;
      var init_pause = false;

      if (this.settings.numbers || this.settings.thumbs) this.skitter_box.find('.info_slide').fadeIn(500);
      if (this.settings.dots) this.skitter_box.find('.info_slide_dots').fadeIn(500);
      if (this.settings.label) this.skitter_box.find('.label_skitter').show();
      if (this.settings.navigation) {
        this.skitter_box.find('.prev_button').fadeIn(500);
        this.skitter_box.find('.next_button').fadeIn(500);
      }
      
      if (self.settings.auto_play) {
        self.startTime();
      }

      self.windowFocusOut();
      self.setLinkAtual();
      
      self.skitter_box.find('.image > a img').attr({'src': self.getCurrentImage()});
      img_link = self.skitter_box.find('.image > a');
      img_link = self.resizeImage(img_link);
      img_link.find('img').fadeIn(1500);
      
      self.setValueBoxText();
      self.showBoxText();
      
      if (self.settings.auto_play) {
        self.stopOnMouseOver();
      }

      var mouseOverInit = function() {
        if (self.settings.stop_over) {
          init_pause = true;
          self.settings.is_hover_skitter_box = true;
          self.clearTimer(true);
          self.pauseProgressBar();
        }
      };

      self.skitter_box.mouseover(mouseOverInit);
      self.skitter_box.find('.next_button').mouseover(mouseOverInit);
      
      if (self.settings.images_links.length > 1 && !init_pause) {
        if (self.settings.auto_play) {
          self.timer = setTimeout(function() { self.nextImage(); }, self.settings.interval);
        }
      } 
      else {
        self.skitter_box.find('.skitter-spinner, .image_number, .next_button, .prev_button').remove();
      }
      
      if ($.isFunction(self.settings.onLoad)) self.settings.onLoad(self);

      this.setDimensions();
    },
    
    /**
     * Jump to image
     */
    jumpToImage: function(imageNumber) 
    {
      if (this.settings.is_animating == false) {
        this.settings.elapsedTime = 0;
        this.skitter_box.find('.box_clone').stop();
        this.clearTimer(true);
        this.settings.image_i = Math.floor(imageNumber);
        
        this.skitter_box.find('.image > a').attr({'href': this.settings.link_atual});
        this.skitter_box.find('.image_main').attr({'src': this.getCurrentImage()});
        this.skitter_box.find('.box_clone').remove();

        this.nextImage();
      }
    },
    
    /**
     * Next image
     */
    nextImage: function() 
    {
      var self = this;
      
      animations_functions = this.animations;

      if (self.settings.progressbar) self.hideProgressBar();
      
      var animation_type;
      if (this.settings.animation == '' && this.settings.images_links[this.settings.image_i][2]) {
        animation_type = this.settings.images_links[this.settings.image_i][2];
      } else if (this.settings.animation == '') {
        animation_type = 'default';
      } else {
        animation_type = this.settings.animation;
      }

      // Animation fixed by window size
      if (self.settings.responsive) {
        var window_width = $(window).width();
        for (var name in self.settings.responsive) {
          var item = self.settings.responsive[name];
          if (window_width < item.max_width && item.animation) {
            animation_type = item.animation;
            break;
          }
        }
      }
      
      // RandomUnique
      if (animation_type == 'randomSmart') 
      {
        if (!this.settings.random_ia) {
          animations_functions.sort(function() {
            return 0.5 - Math.random();
          });
          this.settings.random_ia = animations_functions;
        }
        animation_type = this.settings.random_ia[this.settings.image_i];
      }
      // Random
      else if (animation_type == 'random') 
      {
        var random_id = parseInt(Math.random() * animations_functions.length);
        animation_type = animations_functions[random_id];
      }
      // Specific animations
      else if (self.settings.with_animations.length > 0)
      {
        var total_with_animations = self.settings.with_animations.length;
        if (this.settings._i_animation == undefined) {
          this.settings._i_animation = 0;
        }
        animation_type = self.settings.with_animations[this.settings._i_animation];
        ++this.settings._i_animation;
        if (this.settings._i_animation >= total_with_animations) this.settings._i_animation = 0;
      }
      
      switch (animation_type) 
      {
        case 'cube' : 
          this.animationCube();
          break;
        case 'cubeRandom' : 
          this.animationCube({random:true});
          break;
        case 'block' : 
          this.animationBlock();
          break;
        case 'cubeStop' : 
          this.animationCubeStop();
          break;
        case 'cubeStopRandom' : 
          this.animationCubeStop({random:true});
          break;
        case 'cubeHide' : 
          this.animationCubeHide();
          break;
        case 'cubeSize' : 
          this.animationCubeSize();
          break;
        case 'horizontal' : 
          this.animationHorizontal();
          break;
        case 'showBars' : 
          this.animationShowBars();
          break;
        case 'showBarsRandom' : 
          this.animationShowBars({random:true});
          break;
        case 'tube' : 
          this.animationTube();
          break;
        case 'fade' : 
          this.animationFade();
          break;
        case 'fadeFour' : 
          this.animationFadeFour();
          break;
        case 'paralell' : 
          this.animationParalell();
          break;
        case 'blind' : 
          this.animationBlind();
          break;
        case 'blindHeight' : 
          this.animationBlindDimension({height:true});
          break;
        case 'blindWidth' : 
          this.animationBlindDimension({height:false, time_animate:400, delay:50});
          break;
        case 'directionTop' : 
          this.animationDirection({direction:'top'});
          break;
        case 'directionBottom' : 
          this.animationDirection({direction:'bottom'});
          break;
        case 'directionRight' : 
          this.animationDirection({direction:'right', total:5});
          break;
        case 'directionLeft' : 
          this.animationDirection({direction:'left', total:5});
          break;
        case 'cubeSpread' : 
          this.animationCubeSpread();
          break;
        case 'cubeJelly' : 
          this.animationCubeJelly();
          break;
        case 'glassCube' : 
          this.animationGlassCube();
          break;
        case 'glassBlock' : 
          this.animationGlassBlock();
          break;
        case 'circles' : 
          this.animationCircles();
          break;
        case 'circlesInside' : 
          this.animationCirclesInside();
          break;
        case 'circlesRotate' : 
          this.animationCirclesRotate();
          break;
        case 'cubeShow' : 
          this.animationCubeShow();
          break;
        case 'upBars' : 
          this.animationDirectionBars({direction: 'top'});
          break;
        case 'downBars' : 
          this.animationDirectionBars({direction: 'bottom'});
          break;
        case 'hideBars' : 
          this.animationHideBars();
          break;
        case 'swapBars' : 
          this.animationSwapBars();
          break;
        case 'swapBarsBack' : 
          this.animationSwapBars({easing: 'easeOutBack'});
          break;
        case 'swapBlocks' : 
          this.animationSwapBlocks();
          break;
        case 'cut' : 
          this.animationCut();
          break;
        default : 
          this.animationTube();
          break;
      }
    },
    
    animationCube: function (options)
    {
      var self = this;
      
      var options = $.extend({}, {random: false}, options || {});
      
      this.settings.is_animating = true;
      var easing = (this.settings.easing_default == '') ? 'easeOutExpo' : this.settings.easing_default;
      var time_animate = 700 / this.settings.velocity;
      
      this.setActualLevel();

      var max_w = self.getMaxW(8);
      var division_w  = Math.ceil(this.settings.width_skitter / (this.settings.width_skitter / max_w));
      var division_h  = Math.ceil(this.settings.height_skitter / (this.settings.height_skitter / 3));
      var total   = division_w * division_h;
      
      var width_box   = Math.ceil(this.settings.width_skitter / division_w);
      var height_box  = Math.ceil(this.settings.height_skitter / division_h);
      
      var init_top  = this.settings.height_skitter + 200;
      var init_left   = this.settings.height_skitter + 200;
      
      var col_t = 0;
      var col = 0;
      
      for (i = 0; i < total; i++) {
        
        init_top      = (i % 2 == 0) ? init_top : -init_top;
        init_left       = (i % 2 == 0) ? init_left : -init_left;

        var _vtop       = init_top + (height_box * col_t) + (col_t * 150);
        var _vleft      = -self.settings.width_skitter;
        
        var _vtop_image   = -(height_box * col_t);
        
        var _vleft_image  = -(width_box * col);
        var _btop       = (height_box * col_t);
        var _bleft      = (width_box * col);
        
        var box_clone     = this.getBoxClone();
        box_clone.hide();
        
        var delay_time = 50 * (i);
        
        if (options.random) {
          delay_time = 40 * (col);
          box_clone.css({left:_vleft+'px', top:_vtop+'px', width:width_box, height:height_box});
        } 
        else {
          time_animate = 500;
          box_clone.css({left:(this.settings.width_skitter) + (width_box * i), top:this.settings.height_skitter + (height_box * i), width:width_box, height:height_box});
        }
        
        this.addBoxClone(box_clone);
        
        var callback = (i == (total - 1)) ? function() { self.finishAnimation(); } : '';
        box_clone.show().delay(delay_time).animate({top:_btop+'px', left:_bleft+'px'}, time_animate, easing, callback);
        
        if (options.random) {
          box_clone.find('img').css({left:_vleft_image+100, top:_vtop_image+50});
          box_clone.find('img').delay(delay_time+(time_animate/2)).animate({left:_vleft_image, top:_vtop_image}, 1000, 'easeOutBack');
        }
        else {
          box_clone.find('img').css({left:_vleft_image, top:_vtop_image});
          box_clone.find('img').delay(delay_time+(time_animate/2)).fadeTo(100, 0.5).fadeTo(300, 1);
        }
        
        col_t++;
        if (col_t == division_h) {
          col_t = 0;
          col++;
        }
      }
    },
    
    animationBlock: function(options)
    {
      var self = this;
      
      this.settings.is_animating = true;
      var easing = (this.settings.easing_default == '') ? 'easeOutQuad' : this.settings.easing_default;
      var time_animate = 500 / this.settings.velocity;
      
      this.setActualLevel();
      
      var max_w       = self.getMaxW(15);
      var total       = Math.ceil(this.settings.width_skitter / (this.settings.width_skitter / max_w));
      var width_box   = Math.ceil(this.settings.width_skitter / total);
      var height_box  = (this.settings.height_skitter);
      
      for (i = 0; i < total; i++) {
        
        var _bleft = (width_box * (i));
        var _btop = 0;
        
        var box_clone = this.getBoxClone();
        box_clone.css({left: this.settings.width_skitter + 100, top:0, width:width_box, height:height_box});
        box_clone.find('img').css({left:-(width_box * i)});
        
        this.addBoxClone(box_clone);
        
        var delay_time = 80 * (i);
        var callback = (i == (total - 1)) ? function() { self.finishAnimation(); } : '';
        
        box_clone.show().delay(delay_time).animate({top:_btop, left:_bleft}, time_animate, easing);
        box_clone.find('img').hide().delay(delay_time+100).animate({opacity:'show'}, time_animate+300, easing, callback);
      }
      
    },
    
    animationCubeStop: function(options)
    {
      var self = this;

      var options = $.extend({}, {random: false}, options || {});

      this.settings.is_animating = true;
      var easing = (this.settings.easing_default == '') ? 'easeInQuad' : this.settings.easing_default;
      var time_animate = 300 / this.settings.velocity;

      var image_old = this.getOldImage();

      this.setActualLevel();

      this.setLinkAtual();
      this.skitter_box.find('.image_main').attr({'src':this.getCurrentImage()});

      var max_w = self.getMaxW(8);
      var max_h = self.getMaxH(8);
      var division_w = Math.ceil(this.settings.width_skitter / (this.settings.width_skitter / max_w));
      var division_h = Math.ceil(this.settings.height_skitter / (this.settings.width_skitter / max_h));
      var total = division_w * division_h;

      var width_box = Math.ceil(this.settings.width_skitter / division_w);
      var height_box = Math.ceil(this.settings.height_skitter / division_h);

      var init_top = 0;
      var init_left = 0;

      var col_t = 0;
      var col = 0;
      var _ftop = this.settings.width_skitter / 16;

      for (i = 0; i < total; i++) {
        init_top = (i % 2 == 0) ? init_top : -init_top;
        init_left = (i % 2 == 0) ? init_left : -init_left;

        var _vtop = init_top + (height_box * col_t);
        var _vleft = (init_left + (width_box * col));
        var _vtop_image = -(height_box * col_t);

        var _vleft_image = -(width_box * col);
        var _btop = _vtop - _ftop;
        var _bleft = _vleft - _ftop;

        var box_clone = this.getBoxCloneImgOld(image_old);
        box_clone.css({left:_vleft+'px', top:_vtop+'px', width:width_box, height:height_box});
        box_clone.find('img').css({left:_vleft_image, top:_vtop_image});

        this.addBoxClone(box_clone);
        box_clone.show();

        var delay_time = 50 * i;

        if (options.random) {
          time_animate = (400 * (self.getRandom(2) + 1)) / this.settings.velocity;
          _btop = _vtop;
          _bleft = _vleft;
          delay_time = Math.ceil( 30 * self.getRandom(30) );
        }
        
        if (options.random && i == (total - 1)) {
          time_animate = 400 * 3;
          delay_time = 30 * 30;
        }

        var callback = (i == (total - 1)) ? function() { self.finishAnimation(); } : '';
        box_clone.delay(delay_time).animate({opacity:'hide', top:_btop+'px', left:_bleft+'px'}, time_animate, easing, callback);

        col_t++;
        if (col_t == division_h) {
          col_t = 0;
          col++;
        }
      }
    },
    
    animationCubeHide: function(options)
    {
      var self = this;
      
      this.settings.is_animating = true;
      var easing = (this.settings.easing_default == '') ? 'easeOutQuad' : this.settings.easing_default;
      var time_animate = 500 / this.settings.velocity;
      
      var image_old = this.getOldImage();
      
      this.setActualLevel();
      
      this.setLinkAtual();
      this.skitter_box.find('.image_main').attr({'src':this.getCurrentImage()});
      
      var max_w       = self.getMaxW(8);
      var division_w  = Math.ceil(this.settings.width_skitter / (this.settings.width_skitter / max_w));
      var division_h  = Math.ceil(this.settings.height_skitter / (this.settings.height_skitter / 3));
      var total       = division_w * division_h;
      
      var width_box   = Math.ceil(this.settings.width_skitter / division_w);
      var height_box  = Math.ceil(this.settings.height_skitter / division_h);
      
      var init_top    = 0;
      var init_left   = 0;
      
      var col_t       = 0;
      var col         = 0;
      
      for (i = 0; i < total; i++) {
        
        init_top          = (i % 2 == 0) ? init_top : -init_top;
        init_left         = (i % 2 == 0) ? init_left : -init_left;

        var _vtop         = init_top + (height_box * col_t);
        var _vleft        = (init_left + (width_box * col));
        var _vtop_image   = -(height_box * col_t);
        
        var _vleft_image  = -(width_box * col);
        var _btop         = _vtop - 50;
        var _bleft        = _vleft - 50;
        
        var box_clone = this.getBoxCloneImgOld(image_old);
        box_clone.css({left:_vleft+'px', top:_vtop+'px', width:width_box, height:height_box});
        box_clone.find('img').css({left:_vleft_image, top:_vtop_image});
        
        this.addBoxClone(box_clone);
        box_clone.show();
        
        var delay_time = 50 * i;
        delay_time = (i == (total - 1)) ? (total * 50) : delay_time;
        var callback = (i == (total - 1)) ? function() { self.finishAnimation(); } : '';
        
        box_clone.delay(delay_time).animate({opacity:'hide'}, time_animate, easing, callback);
        
        col_t++;
        if (col_t == division_h) {
          col_t = 0;
          col++;
        }
      }
      
    },
    
    animationCubeJelly: function(options)
    {
      var self = this;
      
      this.settings.is_animating = true;
      var easing = (this.settings.easing_default == '') ? 'easeInBack' : this.settings.easing_default;
      var time_animate = 300 / this.settings.velocity;
      
      var image_old = this.getOldImage();
      
      this.setActualLevel();
      
      this.setLinkAtual();
      this.skitter_box.find('.image_main').attr({'src':this.getCurrentImage()});
      
      var max_w       = self.getMaxW(8);
      var division_w  = Math.ceil(this.settings.width_skitter / (this.settings.width_skitter / max_w));
      var division_h  = Math.ceil(this.settings.height_skitter / (this.settings.height_skitter / 3));
      var total       = division_w * division_h;
      
      var width_box   = Math.ceil(this.settings.width_skitter / division_w);
      var height_box  = Math.ceil(this.settings.height_skitter / division_h);
      
      var init_top    = 0;
      var init_left   = 0;
      
      var col_t       = 0;
      var col         = 0;
      var u           = -1;
      
      for (i = 0; i < total; i++) {
      
        if (col % 2 != 0) {
          if (col_t == 0) {
            u = u + division_h + 1;
          }
          u--;
        } 
        else {
          if (col > 0 && col_t == 0) {
            u = u + 2;
          }
          u++;
        }
      
        init_top         = (i % 2 == 0) ? init_top : -init_top;
        init_left        = (i % 2 == 0) ? init_left : -init_left;

        var _vtop        = init_top + (height_box * col_t);
        var _vleft       = (init_left + (width_box * col));
        var _vtop_image  = -(height_box * col_t);
        
        var _vleft_image = -(width_box * col);
        var _btop        = _vtop - 50;
        var _bleft       = _vleft - 50;
        
        var box_clone = this.getBoxCloneImgOld(image_old);
        box_clone.css({left:_vleft+'px', top:_vtop+'px', width:width_box, height:height_box});
        box_clone.find('img').css({left:_vleft_image, top:_vtop_image});
        
        this.addBoxClone(box_clone);
        box_clone.show();
        
        var delay_time = (50 * i);
        var callback = (i == (total - 1)) ? function() { self.finishAnimation(); } : '';
        
        box_clone.delay(delay_time).animate({width:'+=100px', height:'+=100px', top:'-=20px',  left: '-=20px', opacity:'hide'}, time_animate, easing, callback);
        col_t++;
        
        if (col_t == division_h) {
          col_t = 0;
          col++;
        }
        
      }
    },
    
    animationCubeSize: function(options)
    {
      var self = this;
      
      this.settings.is_animating = true;
      var easing = (this.settings.easing_default == '') ? 'easeInOutQuad' : this.settings.easing_default;
      var time_animate = 600 / this.settings.velocity;
      
      var image_old = this.getOldImage();
      
      this.setActualLevel();
      
      this.setLinkAtual();
      this.skitter_box.find('.image_main').attr({'src':this.getCurrentImage()});
      
      var max_w       = self.getMaxW(8);
      var division_w  = Math.ceil(this.settings.width_skitter / (this.settings.width_skitter / max_w));
      var division_h  = Math.ceil(this.settings.height_skitter / (this.settings.height_skitter / 3));
      var total       = division_w * division_h;
      
      var width_box   = Math.ceil(this.settings.width_skitter / division_w);
      var height_box  = Math.ceil(this.settings.height_skitter / division_h);
      
      var init_top    = 0;
      var init_left   = 0;
      
      var col_t       = 0;
      var col         = 0;
      var _ftop       = Math.ceil(this.settings.width_skitter / 6);
      
      for (i = 0; i < total; i++) {
        
        init_top          = (i % 2 == 0) ? init_top : -init_top;
        init_left         = (i % 2 == 0) ? init_left : -init_left;

        var _vtop         = init_top + (height_box * col_t);
        var _vleft        = (init_left + (width_box * col));
        var _vtop_image   = -(height_box * col_t);
        
        var _vleft_image  = -(width_box * col);
        var _btop         = _vtop - _ftop;
        var _bleft        = _vleft - _ftop;
        
        var box_clone = this.getBoxCloneImgOld(image_old);
        box_clone.css({left:_vleft, top:_vtop, width:width_box, height:height_box});
        box_clone.find('img').css({left:_vleft_image, top:_vtop_image});
        
        this.addBoxClone(box_clone);
        box_clone.show();
        
        var delay_time = 50 * i;
        var callback = (i == (total - 1)) ? function() { self.finishAnimation(); } : '';
        box_clone.delay(delay_time).animate({
          opacity:'hide',width:'hide',height:'hide',top:_vtop+(width_box*1.5),left:_vleft+(height_box*1.5)
        }, time_animate, easing, callback);
        
        col_t++;
        if (col_t == division_h) {
          col_t = 0;
          col++;
        }
      }
      
    },
    
    animationHorizontal: function(options)
    {
      var self = this;
      
      this.settings.is_animating = true;
      var easing = (this.settings.easing_default == '') ? 'easeOutExpo' : this.settings.easing_default;
      var time_animate = 700 / this.settings.velocity;
      
      this.setActualLevel();
      
      var total       = Math.ceil(this.settings.width_skitter / (this.settings.width_skitter / 7));
      var width_box   = (this.settings.width_skitter);
      var height_box  = Math.ceil(this.settings.height_skitter / total);
      
      for (i = 0; i < total; i++) {
        var _bleft = (i % 2 == 0 ? '' : '') + width_box;
        var _btop = (i * height_box);
        
        var box_clone = this.getBoxClone();
        
        box_clone.css({left:_bleft+'px', top:_btop+'px', width:width_box, height:height_box});
        box_clone.find('img').css({left:0, top:-_btop});
        
        this.addBoxClone(box_clone);
        
        var delay_time = 90 * i;
        var callback = (i == (total - 1)) ? function() { self.finishAnimation(); } : '';
        box_clone.delay(delay_time).animate({opacity:'show', top:_btop, left:0}, time_animate, easing, callback);
      }
    },
    
    animationShowBars: function(options)
    {
      var self = this;
      
      var options = $.extend({}, {random: false}, options || {});
      
      this.settings.is_animating = true;
      var easing = (this.settings.easing_default == '') ? 'easeOutQuad' : this.settings.easing_default;
      var time_animate = 400 / this.settings.velocity;
      
      this.setActualLevel();
      
      var max_w       = self.getMaxW(10);
      var total       = Math.ceil(this.settings.width_skitter / (this.settings.width_skitter / max_w));
      var width_box   = Math.ceil(this.settings.width_skitter / total);
      var height_box  = (this.settings.height_skitter);
      
      for (i = 0; i < total; i++) {
        
        var _bleft = (width_box * (i));
        var _btop = 0;
        
        var box_clone = this.getBoxClone();
        
        box_clone.css({left:_bleft, top:_btop - 50, width:width_box, height:height_box});
        box_clone.find('img').css({left:-(width_box * i), top:0});
        
        this.addBoxClone(box_clone);
        
        if (options.random) {
          var random = this.getRandom(total);
          var delay_time = 50 * random;
          delay_time = (i == (total - 1)) ? (50 * total) : delay_time;
        }
        else {
          var delay_time = 70 * (i);
          time_animate = time_animate - (i * 2);
        }
        
        var callback = (i == (total - 1)) ? function() { self.finishAnimation(); } : '';
        box_clone.delay(delay_time).animate({
          opacity:'show', top:_btop+'px', left:_bleft+'px'
        }, time_animate, easing, callback);
      }
      
    },
    
    animationTube: function(options)
    {
      var self = this;
      
      this.settings.is_animating = true;
      var easing = (this.settings.easing_default == '') ? 'easeOutElastic' : this.settings.easing_default;
      var time_animate = 600 / this.settings.velocity;
      
      this.setActualLevel();
      
      var max_w       = self.getMaxW(10);
      var total       = Math.ceil(this.settings.width_skitter / (this.settings.width_skitter / max_w));
      var width_box   = Math.ceil(this.settings.width_skitter / total);
      var height_box  = this.settings.height_skitter;
      
      for (i = 0;i<total;i++) {
        var _btop = 0;
        var _vtop = height_box;
        var vleft = width_box * i;
      
        var box_clone = this.getBoxClone();
        
        box_clone.css({left:vleft,top: _vtop, height:height_box, width: width_box});
        box_clone.find('img').css({left:-(vleft)});
        
        this.addBoxClone(box_clone);
        
        var random = this.getRandom(total);
        var delay_time = 30 * random;
        var callback = (i == (total - 1)) ? function() { self.finishAnimation(); } : '';
        box_clone.show().delay(delay_time).animate({top:_btop}, time_animate, easing, callback);
      }
    },
    
    animationFade: function(options)
    {
      var self = this;
      
      this.settings.is_animating = true;
      var easing = (this.settings.easing_default == '') ? 'easeOutQuad' : this.settings.easing_default;
      var time_animate = 800 / this.settings.velocity;
      
      this.setActualLevel();
      
      var width_box   = this.settings.width_skitter;
      var height_box  = this.settings.height_skitter;
      var total     = 2;
      
      for (i = 0;i<total;i++) {
        var _vtop = 0;
        var _vleft = 0;
      
        var box_clone = this.getBoxClone();
        box_clone.css({left:_vleft, top:_vtop, width:width_box, height:height_box});
        this.addBoxClone(box_clone);

        var callback = (i == (total - 1)) ? function() { self.finishAnimation(); } : '';
        box_clone.animate({opacity:'show', left:0, top:0}, time_animate, easing, callback);
      }
    },
    
    animationFadeFour: function(options)
    {
      var self = this;
      
      this.settings.is_animating = true;
      var easing = (this.settings.easing_default == '') ? 'easeOutQuad' : this.settings.easing_default;
      var time_animate = 500 / this.settings.velocity;
      
      this.setActualLevel();
      
      var width_box   = this.settings.width_skitter;
      var height_box  = this.settings.height_skitter;
      var total     = 4;
      
      for (i = 0;i<total;i++) {
        
        if (i == 0) {
          var _vtop = '-40px';
          var _vleft = '-40px';
        } else if (i == 1) {
          var _vtop = '-40px';
          var _vleft = '40px';
        } else if (i == 2) {
          var _vtop = '40px';
          var _vleft = '-40px';
        } else if (i == 3) {
          var _vtop = '40px';
          var _vleft = '40px';
        }
      
        var box_clone = this.getBoxClone();
        box_clone.css({left:_vleft, top:_vtop, width:width_box, height:height_box});
        this.addBoxClone(box_clone);
        
        var callback = (i == (total - 1)) ? function() { self.finishAnimation(); } : '';
        box_clone.animate({opacity:'show', left:0, top:0}, time_animate, easing, callback);
      }
    },
    
    animationParalell: function(options)
    {
      var self = this;
      
      this.settings.is_animating = true;
      var easing = (this.settings.easing_default == '') ? 'easeOutQuad' : this.settings.easing_default;
      var time_animate = 400 / this.settings.velocity;
      
      this.setActualLevel();
      
      var max_w       = 16; //self.getMaxW(16); // @todo complex
      var total       = Math.ceil(this.settings.width_skitter / (this.settings.width_skitter / max_w));
      var width_box   = Math.ceil(this.settings.width_skitter / total);
      var height_box  = this.settings.height_skitter;
      
      for (i = 0; i < total; i++) {
        
        var _bleft = (width_box * (i));
        var _btop = 0;
        
        var box_clone = this.getBoxClone();
        
        box_clone.css({left:_bleft, top:_btop - this.settings.height_skitter, width:width_box, height:height_box});
        box_clone.find('img').css({left:-(width_box * i), top:0});
        
        this.addBoxClone(box_clone);
        
        var delay_time;
        if (i <= ((total / 2) - 1)) {
          delay_time = 1400 - (i * 200);
        }
        else if (i > ((total / 2) - 1)) {
          delay_time = ((i - (total / 2)) * 200);
        }
        delay_time = delay_time / 2.5;
        
        var callback = (i == (total - 1)) ? function() { self.finishAnimation(); } : '';
        box_clone.delay(delay_time).animate({
          top:_btop+'px', left:_bleft+'px', opacity: 'show'
        }, time_animate, easing, callback);
      }
      
    },
    
    animationBlind: function(options)
    {
      var self = this;
      
      var options = $.extend({}, {height: false}, options || {});
      
      this.settings.is_animating = true;
      var easing = (this.settings.easing_default == '') ? 'easeOutQuad' : this.settings.easing_default;
      var time_animate = 400 / this.settings.velocity;
      
      this.setActualLevel();
      
      var max_w       = 16; // self.getMaxW(16); // @todo complex
      var total       = Math.ceil(this.settings.width_skitter / (this.settings.width_skitter / max_w));
      var width_box   = Math.ceil(this.settings.width_skitter / total);
      var height_box  = this.settings.height_skitter;
      
      for (i = 0; i < total; i++) {
        
        var _bleft = (width_box * (i));
        var _btop = 0;
        
        var box_clone = this.getBoxClone();
        
        box_clone.css({left:_bleft, top:_btop, width:width_box, height:height_box});
        box_clone.find('img').css({left:-(width_box * i), top:0});
        
        this.addBoxClone(box_clone);
        
        var delay_time;
        
        if (!options.height) {
          if (i <= ((total / 2) - 1)) {
            delay_time = 1400 - (i * 200);
          }
          else if (i > ((total / 2) - 1)) {
            delay_time = ((i - (total / 2)) * 200);
          }
          var callback = (i == (total - 1)) ? function() { self.finishAnimation(); } : '';
        }
        else {
          if (i <= ((total / 2) - 1)) {
            delay_time = 200 + (i * 200);
          }
          else if (i > ((total / 2) - 1)) {
            delay_time = (((total / 2) - i) * 200) + (total * 100);
          }
          var callback = (i == (total / 2)) ? function() { self.finishAnimation(); } : '';
        }
        
        delay_time = delay_time / 2.5;
        
        if (!options.height) {
          box_clone.delay(delay_time).animate({
            opacity:'show',top:_btop+'px', left:_bleft+'px', width:'show'
          }, time_animate, easing, callback);
        }
        else {
          time_animate = time_animate + (i * 2);
          var easing = 'easeOutQuad';
          box_clone.delay(delay_time).animate({
            opacity:'show',top:_btop+'px', left:_bleft+'px', height:'show'
          }, time_animate, easing, callback);
        }
      }
      
    },
    
    animationBlindDimension: function(options)
    {
      var self = this;
      
      var options = $.extend({}, {height: true, time_animate: 500, delay: 100}, options || {});
      
      this.settings.is_animating = true;
      var easing = (this.settings.easing_default == '') ? 'easeOutQuad' : this.settings.easing_default;
      var time_animate = options.time_animate / this.settings.velocity;
      
      this.setActualLevel();
      
      var max_w       = self.getMaxW(16);
      var total       = Math.ceil(this.settings.width_skitter / (this.settings.width_skitter / max_w));
      var width_box   = Math.ceil(this.settings.width_skitter / total);
      var height_box  = this.settings.height_skitter;
      
      for (i = 0; i < total; i++) {
        
        var _bleft = (width_box * (i));
        var _btop = 0;
        
        var box_clone = this.getBoxClone();
        
        box_clone.css({left:_bleft, top:_btop, width:width_box, height:height_box});
        box_clone.find('img').css({left:-(width_box * i), top:0});
        
        this.addBoxClone(box_clone);
        
        var delay_time = options.delay * i;
        var callback = (i == (total - 1)) ? function() { self.finishAnimation(); } : '';
        
        if (!options.height) {
          box_clone.delay(delay_time).animate({
            opacity:'show',top:_btop+'px', left:_bleft+'px', width:'show'
          }, time_animate, easing, callback);
        }
        else {
          var easing = 'easeOutQuad';
          box_clone.delay(delay_time).animate({
            opacity:'show',top:_btop+'px', left:_bleft+'px', height:'show'
          }, time_animate, easing, callback);
        }
      }
      
    },
    
    animationDirection: function(options)
    {
      var self = this;
      
      var max_w   = self.getMaxW(7);
      var options = $.extend({}, {direction: 'top', delay_type: 'sequence', total: max_w}, options || {});
      
      this.settings.is_animating = true;
      var easing = (this.settings.easing_default == '') ? 'easeInOutExpo' : this.settings.easing_default;
      var time_animate = 1200 / this.settings.velocity;
      
      var image_old = this.getOldImage();
      
      this.setActualLevel();
      
      this.setLinkAtual();
      this.skitter_box.find('.image_main').attr({'src':this.getCurrentImage()});
      this.skitter_box.find('.image_main').hide();
      
      var total     = options.total;
      
      for (i = 0; i < total; i++) {
        
        switch (options.direction)
        {
          default : case 'top' : 
            
            var width_box     = Math.ceil(this.settings.width_skitter / total);
            var height_box    = this.settings.height_skitter;
            
            var _itopc      = 0;
            var _ileftc     = (width_box * i);
            var _ftopc      = -height_box;
            var _fleftc     = _ileftc;
            
            var _itopn      = height_box;
            var _ileftn     = _ileftc;
            var _ftopn      = 0;
            var _fleftn     = _ileftc;
            
            var _vtop_image   = 0;
            var _vleft_image  = -_ileftc;
            
            break;
            
          case 'bottom' : 
          
            var width_box     = Math.ceil(this.settings.width_skitter / total);
            var height_box    = this.settings.height_skitter;
            
            var _itopc      = 0;
            var _ileftc     = (width_box * i);
            var _ftopc      = height_box;
            var _fleftc     = _ileftc;
            
            var _itopn      = -height_box;
            var _ileftn     = _ileftc;
            var _ftopn      = 0;
            var _fleftn     = _ileftc;
            
            var _vtop_image   = 0;
            var _vleft_image  = -_ileftc;
            
            break;
            
          case 'right' : 
          
            var width_box     = this.settings.width_skitter;
            var height_box    = Math.ceil(this.settings.height_skitter / total);
            
            var _itopc      = (height_box * i);
            var _ileftc     = 0;
            var _ftopc      = _itopc;
            var _fleftc     = width_box;
            
            var _itopn      = _itopc;
            var _ileftn     = -_fleftc;
            var _ftopn      = _itopc;
            var _fleftn     = 0;
            
            var _vtop_image   = -_itopc;
            var _vleft_image  = 0;
            
            break;
            
          case 'left' : 
          
            var width_box     = this.settings.width_skitter;
            var height_box    = Math.ceil(this.settings.height_skitter / total);
            
            var _itopc      = (height_box * i);
            var _ileftc     = 0;
            var _ftopc      = _itopc;
            var _fleftc     = -width_box;
            
            var _itopn      = _itopc;
            var _ileftn     = -_fleftc;
            var _ftopn      = _itopc;
            var _fleftn     = 0;
            
            var _vtop_image   = -_itopc;
            var _vleft_image  = 0;
            
            break;
            
        }
        
        switch (options.delay_type) 
        {
          case 'zebra' : default : var delay_time = (i % 2 == 0) ? 0 : 150; break;
          case 'random' : var delay_time = 30 * (Math.random() * 30); break;
          case 'sequence' : var delay_time = i * 100; break;
        }
        
        var box_clone = this.getBoxCloneImgOld(image_old);
        box_clone.find('img').css({left:_vleft_image, top:_vtop_image});
        
        box_clone.css({top:_itopc, left:_ileftc, width:width_box, height:height_box});
        
        this.addBoxClone(box_clone);
        box_clone.show();
        box_clone.delay(delay_time).animate({ top:_ftopc, left:_fleftc }, time_animate, easing);
        
        // Next image
        var box_clone_next = this.getBoxClone();
        box_clone_next.find('img').css({left:_vleft_image, top:_vtop_image});
        
        box_clone_next.css({top:_itopn, left:_ileftn, width:width_box, height:height_box});
        
        this.addBoxClone(box_clone_next);
        box_clone_next.show();
        
        var callback = (i == (total - 1)) ? function() { self.finishAnimation(); } : '';
        box_clone_next.delay(delay_time).animate({ top:_ftopn, left:_fleftn }, time_animate, easing, callback);
        
      }
    },
    
    animationCubeSpread: function(options)
    {
      var self = this;
      
      this.settings.is_animating = true;
      var easing = (this.settings.easing_default == '') ? 'easeOutQuad' : this.settings.easing_default;
      var time_animate = 700 / this.settings.velocity;
      
      this.setActualLevel();
      
      var max_w       = self.getMaxW(8);
      var max_h       = self.getMaxH(8);
      var division_w  = Math.ceil(this.settings.width_skitter / (this.settings.width_skitter / max_w));
      var division_h  = Math.ceil(this.settings.height_skitter / (this.settings.width_skitter / max_h));
      var total       = division_w * division_h;
      
      var width_box   = Math.ceil(this.settings.width_skitter / division_w);
      var height_box  = Math.ceil(this.settings.height_skitter / division_h);
      
      var init_top    = 0;
      var init_left   = 0;
      
      var col_t       = 0;
      var col         = 0;
      var order       = new Array;
      var spread      = new Array;
      
      // Make order
      for (i = 0; i < total; i++) {
        init_top      = (i % 2 == 0) ? init_top : -init_top;
        init_left       = (i % 2 == 0) ? init_left : -init_left;

        var _vtop       = init_top + (height_box * col_t);
        var _vleft      = (init_left + (width_box * col));
        
        order[i] = [_vtop, _vleft];
        
        col_t++;
        if (col_t == division_h) {
          col_t = 0;
          col++;
        }
      }
      
      // Reset col and col_t
      col_t = 0;
      col = 0;
      
      // Make array for spread
      for (i = 0; i < total; i++) {
        spread[i] = i;
      };
      
      // Shuffle array
      var spread = self.shuffleArray(spread);
      
      for (i = 0; i < total; i++) {
        init_top      = (i % 2 == 0) ? init_top : -init_top;
        init_left       = (i % 2 == 0) ? init_left : -init_left;

        var _vtop       = init_top + (height_box * col_t);
        var _vleft      = (init_left + (width_box * col));
        var _vtop_image   = -(height_box * col_t);
        
        var _vleft_image  = -(width_box * col);
        var _btop       = _vtop;
        var _bleft      = _vleft;
        
        _vtop         = order[spread[i]][0];
        _vleft        = order[spread[i]][1];
        
        var box_clone     = this.getBoxClone();
        
        box_clone.css({left:_vleft+'px', top:_vtop+'px', width:width_box, height:height_box});
        box_clone.find('img').css({left:_vleft_image, top:_vtop_image});
        
        this.addBoxClone(box_clone);
        
        var delay_time = 30 * (Math.random() * 30);
        if (i == (total-1)) delay_time = 30 * 30;
        var callback = (i == (total - 1)) ? function() { self.finishAnimation(); } : '';
        box_clone.delay(delay_time).animate({opacity:'show',top:_btop+'px', left:_bleft+'px'}, time_animate, easing, callback);
        
        col_t++;
        if (col_t == division_h) {
          col_t = 0;
          col++;
        }
      }
    }, 
    
    animationGlassCube: function(options)
    {
      var self = this;
      
      this.settings.is_animating = true;
      var easing = (this.settings.easing_default == '') ? 'easeOutExpo' : this.settings.easing_default;
      var time_animate = 500 / this.settings.velocity;
      
      this.setActualLevel();
      
      var max_w       = self.getMaxW(10);
      var total       = Math.ceil(this.settings.width_skitter / (this.settings.width_skitter / max_w)) * 2;
      var width_box   = Math.ceil(this.settings.width_skitter / total) * 2;
      var height_box  = (this.settings.height_skitter) / 2;
      var col         = 0;
      
      for (i = 0; i < total; i++) {
        mod = (i % 2) == 0 ? true : false;
        
        var _ileft = (width_box * (col));
        var _itop = (mod) ? -self.settings.height_skitter : self.settings.height_skitter;
        
        var _fleft = (width_box * (col));
        var _ftop = (mod) ? 0 : (height_box);
        
        var _bleft = -(width_box * col);
        var _btop = (mod) ? 0 : -(height_box);
        
        var delay_time = 120 * col;
        
        var box_clone = this.getBoxClone();
        box_clone.css({left: _ileft, top:_itop, width:width_box, height:height_box});
        
        box_clone
          .find('img')
          .css({left: _bleft + (width_box / 1.5), top: _btop})
          .delay(delay_time)
          .animate({left: _bleft, top: _btop}, (time_animate * 1.9), 'easeOutQuad');
        
        this.addBoxClone(box_clone);
        
        var callback = (i == (total - 1)) ? function() { self.finishAnimation(); } : '';
        box_clone.show().delay(delay_time).animate({top:_ftop, left:_fleft}, time_animate, easing, callback);
        
        if ((i % 2) != 0) col++;
      }
    },
    
    animationGlassBlock: function(options)
    {
      var self = this;
      
      this.settings.is_animating = true;
      var easing = (this.settings.easing_default == '') ? 'easeOutExpo' : this.settings.easing_default;
      var time_animate = 700 / this.settings.velocity;
      
      this.setActualLevel();
      
      var max_w       = self.getMaxW(10);
      var total       = Math.ceil(this.settings.width_skitter / (this.settings.width_skitter / max_w));
      var width_box   = Math.ceil(this.settings.width_skitter / total);
      var height_box  = (this.settings.height_skitter);
      
      for (i = 0; i < total; i++) {
        var _ileft = (width_box * (i));
        var _itop = 0;
        
        var _fleft = (width_box * (i));
        var _ftop = 0;
        
        var _bleft = -(width_box * (i));
        var _btop = 0;
        
        var delay_time = 100 * i;
        
        var box_clone = this.getBoxClone();
        box_clone.css({left: _ileft, top:_itop, width:width_box, height:height_box});
        
        box_clone
          .find('img')
          .css({left: _bleft + (width_box / 1.5), top: _btop})
          .delay(delay_time)
          .animate({left: _bleft, top: _btop}, (time_animate * 1.1), 'easeInOutQuad');
        
        this.addBoxClone(box_clone);
        
        var callback = (i == (total - 1)) ? function() { self.finishAnimation(); } : '';
        box_clone.delay(delay_time).animate({top:_ftop, left:_fleft, opacity: 'show'}, time_animate, easing, callback);
        
      }
    },
    
    animationCircles: function(options)
    {
      var self = this;
      
      this.settings.is_animating = true;
      var easing = (this.settings.easing_default == '') ? 'easeInQuad' : this.settings.easing_default;
      var time_animate = 500 / this.settings.velocity;
      
      this.setActualLevel();
      
      var total     = Math.ceil(this.settings.width_skitter / (this.settings.width_skitter / 10));
      var size_box  = this.settings.height_skitter;
      
      var radius    = Math.sqrt(Math.pow((this.settings.width_skitter), 2) + Math.pow((this.settings.height_skitter), 2));
      var radius    = Math.ceil(radius);
      
      for (i = 0; i < total; i++) {
        var _ileft = (self.settings.width_skitter / 2) - (size_box / 2);
        var _itop = (self.settings.height_skitter / 2) - (size_box / 2);
        
        var _fleft = _ileft; 
        var _ftop = _itop; 
        var box_clone = null;

        box_clone = this.getBoxCloneBackground({
          image:    self.getCurrentImage(),
          left:     _ileft, 
          top:    _itop, 
          width:    size_box, 
          height:   size_box,
          position: {
            top:    -_itop, 
            left:   -_ileft
          }
        }).skitterCss3({
          'border-radius': radius+'px'
        });
        
        size_box += 200;
        
        this.addBoxClone(box_clone);
        
        var delay_time = 70 * i;
        var callback = (i == (total - 1)) ? function() { self.finishAnimation(); } : '';
        box_clone.delay(delay_time).animate({top: _ftop, left: _fleft, opacity: 'show'}, time_animate, easing, callback);
        
      }
    },
    
    animationCirclesInside: function(options)
    {
      var self = this;
      
      this.settings.is_animating = true;
      var easing = (this.settings.easing_default == '') ? 'easeInQuad' : this.settings.easing_default;
      var time_animate = 500 / this.settings.velocity;
      
      var image_old = this.getOldImage();
      
      this.setActualLevel();
      
      this.setLinkAtual();
      this.skitter_box.find('.image_main').attr({'src':this.getCurrentImage()});
      
      var total     = Math.ceil(this.settings.width_skitter / (this.settings.width_skitter / 10));
      
      var radius    = Math.sqrt(Math.pow((this.settings.width_skitter), 2) + Math.pow((this.settings.height_skitter), 2));
      var radius    = Math.ceil(radius);
      var size_box  = radius;
      
      for (i = 0; i < total; i++) {
        var _ileft = (self.settings.width_skitter / 2) - (size_box / 2);
        var _itop = (self.settings.height_skitter / 2) - (size_box / 2);
        
        var _fleft = _ileft; 
        var _ftop = _itop; 
        var box_clone = null;

        box_clone = this.getBoxCloneBackground({
          image:    image_old,
          left:     _ileft, 
          top:    _itop, 
          width:    size_box, 
          height:   size_box,
          position: {
            top:    -_itop, 
            left:   -_ileft
          }
        }).skitterCss3({
          'border-radius': radius+'px'
        });
        
        size_box -= 200;
        
        this.addBoxClone(box_clone);
        box_clone.show();
        
        var delay_time = 70 * i;
        var callback = (i == (total - 1)) ? function() { self.finishAnimation(); } : '';
        box_clone.delay(delay_time).animate({top: _ftop, left: _fleft, opacity: 'hide'}, time_animate, easing, callback);
        
      }
    },

    // Obs.: animacao com problemas, igual ao animationCirclesInside
    // @todo Usar css3 para rotate
    animationCirclesRotate: function(options)
    {
      var self = this;
      
      this.settings.is_animating = true;
      var easing = (this.settings.easing_default == '') ? 'easeInQuad' : this.settings.easing_default;
      var time_animate = 500 / this.settings.velocity;
      
      var image_old = this.getOldImage();
      
      this.setActualLevel();
      
      this.setLinkAtual();
      this.skitter_box.find('.image_main').attr({'src':this.getCurrentImage()});
      
      var total     = Math.ceil(this.settings.width_skitter / (this.settings.width_skitter / 10));
      
      var radius    = Math.sqrt(Math.pow((this.settings.width_skitter), 2) + Math.pow((this.settings.height_skitter), 2));
      var radius    = Math.ceil(radius);
      var size_box  = radius;
      
      for (i = 0; i < total; i++) {
        var _ileft = (self.settings.width_skitter / 2) - (size_box / 2);
        var _itop = (self.settings.height_skitter / 2) - (size_box / 2);
        
        var _fleft = _ileft; 
        var _ftop = _itop; 
        var box_clone = null;

        box_clone = this.getBoxCloneImgOld(image_old);
        box_clone.css({left: _ileft, top:_itop, width:size_box, height:size_box}).skitterCss3({
          'border-radius': radius+'px'
        });
        box_clone.find('img').css({left: -_ileft, top: -_itop});
        
        size_box -= 300;
        
        this.addBoxClone(box_clone);
        box_clone.show();
        
        var delay_time = 200 * i;
        var callback = (i == (total - 1)) ? function() { self.finishAnimation(); } : '';
        var _rotate = (i % 2 == 0) ? '+=2deg' : '+=2deg';
        box_clone.delay(delay_time).animate({ top: _ftop, left: _fleft, opacity: 'hide' }, time_animate, easing, callback);
      }
    },
    
    animationCubeShow: function(options)
    {
      var self = this;
      
      this.settings.is_animating = true;
      var easing = (this.settings.easing_default == '') ? 'easeOutQuad' : this.settings.easing_default;
      var time_animate = 400 / this.settings.velocity;
      
      this.setActualLevel();

      var max_w         = self.getMaxW(8);
      var max_h         = 4;
      
      var division_w    = Math.ceil(this.settings.width_skitter / (this.settings.width_skitter / max_w));
      var division_h    = Math.ceil(this.settings.height_skitter / (this.settings.height_skitter / max_h));
      var total         = division_w * division_h;
      
      var width_box     = Math.ceil(this.settings.width_skitter / division_w);
      var height_box    = Math.ceil(this.settings.height_skitter / division_h);
      
      var last          = false;
      
      var _btop         = 0;
      var _bleft        = 0;
      var line          = 0;
      var col           = 0;
      
      for (i = 0; i < total; i++) {
        
        _btop = height_box * line;
        _bleft = width_box * col;
        
        var delay_time = 30 * (i);
        
        var box_clone     = this.getBoxClone();
        box_clone.css({left:_bleft, top:_btop, width:width_box, height:height_box}).hide();
        box_clone.find('img').css({left:-_bleft, top:-_btop});
        this.addBoxClone(box_clone);
        
        var callback = (i == (total - 1)) ? function() { self.finishAnimation(); } : '';
        box_clone.delay(delay_time).animate({width:'show', height:'show'}, time_animate, easing, callback);
        
        line++;
        if (line == division_h) {
          line = 0;
          col++;
        }
      }
    },
    
    animationDirectionBars: function(options)
    {
      var self = this;
      
      var options = $.extend({}, {direction: 'top'}, options || {});
      
      this.settings.is_animating = true;
      var easing = (this.settings.easing_default == '') ? 'easeInOutQuad' : this.settings.easing_default;
      var time_animate = 400 / this.settings.velocity;
      
      var image_old = this.getOldImage();
      
      this.setActualLevel();
      
      this.setLinkAtual();
      this.skitter_box.find('.image_main').attr({'src':this.getCurrentImage()});
      
      var max_w       = self.getMaxW(12);
      var total       = max_w;
      var width_box   = Math.ceil(this.settings.width_skitter / total);
      var height_box  = this.settings.height_skitter;
      var _ftop       = (options.direction == 'top') ? -height_box : height_box;
      
      for (i = 0; i < total; i++) {
        var _vtop         = 0;
        var _vleft        = (width_box * i);
        var _vtop_image   = 0;
        var _vleft_image  = -(width_box * i);

        var box_clone = this.getBoxCloneImgOld(image_old);
        box_clone.css({left:_vleft+'px', top:_vtop+'px', width:width_box, height:height_box});
        box_clone.find('img').css({left:_vleft_image, top:_vtop_image});
        
        this.addBoxClone(box_clone);
        box_clone.show();
        
        var delay_time = 70 * i;
        var callback = (i == (total - 1)) ? function() { self.finishAnimation(); } : '';
        
        box_clone.delay(delay_time).animate({top:_ftop}, time_animate, easing, callback);
      }
      
    },

    animationHideBars: function(options)
    {
      var self = this;

      var options = $.extend({}, {random: false}, options || {});

      this.settings.is_animating = true;
      var easing = (this.settings.easing_default == '') ? 'easeOutCirc' : this.settings.easing_default;
      var time_animate = 700 / this.settings.velocity;

      var image_old = this.getOldImage();

      this.setActualLevel();

      this.setLinkAtual();
      this.skitter_box.find('.image_main').attr({'src':this.getCurrentImage()});

      var max_w      = self.getMaxW(10);
      var division_w = Math.ceil(this.settings.width_skitter / (this.settings.width_skitter / max_w));
      var total      = division_w;

      var width_box = Math.ceil(this.settings.width_skitter / division_w);
      var height_box = this.settings.height_skitter;

      for (i = 0; i < total; i++) {
        var _vtop = 0;
        var _vleft = width_box * i;

        var _vtop_image = 0;
        var _vleft_image = -(width_box * i);

        var _fleft = '+='+width_box;

        var box_clone = this.getBoxCloneImgOld(image_old);
        box_clone.css({left:0, top:0, width:width_box, height:height_box});
        box_clone.find('img').css({left:_vleft_image, top:_vtop_image});

        var box_clone_main = this.getBoxCloneImgOld(image_old);
        box_clone_main.css({left:_vleft+'px', top:_vtop+'px', width:width_box, height:height_box});
        box_clone_main.html(box_clone);

        this.addBoxClone(box_clone_main);
        box_clone.show();
        box_clone_main.show();

        var delay_time = 50 * i;
        var callback = (i == (total - 1)) ? function() { self.finishAnimation(); } : '';
        
        box_clone.delay(delay_time).animate({left:_fleft}, time_animate, easing, callback);
      }
    },

    animationSwapBars: function(options)
    {
      var self = this;
      
      var max_w  = self.getMaxW(7);
      var options = $.extend({}, {direction: 'top', delay_type: 'sequence', total: max_w, easing: 'easeOutCirc'}, options || {});
      
      this.settings.is_animating = true;
      var easing = (this.settings.easing_default == '') ? options.easing : this.settings.easing_default;
      var time_animate = 500 / this.settings.velocity;
      
      var image_old = this.getOldImage();
      
      this.setActualLevel();
      
      this.setLinkAtual();
      this.skitter_box.find('.image_main').attr({'src':this.getCurrentImage()});
      this.skitter_box.find('.image_main').hide();
      
      var total     = options.total;
      
      for (i = 0; i < total; i++) {

        var width_box     = Math.ceil(this.settings.width_skitter / total);
        var height_box    = this.settings.height_skitter;
        
        var _itopc      = 0;
        var _ileftc     = (width_box * i);
        var _ftopc      = -height_box;
        var _fleftc     = _ileftc + width_box ;
        
        var _itopn      = height_box;
        var _ileftn     = _ileftc;
        var _ftopn      = 0;
        var _fleftn     = _ileftc;
        
        var _vtop_image   = 0;
        var _vleft_image  = -_ileftc;
        
        switch (options.delay_type) 
        {
          case 'zebra' : default : var delay_time = (i % 2 == 0) ? 0 : 150; break;
          case 'random' : var delay_time = 30 * (Math.random() * 30); break;
          case 'sequence' : var delay_time = i * 100; break;
        }

        // Old image
        var box_clone = this.getBoxCloneImgOld(image_old);
        box_clone.find('img').css({left:_vleft_image, top:0});
        box_clone.css({top:0, left:0, width:width_box, height:height_box});

        // Next image
        var box_clone_next = this.getBoxClone();
        box_clone_next.find('img').css({left:_vleft_image, top:0});
        box_clone_next.css({top:0, left:-width_box, width:width_box, height:height_box});
        
        // Container box images
        var box_clone_container = this.getBoxClone();
        box_clone_container.html('').append(box_clone).append(box_clone_next);
        box_clone_container.css({top:0, left:_ileftc, width:width_box, height:height_box});
        
        // Add containuer
        this.addBoxClone(box_clone_container);

        // Show boxes
        box_clone_container.show();
        box_clone.show();
        box_clone_next.show();
        
        // Callback
        var callback = (i == (total - 1)) ? function() { self.finishAnimation(); } : '';

        // Animations
        box_clone.delay(delay_time).animate({ left: width_box }, time_animate, easing);
        box_clone_next.delay(delay_time).animate({ left:0 }, time_animate, easing, callback);
      }
    },

    animationSwapBlocks: function(options)
    {
      var self = this;
      
      var options = $.extend({}, {easing_old: 'easeInOutQuad', easing_new: 'easeOutQuad'}, options || {});
      
      this.settings.is_animating = true;
      var easing_old = (this.settings.easing_default == '') ? options.easing_old : this.settings.easing_default;
      var easing_new = (this.settings.easing_default == '') ? options.easing_new : this.settings.easing_default;
      var time_animate = 800 / this.settings.velocity;
      
      var image_old = this.getOldImage();
      
      this.setActualLevel();
      
      this.setLinkAtual();
      this.skitter_box.find('.image_main').attr({'src':this.getCurrentImage()});
      this.skitter_box.find('.image_main').hide();
      
      var total       = 2;
      var width_box     = this.settings.width_skitter;
      var height_box    = Math.ceil(this.settings.height_skitter / total);

      // Old image
      var box_clone1 = this.getBoxCloneImgOld(image_old), box_clone2 = this.getBoxCloneImgOld(image_old);
      box_clone1.find('img').css({left:0, top:0});
      box_clone1.css({top:0, left:0, width:width_box, height:height_box});

      box_clone2.find('img').css({left:0, top:-height_box});
      box_clone2.css({top:height_box, left:0, width:width_box, height:height_box});

      // Next image
      var box_clone_next1 = this.getBoxClone(), box_clone_next2 = this.getBoxClone();
      box_clone_next1.find('img').css({left:0, top:height_box});
      box_clone_next1.css({top:0, left:0, width:width_box, height:height_box});

      box_clone_next2.find('img').css({left:0, top: -(height_box * total) });
      box_clone_next2.css({top:height_box, left:0, width:width_box, height:height_box});

      // Add boxes
      this.addBoxClone(box_clone_next1);
      this.addBoxClone(box_clone_next2);
      this.addBoxClone(box_clone1);
      this.addBoxClone(box_clone2);

      // Show boxes
      box_clone1.show();
      box_clone2.show();
      box_clone_next1.show();
      box_clone_next2.show();

      // Callback
      var callback = function() { self.finishAnimation(); };

      // Animations
      box_clone1.find('img').animate({ top: height_box }, time_animate, easing_old, function() {
        box_clone1.remove();
      });
      box_clone2.find('img').animate({ top: -(height_box * total) }, time_animate, easing_old, function() {
        box_clone2.remove();
      });
      box_clone_next1.find('img').animate({ top: 0 }, time_animate, easing_new);
      box_clone_next2.find('img').animate({ top: -height_box }, time_animate, easing_new, callback);
    },

    animationCut: function(options)
    {
      var self = this;
      
      var options = $.extend({}, {easing_old: 'easeInOutExpo', easing_new: 'easeInOutExpo'}, options || {});
      
      this.settings.is_animating = true;
      var easing_old = (this.settings.easing_default == '') ? options.easing_old : this.settings.easing_default;
      var easing_new = (this.settings.easing_default == '') ? options.easing_new : this.settings.easing_default;
      var time_animate = 900 / this.settings.velocity;
      
      var image_old = this.getOldImage();
      
      this.setActualLevel();
      
      this.setLinkAtual();
      this.skitter_box.find('.image_main').attr({'src':this.getCurrentImage()});
      this.skitter_box.find('.image_main').hide();
      
      var total       = 2;
      var width_box     = this.settings.width_skitter;
      var height_box    = Math.ceil(this.settings.height_skitter / total);

      // Old image
      var box_clone1 = this.getBoxCloneImgOld(image_old), box_clone2 = this.getBoxCloneImgOld(image_old);
      box_clone1.find('img').css({left:0, top:0});
      box_clone1.css({top:0, left:0, width:width_box, height:height_box});

      box_clone2.find('img').css({left:0, top:-height_box});
      box_clone2.css({top:height_box, left:0, width:width_box, height:height_box});

      // Next image
      var box_clone_next1 = this.getBoxClone(), box_clone_next2 = this.getBoxClone();
      //box_clone_next1.find('img').css({left:0, top:height_box});
      box_clone_next1.find('img').css({left:0, top:0});
      box_clone_next1.css({top:0, left:width_box, width:width_box, height:height_box});

      //box_clone_next2.find('img').css({left:0, top: -(height_box * total) });
      box_clone_next2.find('img').css({left:0, top: -height_box });
      box_clone_next2.css({top:height_box, left:-width_box, width:width_box, height:height_box});

      // Add boxes
      this.addBoxClone(box_clone_next1);
      this.addBoxClone(box_clone_next2);
      this.addBoxClone(box_clone1);
      this.addBoxClone(box_clone2);

      // Show boxes
      box_clone1.show();
      box_clone2.show();
      box_clone_next1.show();
      box_clone_next2.show();

      // Callback
      var callback = function() { self.finishAnimation(); };

      // Animations
      box_clone1.animate({ left: -width_box }, time_animate, easing_old, function() {
        box_clone1.remove();
      });
      box_clone2.animate({ left: width_box }, time_animate, easing_old, function() {
        box_clone2.remove();
      });
      box_clone_next1.animate({ left: 0 }, time_animate, easing_new);
      box_clone_next2.animate({ left: 0 }, time_animate, easing_new, callback);
    },
    
    // End animations ----------------------
    
    // Finish animation
    finishAnimation: function (options) 
    {
      var self = this;
      this.skitter_box.find('.image_main').show();
      this.showBoxText();
      this.settings.is_animating = false;
      this.skitter_box.find('.image_main').attr({'src': this.getCurrentImage()});
      this.skitter_box.find('.image > a').attr({'href': this.settings.link_atual});
      
      if (!this.settings.is_hover_skitter_box && !this.settings.is_paused && !this.settings.is_blur) {
        this.timer = setTimeout(function() { self.completeMove(); }, this.settings.interval);
      }
      
      self.startTime();
    },

    // Complete move
    completeMove: function () 
    {
      this.clearTimer(true);
      this.skitter_box.find('.box_clone').remove();
      if (!this.settings.is_paused && !this.settings.is_blur) this.nextImage();
    },

    // Actual config for animation
    setActualLevel: function() {
      if ($.isFunction(this.settings.imageSwitched)) this.settings.imageSwitched(this.settings.image_i, this);
      this.setImageLink();
      this.addClassNumber();
      this.hideBoxText();
      this.increasingImage();
    },

    // Set image and link
    setImageLink: function()
    {
      var name_image = this.settings.images_links[this.settings.image_i][0];
      var link_image = this.settings.images_links[this.settings.image_i][1];
      var label_image = this.settings.images_links[this.settings.image_i][3];
      var target_link = this.settings.images_links[this.settings.image_i][4];
      
      this.settings.image_atual = name_image;
      this.settings.link_atual = link_image;
      this.settings.label_atual = label_image;
      this.settings.target_atual = target_link;
    },

    // Add class for number
    addClassNumber: function () 
    {
      var self = this;
      this.skitter_box.find('.image_number_select').removeClass('image_number_select');
      $('#image_n_'+(this.settings.image_i+1)+'_'+self.number_skitter).addClass('image_number_select');
    },

    // Increment image_i
    increasingImage: function()
    {
      this.settings.image_i++;
      if (this.settings.image_i == this.settings.images_links.length) {
        this.settings.image_i = 0;
      }
    },
    
    // Get box clone
    getBoxClone: function()
    {
      if (this.settings.link_atual != '#') {
        var img_clone = $('<a href="'+this.settings.link_atual+'"><img src="'+this.getCurrentImage()+'" /></a>');
        img_clone.attr({ 'target': this.settings.target_atual });
      } 
      else {
        var img_clone = $('<img src="'+this.getCurrentImage()+'" />');
      }
      
      img_clone = this.resizeImage(img_clone);
      var box_clone = $('<div class="box_clone"></div>');
      box_clone.append(img_clone);
      return box_clone;
    },
    
    // Get box clone
    getBoxCloneImgOld: function(image_old)
    {
      if (this.settings.link_atual != '#') {
        var img_clone = $('<a href="'+this.settings.link_atual+'"><img src="'+image_old+'" /></a>');
        img_clone.attr({ 'target': this.settings.target_atual });
      } 
      else {
        var img_clone = $('<img src="'+image_old+'" />');
      }
      
      img_clone = this.resizeImage(img_clone);
      var box_clone = $('<div class="box_clone"></div>');
      box_clone.append(img_clone);
      return box_clone;
    },
    
    // Redimensiona imagem
    resizeImage: function(img_clone) 
    {
      img_clone.find('img').width(this.settings.width_skitter);
      img_clone.find('img').height(this.settings.height_skitter);
      return img_clone;
    }, 

    // Add box clone in skitter_box
    addBoxClone: function(box_clone)
    {
      this.skitter_box.find('.container_skitter').append(box_clone);
    },
    
    // Get accepts easing 
    getEasing: function(easing)
    {
      var easing_accepts = [
        'easeInQuad',     'easeOutQuad',    'easeInOutQuad', 
        'easeInCubic',    'easeOutCubic',   'easeInOutCubic', 
        'easeInQuart',    'easeOutQuart',   'easeInOutQuart', 
        'easeInQuint',    'easeOutQuint',   'easeInOutQuint', 
        'easeInSine',     'easeOutSine',    'easeInOutSine', 
        'easeInExpo',   'easeOutExpo',    'easeInOutExpo', 
        'easeInCirc',     'easeOutCirc',    'easeInOutCirc', 
        'easeInElastic',  'easeOutElastic',   'easeInOutElastic', 
        'easeInBack',     'easeOutBack',    'easeInOutBack', 
        'easeInBounce',   'easeOutBounce',  'easeInOutBounce', 
      ];
      
      if (jQuery.inArray(easing, easing_accepts) > 0) {
        return easing;
      }
      else {
        return '';
      }
    },
    
    // Get random number
    getRandom: function (i) 
    {
      return Math.floor(Math.random() * i);
    },

    // Set value for text
    setValueBoxText: function () 
    {
      this.skitter_box.find('.label_skitter').html(this.settings.label_atual);
    },
    
    // Show box text
    showBoxText: function () 
    {
      var self = this;

      if ( this.settings.label_atual != undefined && this.settings.label_atual != '' && self.settings.label ) {

        switch ( self.settings.label_animation ) {

          case 'slideUp' : default : 
            self.skitter_box.find('.label_skitter').slideDown(400);
            break;

          case 'left' : case 'right' : 
            self.skitter_box.find('.label_skitter').animate({ left: 0 }, 400, 'easeInOutQuad');
            break;

          case 'fixed' : 
            // null
            break;
        }
      }
    },
    
    // Hide box text
    hideBoxText: function () 
    {
      var self = this;

      switch ( self.settings.label_animation ) {

        case 'slideUp' : default : 
          this.skitter_box.find('.label_skitter').slideUp(200, function() {
            self.setValueBoxText();
          });
          break;

        case 'left' : case 'right' : 
          var _left = ( self.settings.label_animation == 'left' ) ? -(self.skitter_box.find('.label_skitter').width()) : (self.skitter_box.find('.label_skitter').width());
          self.skitter_box.find('.label_skitter').animate({ left: _left }, 400, 'easeInOutQuad', function() {
            self.setValueBoxText();
          });
          break;

        case 'fixed' : 
          self.setValueBoxText();
          break;
      }
    },
    
    // Stop time to get over skitter_box
    stopOnMouseOver: function () 
    {
      var self = this;

      if ( self.settings.stop_over ) 
      {
        self.skitter_box.hover(function() {
          
          if (self.settings.stop_over) self.settings.is_hover_skitter_box = true;
          
          if (!self.settings.is_paused_time) {
            self.pauseTime();
          }
          
          self.setHideTools('hover');
          self.clearTimer(true);
          
        }, function() {
          if (self.settings.stop_over) self.settings.is_hover_skitter_box = false;
          
          if (self.settings.elapsedTime == 0 && !self.settings.is_animating && !self.settings.is_paused) {
            self.startTime();
          }
          else if (!self.settings.is_paused) {
            self.resumeTime();
          }
          
          self.setHideTools('out');
          self.clearTimer(true);
          
          if (!self.settings.is_animating && self.settings.images_links.length > 1) {
            self.timer = setTimeout(function() { self.completeMove(); }, self.settings.interval - self.settings.elapsedTime);
            self.skitter_box.find('.image_main').attr({'src': self.getCurrentImage()});
            self.skitter_box.find('.image > a').attr({'href': self.settings.link_atual});
          }
        });
      }
      else
      {
        self.skitter_box.hover(function() {
          self.setHideTools('hover');
        }, function() {
          self.setHideTools('out');
        });
      }
    }, 

    // Hover/out hideTools
    setHideTools: function( type ) {
      var self = this;
      var opacity_elements = self.settings.opacity_elements;
      var interval_in_elements = self.settings.interval_in_elements;
      var interval_out_elements = self.settings.interval_out_elements;

      if ( type == 'hover' ) {
        if (self.settings.hide_tools) {
          if (self.settings.numbers) {
            self.skitter_box
              .find('.info_slide')
              .show()
              .css({opacity:0})
              .animate({opacity: opacity_elements}, interval_in_elements);
          }
          
          if (self.settings.navigation) {
            self.skitter_box
              .find('.prev_button, .next_button')
              .show()
              .css({opacity:0})
              .animate({opacity: opacity_elements}, interval_in_elements);
          }

          if (self.settings.focus && !self.settings.foucs_active) {
            self.skitter_box
              .find('.focus_button')
              .stop()
              .show().css({opacity:0})
              .animate({opacity:opacity_elements}, interval_in_elements);
          }
          
          if (self.settings.controls) {
            self.skitter_box
            .find('.play_pause_button')
            .stop()
            .show().css({opacity:0})
            .animate({opacity:opacity_elements}, interval_in_elements);
          }
        }

        if (self.settings.focus && !self.settings.foucs_active && !self.settings.hide_tools) {
          self.skitter_box
            .find('.focus_button')
            .stop()
            .animate({opacity:1}, interval_in_elements);
        }
        
        if (self.settings.controls && !self.settings.hide_tools) {
          self.skitter_box
            .find('.play_pause_button')
            .stop()
            .animate({opacity:1}, interval_in_elements);
        }
      }
      else {
        if (self.settings.hide_tools) {
          if (self.settings.numbers) {
            self.skitter_box
              .find('.info_slide')
              .queue("fx", [])
              .show()
              .css({opacity: opacity_elements})
              .animate({opacity:0}, interval_out_elements);
          }
          
          if (self.settings.navigation) {
            self.skitter_box
              .find('.prev_button, .next_button')
              .queue("fx", [])
              .show()
              .css({opacity: opacity_elements})
              .animate({opacity:0}, interval_out_elements);
          }

          if (self.settings.focus && !self.settings.foucs_active) {
            self.skitter_box
              .find('.focus_button')
              .stop()
              .css({opacity: opacity_elements})
              .animate({opacity:0}, interval_out_elements);
          }

          if (self.settings.controls) {
            self.skitter_box
              .find('.play_pause_button')
              .stop()
              .css({opacity: opacity_elements})
              .animate({opacity:0}, interval_out_elements);
          }
        }
        
        if (self.settings.focus && !self.settings.foucs_active && !self.settings.hide_tools) {
          self.skitter_box
            .find('.focus_button')
            .stop()
            .animate({opacity:0.3}, interval_out_elements);
        }
        
        if (self.settings.controls && !self.settings.hide_tools) {
          self.skitter_box
            .find('.play_pause_button')
            .stop()
            .animate({opacity:0.3}, interval_out_elements);
        }
      }
    },
    
    // Stop timer
    clearTimer: function (force) {
      var self = this;
      clearInterval(self.timer);
    },
    
    // Set link atual
    setLinkAtual: function() {
      if (this.settings.link_atual != '#' && this.settings.link_atual != '') {
        this.skitter_box.find('.image > a').attr({'href': this.settings.link_atual, 'target': this.settings.target_atual});
      }
      else {
        this.skitter_box.find('.image > a').removeAttr('href');
      }
    },
    
    // Hide tools
    hideTools: function() {
      this.skitter_box.find('.info_slide').fadeTo(0, 0);
      this.skitter_box.find('.prev_button').fadeTo(0, 0);
      this.skitter_box.find('.next_button').fadeTo(0, 0);
      this.skitter_box.find('.focus_button').fadeTo(0, 0);
      this.skitter_box.find('.play_pause_button').fadeTo(0, 0);
    }, 
    
    // Focus Skitter
    focusSkitter: function() {
      var self = this;
      var focus_button = $('<a href="#" class="focus_button">focus</a>');

      self.skitter_box.append(focus_button);
      focus_button
        .animate({opacity:0.3}, self.settings.interval_in_elements);
      
      $(document).keypress(function(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 27) $('#overlay_skitter').trigger('click');
      });

      var _top = self.skitter_box.offset().top;
      var _left = self.skitter_box.offset().left;
      
      self.skitter_box.find('.focus_button').click(function() {
        if ( self.settings.foucs_active ) return false;
        self.settings.foucs_active = true;
        
        $(this).stop().animate({opacity:0}, self.settings.interval_out_elements);
        
        var div = $('<div id="overlay_skitter"></div>')
          .height( $(document).height() )
          .hide()
          .fadeTo(self.settings.interval_in_elements, 0.98);
          
        var _topFinal = (($(window).height() - self.skitter_box.height()) / 2) + $(document).scrollTop();
        var _leftFinal = ($(window).width() - self.skitter_box.width()) / 2;
        
        self.skitter_box.before('<div id="mark_position"></div>');
        $('body').prepend(div);
        $('body').prepend(self.skitter_box);
        self.skitter_box
          .css({'top':_top, 'left':_left, 'position':'absolute', 'z-index':9999})
          .animate({'top':_topFinal, 'left':_leftFinal}, 2000, 'easeOutExpo');
        
        $('#mark_position') 
          .width(self.skitter_box.width())
          .height(self.skitter_box.height())
          .css({'background':'none'})
          .fadeTo(300,0.3);
        
        return false;
      });

      $(document).on('click', '#overlay_skitter', function() {
        if ( $(this).hasClass('finish_overlay_skitter') ) return false;
        
        self.settings.foucs_active = false;
        $(this).addClass('finish_overlay_skitter');
        
        if (!self.settings.hide_tools) self.skitter_box.find('.focus_button').animate({opacity:0.3}, 200);
        
        self.skitter_box
          .stop()
          .animate({'top':_top, 'left':_left}, 200, 'easeOutExpo', function() {
            $('#mark_position').before(self.skitter_box);
            $(this).css({'position':'relative', 'top':0, 'left': 0});
            $('#mark_position').remove();
          });
        
        $('#overlay_skitter').fadeTo(self.settings.interval_out_elements, 0, function() {
          $(this).remove();
        });
        
        return false;
      });
    },
    
    /**
     * Controls: play and stop
     */
    setControls: function() {
      var self = this;
      var play_pause_button = $('<a href="#" class="play_pause_button">pause</a>');

      self.skitter_box.append(play_pause_button);

      play_pause_button
        .animate({opacity:0.3}, self.settings.interval_in_elements);
      
      play_pause_button.click(function() {
        if (!self.settings.is_paused) {
          $(this).html('play');
          $(this).fadeTo(100, 0.5).fadeTo(100, 1);
          
          $(this).addClass('play_button');
          self.pauseTime();
          self.settings.is_paused = true;
          self.clearTimer(true);
        }
        else {
          if (!self.settings.is_animating && !self.skitter_box.find('.progressbar').is(':visible')) {
            self.settings.elapsedTime = 0;
          }
          else {
            self.resumeTime();
          }
          
          if (!self.settings.progressbar) self.resumeTime();
          
          self.settings.is_paused = false;
          
          $(this).html('pause');
          $(this).fadeTo(100, 0.5).fadeTo(100, 1);
          $(this).removeClass('play_button');
          
          if (!self.settings.stop_over) { 
            self.clearTimer(true);
            if (!self.settings.is_animating && self.settings.images_links.length > 1) {
              self.timer = setTimeout(function() { self.completeMove(); }, self.settings.interval - self.settings.elapsedTime);
              self.skitter_box.find('.image_main').attr({'src': self.getCurrentImage()});
              self.skitter_box.find('.image > a').attr({'href': self.settings.link_atual});
            }
          }
        }
        
        return false;
      });
    },
        
    /**
     * Object size
     */
    objectSize: function(obj) {
      var size = 0, key;
      for (key in obj) { if (obj.hasOwnProperty(key)) size++; }
      return size;
    },
    
    /**
     * Add progress bar
     */
    addProgressBar: function() {
      var self = this;
      
      var progressbar = $('<div class="progressbar"></div>');
      self.skitter_box.append(progressbar);
      
      if (self.objectSize(self.settings.progressbar_css) == 0)  {
        if (parseInt(progressbar.css('width')) > 0) {
          self.settings.progressbar_css.width = parseInt(progressbar.css('width'));
        }
        else {
          self.settings.progressbar_css = {width: self.settings.width_skitter, height:5};
        }
      }
      if (self.objectSize(self.settings.progressbar_css) > 0 && self.settings.progressbar_css.width == undefined) {
        self.settings.progressbar_css.width = self.settings.width_skitter;
      }
      
      progressbar.css(self.settings.progressbar_css).hide();
    },
    
    /**
     * Start progress bar
     */
    startProgressBar: function() {
      var self = this;
      if (self.settings.is_hover_skitter_box || self.settings.is_paused || self.settings.is_blur || !self.settings.progressbar) return false;
      self.skitter_box.find('.progressbar')
        .hide()
        .dequeue()
        .width(self.settings.progressbar_css.width)
        .animate({width:'show'}, self.settings.interval, 'linear');
    },
    
    /**
     * Pause progress bar
     */
    pauseProgressBar: function() {
      var self = this;
      if (!self.settings.is_animating) {
        self.skitter_box.find('.progressbar').stop();
      }
    },
    
    /**
     * Resume progress bar
     */
    resumeProgressBar: function() {
      var self = this;
      
      if (self.settings.is_hover_skitter_box || self.settings.is_paused || !self.settings.progressbar) return false;
      
      self.skitter_box.find('.progressbar').dequeue().animate({width: self.settings.progressbar_css.width}, (self.settings.interval - self.settings.elapsedTime), 'linear');
    },
    
    /**
     * Hide progress bar
     */
    hideProgressBar: function() {
      var self = this;
      
      if (!self.settings.progressbar) return false;
      
      self.skitter_box.find('.progressbar').stop().fadeOut(300, function() {
        $(this).width(self.settings.progressbar_css.width);
      });
    },

    /**
     * Start time
     */
    startTime: function() {
      var self = this;
      
      self.settings.is_paused_time = false;
      
      var date = new Date();
      self.settings.elapsedTime = 0;
      self.settings.time_start = date.getTime();
      
      // Start progress bar
      self.startProgressBar();
    }, 
    
    /**
     * Pause time
     */
    pauseTime: function() {
      var self = this;
      
      if (self.settings.is_paused_time) return false;
      self.settings.is_paused_time = true;
      
      var date = new Date();
      self.settings.elapsedTime += date.getTime() - self.settings.time_start;
      
      // Pause progress bar
      self.pauseProgressBar();
    }, 
    
    /**
     * Resume time
     */
    resumeTime: function() {
      var self = this;
      
      self.settings.is_paused_time = false;
      
      var date = new Date();
      self.settings.time_start = date.getTime();
      
      // Resume progress bar
      self.resumeProgressBar();
    }, 

    /**
     * Enable navigation keys
     */
    enableNavigationKeys: function() {
      var self = this;
      $(window).keydown(function(e) {
        // Next
        if (e.keyCode == 39 || e.keyCode == 40) {
          self.skitter_box.find('.next_button').trigger('click');
        }
        // Prev
        else if (e.keyCode == 37 || e.keyCode == 38) {
          self.skitter_box.find('.prev_button').trigger('click');
        }
      });
    },
    
    /**
     * Get box clone with background image
     */
    getBoxCloneBackground: function(options)
    {
      var box_clone = $('<div class="box_clone"></div>');
      var background_size = this.settings.width_skitter + 'px ' + this.settings.height_skitter + 'px';

      box_clone.css({
        'left':                options.left, 
        'top':                 options.top, 
        'width':               options.width, 
        'height':              options.height,
        'background-image':    'url('+options.image+')', 
        'background-size':     background_size, 
        'background-position':  options.position.left+'px '+options.position.top+'px'
      });

      return box_clone;
    }, 

    /**
     * Shuffle array
     * @author Daniel Castro Machado <daniel@cdt.unb.br>
     */
    shuffleArray: function (arrayOrigem) {
      var self = this;
      var arrayDestino = [];
      var indice;
      while (arrayOrigem.length > 0) {
        indice = self.randomUnique(0, arrayOrigem.length - 1);
        arrayDestino[arrayDestino.length] = arrayOrigem[indice];
        arrayOrigem.splice(indice, 1);
      }
      return arrayDestino;
    }, 
    
    /**
     * Gera números aleatórios inteiros entre um intervalo
     * @author Daniel Castro Machado <daniel@cdt.unb.br>
     */
    randomUnique: function (valorIni, valorFim) {
      var numRandom;
      do numRandom = Math.random(); while (numRandom == 1); // Evita gerar o número valorFim + 1
      return (numRandom * (valorFim - valorIni + 1) + valorIni) | 0;
    },
    
    /** 
     * Stop on window focus out
     * @author Dan Partac (http://thiagosf.net/projects/jquery/skitter/#comment-355473307)
     */
    windowFocusOut: function () {
      var self = this;
      $(window).bind('blur', function(){
        self.settings.is_blur = true;
        self.pauseTime();
        self.clearTimer(true);
      });
      $(window).bind('focus', function(){
        if ( self.settings.images_links.length > 1 ) {
          self.settings.is_blur = false;  
          
          if  (self.settings.elapsedTime == 0) {
            self.startTime();
          }
          else {
            self.resumeTime();
          }
          
          if (self.settings.elapsedTime <= self.settings.interval) {
            self.clearTimer(true); // Fix bug IE: double next
            self.timer = setTimeout(function() { self.completeMove(); }, self.settings.interval - self.settings.elapsedTime);
            self.skitter_box.find('.image_main').attr({'src': self.getCurrentImage()});
            self.skitter_box.find('.image > a').attr({'href': self.settings.link_atual});
          }
        }
      });
    },
    
    /**
     * Responsive
     */
    setResponsive: function() {
      if (this.settings.responsive) {
        var self = this;
        var timeout = null;
        $(window).on('resize', function() {
          clearTimeout(timeout);
          timeout = setTimeout(function() {
            self.setDimensions();
          }, 200);
        }).trigger('resize');
      }
    },

    /**
     * Set skitter dimensions 
     */
    setDimensions: function() {
      var self = this;
      var was_set = false;

      this.skitter_box.css('width', '100%');
      this.skitter_box.find('.image_main')
        .attr({ src: this.getCurrentImage() })
        .css({ 'width': '100%', 'height': 'auto' })
        .on('load', function() {
          if (!was_set) {
            was_set = true;
            _setDimensions();
          }
        });

      // fallback
      setTimeout(function() {
        if (!was_set) {
          was_set = true;
          _setDimensions();
        }
      }, 3000);

      var _setDimensions = function() {
        var image = self.skitter_box.find('.image_main');
        var width_box = self.skitter_box.width();
        var height_box = self.skitter_box.height();
        var width_image = image.width();
        var height_image = image.height();
        var width = width_box;
        var height = (height_image * width_box) / width_image;

        if (self.settings.fullscreen) {
          width = $(window).width();
          height = $(window).height();
        }

        self.settings.width_skitter = width;
        self.settings.height_skitter = height;
        self.skitter_box
          .width(width)
          .height(height)
          .find('.container_skitter')
            .width(width)
            .height(height)
          .find('> a img, > img')
            .width(width)
            .height(height);
      };
    },

    /**
     * Check is large device
     */
    isLargeDevice: function() {
      return $(window).width() >= 1024;
    },

    /**
     * Max width splits (responsive friendly)
     */
    getMaxW: function(max_w) {
      // 8 == 1024px
      // x == 768px
      // y == 480px
      // z == 320px
      if (this.settings.responsive) {
        var window_width = $(window).width();
        if (window_width <= 320) {
          max_w = parseInt(max_w / 4);
        } else if (window_width <= 480) {
          max_w = parseInt(max_w / 3);
        } else if (window_width <= 768) {
          max_w = parseInt(max_w / 1.5);
        }
      }
      return max_w;
    },

    /**
     * Max height splits (responsive friendly)
     */
    getMaxH: function(max_h) {
      return this.getMaxW(max_h);
    },

    /**
     * Get current image
     */
    getCurrentImage: function() {
      var image = this.settings.image_atual;
      return this.getImageName(image);
    },

    /**
     * Get old image
     */
    getOldImage: function() {
      var image = this.skitter_box.find('.image_main').attr('src');
      return image;
    },

    /**
     * Get image name for responsive (if enabled)
     */
    getImageName: function(image) {
      var window_width = $(window).width();
      if (this.settings.responsive) {
        for (var name in this.settings.responsive) {
          var item = this.settings.responsive[name];
          if (window_width < item.max_width && item.suffix) {
            var extension = image.split('.').reverse()[0];
            image = image.replace('.' + extension, item.suffix + '.' + extension);
            break;
          }
        }
      }
      return image;
    },

    /**
     * Touches support
     */
    setTouchSupport: function() {
      var self = this;
      var last_position_x = 0;
      var last_position_x_move = 0;
      var isTouch = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0));

      if (isTouch) {
        this.skitter_box.on('touchstart', function(e) {
          if (e.originalEvent.touches.length > 0) {
            last_position_x = e.originalEvent.touches[0].pageX;
          }
        });

        this.skitter_box.on('touchmove', function(e) {
          if (e.originalEvent.touches.length > 0) {
            last_position_x_move = e.originalEvent.touches[0].pageX;
          }
        });

        this.skitter_box.on('touchend', function(e) {
          if (last_position_x < last_position_x_move) {
            self.skitter_box.find('.prev_button').trigger('click');
          } else {
            self.skitter_box.find('.next_button').trigger('click');
          }
        });
      }
    },

    /**
     * Get available animations (public api)
     */
    getAnimations: function() {
      return this.animations;
    },

    /**
     * Set animation (public api)
     */
    setAnimation: function(animation) {
      this.settings.animation = animation;
    },

    /**
     * Next (public api)
     */
    next: function() {
      this.skitter_box.find('.next_button').trigger('click');
    },

    /**
     * Prev (public api)
     */
    prev: function() {
      this.skitter_box.find('.prev_button').trigger('click');
    }
  });
  
  /**
   * Helper function for cross-browser CSS3 support, prepends 
   * all possible prefixes to all properties passed in
   * @param {Object} props Ker/value pairs of CSS3 properties
   */
  $.fn.skitterCss3 = function(props) {
    var css = {};
    var prefixes = ['moz', 'ms', 'o', 'webkit'];
    for(var prop in props) {
      for(var i=0; i<prefixes.length; i++)
        css['-'+prefixes[i]+'-'+prop] = props[prop];
      css[prop] = props[prop];
    }
    this.css(css);
    return this;
  };

});
!function(factory){"function"==typeof define&&define.amd?define(["jquery"],function($){return factory($)}):"object"==typeof module&&"object"==typeof module.exports?exports=factory(require("jquery")):factory(jQuery)}(function($){var number_skitter=0,skitters=[];$.fn.skitter=function(options){if("string"==typeof options){var current_skitter=skitters[$(this).data("skitter_number")];return current_skitter[arguments[0]].call(current_skitter,arguments[1])}return this.each(function(){void 0==$(this).data("skitter_number")&&($(this).data("skitter_number",number_skitter),skitters.push(new $sk(this,options,number_skitter)),++number_skitter)})};var defaults={velocity:1,interval:2500,animation:"",numbers:!1,navigation:!1,label:!0,easing_default:"",skitter_box:null,time_interval:null,images_links:null,image_atual:null,link_atual:null,label_atual:null,target_atual:"_self",width_skitter:null,height_skitter:null,image_i:1,is_animating:!1,is_hover_skitter_box:!1,random_ia:null,show_randomly:!1,thumbs:!1,hide_tools:!1,fullscreen:!1,xml:!1,dots:!0,opacity_elements:.75,interval_in_elements:200,interval_out_elements:300,onLoad:null,imageSwitched:null,max_number_height:20,numbers_align:"center",preview:!1,focus:!1,foucs_active:!1,controls:!1,progressbar:!1,progressbar_css:{},is_paused:!1,is_blur:!1,is_paused_time:!1,time_start:0,elapsedTime:0,stop_over:!0,enable_navigation_keys:!1,with_animations:[],mouseOverButton:null,mouseOutButton:null,auto_play:!0,label_animation:"slideUp",theme:null,structure:'<a href="#" class="prev_button">prev</a><a href="#" class="next_button">next</a><span class="info_slide"></span><div class="container_skitter"><div class="image"><a href=""><img class="image_main" /></a><div class="label_skitter"></div></div></div>',responsive:{small:{animation:"fade",max_width:768},medium:{max_width:1024}}};$.skitter=function(obj,options,number){this.skitter_box=$(obj),this.timer=null,this.settings=$.extend({},defaults,options||{}),this.number_skitter=number,this.setup()};var $sk=$.skitter;$sk.fn=$sk.prototype={},$sk.fn.extend=$.extend,$sk.fn.extend({animations:["cube","cubeRandom","block","cubeStop","cubeStopRandom","cubeHide","cubeSize","horizontal","showBars","showBarsRandom","tube","fade","fadeFour","paralell","blind","blindHeight","blindWidth","directionTop","directionBottom","directionRight","directionLeft","cubeSpread","glassCube","glassBlock","circles","circlesInside","circlesRotate","cubeShow","upBars","downBars","hideBars","swapBars","swapBarsBack","swapBlocks","cut"],setup:function(){var self=this;if(this.settings.fullscreen){var width=$(window).width(),height=$(window).height();this.skitter_box.width(width).height(height),this.skitter_box.css({position:"absolute",top:0,left:0,"z-index":1e3}),this.settings.stop_over=!1,$("body").css({overflown:"hidden"})}if(this.settings.width_skitter=parseFloat(this.skitter_box.css("width")),this.settings.height_skitter=parseFloat(this.skitter_box.css("height")),this.settings.original_width_skitter=this.settings.width_skitter,this.settings.original_height_skitter=this.settings.height_skitter,!this.settings.width_skitter||!this.settings.height_skitter)return console.warn("Width or height size is null! - Skitter Slideshow"),!1;this.settings.theme&&this.skitter_box.addClass("skitter-"+this.settings.theme),this.skitter_box.append(this.settings.structure),this.settings.easing_default=this.getEasing(this.settings.easing),this.settings.velocity>=2&&(this.settings.velocity=1.3),this.settings.velocity<=0&&(this.settings.velocity=1),this.skitter_box.find(".info_slide").hide(),this.skitter_box.find(".label_skitter").hide(),this.skitter_box.find(".prev_button").hide(),this.skitter_box.find(".next_button").hide(),this.skitter_box.find(".container_skitter").width(this.settings.width_skitter),this.skitter_box.find(".container_skitter").height(this.settings.height_skitter);var initial_select_class=" image_number_select",u=0;this.settings.images_links=[];var addImageLink=function(link,src,animation_type,label,target){if(self.settings.images_links.push([src,link,animation_type,label,target]),self.settings.thumbs){self.settings.width_skitter>self.settings.height_skitter?'height="100"':'width="100"',self.skitter_box.find(".info_slide").append('<span class="image_number'+initial_select_class+'" rel="'+(u-1)+'" id="image_n_'+u+"_"+self.number_skitter+'" style="background-image: url('+src+');"></span> ')}else self.skitter_box.find(".info_slide").append('<span class="image_number'+initial_select_class+'" rel="'+(u-1)+'" id="image_n_'+u+"_"+self.number_skitter+'">'+u+"</span> ");initial_select_class=""};if(this.settings.xml?$.ajax({type:"GET",url:this.settings.xml,async:!1,dataType:"xml",success:function(xml){$("<ul></ul>");$(xml).find("skitter slide").each(function(){++u;var link=$(this).find("link").text()?$(this).find("link").text():"#",src=$(this).find("image").text(),animation_type=$(this).find("image").attr("type"),label=$(this).find("label").text(),target=$(this).find("target").text()?$(this).find("target").text():"_self";addImageLink(link,src,animation_type,label,target)})}}):this.settings.json||this.skitter_box.find("ul li").each(function(){++u;var link=$(this).find("a").length?$(this).find("a").attr("href"):"#",src=$(this).find("img").attr("src"),animation_type=$(this).find("img").attr("class"),label=$(this).find(".label_text").html(),target=$(this).find("a").length&&$(this).find("a").attr("target")?$(this).find("a").attr("target"):"_self";addImageLink(link,src,animation_type,label,target)}),self.settings.thumbs&&!self.settings.fullscreen){self.skitter_box.find(".info_slide").addClass("info_slide_thumb");var width_info_slide=(u+1)*self.skitter_box.find(".info_slide_thumb .image_number").width();self.skitter_box.find(".info_slide_thumb").width(width_info_slide),self.skitter_box.css({height:self.skitter_box.height()+self.skitter_box.find(".info_slide").height()}),self.skitter_box.append('<div class="container_thumbs"></div>');var copy_info_slide=self.skitter_box.find(".info_slide").clone();self.skitter_box.find(".info_slide").remove(),self.skitter_box.find(".container_thumbs").width(self.settings.width_skitter).append(copy_info_slide);var width_image=0,width_skitter=this.settings.width_skitter,height_skitter=this.settings.height_skitter,w_info_slide_thumb=0,info_slide_thumb=self.skitter_box.find(".info_slide_thumb"),x_value=0,y_value=self.skitter_box.offset().top;if(info_slide_thumb.find(".image_number").each(function(){width_image+=$(this).outerWidth()}),info_slide_thumb.width(width_image+"px"),w_info_slide_thumb=info_slide_thumb.width(),width_value=this.settings.width_skitter,width_value=width_skitter-100,width_info_slide>self.settings.width_skitter&&self.skitter_box.mousemove(function(e){x_value=self.skitter_box.offset().left+90;var x=e.pageX,y=e.pageY,new_x=0;x-=x_value,y-=y_value,novo_width=w_info_slide_thumb-width_value,new_x=-novo_width*x/width_value,new_x>0&&(new_x=0),new_x<-(w_info_slide_thumb-width_skitter)&&(new_x=-(w_info_slide_thumb-width_skitter)),y>height_skitter&&info_slide_thumb.css({left:new_x})}),self.skitter_box.find(".scroll_thumbs").css({left:10}),width_info_slide<self.settings.width_skitter){self.skitter_box.find(".box_scroll_thumbs").hide();var class_info=".info_slide";switch(self.settings.numbers_align){case"center":self.settings.width_skitter,self.skitter_box.find(class_info).width();self.skitter_box.find(class_info).css({left:"50%",transform:"translateX(-50%)"});break;case"right":self.skitter_box.find(class_info).css({left:"auto",right:"-5px"});break;case"left":self.skitter_box.find(class_info).css({left:"0px"})}}}else{var class_info=".info_slide";switch(self.settings.dots&&(self.skitter_box.find(".info_slide").addClass("info_slide_dots").removeClass("info_slide"),class_info=".info_slide_dots"),self.settings.numbers_align){case"center":self.settings.width_skitter,self.skitter_box.find(class_info).width();self.skitter_box.find(class_info).css({left:"50%",transform:"translateX(-50%)"});break;case"right":self.skitter_box.find(class_info).css({left:"auto",right:"15px"});break;case"left":self.skitter_box.find(class_info).css({left:"15px"})}self.settings.dots||self.skitter_box.find(".info_slide").height()>20&&self.skitter_box.find(".info_slide").hide()}if(this.skitter_box.find("ul").hide(),this.settings.show_randomly&&this.settings.images_links.sort(function(a,b){return Math.random()-.5}),this.settings.image_atual=this.settings.images_links[0][0],this.settings.link_atual=this.settings.images_links[0][1],this.settings.label_atual=this.settings.images_links[0][3],this.settings.target_atual=this.settings.images_links[0][4],this.settings.images_links.length>1&&(this.skitter_box.find(".prev_button").click(function(){return 0==self.settings.is_animating&&(self.settings.image_i-=2,-2==self.settings.image_i?self.settings.image_i=self.settings.images_links.length-2:-1==self.settings.image_i&&(self.settings.image_i=self.settings.images_links.length-1),self.jumpToImage(self.settings.image_i)),!1}),this.skitter_box.find(".next_button").click(function(){return self.jumpToImage(self.settings.image_i),!1}),self.skitter_box.find(".next_button, .prev_button").bind("mouseover",self.settings.mouseOverButton),self.skitter_box.find(".next_button, .prev_button").bind("mouseleave",self.settings.mouseOutButton),this.skitter_box.find(".image_number").click(function(){if("image_number image_number_select"!=$(this).attr("class")){var imageNumber=parseInt($(this).attr("rel"));self.jumpToImage(imageNumber)}return!1}),self.settings.preview&&self.settings.dots)){for(var preview=$('<div class="preview_slide"><ul></ul></div>'),i=0;i<this.settings.images_links.length;i++){var li=$("<li></li>"),img=$("<img />");img.attr("src",this.settings.images_links[i][0]),li.append(img),preview.find("ul").append(li)}var width_preview_ul=parseInt(100*this.settings.images_links.length);preview.find("ul").width(width_preview_ul),$(class_info).append(preview),self.skitter_box.find(class_info).find(".image_number").mouseenter(function(){if(self.isLargeDevice()){var _left_info=parseFloat(self.skitter_box.find(class_info).offset().left),_left_image=parseFloat($(this).offset().left),_left_preview=_left_image-_left_info-43,rel=parseInt($(this).attr("rel")),_left_ul=(self.skitter_box.find(".preview_slide_current img").attr("src"),-100*rel);self.skitter_box.find(".preview_slide").find("ul").animate({left:_left_ul},{duration:200,queue:!1,easing:"easeOutSine"}),self.skitter_box.find(".preview_slide").fadeTo(1,1).animate({left:_left_preview},{duration:200,queue:!1})}}),self.skitter_box.find(class_info).mouseleave(function(){self.isLargeDevice()&&$(".preview_slide").animate({opacity:"hide"},{duration:200,queue:!1})})}self.settings.focus&&self.focusSkitter(),self.settings.controls&&self.setControls(),self.settings.progressbar&&self.settings.auto_play&&self.addProgressBar(),self.settings.hide_tools&&self.hideTools(),self.settings.enable_navigation_keys&&self.enableNavigationKeys(),this.loadImages(),this.setResponsive(),this.setTouchSupport()},loadImages:function(){var self=this,loading=$('<div class="skitter-spinner"><div class="icon-sending"></div></div>'),total=this.settings.images_links.length,u=0;this.skitter_box.append(loading);for(var i in this.settings.images_links){var self_il=this.settings.images_links[i],src=self.getImageName(self_il[0]),img=new Image;$(img).on("load",function(){++u==total&&(self.skitter_box.find(".skitter-spinner").remove(),self.start())}).on("error",function(){self.skitter_box.find(".skitter-spinner, .image_number, .next_button, .prev_button").remove(),self.skitter_box.html('<p style="color:white;background:black;">Error loading images. One or more images were not found.</p>')}).attr("src",src)}},start:function(){var self=this,init_pause=!1;(this.settings.numbers||this.settings.thumbs)&&this.skitter_box.find(".info_slide").fadeIn(500),this.settings.dots&&this.skitter_box.find(".info_slide_dots").fadeIn(500),this.settings.label&&this.skitter_box.find(".label_skitter").show(),this.settings.navigation&&(this.skitter_box.find(".prev_button").fadeIn(500),this.skitter_box.find(".next_button").fadeIn(500)),self.settings.auto_play&&self.startTime(),self.windowFocusOut(),self.setLinkAtual(),self.skitter_box.find(".image > a img").attr({src:self.getCurrentImage()}),img_link=self.skitter_box.find(".image > a"),img_link=self.resizeImage(img_link),img_link.find("img").fadeIn(1500),self.setValueBoxText(),self.showBoxText(),self.settings.auto_play&&self.stopOnMouseOver();var mouseOverInit=function(){self.settings.stop_over&&(init_pause=!0,self.settings.is_hover_skitter_box=!0,self.clearTimer(!0),self.pauseProgressBar())};self.skitter_box.mouseover(mouseOverInit),self.skitter_box.find(".next_button").mouseover(mouseOverInit),self.settings.images_links.length>1&&!init_pause?self.settings.auto_play&&(self.timer=setTimeout(function(){self.nextImage()},self.settings.interval)):self.skitter_box.find(".skitter-spinner, .image_number, .next_button, .prev_button").remove(),$.isFunction(self.settings.onLoad)&&self.settings.onLoad(self),this.setDimensions()},jumpToImage:function(imageNumber){0==this.settings.is_animating&&(this.settings.elapsedTime=0,this.skitter_box.find(".box_clone").stop(),this.clearTimer(!0),this.settings.image_i=Math.floor(imageNumber),this.skitter_box.find(".image > a").attr({href:this.settings.link_atual}),this.skitter_box.find(".image_main").attr({src:this.getCurrentImage()}),this.skitter_box.find(".box_clone").remove(),this.nextImage())},nextImage:function(){var self=this;animations_functions=this.animations,self.settings.progressbar&&self.hideProgressBar();var animation_type;if(animation_type=""==this.settings.animation&&this.settings.images_links[this.settings.image_i][2]?this.settings.images_links[this.settings.image_i][2]:""==this.settings.animation?"default":this.settings.animation,self.settings.responsive){var window_width=$(window).width();for(var name in self.settings.responsive){var item=self.settings.responsive[name];if(window_width<item.max_width&&item.animation){animation_type=item.animation;break}}}if("randomSmart"==animation_type)this.settings.random_ia||(animations_functions.sort(function(){return.5-Math.random()}),this.settings.random_ia=animations_functions),animation_type=this.settings.random_ia[this.settings.image_i];else if("random"==animation_type){var random_id=parseInt(Math.random()*animations_functions.length);animation_type=animations_functions[random_id]}else if(self.settings.with_animations.length>0){var total_with_animations=self.settings.with_animations.length;void 0==this.settings._i_animation&&(this.settings._i_animation=0),animation_type=self.settings.with_animations[this.settings._i_animation],++this.settings._i_animation,this.settings._i_animation>=total_with_animations&&(this.settings._i_animation=0)}switch(animation_type){case"cube":this.animationCube();break;case"cubeRandom":this.animationCube({random:!0});break;case"block":this.animationBlock();break;case"cubeStop":this.animationCubeStop();break;case"cubeStopRandom":this.animationCubeStop({random:!0});break;case"cubeHide":this.animationCubeHide();break;case"cubeSize":this.animationCubeSize();break;case"horizontal":this.animationHorizontal();break;case"showBars":this.animationShowBars();break;case"showBarsRandom":this.animationShowBars({random:!0});break;case"tube":this.animationTube();break;case"fade":this.animationFade();break;case"fadeFour":this.animationFadeFour();break;case"paralell":this.animationParalell();break;case"blind":this.animationBlind();break;case"blindHeight":this.animationBlindDimension({height:!0});break;case"blindWidth":this.animationBlindDimension({height:!1,time_animate:400,delay:50});break;case"directionTop":this.animationDirection({direction:"top"});break;case"directionBottom":this.animationDirection({direction:"bottom"});break;case"directionRight":this.animationDirection({direction:"right",total:5});break;case"directionLeft":this.animationDirection({direction:"left",total:5});break;case"cubeSpread":this.animationCubeSpread();break;case"cubeJelly":this.animationCubeJelly();break;case"glassCube":this.animationGlassCube();break;case"glassBlock":this.animationGlassBlock();break;case"circles":this.animationCircles();break;case"circlesInside":this.animationCirclesInside();break;case"circlesRotate":this.animationCirclesRotate();break;case"cubeShow":this.animationCubeShow();break;case"upBars":this.animationDirectionBars({direction:"top"});break;case"downBars":this.animationDirectionBars({direction:"bottom"});break;case"hideBars":this.animationHideBars();break;case"swapBars":this.animationSwapBars();break;case"swapBarsBack":this.animationSwapBars({easing:"easeOutBack"});break;case"swapBlocks":this.animationSwapBlocks();break;case"cut":this.animationCut();break;default:this.animationTube()}},animationCube:function(options){var self=this,options=$.extend({},{random:!1},options||{});this.settings.is_animating=!0;var easing=""==this.settings.easing_default?"easeOutExpo":this.settings.easing_default,time_animate=700/this.settings.velocity;this.setActualLevel();var max_w=self.getMaxW(8),division_w=Math.ceil(this.settings.width_skitter/(this.settings.width_skitter/max_w)),division_h=Math.ceil(this.settings.height_skitter/(this.settings.height_skitter/3)),total=division_w*division_h,width_box=Math.ceil(this.settings.width_skitter/division_w),height_box=Math.ceil(this.settings.height_skitter/division_h),init_top=this.settings.height_skitter+200,init_left=this.settings.height_skitter+200,col_t=0,col=0;for(i=0;i<total;i++){init_top=i%2==0?init_top:-init_top,init_left=i%2==0?init_left:-init_left;var _vtop=init_top+height_box*col_t+150*col_t,_vleft=-self.settings.width_skitter,_vtop_image=-height_box*col_t,_vleft_image=-width_box*col,_btop=height_box*col_t,_bleft=width_box*col,box_clone=this.getBoxClone();box_clone.hide();var delay_time=50*i;options.random?(delay_time=40*col,box_clone.css({left:_vleft+"px",top:_vtop+"px",width:width_box,height:height_box})):(time_animate=500,box_clone.css({left:this.settings.width_skitter+width_box*i,top:this.settings.height_skitter+height_box*i,width:width_box,height:height_box})),this.addBoxClone(box_clone);var callback=i==total-1?function(){self.finishAnimation()}:"";box_clone.show().delay(delay_time).animate({top:_btop+"px",left:_bleft+"px"},time_animate,easing,callback),options.random?(box_clone.find("img").css({left:_vleft_image+100,top:_vtop_image+50}),box_clone.find("img").delay(delay_time+time_animate/2).animate({left:_vleft_image,top:_vtop_image},1e3,"easeOutBack")):(box_clone.find("img").css({left:_vleft_image,top:_vtop_image}),box_clone.find("img").delay(delay_time+time_animate/2).fadeTo(100,.5).fadeTo(300,1)),col_t++,col_t==division_h&&(col_t=0,col++)}},animationBlock:function(options){var self=this;this.settings.is_animating=!0;var easing=""==this.settings.easing_default?"easeOutQuad":this.settings.easing_default,time_animate=500/this.settings.velocity;this.setActualLevel();var max_w=self.getMaxW(15),total=Math.ceil(this.settings.width_skitter/(this.settings.width_skitter/max_w)),width_box=Math.ceil(this.settings.width_skitter/total),height_box=this.settings.height_skitter;for(i=0;i<total;i++){var _bleft=width_box*i,box_clone=this.getBoxClone();box_clone.css({left:this.settings.width_skitter+100,top:0,width:width_box,height:height_box}),box_clone.find("img").css({left:-width_box*i}),this.addBoxClone(box_clone);var delay_time=80*i,callback=i==total-1?function(){self.finishAnimation()}:"";box_clone.show().delay(delay_time).animate({top:0,left:_bleft},time_animate,easing),box_clone.find("img").hide().delay(delay_time+100).animate({opacity:"show"},time_animate+300,easing,callback)}},animationCubeStop:function(options){var self=this,options=$.extend({},{random:!1},options||{});this.settings.is_animating=!0;var easing=""==this.settings.easing_default?"easeInQuad":this.settings.easing_default,time_animate=300/this.settings.velocity,image_old=this.getOldImage();this.setActualLevel(),this.setLinkAtual(),this.skitter_box.find(".image_main").attr({src:this.getCurrentImage()});var max_w=self.getMaxW(8),max_h=self.getMaxH(8),division_w=Math.ceil(this.settings.width_skitter/(this.settings.width_skitter/max_w)),division_h=Math.ceil(this.settings.height_skitter/(this.settings.width_skitter/max_h)),total=division_w*division_h,width_box=Math.ceil(this.settings.width_skitter/division_w),height_box=Math.ceil(this.settings.height_skitter/division_h),init_top=0,init_left=0,col_t=0,col=0,_ftop=this.settings.width_skitter/16;for(i=0;i<total;i++){init_top=i%2==0?init_top:-init_top,init_left=i%2==0?init_left:-init_left;var _vtop=init_top+height_box*col_t,_vleft=init_left+width_box*col,_vtop_image=-height_box*col_t,_vleft_image=-width_box*col,_btop=_vtop-_ftop,_bleft=_vleft-_ftop,box_clone=this.getBoxCloneImgOld(image_old);box_clone.css({left:_vleft+"px",top:_vtop+"px",width:width_box,height:height_box}),box_clone.find("img").css({left:_vleft_image,top:_vtop_image}),this.addBoxClone(box_clone),box_clone.show();var delay_time=50*i;options.random&&(time_animate=400*(self.getRandom(2)+1)/this.settings.velocity,_btop=_vtop,_bleft=_vleft,delay_time=Math.ceil(30*self.getRandom(30))),options.random&&i==total-1&&(time_animate=1200,delay_time=900);var callback=i==total-1?function(){self.finishAnimation()}:"";box_clone.delay(delay_time).animate({opacity:"hide",top:_btop+"px",left:_bleft+"px"},time_animate,easing,callback),col_t++,col_t==division_h&&(col_t=0,col++)}},animationCubeHide:function(options){var self=this;this.settings.is_animating=!0;var easing=""==this.settings.easing_default?"easeOutQuad":this.settings.easing_default,time_animate=500/this.settings.velocity,image_old=this.getOldImage();this.setActualLevel(),this.setLinkAtual(),this.skitter_box.find(".image_main").attr({src:this.getCurrentImage()});var max_w=self.getMaxW(8),division_w=Math.ceil(this.settings.width_skitter/(this.settings.width_skitter/max_w)),division_h=Math.ceil(this.settings.height_skitter/(this.settings.height_skitter/3)),total=division_w*division_h,width_box=Math.ceil(this.settings.width_skitter/division_w),height_box=Math.ceil(this.settings.height_skitter/division_h),init_top=0,init_left=0,col_t=0,col=0;for(i=0;i<total;i++){init_top=i%2==0?init_top:-init_top,init_left=i%2==0?init_left:-init_left;var _vtop=init_top+height_box*col_t,_vleft=init_left+width_box*col,_vtop_image=-height_box*col_t,_vleft_image=-width_box*col,box_clone=this.getBoxCloneImgOld(image_old);box_clone.css({left:_vleft+"px",top:_vtop+"px",width:width_box,height:height_box}),box_clone.find("img").css({left:_vleft_image,top:_vtop_image}),this.addBoxClone(box_clone),box_clone.show();var delay_time=50*i;delay_time=i==total-1?50*total:delay_time;var callback=i==total-1?function(){self.finishAnimation()}:"";box_clone.delay(delay_time).animate({opacity:"hide"},time_animate,easing,callback),col_t++,col_t==division_h&&(col_t=0,col++)}},animationCubeJelly:function(options){var self=this;this.settings.is_animating=!0;var easing=""==this.settings.easing_default?"easeInBack":this.settings.easing_default,time_animate=300/this.settings.velocity,image_old=this.getOldImage();this.setActualLevel(),this.setLinkAtual(),this.skitter_box.find(".image_main").attr({src:this.getCurrentImage()});var max_w=self.getMaxW(8),division_w=Math.ceil(this.settings.width_skitter/(this.settings.width_skitter/max_w)),division_h=Math.ceil(this.settings.height_skitter/(this.settings.height_skitter/3)),total=division_w*division_h,width_box=Math.ceil(this.settings.width_skitter/division_w),height_box=Math.ceil(this.settings.height_skitter/division_h),init_top=0,init_left=0,col_t=0,col=0,u=-1;for(i=0;i<total;i++){col%2!=0?(0==col_t&&(u=u+division_h+1),u--):(col>0&&0==col_t&&(u+=2),u++),init_top=i%2==0?init_top:-init_top,init_left=i%2==0?init_left:-init_left;var _vtop=init_top+height_box*col_t,_vleft=init_left+width_box*col,_vtop_image=-height_box*col_t,_vleft_image=-width_box*col,box_clone=this.getBoxCloneImgOld(image_old);box_clone.css({left:_vleft+"px",top:_vtop+"px",width:width_box,height:height_box}),box_clone.find("img").css({left:_vleft_image,top:_vtop_image}),this.addBoxClone(box_clone),box_clone.show();var delay_time=50*i,callback=i==total-1?function(){self.finishAnimation()}:"";box_clone.delay(delay_time).animate({width:"+=100px",height:"+=100px",top:"-=20px",left:"-=20px",opacity:"hide"},time_animate,easing,callback),col_t++,col_t==division_h&&(col_t=0,col++)}},animationCubeSize:function(options){var self=this;this.settings.is_animating=!0;var easing=""==this.settings.easing_default?"easeInOutQuad":this.settings.easing_default,time_animate=600/this.settings.velocity,image_old=this.getOldImage();this.setActualLevel(),this.setLinkAtual(),this.skitter_box.find(".image_main").attr({src:this.getCurrentImage()});var max_w=self.getMaxW(8),division_w=Math.ceil(this.settings.width_skitter/(this.settings.width_skitter/max_w)),division_h=Math.ceil(this.settings.height_skitter/(this.settings.height_skitter/3)),total=division_w*division_h,width_box=Math.ceil(this.settings.width_skitter/division_w),height_box=Math.ceil(this.settings.height_skitter/division_h),init_top=0,init_left=0,col_t=0,col=0;Math.ceil(this.settings.width_skitter/6);for(i=0;i<total;i++){init_top=i%2==0?init_top:-init_top,init_left=i%2==0?init_left:-init_left;var _vtop=init_top+height_box*col_t,_vleft=init_left+width_box*col,_vtop_image=-height_box*col_t,_vleft_image=-width_box*col,box_clone=this.getBoxCloneImgOld(image_old);box_clone.css({left:_vleft,top:_vtop,width:width_box,height:height_box}),box_clone.find("img").css({left:_vleft_image,top:_vtop_image}),this.addBoxClone(box_clone),box_clone.show();var delay_time=50*i,callback=i==total-1?function(){self.finishAnimation()}:"";box_clone.delay(delay_time).animate({opacity:"hide",width:"hide",height:"hide",top:_vtop+1.5*width_box,left:_vleft+1.5*height_box},time_animate,easing,callback),col_t++,col_t==division_h&&(col_t=0,col++)}},animationHorizontal:function(options){var self=this;this.settings.is_animating=!0;var easing=""==this.settings.easing_default?"easeOutExpo":this.settings.easing_default,time_animate=700/this.settings.velocity;this.setActualLevel();var total=Math.ceil(this.settings.width_skitter/(this.settings.width_skitter/7)),width_box=this.settings.width_skitter,height_box=Math.ceil(this.settings.height_skitter/total);for(i=0;i<total;i++){var _bleft=(i,""+width_box),_btop=i*height_box,box_clone=this.getBoxClone();box_clone.css({left:_bleft+"px",top:_btop+"px",width:width_box,height:height_box}),box_clone.find("img").css({left:0,top:-_btop}),this.addBoxClone(box_clone);var delay_time=90*i,callback=i==total-1?function(){self.finishAnimation()}:"";box_clone.delay(delay_time).animate({opacity:"show",top:_btop,left:0},time_animate,easing,callback)}},animationShowBars:function(options){var self=this,options=$.extend({},{random:!1},options||{});this.settings.is_animating=!0;var easing=""==this.settings.easing_default?"easeOutQuad":this.settings.easing_default,time_animate=400/this.settings.velocity;this.setActualLevel();var max_w=self.getMaxW(10),total=Math.ceil(this.settings.width_skitter/(this.settings.width_skitter/max_w)),width_box=Math.ceil(this.settings.width_skitter/total),height_box=this.settings.height_skitter;for(i=0;i<total;i++){var _bleft=width_box*i,box_clone=this.getBoxClone();if(box_clone.css({left:_bleft,top:-50,width:width_box,height:height_box}),box_clone.find("img").css({left:-width_box*i,top:0}),this.addBoxClone(box_clone),options.random){var random=this.getRandom(total),delay_time=50*random;delay_time=i==total-1?50*total:delay_time}else{var delay_time=70*i;time_animate-=2*i}var callback=i==total-1?function(){self.finishAnimation()}:"";box_clone.delay(delay_time).animate({opacity:"show",top:"0px",left:_bleft+"px"},time_animate,easing,callback)}},animationTube:function(options){var self=this;this.settings.is_animating=!0;var easing=""==this.settings.easing_default?"easeOutElastic":this.settings.easing_default,time_animate=600/this.settings.velocity;this.setActualLevel();var max_w=self.getMaxW(10),total=Math.ceil(this.settings.width_skitter/(this.settings.width_skitter/max_w)),width_box=Math.ceil(this.settings.width_skitter/total),height_box=this.settings.height_skitter;for(i=0;i<total;i++){var _vtop=height_box,vleft=width_box*i,box_clone=this.getBoxClone();box_clone.css({left:vleft,top:_vtop,height:height_box,width:width_box}),box_clone.find("img").css({left:-vleft}),this.addBoxClone(box_clone);var random=this.getRandom(total),delay_time=30*random,callback=i==total-1?function(){self.finishAnimation()}:"";box_clone.show().delay(delay_time).animate({top:0},time_animate,easing,callback)}},animationFade:function(options){var self=this;this.settings.is_animating=!0;var easing=""==this.settings.easing_default?"easeOutQuad":this.settings.easing_default,time_animate=800/this.settings.velocity;this.setActualLevel();var width_box=this.settings.width_skitter,height_box=this.settings.height_skitter;for(i=0;i<2;i++){var box_clone=this.getBoxClone();box_clone.css({left:0,top:0,width:width_box,height:height_box}),this.addBoxClone(box_clone);var callback=1==i?function(){self.finishAnimation()}:"";box_clone.animate({opacity:"show",left:0,top:0},time_animate,easing,callback)}},animationFadeFour:function(options){var self=this;this.settings.is_animating=!0;var easing=""==this.settings.easing_default?"easeOutQuad":this.settings.easing_default,time_animate=500/this.settings.velocity;this.setActualLevel();var width_box=this.settings.width_skitter,height_box=this.settings.height_skitter;for(i=0;i<4;i++){if(0==i)var _vtop="-40px",_vleft="-40px";else if(1==i)var _vtop="-40px",_vleft="40px";else if(2==i)var _vtop="40px",_vleft="-40px";else if(3==i)var _vtop="40px",_vleft="40px";var box_clone=this.getBoxClone();box_clone.css({left:_vleft,top:_vtop,width:width_box,height:height_box}),this.addBoxClone(box_clone);var callback=3==i?function(){self.finishAnimation()}:"";box_clone.animate({opacity:"show",left:0,top:0},time_animate,easing,callback)}},animationParalell:function(options){var self=this;this.settings.is_animating=!0;var easing=""==this.settings.easing_default?"easeOutQuad":this.settings.easing_default,time_animate=400/this.settings.velocity;this.setActualLevel();var total=Math.ceil(this.settings.width_skitter/(this.settings.width_skitter/16)),width_box=Math.ceil(this.settings.width_skitter/total),height_box=this.settings.height_skitter;for(i=0;i<total;i++){var _bleft=width_box*i,box_clone=this.getBoxClone();box_clone.css({left:_bleft,top:0-this.settings.height_skitter,width:width_box,height:height_box}),box_clone.find("img").css({left:-width_box*i,top:0}),this.addBoxClone(box_clone);var delay_time;i<=total/2-1?delay_time=1400-200*i:i>total/2-1&&(delay_time=200*(i-total/2)),delay_time/=2.5;var callback=i==total-1?function(){self.finishAnimation()}:"";box_clone.delay(delay_time).animate({top:"0px",left:_bleft+"px",opacity:"show"},time_animate,easing,callback)}},animationBlind:function(options){var self=this,options=$.extend({},{height:!1},options||{});this.settings.is_animating=!0;var easing=""==this.settings.easing_default?"easeOutQuad":this.settings.easing_default,time_animate=400/this.settings.velocity;this.setActualLevel();var total=Math.ceil(this.settings.width_skitter/(this.settings.width_skitter/16)),width_box=Math.ceil(this.settings.width_skitter/total),height_box=this.settings.height_skitter;for(i=0;i<total;i++){var _bleft=width_box*i,box_clone=this.getBoxClone();box_clone.css({left:_bleft,top:0,width:width_box,height:height_box}),box_clone.find("img").css({left:-width_box*i,top:0}),this.addBoxClone(box_clone);var delay_time;if(options.height){i<=total/2-1?delay_time=200+200*i:i>total/2-1&&(delay_time=200*(total/2-i)+100*total);var callback=i==total/2?function(){self.finishAnimation()}:""}else{i<=total/2-1?delay_time=1400-200*i:i>total/2-1&&(delay_time=200*(i-total/2));var callback=i==total-1?function(){self.finishAnimation()}:""}
if(delay_time/=2.5,options.height){time_animate+=2*i;var easing="easeOutQuad";box_clone.delay(delay_time).animate({opacity:"show",top:"0px",left:_bleft+"px",height:"show"},time_animate,easing,callback)}else box_clone.delay(delay_time).animate({opacity:"show",top:"0px",left:_bleft+"px",width:"show"},time_animate,easing,callback)}},animationBlindDimension:function(options){var self=this,options=$.extend({},{height:!0,time_animate:500,delay:100},options||{});this.settings.is_animating=!0;var easing=""==this.settings.easing_default?"easeOutQuad":this.settings.easing_default,time_animate=options.time_animate/this.settings.velocity;this.setActualLevel();var max_w=self.getMaxW(16),total=Math.ceil(this.settings.width_skitter/(this.settings.width_skitter/max_w)),width_box=Math.ceil(this.settings.width_skitter/total),height_box=this.settings.height_skitter;for(i=0;i<total;i++){var _bleft=width_box*i,box_clone=this.getBoxClone();box_clone.css({left:_bleft,top:0,width:width_box,height:height_box}),box_clone.find("img").css({left:-width_box*i,top:0}),this.addBoxClone(box_clone);var delay_time=options.delay*i,callback=i==total-1?function(){self.finishAnimation()}:"";if(options.height){var easing="easeOutQuad";box_clone.delay(delay_time).animate({opacity:"show",top:"0px",left:_bleft+"px",height:"show"},time_animate,easing,callback)}else box_clone.delay(delay_time).animate({opacity:"show",top:"0px",left:_bleft+"px",width:"show"},time_animate,easing,callback)}},animationDirection:function(options){var self=this,max_w=self.getMaxW(7),options=$.extend({},{direction:"top",delay_type:"sequence",total:max_w},options||{});this.settings.is_animating=!0;var easing=""==this.settings.easing_default?"easeInOutExpo":this.settings.easing_default,time_animate=1200/this.settings.velocity,image_old=this.getOldImage();this.setActualLevel(),this.setLinkAtual(),this.skitter_box.find(".image_main").attr({src:this.getCurrentImage()}),this.skitter_box.find(".image_main").hide();var total=options.total;for(i=0;i<total;i++){switch(options.direction){default:case"top":var width_box=Math.ceil(this.settings.width_skitter/total),height_box=this.settings.height_skitter,_itopc=0,_ileftc=width_box*i,_ftopc=-height_box,_fleftc=_ileftc,_itopn=height_box,_ileftn=_ileftc,_ftopn=0,_fleftn=_ileftc,_vtop_image=0,_vleft_image=-_ileftc;break;case"bottom":var width_box=Math.ceil(this.settings.width_skitter/total),height_box=this.settings.height_skitter,_itopc=0,_ileftc=width_box*i,_ftopc=height_box,_fleftc=_ileftc,_itopn=-height_box,_ileftn=_ileftc,_ftopn=0,_fleftn=_ileftc,_vtop_image=0,_vleft_image=-_ileftc;break;case"right":var width_box=this.settings.width_skitter,height_box=Math.ceil(this.settings.height_skitter/total),_itopc=height_box*i,_ileftc=0,_ftopc=_itopc,_fleftc=width_box,_itopn=_itopc,_ileftn=-_fleftc,_ftopn=_itopc,_fleftn=0,_vtop_image=-_itopc,_vleft_image=0;break;case"left":var width_box=this.settings.width_skitter,height_box=Math.ceil(this.settings.height_skitter/total),_itopc=height_box*i,_ileftc=0,_ftopc=_itopc,_fleftc=-width_box,_itopn=_itopc,_ileftn=-_fleftc,_ftopn=_itopc,_fleftn=0,_vtop_image=-_itopc,_vleft_image=0}switch(options.delay_type){case"zebra":default:var delay_time=i%2==0?0:150;break;case"random":var delay_time=30*Math.random()*30;break;case"sequence":var delay_time=100*i}var box_clone=this.getBoxCloneImgOld(image_old);box_clone.find("img").css({left:_vleft_image,top:_vtop_image}),box_clone.css({top:_itopc,left:_ileftc,width:width_box,height:height_box}),this.addBoxClone(box_clone),box_clone.show(),box_clone.delay(delay_time).animate({top:_ftopc,left:_fleftc},time_animate,easing);var box_clone_next=this.getBoxClone();box_clone_next.find("img").css({left:_vleft_image,top:_vtop_image}),box_clone_next.css({top:_itopn,left:_ileftn,width:width_box,height:height_box}),this.addBoxClone(box_clone_next),box_clone_next.show();var callback=i==total-1?function(){self.finishAnimation()}:"";box_clone_next.delay(delay_time).animate({top:_ftopn,left:_fleftn},time_animate,easing,callback)}},animationCubeSpread:function(options){var self=this;this.settings.is_animating=!0;var easing=""==this.settings.easing_default?"easeOutQuad":this.settings.easing_default,time_animate=700/this.settings.velocity;this.setActualLevel();var max_w=self.getMaxW(8),max_h=self.getMaxH(8),division_w=Math.ceil(this.settings.width_skitter/(this.settings.width_skitter/max_w)),division_h=Math.ceil(this.settings.height_skitter/(this.settings.width_skitter/max_h)),total=division_w*division_h,width_box=Math.ceil(this.settings.width_skitter/division_w),height_box=Math.ceil(this.settings.height_skitter/division_h),init_top=0,init_left=0,col_t=0,col=0,order=new Array,spread=new Array;for(i=0;i<total;i++){init_top=i%2==0?init_top:-init_top,init_left=i%2==0?init_left:-init_left;var _vtop=init_top+height_box*col_t,_vleft=init_left+width_box*col;order[i]=[_vtop,_vleft],col_t++,col_t==division_h&&(col_t=0,col++)}for(col_t=0,col=0,i=0;i<total;i++)spread[i]=i;var spread=self.shuffleArray(spread);for(i=0;i<total;i++){init_top=i%2==0?init_top:-init_top,init_left=i%2==0?init_left:-init_left;var _vtop=init_top+height_box*col_t,_vleft=init_left+width_box*col,_vtop_image=-height_box*col_t,_vleft_image=-width_box*col,_btop=_vtop,_bleft=_vleft;_vtop=order[spread[i]][0],_vleft=order[spread[i]][1];var box_clone=this.getBoxClone();box_clone.css({left:_vleft+"px",top:_vtop+"px",width:width_box,height:height_box}),box_clone.find("img").css({left:_vleft_image,top:_vtop_image}),this.addBoxClone(box_clone);var delay_time=30*Math.random()*30;i==total-1&&(delay_time=900);var callback=i==total-1?function(){self.finishAnimation()}:"";box_clone.delay(delay_time).animate({opacity:"show",top:_btop+"px",left:_bleft+"px"},time_animate,easing,callback),col_t++,col_t==division_h&&(col_t=0,col++)}},animationGlassCube:function(options){var self=this;this.settings.is_animating=!0;var easing=""==this.settings.easing_default?"easeOutExpo":this.settings.easing_default,time_animate=500/this.settings.velocity;this.setActualLevel();var max_w=self.getMaxW(10),total=2*Math.ceil(this.settings.width_skitter/(this.settings.width_skitter/max_w)),width_box=2*Math.ceil(this.settings.width_skitter/total),height_box=this.settings.height_skitter/2,col=0;for(i=0;i<total;i++){mod=i%2==0;var _ileft=width_box*col,_itop=mod?-self.settings.height_skitter:self.settings.height_skitter,_fleft=width_box*col,_ftop=mod?0:height_box,_bleft=-width_box*col,_btop=mod?0:-height_box,delay_time=120*col,box_clone=this.getBoxClone();box_clone.css({left:_ileft,top:_itop,width:width_box,height:height_box}),box_clone.find("img").css({left:_bleft+width_box/1.5,top:_btop}).delay(delay_time).animate({left:_bleft,top:_btop},1.9*time_animate,"easeOutQuad"),this.addBoxClone(box_clone);var callback=i==total-1?function(){self.finishAnimation()}:"";box_clone.show().delay(delay_time).animate({top:_ftop,left:_fleft},time_animate,easing,callback),i%2!=0&&col++}},animationGlassBlock:function(options){var self=this;this.settings.is_animating=!0;var easing=""==this.settings.easing_default?"easeOutExpo":this.settings.easing_default,time_animate=700/this.settings.velocity;this.setActualLevel();var max_w=self.getMaxW(10),total=Math.ceil(this.settings.width_skitter/(this.settings.width_skitter/max_w)),width_box=Math.ceil(this.settings.width_skitter/total),height_box=this.settings.height_skitter;for(i=0;i<total;i++){var _ileft=width_box*i,_fleft=width_box*i,_bleft=-width_box*i,delay_time=100*i,box_clone=this.getBoxClone();box_clone.css({left:_ileft,top:0,width:width_box,height:height_box}),box_clone.find("img").css({left:_bleft+width_box/1.5,top:0}).delay(delay_time).animate({left:_bleft,top:0},1.1*time_animate,"easeInOutQuad"),this.addBoxClone(box_clone);var callback=i==total-1?function(){self.finishAnimation()}:"";box_clone.delay(delay_time).animate({top:0,left:_fleft,opacity:"show"},time_animate,easing,callback)}},animationCircles:function(options){var self=this;this.settings.is_animating=!0;var easing=""==this.settings.easing_default?"easeInQuad":this.settings.easing_default,time_animate=500/this.settings.velocity;this.setActualLevel();var total=Math.ceil(this.settings.width_skitter/(this.settings.width_skitter/10)),size_box=this.settings.height_skitter,radius=Math.sqrt(Math.pow(this.settings.width_skitter,2)+Math.pow(this.settings.height_skitter,2)),radius=Math.ceil(radius);for(i=0;i<total;i++){var _ileft=self.settings.width_skitter/2-size_box/2,_itop=self.settings.height_skitter/2-size_box/2,_fleft=_ileft,_ftop=_itop,box_clone=null;box_clone=this.getBoxCloneBackground({image:self.getCurrentImage(),left:_ileft,top:_itop,width:size_box,height:size_box,position:{top:-_itop,left:-_ileft}}).skitterCss3({"border-radius":radius+"px"}),size_box+=200,this.addBoxClone(box_clone);var delay_time=70*i,callback=i==total-1?function(){self.finishAnimation()}:"";box_clone.delay(delay_time).animate({top:_ftop,left:_fleft,opacity:"show"},time_animate,easing,callback)}},animationCirclesInside:function(options){var self=this;this.settings.is_animating=!0;var easing=""==this.settings.easing_default?"easeInQuad":this.settings.easing_default,time_animate=500/this.settings.velocity,image_old=this.getOldImage();this.setActualLevel(),this.setLinkAtual(),this.skitter_box.find(".image_main").attr({src:this.getCurrentImage()});var total=Math.ceil(this.settings.width_skitter/(this.settings.width_skitter/10)),radius=Math.sqrt(Math.pow(this.settings.width_skitter,2)+Math.pow(this.settings.height_skitter,2)),radius=Math.ceil(radius),size_box=radius;for(i=0;i<total;i++){var _ileft=self.settings.width_skitter/2-size_box/2,_itop=self.settings.height_skitter/2-size_box/2,_fleft=_ileft,_ftop=_itop,box_clone=null;box_clone=this.getBoxCloneBackground({image:image_old,left:_ileft,top:_itop,width:size_box,height:size_box,position:{top:-_itop,left:-_ileft}}).skitterCss3({"border-radius":radius+"px"}),size_box-=200,this.addBoxClone(box_clone),box_clone.show();var delay_time=70*i,callback=i==total-1?function(){self.finishAnimation()}:"";box_clone.delay(delay_time).animate({top:_ftop,left:_fleft,opacity:"hide"},time_animate,easing,callback)}},animationCirclesRotate:function(options){var self=this;this.settings.is_animating=!0;var easing=""==this.settings.easing_default?"easeInQuad":this.settings.easing_default,time_animate=500/this.settings.velocity,image_old=this.getOldImage();this.setActualLevel(),this.setLinkAtual(),this.skitter_box.find(".image_main").attr({src:this.getCurrentImage()});var total=Math.ceil(this.settings.width_skitter/(this.settings.width_skitter/10)),radius=Math.sqrt(Math.pow(this.settings.width_skitter,2)+Math.pow(this.settings.height_skitter,2)),radius=Math.ceil(radius),size_box=radius;for(i=0;i<total;i++){var _ileft=self.settings.width_skitter/2-size_box/2,_itop=self.settings.height_skitter/2-size_box/2,_fleft=_ileft,_ftop=_itop,box_clone=null;box_clone=this.getBoxCloneImgOld(image_old),box_clone.css({left:_ileft,top:_itop,width:size_box,height:size_box}).skitterCss3({"border-radius":radius+"px"}),box_clone.find("img").css({left:-_ileft,top:-_itop}),size_box-=300,this.addBoxClone(box_clone),box_clone.show();var delay_time=200*i,callback=i==total-1?function(){self.finishAnimation()}:"";i;box_clone.delay(delay_time).animate({top:_ftop,left:_fleft,opacity:"hide"},time_animate,easing,callback)}},animationCubeShow:function(options){var self=this;this.settings.is_animating=!0;var easing=""==this.settings.easing_default?"easeOutQuad":this.settings.easing_default,time_animate=400/this.settings.velocity;this.setActualLevel();var max_w=self.getMaxW(8),division_w=Math.ceil(this.settings.width_skitter/(this.settings.width_skitter/max_w)),division_h=Math.ceil(this.settings.height_skitter/(this.settings.height_skitter/4)),total=division_w*division_h,width_box=Math.ceil(this.settings.width_skitter/division_w),height_box=Math.ceil(this.settings.height_skitter/division_h),_btop=0,_bleft=0,line=0,col=0;for(i=0;i<total;i++){_btop=height_box*line,_bleft=width_box*col;var delay_time=30*i,box_clone=this.getBoxClone();box_clone.css({left:_bleft,top:_btop,width:width_box,height:height_box}).hide(),box_clone.find("img").css({left:-_bleft,top:-_btop}),this.addBoxClone(box_clone);var callback=i==total-1?function(){self.finishAnimation()}:"";box_clone.delay(delay_time).animate({width:"show",height:"show"},time_animate,easing,callback),line++,line==division_h&&(line=0,col++)}},animationDirectionBars:function(options){var self=this,options=$.extend({},{direction:"top"},options||{});this.settings.is_animating=!0;var easing=""==this.settings.easing_default?"easeInOutQuad":this.settings.easing_default,time_animate=400/this.settings.velocity,image_old=this.getOldImage();this.setActualLevel(),this.setLinkAtual(),this.skitter_box.find(".image_main").attr({src:this.getCurrentImage()});var max_w=self.getMaxW(12),total=max_w,width_box=Math.ceil(this.settings.width_skitter/total),height_box=this.settings.height_skitter,_ftop="top"==options.direction?-height_box:height_box;for(i=0;i<total;i++){var _vleft=width_box*i,_vleft_image=-width_box*i,box_clone=this.getBoxCloneImgOld(image_old);box_clone.css({left:_vleft+"px",top:"0px",width:width_box,height:height_box}),box_clone.find("img").css({left:_vleft_image,top:0}),this.addBoxClone(box_clone),box_clone.show();var delay_time=70*i,callback=i==total-1?function(){self.finishAnimation()}:"";box_clone.delay(delay_time).animate({top:_ftop},time_animate,easing,callback)}},animationHideBars:function(options){var self=this,options=$.extend({},{random:!1},options||{});this.settings.is_animating=!0;var easing=""==this.settings.easing_default?"easeOutCirc":this.settings.easing_default,time_animate=700/this.settings.velocity,image_old=this.getOldImage();this.setActualLevel(),this.setLinkAtual(),this.skitter_box.find(".image_main").attr({src:this.getCurrentImage()});var max_w=self.getMaxW(10),division_w=Math.ceil(this.settings.width_skitter/(this.settings.width_skitter/max_w)),total=division_w,width_box=Math.ceil(this.settings.width_skitter/division_w),height_box=this.settings.height_skitter;for(i=0;i<total;i++){var _vleft=width_box*i,_vleft_image=-width_box*i,_fleft="+="+width_box,box_clone=this.getBoxCloneImgOld(image_old);box_clone.css({left:0,top:0,width:width_box,height:height_box}),box_clone.find("img").css({left:_vleft_image,top:0});var box_clone_main=this.getBoxCloneImgOld(image_old);box_clone_main.css({left:_vleft+"px",top:"0px",width:width_box,height:height_box}),box_clone_main.html(box_clone),this.addBoxClone(box_clone_main),box_clone.show(),box_clone_main.show();var delay_time=50*i,callback=i==total-1?function(){self.finishAnimation()}:"";box_clone.delay(delay_time).animate({left:_fleft},time_animate,easing,callback)}},animationSwapBars:function(options){var self=this,max_w=self.getMaxW(7),options=$.extend({},{direction:"top",delay_type:"sequence",total:max_w,easing:"easeOutCirc"},options||{});this.settings.is_animating=!0;var easing=""==this.settings.easing_default?options.easing:this.settings.easing_default,time_animate=500/this.settings.velocity,image_old=this.getOldImage();this.setActualLevel(),this.setLinkAtual(),this.skitter_box.find(".image_main").attr({src:this.getCurrentImage()}),this.skitter_box.find(".image_main").hide();var total=options.total;for(i=0;i<total;i++){var width_box=Math.ceil(this.settings.width_skitter/total),height_box=this.settings.height_skitter,_ileftc=width_box*i,_vleft_image=-_ileftc;switch(options.delay_type){case"zebra":default:var delay_time=i%2==0?0:150;break;case"random":var delay_time=30*Math.random()*30;break;case"sequence":var delay_time=100*i}var box_clone=this.getBoxCloneImgOld(image_old);box_clone.find("img").css({left:_vleft_image,top:0}),box_clone.css({top:0,left:0,width:width_box,height:height_box});var box_clone_next=this.getBoxClone();box_clone_next.find("img").css({left:_vleft_image,top:0}),box_clone_next.css({top:0,left:-width_box,width:width_box,height:height_box});var box_clone_container=this.getBoxClone();box_clone_container.html("").append(box_clone).append(box_clone_next),box_clone_container.css({top:0,left:_ileftc,width:width_box,height:height_box}),this.addBoxClone(box_clone_container),box_clone_container.show(),box_clone.show(),box_clone_next.show();var callback=i==total-1?function(){self.finishAnimation()}:"";box_clone.delay(delay_time).animate({left:width_box},time_animate,easing),box_clone_next.delay(delay_time).animate({left:0},time_animate,easing,callback)}},animationSwapBlocks:function(options){var self=this,options=$.extend({},{easing_old:"easeInOutQuad",easing_new:"easeOutQuad"},options||{});this.settings.is_animating=!0;var easing_old=""==this.settings.easing_default?options.easing_old:this.settings.easing_default,easing_new=""==this.settings.easing_default?options.easing_new:this.settings.easing_default,time_animate=800/this.settings.velocity,image_old=this.getOldImage();this.setActualLevel(),this.setLinkAtual(),this.skitter_box.find(".image_main").attr({src:this.getCurrentImage()}),this.skitter_box.find(".image_main").hide();var width_box=this.settings.width_skitter,height_box=Math.ceil(this.settings.height_skitter/2),box_clone1=this.getBoxCloneImgOld(image_old),box_clone2=this.getBoxCloneImgOld(image_old);box_clone1.find("img").css({left:0,top:0}),box_clone1.css({top:0,left:0,width:width_box,height:height_box}),box_clone2.find("img").css({left:0,top:-height_box}),box_clone2.css({top:height_box,left:0,width:width_box,height:height_box});var box_clone_next1=this.getBoxClone(),box_clone_next2=this.getBoxClone();box_clone_next1.find("img").css({left:0,top:height_box}),box_clone_next1.css({top:0,left:0,width:width_box,height:height_box}),box_clone_next2.find("img").css({left:0,top:-2*height_box}),box_clone_next2.css({top:height_box,left:0,width:width_box,height:height_box}),this.addBoxClone(box_clone_next1),this.addBoxClone(box_clone_next2),this.addBoxClone(box_clone1),this.addBoxClone(box_clone2),box_clone1.show(),box_clone2.show(),box_clone_next1.show(),box_clone_next2.show();var callback=function(){self.finishAnimation()};box_clone1.find("img").animate({top:height_box},time_animate,easing_old,function(){box_clone1.remove()}),box_clone2.find("img").animate({top:-2*height_box},time_animate,easing_old,function(){box_clone2.remove()}),box_clone_next1.find("img").animate({top:0},time_animate,easing_new),box_clone_next2.find("img").animate({top:-height_box},time_animate,easing_new,callback)},animationCut:function(options){var self=this,options=$.extend({},{easing_old:"easeInOutExpo",easing_new:"easeInOutExpo"},options||{});this.settings.is_animating=!0;var easing_old=""==this.settings.easing_default?options.easing_old:this.settings.easing_default,easing_new=""==this.settings.easing_default?options.easing_new:this.settings.easing_default,time_animate=900/this.settings.velocity,image_old=this.getOldImage();this.setActualLevel(),this.setLinkAtual(),this.skitter_box.find(".image_main").attr({src:this.getCurrentImage()}),this.skitter_box.find(".image_main").hide();var width_box=this.settings.width_skitter,height_box=Math.ceil(this.settings.height_skitter/2),box_clone1=this.getBoxCloneImgOld(image_old),box_clone2=this.getBoxCloneImgOld(image_old);box_clone1.find("img").css({left:0,top:0}),box_clone1.css({top:0,left:0,width:width_box,height:height_box}),box_clone2.find("img").css({left:0,top:-height_box}),box_clone2.css({top:height_box,left:0,width:width_box,height:height_box});var box_clone_next1=this.getBoxClone(),box_clone_next2=this.getBoxClone();box_clone_next1.find("img").css({left:0,top:0}),box_clone_next1.css({top:0,left:width_box,width:width_box,height:height_box}),box_clone_next2.find("img").css({left:0,top:-height_box}),box_clone_next2.css({top:height_box,left:-width_box,width:width_box,height:height_box}),this.addBoxClone(box_clone_next1),this.addBoxClone(box_clone_next2),this.addBoxClone(box_clone1),this.addBoxClone(box_clone2),box_clone1.show(),box_clone2.show(),box_clone_next1.show(),box_clone_next2.show();var callback=function(){self.finishAnimation()};box_clone1.animate({left:-width_box},time_animate,easing_old,function(){box_clone1.remove()}),box_clone2.animate({left:width_box},time_animate,easing_old,function(){box_clone2.remove()}),box_clone_next1.animate({left:0},time_animate,easing_new),box_clone_next2.animate({left:0},time_animate,easing_new,callback)},finishAnimation:function(options){var self=this;this.skitter_box.find(".image_main").show(),this.showBoxText(),this.settings.is_animating=!1,this.skitter_box.find(".image_main").attr({src:this.getCurrentImage()}),this.skitter_box.find(".image > a").attr({href:this.settings.link_atual}),this.settings.is_hover_skitter_box||this.settings.is_paused||this.settings.is_blur||(this.timer=setTimeout(function(){self.completeMove()},this.settings.interval)),self.startTime()},completeMove:function(){this.clearTimer(!0),this.skitter_box.find(".box_clone").remove(),this.settings.is_paused||this.settings.is_blur||this.nextImage()},setActualLevel:function(){$.isFunction(this.settings.imageSwitched)&&this.settings.imageSwitched(this.settings.image_i,this),this.setImageLink(),this.addClassNumber(),this.hideBoxText(),this.increasingImage()},setImageLink:function(){var name_image=this.settings.images_links[this.settings.image_i][0],link_image=this.settings.images_links[this.settings.image_i][1],label_image=this.settings.images_links[this.settings.image_i][3],target_link=this.settings.images_links[this.settings.image_i][4];this.settings.image_atual=name_image,this.settings.link_atual=link_image,this.settings.label_atual=label_image,this.settings.target_atual=target_link},addClassNumber:function(){var self=this;this.skitter_box.find(".image_number_select").removeClass("image_number_select"),$("#image_n_"+(this.settings.image_i+1)+"_"+self.number_skitter).addClass("image_number_select")},increasingImage:function(){++this.settings.image_i==this.settings.images_links.length&&(this.settings.image_i=0)},getBoxClone:function(){if("#"!=this.settings.link_atual){var img_clone=$('<a href="'+this.settings.link_atual+'"><img src="'+this.getCurrentImage()+'" /></a>');img_clone.attr({target:this.settings.target_atual})}else var img_clone=$('<img src="'+this.getCurrentImage()+'" />');img_clone=this.resizeImage(img_clone);var box_clone=$('<div class="box_clone"></div>');return box_clone.append(img_clone),box_clone},getBoxCloneImgOld:function(image_old){if("#"!=this.settings.link_atual){var img_clone=$('<a href="'+this.settings.link_atual+'"><img src="'+image_old+'" /></a>');img_clone.attr({target:this.settings.target_atual})}else var img_clone=$('<img src="'+image_old+'" />');img_clone=this.resizeImage(img_clone);var box_clone=$('<div class="box_clone"></div>');return box_clone.append(img_clone),box_clone},resizeImage:function(img_clone){return img_clone.find("img").width(this.settings.width_skitter),img_clone.find("img").height(this.settings.height_skitter),img_clone},addBoxClone:function(box_clone){this.skitter_box.find(".container_skitter").append(box_clone)},getEasing:function(easing){var easing_accepts=["easeInQuad","easeOutQuad","easeInOutQuad","easeInCubic","easeOutCubic","easeInOutCubic","easeInQuart","easeOutQuart","easeInOutQuart","easeInQuint","easeOutQuint","easeInOutQuint","easeInSine","easeOutSine","easeInOutSine","easeInExpo","easeOutExpo","easeInOutExpo","easeInCirc","easeOutCirc","easeInOutCirc","easeInElastic","easeOutElastic","easeInOutElastic","easeInBack","easeOutBack","easeInOutBack","easeInBounce","easeOutBounce","easeInOutBounce"];return jQuery.inArray(easing,easing_accepts)>0?easing:""},getRandom:function(i){return Math.floor(Math.random()*i)},setValueBoxText:function(){this.skitter_box.find(".label_skitter").html(this.settings.label_atual)},showBoxText:function(){var self=this;if(void 0!=this.settings.label_atual&&""!=this.settings.label_atual&&self.settings.label)switch(self.settings.label_animation){case"slideUp":default:self.skitter_box.find(".label_skitter").slideDown(400);break;case"left":case"right":self.skitter_box.find(".label_skitter").animate({left:0},400,"easeInOutQuad");break;case"fixed":}},hideBoxText:function(){var self=this;switch(self.settings.label_animation){case"slideUp":default:this.skitter_box.find(".label_skitter").slideUp(200,function(){self.setValueBoxText()});break;case"left":case"right":var _left="left"==self.settings.label_animation?-self.skitter_box.find(".label_skitter").width():self.skitter_box.find(".label_skitter").width();self.skitter_box.find(".label_skitter").animate({left:_left},400,"easeInOutQuad",function(){self.setValueBoxText()});break;case"fixed":self.setValueBoxText()}},stopOnMouseOver:function(){var self=this;self.settings.stop_over?self.skitter_box.hover(function(){self.settings.stop_over&&(self.settings.is_hover_skitter_box=!0),self.settings.is_paused_time||self.pauseTime(),self.setHideTools("hover"),self.clearTimer(!0)},function(){self.settings.stop_over&&(self.settings.is_hover_skitter_box=!1),0!=self.settings.elapsedTime||self.settings.is_animating||self.settings.is_paused?self.settings.is_paused||self.resumeTime():self.startTime(),self.setHideTools("out"),self.clearTimer(!0),!self.settings.is_animating&&self.settings.images_links.length>1&&(self.timer=setTimeout(function(){self.completeMove()},self.settings.interval-self.settings.elapsedTime),self.skitter_box.find(".image_main").attr({src:self.getCurrentImage()}),self.skitter_box.find(".image > a").attr({href:self.settings.link_atual}))}):self.skitter_box.hover(function(){self.setHideTools("hover")},function(){self.setHideTools("out")})},setHideTools:function(type){var self=this,opacity_elements=self.settings.opacity_elements,interval_in_elements=self.settings.interval_in_elements,interval_out_elements=self.settings.interval_out_elements;"hover"==type?(self.settings.hide_tools&&(self.settings.numbers&&self.skitter_box.find(".info_slide").show().css({opacity:0}).animate({opacity:opacity_elements},interval_in_elements),self.settings.navigation&&self.skitter_box.find(".prev_button, .next_button").show().css({opacity:0}).animate({opacity:opacity_elements},interval_in_elements),self.settings.focus&&!self.settings.foucs_active&&self.skitter_box.find(".focus_button").stop().show().css({opacity:0}).animate({opacity:opacity_elements},interval_in_elements),self.settings.controls&&self.skitter_box.find(".play_pause_button").stop().show().css({opacity:0}).animate({opacity:opacity_elements},interval_in_elements)),!self.settings.focus||self.settings.foucs_active||self.settings.hide_tools||self.skitter_box.find(".focus_button").stop().animate({opacity:1},interval_in_elements),self.settings.controls&&!self.settings.hide_tools&&self.skitter_box.find(".play_pause_button").stop().animate({opacity:1},interval_in_elements)):(self.settings.hide_tools&&(self.settings.numbers&&self.skitter_box.find(".info_slide").queue("fx",[]).show().css({opacity:opacity_elements}).animate({opacity:0},interval_out_elements),self.settings.navigation&&self.skitter_box.find(".prev_button, .next_button").queue("fx",[]).show().css({opacity:opacity_elements}).animate({opacity:0},interval_out_elements),self.settings.focus&&!self.settings.foucs_active&&self.skitter_box.find(".focus_button").stop().css({opacity:opacity_elements}).animate({opacity:0},interval_out_elements),self.settings.controls&&self.skitter_box.find(".play_pause_button").stop().css({opacity:opacity_elements}).animate({opacity:0},interval_out_elements)),!self.settings.focus||self.settings.foucs_active||self.settings.hide_tools||self.skitter_box.find(".focus_button").stop().animate({opacity:.3},interval_out_elements),self.settings.controls&&!self.settings.hide_tools&&self.skitter_box.find(".play_pause_button").stop().animate({opacity:.3},interval_out_elements))},clearTimer:function(force){var self=this;clearInterval(self.timer)},setLinkAtual:function(){"#"!=this.settings.link_atual&&""!=this.settings.link_atual?this.skitter_box.find(".image > a").attr({href:this.settings.link_atual,target:this.settings.target_atual}):this.skitter_box.find(".image > a").removeAttr("href")},hideTools:function(){this.skitter_box.find(".info_slide").fadeTo(0,0),this.skitter_box.find(".prev_button").fadeTo(0,0),this.skitter_box.find(".next_button").fadeTo(0,0),this.skitter_box.find(".focus_button").fadeTo(0,0),this.skitter_box.find(".play_pause_button").fadeTo(0,0)},focusSkitter:function(){var self=this,focus_button=$('<a href="#" class="focus_button">focus</a>');self.skitter_box.append(focus_button),focus_button.animate({opacity:.3},self.settings.interval_in_elements),$(document).keypress(function(e){27==(e.keyCode?e.keyCode:e.which)&&$("#overlay_skitter").trigger("click")});var _top=self.skitter_box.offset().top,_left=self.skitter_box.offset().left;self.skitter_box.find(".focus_button").click(function(){if(self.settings.foucs_active)return!1;self.settings.foucs_active=!0,$(this).stop().animate({opacity:0},self.settings.interval_out_elements);var div=$('<div id="overlay_skitter"></div>').height($(document).height()).hide().fadeTo(self.settings.interval_in_elements,.98),_topFinal=($(window).height()-self.skitter_box.height())/2+$(document).scrollTop(),_leftFinal=($(window).width()-self.skitter_box.width())/2;return self.skitter_box.before('<div id="mark_position"></div>'),$("body").prepend(div),$("body").prepend(self.skitter_box),self.skitter_box.css({top:_top,left:_left,position:"absolute","z-index":9999}).animate({top:_topFinal,left:_leftFinal},2e3,"easeOutExpo"),$("#mark_position").width(self.skitter_box.width()).height(self.skitter_box.height()).css({background:"none"}).fadeTo(300,.3),!1}),$(document).on("click","#overlay_skitter",function(){return!$(this).hasClass("finish_overlay_skitter")&&(self.settings.foucs_active=!1,$(this).addClass("finish_overlay_skitter"),self.settings.hide_tools||self.skitter_box.find(".focus_button").animate({opacity:.3},200),self.skitter_box.stop().animate({top:_top,left:_left},200,"easeOutExpo",function(){$("#mark_position").before(self.skitter_box),$(this).css({position:"relative",top:0,left:0}),$("#mark_position").remove()}),$("#overlay_skitter").fadeTo(self.settings.interval_out_elements,0,function(){$(this).remove()}),!1)})},setControls:function(){var self=this,play_pause_button=$('<a href="#" class="play_pause_button">pause</a>');self.skitter_box.append(play_pause_button),play_pause_button.animate({opacity:.3},self.settings.interval_in_elements),play_pause_button.click(function(){return self.settings.is_paused?(self.settings.is_animating||self.skitter_box.find(".progressbar").is(":visible")?self.resumeTime():self.settings.elapsedTime=0,self.settings.progressbar||self.resumeTime(),self.settings.is_paused=!1,$(this).html("pause"),$(this).fadeTo(100,.5).fadeTo(100,1),$(this).removeClass("play_button"),self.settings.stop_over||(self.clearTimer(!0),!self.settings.is_animating&&self.settings.images_links.length>1&&(self.timer=setTimeout(function(){self.completeMove()},self.settings.interval-self.settings.elapsedTime),self.skitter_box.find(".image_main").attr({src:self.getCurrentImage()}),self.skitter_box.find(".image > a").attr({href:self.settings.link_atual})))):($(this).html("play"),$(this).fadeTo(100,.5).fadeTo(100,1),$(this).addClass("play_button"),self.pauseTime(),self.settings.is_paused=!0,self.clearTimer(!0)),!1})},objectSize:function(obj){var key,size=0;for(key in obj)obj.hasOwnProperty(key)&&size++;return size},addProgressBar:function(){var self=this,progressbar=$('<div class="progressbar"></div>');self.skitter_box.append(progressbar),0==self.objectSize(self.settings.progressbar_css)&&(parseInt(progressbar.css("width"))>0?self.settings.progressbar_css.width=parseInt(progressbar.css("width")):self.settings.progressbar_css={width:self.settings.width_skitter,height:5}),self.objectSize(self.settings.progressbar_css)>0&&void 0==self.settings.progressbar_css.width&&(self.settings.progressbar_css.width=self.settings.width_skitter),progressbar.css(self.settings.progressbar_css).hide()},startProgressBar:function(){
var self=this;if(self.settings.is_hover_skitter_box||self.settings.is_paused||self.settings.is_blur||!self.settings.progressbar)return!1;self.skitter_box.find(".progressbar").hide().dequeue().width(self.settings.progressbar_css.width).animate({width:"show"},self.settings.interval,"linear")},pauseProgressBar:function(){var self=this;self.settings.is_animating||self.skitter_box.find(".progressbar").stop()},resumeProgressBar:function(){var self=this;if(self.settings.is_hover_skitter_box||self.settings.is_paused||!self.settings.progressbar)return!1;self.skitter_box.find(".progressbar").dequeue().animate({width:self.settings.progressbar_css.width},self.settings.interval-self.settings.elapsedTime,"linear")},hideProgressBar:function(){var self=this;if(!self.settings.progressbar)return!1;self.skitter_box.find(".progressbar").stop().fadeOut(300,function(){$(this).width(self.settings.progressbar_css.width)})},startTime:function(){var self=this;self.settings.is_paused_time=!1;var date=new Date;self.settings.elapsedTime=0,self.settings.time_start=date.getTime(),self.startProgressBar()},pauseTime:function(){var self=this;if(self.settings.is_paused_time)return!1;self.settings.is_paused_time=!0;var date=new Date;self.settings.elapsedTime+=date.getTime()-self.settings.time_start,self.pauseProgressBar()},resumeTime:function(){var self=this;self.settings.is_paused_time=!1;var date=new Date;self.settings.time_start=date.getTime(),self.resumeProgressBar()},enableNavigationKeys:function(){var self=this;$(window).keydown(function(e){39==e.keyCode||40==e.keyCode?self.skitter_box.find(".next_button").trigger("click"):37!=e.keyCode&&38!=e.keyCode||self.skitter_box.find(".prev_button").trigger("click")})},getBoxCloneBackground:function(options){var box_clone=$('<div class="box_clone"></div>'),background_size=this.settings.width_skitter+"px "+this.settings.height_skitter+"px";return box_clone.css({left:options.left,top:options.top,width:options.width,height:options.height,"background-image":"url("+options.image+")","background-size":background_size,"background-position":options.position.left+"px "+options.position.top+"px"}),box_clone},shuffleArray:function(arrayOrigem){for(var indice,self=this,arrayDestino=[];arrayOrigem.length>0;)indice=self.randomUnique(0,arrayOrigem.length-1),arrayDestino[arrayDestino.length]=arrayOrigem[indice],arrayOrigem.splice(indice,1);return arrayDestino},randomUnique:function(valorIni,valorFim){var numRandom;do{numRandom=Math.random()}while(1==numRandom);return numRandom*(valorFim-valorIni+1)+valorIni|0},windowFocusOut:function(){var self=this;$(window).bind("blur",function(){self.settings.is_blur=!0,self.pauseTime(),self.clearTimer(!0)}),$(window).bind("focus",function(){self.settings.images_links.length>1&&(self.settings.is_blur=!1,0==self.settings.elapsedTime?self.startTime():self.resumeTime(),self.settings.elapsedTime<=self.settings.interval&&(self.clearTimer(!0),self.timer=setTimeout(function(){self.completeMove()},self.settings.interval-self.settings.elapsedTime),self.skitter_box.find(".image_main").attr({src:self.getCurrentImage()}),self.skitter_box.find(".image > a").attr({href:self.settings.link_atual})))})},setResponsive:function(){if(this.settings.responsive){var self=this,timeout=null;$(window).on("resize",function(){clearTimeout(timeout),timeout=setTimeout(function(){self.setDimensions()},200)}).trigger("resize")}},setDimensions:function(){var self=this,was_set=!1;this.skitter_box.css("width","100%"),this.skitter_box.find(".image_main").attr({src:this.getCurrentImage()}).css({width:"100%",height:"auto"}).on("load",function(){was_set||(was_set=!0,_setDimensions())}),setTimeout(function(){was_set||(was_set=!0,_setDimensions())},3e3);var _setDimensions=function(){var image=self.skitter_box.find(".image_main"),width_box=self.skitter_box.width(),width_image=(self.skitter_box.height(),image.width()),height_image=image.height(),width=width_box,height=height_image*width_box/width_image;self.settings.fullscreen&&(width=$(window).width(),height=$(window).height()),self.settings.width_skitter=width,self.settings.height_skitter=height,self.skitter_box.width(width).height(height).find(".container_skitter").width(width).height(height).find("> a img, > img").width(width).height(height)}},isLargeDevice:function(){return $(window).width()>=1024},getMaxW:function(max_w){if(this.settings.responsive){var window_width=$(window).width();window_width<=320?max_w=parseInt(max_w/4):window_width<=480?max_w=parseInt(max_w/3):window_width<=768&&(max_w=parseInt(max_w/1.5))}return max_w},getMaxH:function(max_h){return this.getMaxW(max_h)},getCurrentImage:function(){var image=this.settings.image_atual;return this.getImageName(image)},getOldImage:function(){return this.skitter_box.find(".image_main").attr("src")},getImageName:function(image){var window_width=$(window).width();if(this.settings.responsive)for(var name in this.settings.responsive){var item=this.settings.responsive[name];if(window_width<item.max_width&&item.suffix){var extension=image.split(".").reverse()[0];image=image.replace("."+extension,item.suffix+"."+extension);break}}return image},setTouchSupport:function(){var self=this,last_position_x=0,last_position_x_move=0;("ontouchstart"in window||navigator.msMaxTouchPoints>0)&&(this.skitter_box.on("touchstart",function(e){e.originalEvent.touches.length>0&&(last_position_x=e.originalEvent.touches[0].pageX)}),this.skitter_box.on("touchmove",function(e){e.originalEvent.touches.length>0&&(last_position_x_move=e.originalEvent.touches[0].pageX)}),this.skitter_box.on("touchend",function(e){last_position_x<last_position_x_move?self.skitter_box.find(".prev_button").trigger("click"):self.skitter_box.find(".next_button").trigger("click")}))},getAnimations:function(){return this.animations},setAnimation:function(animation){this.settings.animation=animation},next:function(){this.skitter_box.find(".next_button").trigger("click")},prev:function(){this.skitter_box.find(".prev_button").trigger("click")}}),$.fn.skitterCss3=function(props){var css={},prefixes=["moz","ms","o","webkit"];for(var prop in props){for(var i=0;i<prefixes.length;i++)css["-"+prefixes[i]+"-"+prop]=props[prop];css[prop]=props[prop]}return this.css(css),this}});
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//



;
