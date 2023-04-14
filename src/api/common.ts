/**
 * @author cai zl
 * @since 2023/4/6 15:38
 */

export const REGEX_IP = /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/

export enum ServerOption {
    PLACEHOLDER = ""
}

export enum ModelOption {
    LIST = "list",
    ONE = "one",
    SAVE = "save",
    UPDATE = "update",
    DELETE = "delete",
}
