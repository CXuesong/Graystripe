System.register(["./utility"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function initializeAsync() {
        return Utility.getJson("data/locale.json").done(function (json) { locale = json; });
    }
    exports_1("initializeAsync", initializeAsync);
    function fallbackLanguageTag(languageTag) {
        var index = languageTag.lastIndexOf("-");
        if (index <= 0)
            return "";
        return languageTag.substr(0, index);
    }
    exports_1("fallbackLanguageTag", fallbackLanguageTag);
    function getSurrogateLanguage(languageTag) {
        return locale.surrogates[languageTag] || null;
    }
    exports_1("getSurrogateLanguage", getSurrogateLanguage);
    function LanguageTagEquals(x, y) {
        return x.toLowerCase() === y.toLowerCase();
    }
    exports_1("LanguageTagEquals", LanguageTagEquals);
    function FindLanguageTag(x, tags) {
        for (var i = 0; i < tags.length; i++) {
            if (LanguageTagEquals(x, tags[i]))
                return tags[i];
        }
        return null;
    }
    exports_1("FindLanguageTag", FindLanguageTag);
    var Utility, locale;
    return {
        setters: [
            function (Utility_1) {
                Utility = Utility_1;
            }
        ],
        execute: function () {
        }
    };
});

//# sourceMappingURL=locale.js.map
