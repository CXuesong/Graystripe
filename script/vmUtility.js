System.register(["./localization"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function showError(err) {
        toastr.error(err);
    }
    exports_1("showError", showError);
    var localization_1, LocalizableViewModel;
    return {
        setters: [
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
