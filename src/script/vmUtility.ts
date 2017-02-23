/// <reference path="../../typings/index.d.ts"/>
import { LR } from "./localization";

export class LocalizableViewModel {
    public LC(key: string) {
        return LR.getObservableString(key);
    }
}

export function showError(err: any) {
    toastr.error(err);
}
