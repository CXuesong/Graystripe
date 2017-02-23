/// <reference path="../../typings/index.d.ts"/>

export class NetError extends Error {
    public constructor(public readonly status: string, public readonly url?: string) {
        super(`Network error when requesting "${url}": ${status}.`);
    }
}

export class ResourceMissingError extends Error {
    public constructor(public readonly resourceId: any, public readonly resourceType: string) {
        super(`Cannot find the specified ${resourceType}: "${resourceId}".`);
    }
}

export function getJson(url: string) {
    return $.getJSON(url).then(data => {
        return data;
    }, (xhr, status, err) => {
        return new NetError(err || status, xhr.responseURL);
    });
}

export function htmlEscape(unsafe: string) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function formatString(format: string, ...args: any[]): string;
export function formatString() {
    let content = arguments[0];
    for (let i = 1; i < arguments.length; i++) {
        let replacement = "{" + (i - 1) + "}";
        content = content.replace(replacement, arguments[i]);
    }
    return content;
}
