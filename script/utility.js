System.register([], function (exports_1, context_1) {
    "use strict";
    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __moduleName = context_1 && context_1.id;
    function getJson(url) {
        return $.getJSON(url).then(function (data) {
            return data;
        }, function (xhr, status, err) {
            return new NetError(err || status, xhr.responseURL);
        });
    }
    exports_1("getJson", getJson);
    function htmlEscape(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    exports_1("htmlEscape", htmlEscape);
    function formatString() {
        var content = arguments[0];
        for (var i = 1; i < arguments.length; i++) {
            var replacement = "{" + (i - 1) + "}";
            content = content.replace(replacement, arguments[i]);
        }
        return content;
    }
    exports_1("formatString", formatString);
    var NetError, ResourceMissingError;
    return {
        setters: [],
        execute: function () {
            NetError = (function (_super) {
                __extends(NetError, _super);
                function NetError(status, url) {
                    var _this = _super.call(this, "Network error when requesting \"" + url + "\": " + status + ".") || this;
                    _this.status = status;
                    _this.url = url;
                    return _this;
                }
                return NetError;
            }(Error));
            exports_1("NetError", NetError);
            ResourceMissingError = (function (_super) {
                __extends(ResourceMissingError, _super);
                function ResourceMissingError(resourceId, resourceType) {
                    var _this = _super.call(this, "Cannot find the specified " + resourceType + ": \"" + resourceId + "\".") || this;
                    _this.resourceId = resourceId;
                    _this.resourceType = resourceType;
                    return _this;
                }
                return ResourceMissingError;
            }(Error));
            exports_1("ResourceMissingError", ResourceMissingError);
        }
    };
});

//# sourceMappingURL=utility.js.map
