import ItemModel from "../models/item";

const getOrders = async () => {
  const responseIntem = await ItemModel.find({});
  return responseIntem;
};

export { getOrders };
