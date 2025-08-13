import { Request, Response } from "express";
import { handleHttp } from "../utils/error.handle";
import { RequestExt } from "../interfaces/req-ex";
const getItems = (req: RequestExt, res: Response) => {
  try {
    res.send({
      data: "esto solo lo ven personas con permiso de firma",
      user: req.user,
    });
  } catch {
    handleHttp(res, "error de ..");
  }
};
export { getItems };
