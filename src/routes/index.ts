import { Router } from "express";
import { readdirSync } from "fs";

const PATH_ROUTER = `${__dirname}`;
const router = Router();

//remueve ts del las rutas ejecutas del index
const cleanFileName = (fileName: string) => {
  const file = fileName.split(".").shift();
  return file;
};

//esto me va a devolver un array de las routas que luego se van a ser peticiones
readdirSync(PATH_ROUTER).filter((fileName) => {
  const cleanName = cleanFileName(fileName);
  if (cleanName !== "index") {
    import(`./${cleanName}`).then((moduleRouter) => {
      console.log(`se esta cargando la ruta ....../${cleanName}`);
      router.use(`/${cleanName}`, moduleRouter.router);
    });
  }
});
export { router };
