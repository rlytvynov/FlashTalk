import {NextFunction, Request, Response} from "express";

export default function responseMiddleware(req: Request, res: Response, next: NextFunction) {
    res.sendJson = function <T>(data: T, message = 'OK') {
        return this.json({ data, message });
    };
    next();
}