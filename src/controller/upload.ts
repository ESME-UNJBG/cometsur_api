import { Request, Response } from "express";
import { handleHttp } from "../utils/error.handle";
import { RequestExt } from "../interfaces/req-ex";
import { registerUpload } from "../services/storage";
import { Storage } from "../interfaces/Storage";
const getfile = async (req: RequestExt, res: Response) => {
  try {
    const { user, file } = req;
    //console.log(user);
    //console.log(user);
    // console.log(file?.filename);
    const dataToRegister: Storage = {
      idUser: user?.id,
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
