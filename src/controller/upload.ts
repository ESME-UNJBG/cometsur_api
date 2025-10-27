import { Request, Response } from "express";
import { handleHttp } from "../utils/error.handle";
import { RequestExt } from "../interfaces/req-ex";
import { registerUpload } from "../services/storage";
import { Storage } from "../interfaces/Storage";

const getfile = async (req: RequestExt, res: Response) => {
  try {
    const { user, file } = req;

    // ✅ CORREGIDO: Usar _id en lugar de id

    const idUser = (user as any)?._id || (user as any)?.id;

    if (!idUser) {
      res.status(401).send("Usuario no autenticado");
      return;
    }

    const dataToRegister: Storage = {
      idUser: idUser, // ✅ Ahora usa _id
      fileName: file!.filename,
      path: file!.path,
    };

    const response = await registerUpload(dataToRegister);
    res.send(response);
  } catch (e) {
    handleHttp(res, "ERROR");
  }
};

export { getfile };
