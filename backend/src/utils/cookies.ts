import { Response, Request } from "express";

export const setCookie = (res: Response, name: string, value: string, options: object = {}) : void => {
    res.cookie(name, value, {httpOnly: true, ...options});
};

export const getCookie = (req: Request, name: string) : string | undefined => {
    return req.cookies[name];
}

export const clearCookie = (res: Response, name: string) : void => {
    res.clearCookie(name);
}