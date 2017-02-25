/// <reference path="../../typings/index.d.ts"/>

export class NetError extends Error {
    public constructor(public readonly status: string, public readonly statusCode: number, public readonly url?: string) {
        super(`Network error when requesting "${url}": ${status}. [${statusCode}]`);
    }

    public get IsBadRequest() { return this.statusCode >= 400 && this.statusCode <= 499; }
}

export class ResourceMissingError extends Error {
    public constructor(public readonly resourceId: any, public readonly resourceType: string) {
        super(`Cannot find the specified ${resourceType}: "${resourceId}".`);
    }
}

export function getJson(url: string): JQueryPromise<any> {
    let d = $.Deferred();
    $.getJSON(url).then(data => d.resolve(data),
        (xhr, status, err) => d.reject(new NetError(err || status, xhr.status, url)));
    return d;
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

export function resolvePropertyPath(obj: any, path: string): any;
export function resolvePropertyPath(obj: any, pathSegments: string[]): any;
export function resolvePropertyPath(obj: any, pathOrSegments: string | string[]): any;
export function resolvePropertyPath(obj: any, path: any) {
    let v = obj;
    let seg = path instanceof Array ? path : path.split("/");
    for (let i = 0; i < seg.length; i++) {
        v = v[seg[i]];
        if (v === undefined || v === null) return v;
    }
    return v;
}

/**
 * fileName.ext --> fileNameSuffix.ext
 */
export function fileNameAddSuffix(fileName: string, suffix: string) {
    let pos = fileName.lastIndexOf(".");
    if (pos < 0) return fileName + suffix;
    return fileName.substring(0, pos) + suffix + fileName.substring(pos);
}

export function XmlToString(element: Node) {
    let a = <any>element;
    if (a.xml !== undefined) return a.xml;
    if (XMLSerializer) return (new XMLSerializer()).serializeToString(element);
    throw new TypeError("Cannot convert XML to string.");
}

export function delayAsync(milliseconds: number): JQueryPromise<void> {
    let d = $.Deferred<void>();
    setTimeout(function() {
        d.resolve();
    }, milliseconds);
    return d;
}