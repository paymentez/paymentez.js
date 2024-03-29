/*! selectize.js - v0.13.0 | https://github.com/selectize/selectize.js | Apache License (v2) */

!function (e, t) {
  "function" == typeof define && define.amd ? define("sifter", t) : "object" == typeof exports ? module.exports = t() : e.Sifter = t()
}(this, function () {
  function e(e, t) {
    this.items = e, this.settings = t || {diacritics: !0}
  }

  e.prototype.tokenize = function (e) {
    if (!(e = a(String(e || "").toLowerCase())) || !e.length) return [];
    for (var t, n, i = [], o = e.split(/ +/), r = 0, s = o.length; r < s; r++) {
      if (t = l(o[r]), this.settings.diacritics) for (n in p) p.hasOwnProperty(n) && (t = t.replace(new RegExp(n, "g"), p[n]));
      i.push({string: o[r], regex: new RegExp(t, "i")})
    }
    return i
  }, e.prototype.iterator = function (e, t) {
    var n = s(e) ? Array.prototype.forEach || function (e) {
      for (var t = 0, n = this.length; t < n; t++) e(this[t], t, this)
    } : function (e) {
      for (var t in this) this.hasOwnProperty(t) && e(this[t], t, this)
    };
    n.apply(e, [t])
  }, e.prototype.getScoreFunction = function (e, t) {
    var o, r, s, a;
    e = this.prepareSearch(e, t), r = e.tokens, o = e.options.fields, s = r.length, a = e.options.nesting;

    function l(e, t) {
      var n;
      return !e || -1 === (n = (e = String(e || "")).search(t.regex)) ? 0 : (e = t.string.length / e.length, 0 === n && (e += .5), e)
    }

    var p, c = (p = o.length) ? 1 === p ? function (e, t) {
      return l(g(t, o[0], a), e)
    } : function (e, t) {
      for (var n = 0, i = 0; n < p; n++) i += l(g(t, o[n], a), e);
      return i / p
    } : function () {
      return 0
    };
    return s ? 1 === s ? function (e) {
      return c(r[0], e)
    } : "and" === e.options.conjunction ? function (e) {
      for (var t, n = 0, i = 0; n < s; n++) {
        if ((t = c(r[n], e)) <= 0) return 0;
        i += t
      }
      return i / s
    } : function (e) {
      for (var t = 0, n = 0; t < s; t++) n += c(r[t], e);
      return n / s
    } : function () {
      return 0
    }
  }, e.prototype.getSortFunction = function (e, n) {
    var t, i, o, r, s, a, l, p = this, c = !(e = p.prepareSearch(e, n)).query && n.sort_empty || n.sort, u = function (e, t) {
      return "$score" === e ? t.score : g(p.items[t.id], e, n.nesting)
    }, d = [];
    if (c) for (t = 0, i = c.length; t < i; t++) !e.query && "$score" === c[t].field || d.push(c[t]);
    if (e.query) {
      for (l = !0, t = 0, i = d.length; t < i; t++) if ("$score" === d[t].field) {
        l = !1;
        break
      }
      l && d.unshift({field: "$score", direction: "desc"})
    } else for (t = 0, i = d.length; t < i; t++) if ("$score" === d[t].field) {
      d.splice(t, 1);
      break
    }
    for (a = [], t = 0, i = d.length; t < i; t++) a.push("desc" === d[t].direction ? -1 : 1);
    return (r = d.length) ? 1 === r ? (o = d[0].field, s = a[0], function (e, t) {
      return s * h(u(o, e), u(o, t))
    }) : function (e, t) {
      for (var n, i = 0; i < r; i++) if (n = d[i].field, n = a[i] * h(u(n, e), u(n, t))) return n;
      return 0
    } : null
  }, e.prototype.prepareSearch = function (e, t) {
    if ("object" == typeof e) return e;
    var n = (t = r({}, t)).fields, i = t.sort, o = t.sort_empty;
    return n && !s(n) && (t.fields = [n]), i && !s(i) && (t.sort = [i]), o && !s(o) && (t.sort_empty = [o]), {
      options: t,
      query: String(e || "").toLowerCase(),
      tokens: this.tokenize(e),
      total: 0,
      items: []
    }
  }, e.prototype.search = function (e, n) {
    var i, o, t = this, r = this.prepareSearch(e, n);
    return n = r.options, e = r.query, o = n.score || t.getScoreFunction(r), e.length ? t.iterator(t.items, function (e, t) {
      i = o(e), (!1 === n.filter || 0 < i) && r.items.push({score: i, id: t})
    }) : t.iterator(t.items, function (e, t) {
      r.items.push({score: 1, id: t})
    }), (t = t.getSortFunction(r, n)) && r.items.sort(t), r.total = r.items.length, "number" == typeof n.limit && (r.items = r.items.slice(0, n.limit)), r
  };
  var h = function (e, t) {
    return "number" == typeof e && "number" == typeof t ? t < e ? 1 : e < t ? -1 : 0 : (e = n(String(e || "")), (t = n(String(t || ""))) < e ? 1 : e < t ? -1 : 0)
  }, r = function (e, t) {
    for (var n, i, o = 1, r = arguments.length; o < r; o++) if (i = arguments[o]) for (n in i) i.hasOwnProperty(n) && (e[n] = i[n]);
    return e
  }, g = function (e, t, n) {
    if (e && t) {
      if (!n) return e[t];
      for (var i = t.split("."); i.length && (e = e[i.shift()]);) ;
      return e
    }
  }, a = function (e) {
    return (e + "").replace(/^\s+|\s+$|/g, "")
  }, l = function (e) {
    return (e + "").replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1")
  }, s = Array.isArray || "undefined" != typeof $ && $.isArray || function (e) {
    return "[object Array]" === Object.prototype.toString.call(e)
  }, p = {
    a: "[aḀḁĂăÂâǍǎȺⱥȦȧẠạÄäÀàÁáĀāÃãÅåąĄÃąĄ]",
    b: "[b␢βΒB฿𐌁ᛒ]",
    c: "[cĆćĈĉČčĊċC̄c̄ÇçḈḉȻȼƇƈɕᴄＣｃ]",
    d: "[dĎďḊḋḐḑḌḍḒḓḎḏĐđD̦d̦ƉɖƊɗƋƌᵭᶁᶑȡᴅＤｄð]",
    e: "[eÉéÈèÊêḘḙĚěĔĕẼẽḚḛẺẻĖėËëĒēȨȩĘęᶒɆɇȄȅẾếỀềỄễỂểḜḝḖḗḔḕȆȇẸẹỆệⱸᴇＥｅɘǝƏƐε]",
    f: "[fƑƒḞḟ]",
    g: "[gɢ₲ǤǥĜĝĞğĢģƓɠĠġ]",
    h: "[hĤĥĦħḨḩẖẖḤḥḢḣɦʰǶƕ]",
    i: "[iÍíÌìĬĭÎîǏǐÏïḮḯĨĩĮįĪīỈỉȈȉȊȋỊịḬḭƗɨɨ̆ᵻᶖİiIıɪＩｉ]",
    j: "[jȷĴĵɈɉʝɟʲ]",
    k: "[kƘƙꝀꝁḰḱǨǩḲḳḴḵκϰ₭]",
    l: "[lŁłĽľĻļĹĺḶḷḸḹḼḽḺḻĿŀȽƚⱠⱡⱢɫɬᶅɭȴʟＬｌ]",
    n: "[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲȠƞᵰᶇɳȵɴＮｎŊŋ]",
    o: "[oØøÖöÓóÒòÔôǑǒŐőŎŏȮȯỌọƟɵƠơỎỏŌōÕõǪǫȌȍՕօ]",
    p: "[pṔṕṖṗⱣᵽƤƥᵱ]",
    q: "[qꝖꝗʠɊɋꝘꝙq̃]",
    r: "[rŔŕɌɍŘřŖŗṘṙȐȑȒȓṚṛⱤɽ]",
    s: "[sŚśṠṡṢṣꞨꞩŜŝŠšŞşȘșS̈s̈]",
    t: "[tŤťṪṫŢţṬṭƮʈȚțṰṱṮṯƬƭ]",
    u: "[uŬŭɄʉỤụÜüÚúÙùÛûǓǔŰűŬŭƯưỦủŪūŨũŲųȔȕ∪]",
    v: "[vṼṽṾṿƲʋꝞꝟⱱʋ]",
    w: "[wẂẃẀẁŴŵẄẅẆẇẈẉ]",
    x: "[xẌẍẊẋχ]",
    y: "[yÝýỲỳŶŷŸÿỸỹẎẏỴỵɎɏƳƴ]",
    z: "[zŹźẐẑŽžŻżẒẓẔẕƵƶ]"
  }, n = function () {
    var e, t, n, i, o = "", r = {};
    for (n in p) if (p.hasOwnProperty(n)) for (o += i = p[n].substring(2, p[n].length - 1), e = 0, t = i.length; e < t; e++) r[i.charAt(e)] = n;
    var s = new RegExp("[" + o + "]", "g");
    return function (e) {
      return e.replace(s, function (e) {
        return r[e]
      }).toLowerCase()
    }
  }();
  return e
}), function (e, t) {
  "function" == typeof define && define.amd ? define("microplugin", t) : "object" == typeof exports ? module.exports = t() : e.MicroPlugin = t()
}(this, function () {
  var e = {
    mixin: function (i) {
      i.plugins = {}, i.prototype.initializePlugins = function (e) {
        var t, n, i, o = [];
        if (this.plugins = {
          names: [],
          settings: {},
          requested: {},
          loaded: {}
        }, r.isArray(e)) for (t = 0, n = e.length; t < n; t++) "string" == typeof e[t] ? o.push(e[t]) : (this.plugins.settings[e[t].name] = e[t].options, o.push(e[t].name)); else if (e) for (i in e) e.hasOwnProperty(i) && (this.plugins.settings[i] = e[i], o.push(i));
        for (; o.length;) this.require(o.shift())
      }, i.prototype.loadPlugin = function (e) {
        var t = this.plugins, n = i.plugins[e];
        if (!i.plugins.hasOwnProperty(e)) throw new Error('Unable to find "' + e + '" plugin');
        t.requested[e] = !0, t.loaded[e] = n.fn.apply(this, [this.plugins.settings[e] || {}]), t.names.push(e)
      }, i.prototype.require = function (e) {
        var t = this.plugins;
        if (!this.plugins.loaded.hasOwnProperty(e)) {
          if (t.requested[e]) throw new Error('Plugin has circular dependency ("' + e + '")');
          this.loadPlugin(e)
        }
        return t.loaded[e]
      }, i.define = function (e, t) {
        i.plugins[e] = {name: e, fn: t}
      }
    }
  }, r = {
    isArray: Array.isArray || function (e) {
      return "[object Array]" === Object.prototype.toString.call(e)
    }
  };
  return e
});
var highlight = function (e, t) {
  if ("string" != typeof t || t.length) {
    var s = "string" == typeof t ? new RegExp(t, "i") : t, a = function (e) {
      var t = 0;
      if (3 === e.nodeType) {
        var n, i, o = e.data.search(s);
        0 <= o && 0 < e.data.length && (i = e.data.match(s), (n = document.createElement("span")).className = "highlight", (o = e.splitText(o)).splitText(i[0].length), i = o.cloneNode(!0), n.appendChild(i), o.parentNode.replaceChild(n, o), t = 1)
      } else if (1 === e.nodeType && e.childNodes && !/(script|style)/i.test(e.tagName) && ("highlight" !== e.className || "SPAN" !== e.tagName)) for (var r = 0; r < e.childNodes.length; ++r) r += a(e.childNodes[r]);
      return t
    };
    return e.each(function () {
      a(this)
    })
  }
};
$.fn.removeHighlight = function () {
  return this.find("span.highlight").each(function () {
    this.parentNode.firstChild.nodeName;
    var e = this.parentNode;
    e.replaceChild(this.firstChild, this), e.normalize()
  }).end()
};
var MicroEvent = function () {
};
MicroEvent.prototype = {
  on: function (e, t) {
    this._events = this._events || {}, this._events[e] = this._events[e] || [], this._events[e].push(t)
  }, off: function (e, t) {
    var n = arguments.length;
    return 0 === n ? delete this._events : 1 === n ? delete this._events[e] : (this._events = this._events || {}, void (e in this._events != !1 && this._events[e].splice(this._events[e].indexOf(t), 1)))
  }, trigger: function (e) {
    if (this._events = this._events || {}, e in this._events != !1) for (var t = 0; t < this._events[e].length; t++) this._events[e][t].apply(this, Array.prototype.slice.call(arguments, 1))
  }
}, MicroEvent.mixin = function (e) {
  for (var t = ["on", "off", "trigger"], n = 0; n < t.length; n++) e.prototype[t[n]] = MicroEvent.prototype[t[n]]
};
var IS_MAC = /Mac/.test(navigator.userAgent), KEY_A = 65, KEY_COMMA = 188, KEY_RETURN = 13, KEY_ESC = 27, KEY_LEFT = 37, KEY_UP = 38,
  KEY_P = 80, KEY_RIGHT = 39, KEY_DOWN = 40, KEY_N = 78, KEY_BACKSPACE = 8, KEY_DELETE = 46, KEY_SHIFT = 16, KEY_CMD = IS_MAC ? 91 : 17,
  KEY_CTRL = IS_MAC ? 18 : 17, KEY_TAB = 9, TAG_SELECT = 1, TAG_INPUT = 2,
  SUPPORTS_VALIDITY_API = !/android/i.test(window.navigator.userAgent) && !!document.createElement("input").validity, isset = function (e) {
    return void 0 !== e
  }, hash_key = function (e) {
    return null == e ? null : "boolean" == typeof e ? e ? "1" : "0" : e + ""
  }, escape_html = function (e) {
    return (e + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
  }, escape_replace = function (e) {
    return (e + "").replace(/\$/g, "$$$$")
  }, hook = {
    before: function (e, t, n) {
      var i = e[t];
      e[t] = function () {
        return n.apply(e, arguments), i.apply(e, arguments)
      }
    }, after: function (t, e, n) {
      var i = t[e];
      t[e] = function () {
        var e = i.apply(t, arguments);
        return n.apply(t, arguments), e
      }
    }
  }, once = function (e) {
    var t = !1;
    return function () {
      t || (t = !0, e.apply(this, arguments))
    }
  }, debounce = function (n, i) {
    var o;
    return function () {
      var e = this, t = arguments;
      window.clearTimeout(o), o = window.setTimeout(function () {
        n.apply(e, t)
      }, i)
    }
  }, debounce_events = function (t, n, e) {
    var i, o = t.trigger, r = {};
    for (i in t.trigger = function () {
      var e = arguments[0];
      if (-1 === n.indexOf(e)) return o.apply(t, arguments);
      r[e] = arguments
    }, e.apply(t, []), t.trigger = o, r) r.hasOwnProperty(i) && o.apply(t, r[i])
  }, watchChildEvent = function (n, e, t, i) {
    n.on(e, t, function (e) {
      for (var t = e.target; t && t.parentNode !== n[0];) t = t.parentNode;
      return e.currentTarget = t, i.apply(this, [e])
    })
  }, getSelection = function (e) {
    var t, n, i = {};
    return "selectionStart" in e ? (i.start = e.selectionStart, i.length = e.selectionEnd - i.start) : document.selection && (e.focus(), t = document.selection.createRange(), n = document.selection.createRange().text.length, t.moveStart("character", -e.value.length), i.start = t.text.length - n, i.length = n), i
  }, transferStyles = function (e, t, n) {
    var i, o, r = {};
    if (n) for (i = 0, o = n.length; i < o; i++) r[n[i]] = e.css(n[i]); else r = e.css();
    t.css(r)
  }, measureString = function (e, t) {
    return e ? (Selectize.$testInput || (Selectize.$testInput = $("<span />").css({
      position: "absolute",
      width: "auto",
      padding: 0,
      whiteSpace: "pre"
    }), $("<div />").css({
      position: "absolute",
      width: 0,
      height: 0,
      overflow: "hidden"
    }).append(Selectize.$testInput).appendTo("body")), Selectize.$testInput.text(e), transferStyles(t, Selectize.$testInput, ["letterSpacing", "fontSize", "fontFamily", "fontWeight", "textTransform"]), Selectize.$testInput.width()) : 0
  }, autoGrow = function (s) {
    function e(e, t) {
      var n, i, o, r;
      t = t || {}, (e = e || window.event || {}).metaKey || e.altKey || !t.force && !1 === s.data("grow") || (i = s.val(), e.type && "keydown" === e.type.toLowerCase() && (o = 48 <= (n = e.keyCode) && n <= 57 || 65 <= n && n <= 90 || 96 <= n && n <= 111 || 186 <= n && n <= 222 || 32 === n, n === KEY_DELETE || n === KEY_BACKSPACE ? (t = getSelection(s[0])).length ? i = i.substring(0, t.start) + i.substring(t.start + t.length) : n === KEY_BACKSPACE && t.start ? i = i.substring(0, t.start - 1) + i.substring(t.start + 1) : n === KEY_DELETE && void 0 !== t.start && (i = i.substring(0, t.start) + i.substring(t.start + 1)) : o && (o = e.shiftKey, r = String.fromCharCode(e.keyCode), i += r = o ? r.toUpperCase() : r.toLowerCase())), r = s.attr("placeholder"), !i && r && (i = r), (i = measureString(i, s) + 4) !== a && (a = i, s.width(i), s.triggerHandler("resize")))
    }

    var a = null;
    s.on("keydown keyup update blur", e), e()
  }, domToString = function (e) {
    var t = document.createElement("div");
    return t.appendChild(e.cloneNode(!0)), t.innerHTML
  }, logError = function (e, t) {
    t = t || {};
    console.error("Selectize: " + e), t.explanation && (console.group && console.group(), console.error(t.explanation), console.group && console.groupEnd())
  }, Selectize = function (e, t) {
    var n, i, o = this, r = e[0];
    r.selectize = o;
    var s = window.getComputedStyle && window.getComputedStyle(r, null);
    if (s = (s = s ? s.getPropertyValue("direction") : r.currentStyle && r.currentStyle.direction) || e.parents("[dir]:first").attr("dir") || "", $.extend(o, {
      order: 0,
      settings: t,
      $input: e,
      tabIndex: e.attr("tabindex") || "",
      tagType: "select" === r.tagName.toLowerCase() ? TAG_SELECT : TAG_INPUT,
      rtl: /rtl/i.test(s),
      eventNS: ".selectize" + ++Selectize.count,
      highlightedValue: null,
      isBlurring: !1,
      isOpen: !1,
      isDisabled: !1,
      isRequired: e.is("[required]"),
      isInvalid: !1,
      isLocked: !1,
      isFocused: !1,
      isInputHidden: !1,
      isSetup: !1,
      isShiftDown: !1,
      isCmdDown: !1,
      isCtrlDown: !1,
      ignoreFocus: !1,
      ignoreBlur: !1,
      ignoreHover: !1,
      hasOptions: !1,
      currentResults: null,
      lastValue: "",
      caretPos: 0,
      loading: 0,
      loadedSearches: {},
      $activeOption: null,
      $activeItems: [],
      optgroups: {},
      options: {},
      userOptions: {},
      items: [],
      renderCache: {},
      onSearchChange: null === t.loadThrottle ? o.onSearchChange : debounce(o.onSearchChange, t.loadThrottle)
    }), o.sifter = new Sifter(this.options, {diacritics: t.diacritics}), o.settings.options) {
      for (n = 0, i = o.settings.options.length; n < i; n++) o.registerOption(o.settings.options[n]);
      delete o.settings.options
    }
    if (o.settings.optgroups) {
      for (n = 0, i = o.settings.optgroups.length; n < i; n++) o.registerOptionGroup(o.settings.optgroups[n]);
      delete o.settings.optgroups
    }
    o.settings.mode = o.settings.mode || (1 === o.settings.maxItems ? "single" : "multi"), "boolean" != typeof o.settings.hideSelected && (o.settings.hideSelected = "multi" === o.settings.mode), o.initializePlugins(o.settings.plugins), o.setupCallbacks(), o.setupTemplates(), o.setup()
  };
MicroEvent.mixin(Selectize), "undefined" != typeof MicroPlugin ? MicroPlugin.mixin(Selectize) : logError("Dependency MicroPlugin is missing", {explanation: 'Make sure you either: (1) are using the "standalone" version of Selectize, or (2) require MicroPlugin before you load Selectize.'}), $.extend(Selectize.prototype, {
  setup: function () {
    var e, t = this, n = t.settings, i = t.eventNS, o = $(window), r = $(document), s = t.$input, a = t.settings.mode,
      l = s.attr("class") || "", p = $("<div>").addClass(n.wrapperClass).addClass(l).addClass(a),
      c = $("<div>").addClass(n.inputClass).addClass("items").appendTo(p),
      u = $('<input type="text" autocomplete="new-password" autofill="no" />').appendTo(c).attr("tabindex", s.is(":disabled") ? "-1" : t.tabIndex),
      d = $(n.dropdownParent || p), h = $("<div>").addClass(n.dropdownClass).addClass(a).hide().appendTo(d),
      a = $("<div>").addClass(n.dropdownContentClass).appendTo(h);
    (d = s.attr("id")) && (u.attr("id", d + "-selectized"), $("label[for='" + d + "']").attr("for", d + "-selectized")), t.settings.copyClassesToDropdown && h.addClass(l), p.css({width: s[0].style.width}), t.plugins.names.length && (e = "plugin-" + t.plugins.names.join(" plugin-"), p.addClass(e), h.addClass(e)), (null === n.maxItems || 1 < n.maxItems) && t.tagType === TAG_SELECT && s.attr("multiple", "multiple"), t.settings.placeholder && u.attr("placeholder", n.placeholder), !t.settings.splitOn && t.settings.delimiter && (e = t.settings.delimiter.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), t.settings.splitOn = new RegExp("\\s*" + e + "+\\s*")), s.attr("autocorrect") && u.attr("autocorrect", s.attr("autocorrect")), s.attr("autocapitalize") && u.attr("autocapitalize", s.attr("autocapitalize")), u[0].type = s[0].type, t.$wrapper = p, t.$control = c, t.$control_input = u, t.$dropdown = h, t.$dropdown_content = a, h.on("mouseenter mousedown click", "[data-disabled]>[data-selectable]", function (e) {
      e.stopImmediatePropagation()
    }), h.on("mouseenter", "[data-selectable]", function () {
      return t.onOptionHover.apply(t, arguments)
    }), h.on("mousedown click", "[data-selectable]", function () {
      return t.onOptionSelect.apply(t, arguments)
    }), watchChildEvent(c, "mousedown", "*:not(input)", function () {
      return t.onItemSelect.apply(t, arguments)
    }), autoGrow(u), c.on({
      mousedown: function () {
        return t.onMouseDown.apply(t, arguments)
      }, click: function () {
        return t.onClick.apply(t, arguments)
      }
    }), u.on({
      mousedown: function (e) {
        e.stopPropagation()
      }, keydown: function () {
        return t.onKeyDown.apply(t, arguments)
      }, keyup: function () {
        return t.onKeyUp.apply(t, arguments)
      }, keypress: function () {
        return t.onKeyPress.apply(t, arguments)
      }, resize: function () {
        t.positionDropdown.apply(t, [])
      }, blur: function () {
        return t.onBlur.apply(t, arguments)
      }, focus: function () {
        return t.ignoreBlur = !1, t.onFocus.apply(t, arguments)
      }, paste: function () {
        return t.onPaste.apply(t, arguments)
      }
    }), r.on("keydown" + i, function (e) {
      t.isCmdDown = e[IS_MAC ? "metaKey" : "ctrlKey"], t.isCtrlDown = e[IS_MAC ? "altKey" : "ctrlKey"], t.isShiftDown = e.shiftKey
    }), r.on("keyup" + i, function (e) {
      e.keyCode === KEY_CTRL && (t.isCtrlDown = !1), e.keyCode === KEY_SHIFT && (t.isShiftDown = !1), e.keyCode === KEY_CMD && (t.isCmdDown = !1)
    }), r.on("mousedown" + i, function (e) {
      if (t.isFocused) {
        if (e.target === t.$dropdown[0] || e.target.parentNode === t.$dropdown[0]) return !1;
        t.$control.has(e.target).length || e.target === t.$control[0] || t.blur(e.target)
      }
    }), o.on(["scroll" + i, "resize" + i].join(" "), function () {
      t.isOpen && t.positionDropdown.apply(t, arguments)
    }), o.on("mousemove" + i, function () {
      t.ignoreHover = !1
    }), this.revertSettings = {
      $children: s.children().detach(),
      tabindex: s.attr("tabindex")
    }, s.attr("tabindex", -1).hide().after(t.$wrapper), $.isArray(n.items) && (t.setValue(n.items), delete n.items), SUPPORTS_VALIDITY_API && s.on("invalid" + i, function (e) {
      e.preventDefault(), t.isInvalid = !0, t.refreshState()
    }), t.updateOriginalInput(), t.refreshItems(), t.refreshState(), t.updatePlaceholder(), t.isSetup = !0, s.is(":disabled") && t.disable(), t.on("change", this.onChange), s.data("selectize", t), s.addClass("selectized"), t.trigger("initialize"), !0 === n.preload && t.onSearchChange("")
  }, setupTemplates: function () {
    var n = this.settings.labelField, i = this.settings.optgroupLabelField, e = {
      optgroup: function (e) {
        return '<div class="optgroup">' + e.html + "</div>"
      }, optgroup_header: function (e, t) {
        return '<div class="optgroup-header">' + t(e[i]) + "</div>"
      }, option: function (e, t) {
        return '<div class="option">' + t(e[n]) + "</div>"
      }, item: function (e, t) {
        return '<div class="item">' + t(e[n]) + "</div>"
      }, option_create: function (e, t) {
        return '<div class="create">Add <strong>' + t(e.input) + "</strong>&hellip;</div>"
      }
    };
    this.settings.render = $.extend({}, e, this.settings.render)
  }, setupCallbacks: function () {
    var e, t, n = {
      initialize: "onInitialize",
      change: "onChange",
      item_add: "onItemAdd",
      item_remove: "onItemRemove",
      clear: "onClear",
      option_add: "onOptionAdd",
      option_remove: "onOptionRemove",
      option_clear: "onOptionClear",
      optgroup_add: "onOptionGroupAdd",
      optgroup_remove: "onOptionGroupRemove",
      optgroup_clear: "onOptionGroupClear",
      dropdown_open: "onDropdownOpen",
      dropdown_close: "onDropdownClose",
      type: "onType",
      load: "onLoad",
      focus: "onFocus",
      blur: "onBlur",
      dropdown_item_activate: "onDropdownItemActivate",
      dropdown_item_deactivate: "onDropdownItemDeactivate"
    };
    for (e in n) n.hasOwnProperty(e) && (t = this.settings[n[e]]) && this.on(e, t)
  }, onClick: function (e) {
    this.isFocused && this.isOpen || (this.focus(), e.preventDefault())
  }, onMouseDown: function (e) {
    var t = this, n = e.isDefaultPrevented();
    $(e.target);
    if (t.isFocused) {
      if (e.target !== t.$control_input[0]) return "single" === t.settings.mode ? t.isOpen ? t.close() : t.open() : n || t.setActiveItem(null), !1
    } else n || window.setTimeout(function () {
      t.focus()
    }, 0)
  }, onChange: function () {
    this.$input.trigger("change")
  }, onPaste: function (e) {
    var o = this;
    o.isFull() || o.isInputHidden || o.isLocked ? e.preventDefault() : o.settings.splitOn && setTimeout(function () {
      var e = o.$control_input.val();
      if (e.match(o.settings.splitOn)) for (var t = $.trim(e).split(o.settings.splitOn), n = 0, i = t.length; n < i; n++) o.createItem(t[n])
    }, 0)
  }, onKeyPress: function (e) {
    if (this.isLocked) return e && e.preventDefault();
    var t = String.fromCharCode(e.keyCode || e.which);
    return this.settings.create && "multi" === this.settings.mode && t === this.settings.delimiter ? (this.createItem(), e.preventDefault(), !1) : void 0
  }, onKeyDown: function (e) {
    e.target, this.$control_input[0];
    var t, n = this;
    if (n.isLocked) e.keyCode !== KEY_TAB && e.preventDefault(); else {
      switch (e.keyCode) {
        case KEY_A:
          if (n.isCmdDown) return void n.selectAll();
          break;
        case KEY_ESC:
          return void (n.isOpen && (e.preventDefault(), e.stopPropagation(), n.close()));
        case KEY_N:
          if (!e.ctrlKey || e.altKey) break;
        case KEY_DOWN:
          return !n.isOpen && n.hasOptions ? n.open() : n.$activeOption && (n.ignoreHover = !0, (t = n.getAdjacentOption(n.$activeOption, 1)).length && n.setActiveOption(t, !0, !0)), void e.preventDefault();
        case KEY_P:
          if (!e.ctrlKey || e.altKey) break;
        case KEY_UP:
          return n.$activeOption && (n.ignoreHover = !0, (t = n.getAdjacentOption(n.$activeOption, -1)).length && n.setActiveOption(t, !0, !0)), void e.preventDefault();
        case KEY_RETURN:
          return void (n.isOpen && n.$activeOption && (n.onOptionSelect({currentTarget: n.$activeOption}), e.preventDefault()));
        case KEY_LEFT:
          return void n.advanceSelection(-1, e);
        case KEY_RIGHT:
          return void n.advanceSelection(1, e);
        case KEY_TAB:
          return n.settings.selectOnTab && n.isOpen && n.$activeOption && (n.onOptionSelect({currentTarget: n.$activeOption}), n.isFull() || e.preventDefault()), void (n.settings.create && n.createItem() && e.preventDefault());
        case KEY_BACKSPACE:
        case KEY_DELETE:
          return void n.deleteSelection(e)
      }
      !n.isFull() && !n.isInputHidden || (IS_MAC ? e.metaKey : e.ctrlKey) || e.preventDefault()
    }
  }, onKeyUp: function (e) {
    var t = this;
    if (t.isLocked) return e && e.preventDefault();
    e = t.$control_input.val() || "";
    t.lastValue !== e && (t.lastValue = e, t.onSearchChange(e), t.refreshOptions(), t.trigger("type", e))
  }, onSearchChange: function (t) {
    var n = this, i = n.settings.load;
    i && (n.loadedSearches.hasOwnProperty(t) || (n.loadedSearches[t] = !0, n.load(function (e) {
      i.apply(n, [t, e])
    })))
  }, onFocus: function (e) {
    var t = this, n = t.isFocused;
    if (t.isDisabled) return t.blur(), e && e.preventDefault(), !1;
    t.ignoreFocus || (t.isFocused = !0, "focus" === t.settings.preload && t.onSearchChange(""), n || t.trigger("focus"), t.$activeItems.length || (t.showInput(), t.setActiveItem(null), t.refreshOptions(!!t.settings.openOnFocus)), t.refreshState())
  }, onBlur: function (e, t) {
    var n = this;
    if (n.isFocused && (n.isFocused = !1, !n.ignoreFocus)) {
      if (!n.ignoreBlur && document.activeElement === n.$dropdown_content[0]) return n.ignoreBlur = !0, void n.onFocus(e);
      e = function () {
        n.close(), n.setTextboxValue(""), n.setActiveItem(null), n.setActiveOption(null), n.setCaret(n.items.length), n.refreshState(), t && t.focus && t.focus(), n.isBlurring = !1, n.ignoreFocus = !1, n.trigger("blur")
      };
      n.isBlurring = !0, n.ignoreFocus = !0, n.settings.create && n.settings.createOnBlur ? n.createItem(null, !1, e) : e()
    }
  }, onOptionHover: function (e) {
    this.ignoreHover || this.setActiveOption(e.currentTarget, !1)
  }, onOptionSelect: function (e) {
    var t, n = this;
    e.preventDefault && (e.preventDefault(), e.stopPropagation()), (t = $(e.currentTarget)).hasClass("create") ? n.createItem(null, function () {
      n.settings.closeAfterSelect && n.close()
    }) : void 0 !== (t = t.attr("data-value")) && (n.lastQuery = null, n.setTextboxValue(""), n.addItem(t), n.settings.closeAfterSelect ? n.close() : !n.settings.hideSelected && e.type && /mouse/.test(e.type) && n.setActiveOption(n.getOption(t)))
  }, onItemSelect: function (e) {
    this.isLocked || "multi" === this.settings.mode && (e.preventDefault(), this.setActiveItem(e.currentTarget, e))
  }, load: function (e) {
    var t = this, n = t.$wrapper.addClass(t.settings.loadingClass);
    t.loading++, e.apply(t, [function (e) {
      t.loading = Math.max(t.loading - 1, 0), e && e.length && (t.addOption(e), t.refreshOptions(t.isFocused && !t.isInputHidden)), t.loading || n.removeClass(t.settings.loadingClass), t.trigger("load", e)
    }])
  }, setTextboxValue: function (e) {
    var t = this.$control_input;
    t.val() !== e && (t.val(e).triggerHandler("update"), this.lastValue = e)
  }, getValue: function () {
    return this.tagType === TAG_SELECT && this.$input.attr("multiple") ? this.items : this.items.join(this.settings.delimiter)
  }, setValue: function (e, t) {
    debounce_events(this, t ? [] : ["change"], function () {
      this.clear(t), this.addItems(e, t)
    })
  }, setActiveItem: function (e, t) {
    var n, i, o, r, s, a, l = this;
    if ("single" !== l.settings.mode) {
      if (!(e = $(e)).length) return $(l.$activeItems).removeClass("active"), l.$activeItems = [], void (l.isFocused && l.showInput());
      if ("mousedown" === (i = t && t.type.toLowerCase()) && l.isShiftDown && l.$activeItems.length) {
        for (a = l.$control.children(".active:last"), o = Array.prototype.indexOf.apply(l.$control[0].childNodes, [a[0]]), (r = Array.prototype.indexOf.apply(l.$control[0].childNodes, [e[0]])) < o && (a = o, o = r, r = a), n = o; n <= r; n++) s = l.$control[0].childNodes[n], -1 === l.$activeItems.indexOf(s) && ($(s).addClass("active"), l.$activeItems.push(s));
        t.preventDefault()
      } else "mousedown" === i && l.isCtrlDown || "keydown" === i && this.isShiftDown ? e.hasClass("active") ? (i = l.$activeItems.indexOf(e[0]), l.$activeItems.splice(i, 1), e.removeClass("active")) : l.$activeItems.push(e.addClass("active")[0]) : ($(l.$activeItems).removeClass("active"), l.$activeItems = [e.addClass("active")[0]]);
      l.hideInput(), this.isFocused || l.focus()
    }
  }, setActiveOption: function (e, t, n) {
    var i, o, r, s, a = this;
    a.$activeOption && (a.$activeOption.removeClass("active"), a.trigger("dropdown_item_deactivate", a.$activeOption.attr("data-value"))), a.$activeOption = null, (e = $(e)).length && (a.$activeOption = e.addClass("active"), a.isOpen && a.trigger("dropdown_item_activate", a.$activeOption.attr("data-value")), !t && isset(t) || (i = a.$dropdown_content.height(), o = a.$activeOption.outerHeight(!0), t = a.$dropdown_content.scrollTop() || 0, e = (s = r = a.$activeOption.offset().top - a.$dropdown_content.offset().top + t) - i + o, i + t < r + o ? a.$dropdown_content.stop().animate({scrollTop: e}, n ? a.settings.scrollDuration : 0) : r < t && a.$dropdown_content.stop().animate({scrollTop: s}, n ? a.settings.scrollDuration : 0)))
  }, selectAll: function () {
    var e = this;
    "single" !== e.settings.mode && (e.$activeItems = Array.prototype.slice.apply(e.$control.children(":not(input)").addClass("active")), e.$activeItems.length && (e.hideInput(), e.close()), e.focus())
  }, hideInput: function () {
    this.setTextboxValue(""), this.$control_input.css({
      opacity: 0,
      position: "absolute",
      left: this.rtl ? 1e4 : -1e4
    }), this.isInputHidden = !0
  }, showInput: function () {
    this.$control_input.css({opacity: 1, position: "relative", left: 0}), this.isInputHidden = !1
  }, focus: function () {
    var e = this;
    e.isDisabled || (e.ignoreFocus = !0, e.$control_input[0].focus(), window.setTimeout(function () {
      e.ignoreFocus = !1, e.onFocus()
    }, 0))
  }, blur: function (e) {
    this.$control_input[0].blur(), this.onBlur(null, e)
  }, getScoreFunction: function (e) {
    return this.sifter.getScoreFunction(e, this.getSearchOptions())
  }, getSearchOptions: function () {
    var e = this.settings, t = e.sortField;
    return "string" == typeof t && (t = [{field: t}]), {
      fields: e.searchField,
      conjunction: e.searchConjunction,
      sort: t,
      nesting: e.nesting
    }
  }, search: function (e) {
    var t, n, i, o = this, r = o.settings, s = this.getSearchOptions();
    if (r.score && "function" != typeof (i = o.settings.score.apply(this, [e]))) throw new Error('Selectize "score" setting must be a function that returns a function');
    if (e !== o.lastQuery ? (o.lastQuery = e, n = o.sifter.search(e, $.extend(s, {score: i})), o.currentResults = n) : n = $.extend(!0, {}, o.currentResults), r.hideSelected) for (t = n.items.length - 1; 0 <= t; t--) -1 !== o.items.indexOf(hash_key(n.items[t].id)) && n.items.splice(t, 1);
    return n
  }, refreshOptions: function (e) {
    var t, n, i, o, r, s, a, l, p, c, u, d, h, g;
    void 0 === e && (e = !0);
    var f = this, v = $.trim(f.$control_input.val()), m = f.search(v), y = f.$dropdown_content,
      C = f.$activeOption && hash_key(f.$activeOption.attr("data-value")), w = m.items.length;
    for ("number" == typeof f.settings.maxOptions && (w = Math.min(w, f.settings.maxOptions)), o = {}, r = [], t = 0; t < w; t++) for (s = f.options[m.items[t].id], a = f.render("option", s), l = s[f.settings.optgroupField] || "", n = 0, i = (p = $.isArray(l) ? l : [l]) && p.length; n < i; n++) l = p[n], f.optgroups.hasOwnProperty(l) || (l = ""), o.hasOwnProperty(l) || (o[l] = document.createDocumentFragment(), r.push(l)), o[l].appendChild(a);
    for (this.settings.lockOptgroupOrder && r.sort(function (e, t) {
      return (f.optgroups[e].$order || 0) - (f.optgroups[t].$order || 0)
    }), c = document.createDocumentFragment(), t = 0, w = r.length; t < w; t++) l = r[t], f.optgroups.hasOwnProperty(l) && o[l].childNodes.length ? ((u = document.createDocumentFragment()).appendChild(f.render("optgroup_header", f.optgroups[l])), u.appendChild(o[l]), c.appendChild(f.render("optgroup", $.extend({}, f.optgroups[l], {
      html: domToString(u),
      dom: u
    })))) : c.appendChild(o[l]);
    if (y.html(c), f.settings.highlight && (y.removeHighlight(), m.query.length && m.tokens.length)) for (t = 0, w = m.tokens.length; t < w; t++) highlight(y, m.tokens[t].regex);
    if (!f.settings.hideSelected) for (f.$dropdown.find(".selected").removeClass("selected"), t = 0, w = f.items.length; t < w; t++) f.getOption(f.items[t]).addClass("selected");
    (d = f.canCreate(v)) && (y.prepend(f.render("option_create", {input: v})), g = $(y[0].childNodes[0])), f.hasOptions = 0 < m.items.length || d, f.hasOptions ? (0 < m.items.length ? ((C = C && f.getOption(C)) && C.length ? h = C : "single" === f.settings.mode && f.items.length && (h = f.getOption(f.items[0])), h && h.length || (h = g && !f.settings.addPrecedence ? f.getAdjacentOption(g, 1) : y.find("[data-selectable]:first"))) : h = g, f.setActiveOption(h), e && !f.isOpen && f.open()) : (f.setActiveOption(null), e && f.isOpen && f.close())
  }, addOption: function (e) {
    var t, n, i, o = this;
    if ($.isArray(e)) for (t = 0, n = e.length; t < n; t++) o.addOption(e[t]); else (i = o.registerOption(e)) && (o.userOptions[i] = !0, o.lastQuery = null, o.trigger("option_add", i, e))
  }, registerOption: function (e) {
    var t = hash_key(e[this.settings.valueField]);
    return null != t && !this.options.hasOwnProperty(t) && (e.$order = e.$order || ++this.order, this.options[t] = e, t)
  }, registerOptionGroup: function (e) {
    var t = hash_key(e[this.settings.optgroupValueField]);
    return !!t && (e.$order = e.$order || ++this.order, this.optgroups[t] = e, t)
  }, addOptionGroup: function (e, t) {
    t[this.settings.optgroupValueField] = e, (e = this.registerOptionGroup(t)) && this.trigger("optgroup_add", e, t)
  }, removeOptionGroup: function (e) {
    this.optgroups.hasOwnProperty(e) && (delete this.optgroups[e], this.renderCache = {}, this.trigger("optgroup_remove", e))
  }, clearOptionGroups: function () {
    this.optgroups = {}, this.renderCache = {}, this.trigger("optgroup_clear")
  }, updateOption: function (e, t) {
    var n, i, o, r = this;
    if (e = hash_key(e), n = hash_key(t[r.settings.valueField]), null !== e && r.options.hasOwnProperty(e)) {
      if ("string" != typeof n) throw new Error("Value must be set in option data");
      o = r.options[e].$order, n !== e && (delete r.options[e], -1 !== (i = r.items.indexOf(e)) && r.items.splice(i, 1, n)), t.$order = t.$order || o, r.options[n] = t, i = r.renderCache.item, o = r.renderCache.option, i && (delete i[e], delete i[n]), o && (delete o[e], delete o[n]), -1 !== r.items.indexOf(n) && (e = r.getItem(e), t = $(r.render("item", t)), e.hasClass("active") && t.addClass("active"), e.replaceWith(t)), r.lastQuery = null, r.isOpen && r.refreshOptions(!1)
    }
  }, removeOption: function (e, t) {
    var n = this;
    e = hash_key(e);
    var i = n.renderCache.item, o = n.renderCache.option;
    i && delete i[e], o && delete o[e], delete n.userOptions[e], delete n.options[e], n.lastQuery = null, n.trigger("option_remove", e), n.removeItem(e, t)
  }, clearOptions: function (e) {
    var n = this;
    n.loadedSearches = {}, n.userOptions = {}, n.renderCache = {};
    var i = n.options;
    $.each(n.options, function (e, t) {
      -1 == n.items.indexOf(e) && delete i[e]
    }), n.options = n.sifter.items = i, n.lastQuery = null, n.trigger("option_clear"), n.clear(e)
  }, getOption: function (e) {
    return this.getElementWithValue(e, this.$dropdown_content.find("[data-selectable]"))
  }, getAdjacentOption: function (e, t) {
    var n = this.$dropdown.find("[data-selectable]"), t = n.index(e) + t;
    return 0 <= t && t < n.length ? n.eq(t) : $()
  }, getElementWithValue: function (e, t) {
    if (null != (e = hash_key(e))) for (var n = 0, i = t.length; n < i; n++) if (t[n].getAttribute("data-value") === e) return $(t[n]);
    return $()
  }, getItem: function (e) {
    return this.getElementWithValue(e, this.$control.children())
  }, addItems: function (e, t) {
    this.buffer = document.createDocumentFragment();
    for (var n = this.$control[0].childNodes, i = 0; i < n.length; i++) this.buffer.appendChild(n[i]);
    for (var o = $.isArray(e) ? e : [e], i = 0, r = o.length; i < r; i++) this.isPending = i < r - 1, this.addItem(o[i], t);
    e = this.$control[0];
    e.insertBefore(this.buffer, e.firstChild), this.buffer = null
  }, addItem: function (r, s) {
    debounce_events(this, s ? [] : ["change"], function () {
      var e, t, n, i = this, o = i.settings.mode;
      r = hash_key(r), -1 === i.items.indexOf(r) ? i.options.hasOwnProperty(r) && ("single" === o && i.clear(s), "multi" === o && i.isFull() || (e = $(i.render("item", i.options[r])), n = i.isFull(), i.items.splice(i.caretPos, 0, r), i.insertAtCaret(e), i.isPending && (n || !i.isFull()) || i.refreshState(), i.isSetup && (t = i.$dropdown_content.find("[data-selectable]"), i.isPending || (n = i.getOption(r), n = i.getAdjacentOption(n, 1).attr("data-value"), i.refreshOptions(i.isFocused && "single" !== o), n && i.setActiveOption(i.getOption(n))), !t.length || i.isFull() ? i.close() : i.isPending || i.positionDropdown(), i.updatePlaceholder(), i.trigger("item_add", r, e), i.isPending || i.updateOriginalInput({silent: s})))) : "single" === o && i.close()
    })
  }, removeItem: function (e, t) {
    var n, i, o = this, r = e instanceof $ ? e : o.getItem(e);
    e = hash_key(r.attr("data-value")), -1 !== (n = o.items.indexOf(e)) && (r.remove(), r.hasClass("active") && (i = o.$activeItems.indexOf(r[0]), o.$activeItems.splice(i, 1)), o.items.splice(n, 1), o.lastQuery = null, !o.settings.persist && o.userOptions.hasOwnProperty(e) && o.removeOption(e, t), n < o.caretPos && o.setCaret(o.caretPos - 1), o.refreshState(), o.updatePlaceholder(), o.updateOriginalInput({silent: t}), o.positionDropdown(), o.trigger("item_remove", e, r))
  }, createItem: function (e, n) {
    var i = this, o = i.caretPos;
    e = e || $.trim(i.$control_input.val() || "");
    var r = arguments[arguments.length - 1];
    if ("function" != typeof r && (r = function () {
    }), "boolean" != typeof n && (n = !0), !i.canCreate(e)) return r(), !1;
    i.lock();
    var t = "function" == typeof i.settings.create ? this.settings.create : function (e) {
      var t = {};
      return t[i.settings.labelField] = e, t[i.settings.valueField] = e, t
    }, s = once(function (e) {
      if (i.unlock(), !e || "object" != typeof e) return r();
      var t = hash_key(e[i.settings.valueField]);
      if ("string" != typeof t) return r();
      i.setTextboxValue(""), i.addOption(e), i.setCaret(o), i.addItem(t), i.refreshOptions(n && "single" !== i.settings.mode), r(e)
    }), t = t.apply(this, [e, s]);
    return void 0 !== t && s(t), !0
  }, refreshItems: function () {
    this.lastQuery = null, this.isSetup && this.addItem(this.items), this.refreshState(), this.updateOriginalInput()
  }, refreshState: function () {
    this.refreshValidityState(), this.refreshClasses()
  }, refreshValidityState: function () {
    if (!this.isRequired) return !1;
    var e = !this.items.length;
    this.isInvalid = e, this.$control_input.prop("required", e), this.$input.prop("required", !e)
  }, refreshClasses: function () {
    var e = this, t = e.isFull(), n = e.isLocked;
    e.$wrapper.toggleClass("rtl", e.rtl), e.$control.toggleClass("focus", e.isFocused).toggleClass("disabled", e.isDisabled).toggleClass("required", e.isRequired).toggleClass("invalid", e.isInvalid).toggleClass("locked", n).toggleClass("full", t).toggleClass("not-full", !t).toggleClass("input-active", e.isFocused && !e.isInputHidden).toggleClass("dropdown-active", e.isOpen).toggleClass("has-options", !$.isEmptyObject(e.options)).toggleClass("has-items", 0 < e.items.length), e.$control_input.data("grow", !t && !n)
  }, isFull: function () {
    return null !== this.settings.maxItems && this.items.length >= this.settings.maxItems
  }, updateOriginalInput: function (e) {
    var t, n, i, o = this;
    if (e = e || {}, o.tagType === TAG_SELECT) {
      for (i = [], t = 0, n = o.items.length; t < n; t++) {
        var r = o.options[o.items[t]].code || "", s = o.options[o.items[t]][o.settings.labelField] || "";
        i.push('<option data-code="' + escape_html(o.getValue()) + '" value="' + escape_html(r) + '" selected="selected">' + escape_html(s) + "</option>")
      }
      i.length || this.$input.attr("multiple") || i.push('<option value="" selected="selected"></option>'), o.$input.html(i.join(""))
    } else o.$input.val(o.getValue()), o.$input.attr("value", o.$input.val());
    o.isSetup && (e.silent || o.trigger("change", o.$input.val()))
  }, updatePlaceholder: function () {
    var e;
    this.settings.placeholder && (e = this.$control_input, this.items.length ? e.removeAttr("placeholder") : e.attr("placeholder", this.settings.placeholder), e.triggerHandler("update", {force: !0}))
  }, open: function () {
    var e = this;
    e.isLocked || e.isOpen || "multi" === e.settings.mode && e.isFull() || (e.focus(), e.isOpen = !0, e.refreshState(), e.$dropdown.css({
      visibility: "hidden",
      display: "block"
    }), e.positionDropdown(), e.$dropdown.css({visibility: "visible"}), e.trigger("dropdown_open", e.$dropdown))
  }, close: function () {
    var e = this, t = e.isOpen;
    "single" === e.settings.mode && e.items.length && (e.hideInput(), e.isBlurring || e.$control_input.blur()), e.isOpen = !1, e.$dropdown.hide(), e.setActiveOption(null), e.refreshState(), t && e.trigger("dropdown_close", e.$dropdown)
  }, positionDropdown: function () {
    var e = this.$control, t = "body" === this.settings.dropdownParent ? e.offset() : e.position();
    t.top += e.outerHeight(!0), this.$dropdown.css({width: e[0].getBoundingClientRect().width, top: t.top, left: t.left})
  }, clear: function (e) {
    var t = this;
    t.items.length && (t.$control.children(":not(input)").remove(), t.items = [], t.lastQuery = null, t.setCaret(0), t.setActiveItem(null), t.updatePlaceholder(), t.updateOriginalInput({silent: e}), t.refreshState(), t.showInput(), t.trigger("clear"))
  }, insertAtCaret: function (e) {
    var t = Math.min(this.caretPos, this.items.length), n = e[0], e = this.buffer || this.$control[0];
    0 === t ? e.insertBefore(n, e.firstChild) : e.insertBefore(n, e.childNodes[t]), this.setCaret(t + 1)
  }, deleteSelection: function (e) {
    var t, n, i, o, r, s, a = this, l = e && e.keyCode === KEY_BACKSPACE ? -1 : 1, p = getSelection(a.$control_input[0]);
    if (a.$activeOption && !a.settings.hideSelected && (o = a.getAdjacentOption(a.$activeOption, -1).attr("data-value")), i = [], a.$activeItems.length) {
      for (s = a.$control.children(".active:" + (0 < l ? "last" : "first")), s = a.$control.children(":not(input)").index(s), 0 < l && s++, t = 0, n = a.$activeItems.length; t < n; t++) i.push($(a.$activeItems[t]).attr("data-value"));
      e && (e.preventDefault(), e.stopPropagation())
    } else (a.isFocused || "single" === a.settings.mode) && a.items.length && (l < 0 && 0 === p.start && 0 === p.length ? i.push(a.items[a.caretPos - 1]) : 0 < l && p.start === a.$control_input.val().length && i.push(a.items[a.caretPos]));
    if (!i.length || "function" == typeof a.settings.onDelete && !1 === a.settings.onDelete.apply(a, [i])) return !1;
    for (void 0 !== s && a.setCaret(s); i.length;) a.removeItem(i.pop());
    return a.showInput(), a.positionDropdown(), a.refreshOptions(!0), o && (r = a.getOption(o)).length && a.setActiveOption(r), !0
  }, advanceSelection: function (e, t) {
    var n, i, o, r = this;
    0 !== e && (r.rtl && (e *= -1), o = 0 < e ? "last" : "first", n = getSelection(r.$control_input[0]), r.isFocused && !r.isInputHidden ? (i = r.$control_input.val().length, (e < 0 ? 0 !== n.start || 0 !== n.length : n.start !== i) || i || r.advanceCaret(e, t)) : (o = r.$control.children(".active:" + o)).length && (o = r.$control.children(":not(input)").index(o), r.setActiveItem(null), r.setCaret(0 < e ? o + 1 : o)))
  }, advanceCaret: function (e, t) {
    var n, i = this;
    0 !== e && (n = 0 < e ? "next" : "prev", i.isShiftDown ? (n = i.$control_input[n]()).length && (i.hideInput(), i.setActiveItem(n), t && t.preventDefault()) : i.setCaret(i.caretPos + e))
  }, setCaret: function (e) {
    var t = this;
    if (e = "single" === t.settings.mode ? t.items.length : Math.max(0, Math.min(t.items.length, e)), !t.isPending) for (var n, i = t.$control.children(":not(input)"), o = 0, r = i.length; o < r; o++) n = $(i[o]).detach(), o < e ? t.$control_input.before(n) : t.$control.append(n);
    t.caretPos = e
  }, lock: function () {
    this.close(), this.isLocked = !0, this.refreshState()
  }, unlock: function () {
    this.isLocked = !1, this.refreshState()
  }, disable: function () {
    this.$input.prop("disabled", !0), this.$control_input.prop("disabled", !0).prop("tabindex", -1), this.isDisabled = !0, this.lock()
  }, enable: function () {
    var e = this;
    e.$input.prop("disabled", !1), e.$control_input.prop("disabled", !1).prop("tabindex", e.tabIndex), e.isDisabled = !1, e.unlock()
  }, destroy: function () {
    var e = this, t = e.eventNS, n = e.revertSettings;
    e.trigger("destroy"), e.off(), e.$wrapper.remove(), e.$dropdown.remove(), e.$input.html("").append(n.$children).removeAttr("tabindex").removeClass("selectized").attr({tabindex: n.tabindex}).show(), e.$control_input.removeData("grow"), e.$input.removeData("selectize"), 0 == --Selectize.count && Selectize.$testInput && (Selectize.$testInput.remove(), Selectize.$testInput = void 0), $(window).off(t), $(document).off(t), $(document.body).off(t), delete e.$input[0].selectize
  }, render: function (e, t) {
    var n, i, o = "", r = !1, s = this;
    return "option" !== e && "item" !== e || (r = !!(n = hash_key(t[s.settings.valueField]))), r && (isset(s.renderCache[e]) || (s.renderCache[e] = {}), s.renderCache[e].hasOwnProperty(n)) ? s.renderCache[e][n] : (o = $(s.settings.render[e].apply(this, [t, escape_html])), "option" === e || "option_create" === e ? t[s.settings.disabledField] || o.attr("data-selectable", "") : "optgroup" === e && (i = t[s.settings.optgroupValueField] || "", o.attr("data-group", i), t[s.settings.disabledField] && o.attr("data-disabled", "")), "option" !== e && "item" !== e || o.attr("data-value", n || ""), r && (s.renderCache[e][n] = o[0]), o[0])
  }, clearCache: function (e) {
    void 0 === e ? this.renderCache = {} : delete this.renderCache[e]
  }, canCreate: function (e) {
    if (!this.settings.create) return !1;
    var t = this.settings.createFilter;
    return e.length && ("function" != typeof t || t.apply(this, [e])) && ("string" != typeof t || new RegExp(t).test(e)) && (!(t instanceof RegExp) || t.test(e))
  }
}), Selectize.count = 0, Selectize.defaults = {
  options: [],
  optgroups: [],
  plugins: [],
  delimiter: ",",
  splitOn: null,
  persist: !0,
  diacritics: !0,
  create: !1,
  createOnBlur: !1,
  createFilter: null,
  highlight: !0,
  openOnFocus: !0,
  maxOptions: 1e3,
  maxItems: null,
  hideSelected: null,
  addPrecedence: !1,
  selectOnTab: !0,
  preload: !1,
  allowEmptyOption: !1,
  closeAfterSelect: !1,
  scrollDuration: 60,
  loadThrottle: 300,
  loadingClass: "loading",
  dataAttr: "data-data",
  optgroupField: "optgroup",
  valueField: "value",
  labelField: "text",
  disabledField: "disabled",
  optgroupLabelField: "label",
  optgroupValueField: "value",
  lockOptgroupOrder: !1,
  sortField: "$order",
  searchField: ["text"],
  searchConjunction: "and",
  mode: null,
  wrapperClass: "selectize-control",
  inputClass: "selectize-input",
  dropdownClass: "selectize-dropdown",
  dropdownContentClass: "selectize-dropdown-content",
  dropdownParent: null,
  copyClassesToDropdown: !0,
  render: {}
}, $.fn.selectize = function (i) {
  function o(e, s) {
    function a(e) {
      return "string" == typeof (e = u && e.attr(u)) && e.length ? JSON.parse(e) : null
    }

    function l(e, t) {
      e = $(e);
      var n, i = hash_key(e.val());
      (i || c.allowEmptyOption) && (p.hasOwnProperty(i) ? t && ((n = p[i][f]) ? $.isArray(n) ? n.push(t) : p[i][f] = [n, t] : p[i][f] = t) : ((n = a(e) || {})[d] = n[d] || e.text(), n[h] = n[h] || i, n[g] = n[g] || e.prop("disabled"), n[f] = n[f] || t, p[i] = n, r.push(n), e.is(":selected") && s.items.push(i)))
    }

    var t, n, i, o, r = s.options, p = {};
    for (s.maxItems = e.attr("multiple") ? null : 1, t = 0, n = (o = e.children()).length; t < n; t++) "optgroup" === (i = o[t].tagName.toLowerCase()) ? function (e) {
      var t, n, i, o, r;
      for ((i = (e = $(e)).attr("label")) && ((o = a(e) || {})[v] = i, o[m] = i, o[g] = e.prop("disabled"), s.optgroups.push(o)), t = 0, n = (r = $("option", e)).length; t < n; t++) l(r[t], i)
    }(o[t]) : "option" === i && l(o[t])
  }

  var r = $.fn.selectize.defaults, c = $.extend({}, r, i), u = c.dataAttr, d = c.labelField, h = c.valueField, g = c.disabledField,
    f = c.optgroupField, v = c.optgroupLabelField, m = c.optgroupValueField;
  return this.each(function () {
    var e, t, n;
    this.selectize || (e = $(this), t = this.tagName.toLowerCase(), (n = e.attr("placeholder") || e.attr("data-placeholder")) || c.allowEmptyOption || (n = e.children('option[value=""]').text()), ("select" === t ? o : function (e, t) {
      var n, i, o, r, s = e.attr(u);
      if (s) for (t.options = JSON.parse(s), n = 0, i = t.options.length; n < i; n++) t.items.push(t.options[n][h]); else {
        e = $.trim(e.val() || "");
        if (c.allowEmptyOption || e.length) {
          for (n = 0, i = (o = e.split(c.delimiter)).length; n < i; n++) (r = {})[d] = o[n], r[h] = o[n], t.options.push(r);
          t.items = o
        }
      }
    })(e, n = {placeholder: n, options: [], optgroups: [], items: []}), new Selectize(e, $.extend(!0, {}, r, n, i)))
  })
}, $.fn.selectize.defaults = Selectize.defaults, $.fn.selectize.support = {validity: SUPPORTS_VALIDITY_API};
