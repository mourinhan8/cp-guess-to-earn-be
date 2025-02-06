async function getCPPrice() {
  const response = await fetch(
    `https://api.geckoterminal.com/api/v2/simple/networks/glmr/token_price/0x6021d2c27b6fbd6e7608d1f39b41398caee2f824`
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();
  return Number(data.data.attributes.token_prices[
    "0x6021d2c27b6fbd6e7608d1f39b41398caee2f824"
  ]);
}

export async function getBitcoinPrice() {
  const response = await fetch(
    "https://api.coindesk.com/v1/bpi/currentprice/BTC.json"
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();
  return data.bpi.USD.rate_float;
}

module.exports = {
  getCPPrice
};
