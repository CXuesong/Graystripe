/// <reference path="../../typings/index.d.ts"/>
import * as Utility from "./utility";
import { LR } from "./localization";

export class LocalizableViewModel {
    public LC(key: string) {
        return LR.getObservableString(key);
    }
}

export function showError(err: any) {
    toastr.error(Utility.htmlEscape(err.toString()));
}

// https://github.com/MEYVN-digital/mdl-selectfield/issues/14
export function mdlSelectNotifyChanged(container: Element) {
    $(".mdl-selectfield", container).each(function () {
        let msf = this.MaterialSelectfield;
        if (!msf) return;
        let sel = msf.select_.selectedIndex;
        // console.log(sel);
        msf.selectedOptionValue_.textContent = sel >= 0 ? msf.select_.options[sel].text : null;
    });
}