!function (e, t)
{
    "object" == typeof exports && "object" == typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define([], t) : "object" == typeof exports ? exports.VideosLoaded = t() : e.VideosLoaded = t()
}(window, function ()
{
    return function (e)
    {
        var t = {};

        function o(n)
        {
            if (t[n])
            {
                return t[n].exports;
            }
            var r = t[n] = {i: n, l: !1, exports: {}};
            return e[n].call(r.exports, r, r.exports, o), r.l = !0, r.exports
        }

        return o.m = e, o.c = t, o.d = function (e, t, n)
        {
            o.o(e, t) || Object.defineProperty(e, t, {configurable: !1, enumerable: !0, get: n})
        }, o.r = function (e)
        {
            Object.defineProperty(e, "__esModule", {value: !0})
        }, o.n = function (e)
        {
            var t = e && e.__esModule ? function ()
            {
                return e.default
            } : function ()
            {
                return e
            };
            return o.d(t, "a", t), t
        }, o.o = function (e, t)
        {
            return Object.prototype.hasOwnProperty.call(e, t)
        }, o.p = "", o(o.s = 0)
    }([function (e, t, o)
    {
        "use strict";
        var n = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (e)
        {
            return typeof e
        } : function (e)
        {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }, r = function ()
        {
            function e(e, t)
            {
                for (var o = 0; o < t.length; o++)
                {
                    var n = t[o];
                    n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n)
                }
            }

            return function (t, o, n)
            {
                return o && e(t.prototype, o), n && e(t, n), t
            }
        }();
        var i = function ()
        {
            function e(t, o, r)
            {
                return function (e, t)
                {
                    if (!(e instanceof t))
                    {
                        throw new TypeError("Cannot call a class as a function")
                    }
                }(this, e), "object" != (void 0 === o ? "undefined" : n(o)) || r ? this.callback = o : (r = o, this.callback = null), this.options = Object.assign({
                    timeout: 0,
                    readyState: 4
                }, r), this.element = "string" == typeof t ? document.querySelectorAll(t) : t, this.elements = this._nodeListToArray(this.element), this.videos = [], this.addVideos(), this.load()
            }

            return r(e, [{
                key: "_nodeListToArray", value: function (e)
                {
                    return Array.isArray(e) ? e : e instanceof NodeList ? Array.prototype.slice.call(e) : [e]
                }
            }, {
                key: "addVideos", value: function ()
                {
                    var e = this;
                    this.elements.forEach(function (t)
                    {
                        "VIDEO" == t.nodeName && e.videos.push(t), t.querySelectorAll("video").forEach(function (t)
                        {
                            e.videos.push(t)
                        })
                    })
                }
            }, {
                key: "load", value: function ()
                {
                    var e = this, t = [], o = function (t)
                    {
                        return t.readyState >= e.options.readyState
                    };
                    this.videos.forEach(function (e)
                    {
                        t.push(new Promise(function (t)
                        {
                            if (o(e))
                            {
                                return t();
                            }
                            e.addEventListener("loadeddata", function ()
                            {
                                if (o(e))
                                {
                                    return t()
                                }
                            }, !1)
                        }))
                    });
                    var n = Promise.all(t);
                    if (this.options.timeout > 0)
                    {
                        var r = new Promise(function (t, o)
                        {
                            var n = setTimeout(function ()
                            {
                                clearTimeout(n), o("Load timed out (" + e.options.timeout + "ms)")
                            }, e.options.timeout)
                        });
                        n = Promise.race([n, r])
                    }
                    return n.then(function ()
                    {
                        return "function" == typeof e.callback && e.callback.call(null, e.videos), Promise.resolve(e.videos)
                    })
                }
            }], [{
                key: "bindToJQuery", value: function (t)
                {
                    (t = t || window.jQuery) && (t.fn.videosLoaded = function (t, o)
                    {
                        return new e(this.get(), t, o)
                    })
                }
            }]), e
        }();
        i.bindToJQuery(), e.exports = i
    }])
});
