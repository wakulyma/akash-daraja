import axios from "axios";
import { config } from "../config/config";

export const getAktPrice = async () => {
  try {
    let axiosConfig = {
      method: "get",
      url: config.COINMARKET_CAP_AKT_PRICE_URL,
      headers: { "X-CMC_PRO_API_KEY": config.COINMARKET_CAP_API_KEY },
    };

    let response = await axios(axiosConfig);

    //returns the price of AKT in USD as per the coinmarketcap API specification
    let price = response.data.data["7431"].quote.USD.price;
    console.log("Fetched AKT price as", price);

    return price;
  } catch (err) {
    console.log(err);
  }
};
