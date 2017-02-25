System.register(["./utility", "./localization"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function showError(err) {
        toastr.error(Utility.htmlEscape(err.toString()));
    }
    exports_1("showError", showError);
    function mdlSelectNotifyChanged(container) {
        $(".mdl-selectfield", container).each(function () {
            var msf = this.MaterialSelectfield;
            if (!msf)
                return;
            var sel = msf.select_.selectedIndex;
            msf.selectedOptionValue_.textContent = sel >= 0 ? msf.select_.options[sel].text : null;
        });
    }
    exports_1("mdlSelectNotifyChanged", mdlSelectNotifyChanged);
    var Utility, localization_1, LocalizableViewModel;
    return {
        setters: [
            function (Utility_1) {
                Utility = Utility_1;
            },
            function (localization_1_1) {
                localization_1 = localization_1_1;
            }
        ],
        execute: function () {
            LocalizableViewModel = (function () {
                function LocalizableViewModel() {
                }
                LocalizableViewModel.prototype.LC = function (key) {
                    return localization_1.LR.getObservableString(key);
                };
                return LocalizableViewModel;
            }());
            exports_1("LocalizableViewModel", LocalizableViewModel);
        }
    };
});

//# sourceMappingURL=vmUtility.js.map
