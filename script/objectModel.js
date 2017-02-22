System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function reconstructSessionSlot(obj) {
        if (!obj)
            return obj;
        obj.time = new Date(obj.time);
    }
    exports_1("reconstructSessionSlot", reconstructSessionSlot);
    return {
        setters: [],
        execute: function () {
        }
    };
});

//# sourceMappingURL=objectModel.js.map
