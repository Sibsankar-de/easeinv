import currencyCodes from "currency-codes";
import getSymbolFromCurrency from "currency-symbol-map";

const currencies = currencyCodes.data
  .map((c) => {
    const symbol = getSymbolFromCurrency(c.code);

    return {
      code: c.code,
      name: c.currency,
      symbol: symbol || null,
    };
  })
  .filter((c) => c.code && c.name); // remove invalid entries

export default currencies;
