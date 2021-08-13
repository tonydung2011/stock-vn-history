import fs from 'fs';
import fetch from 'node-fetch';
import numeral from 'numeral'

const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkdYdExONzViZlZQakdvNERWdjV4QkRITHpnSSIsImtpZCI6IkdYdExONzViZlZQakdvNERWdjV4QkRITHpnSSJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmZpcmVhbnQudm4iLCJhdWQiOiJodHRwczovL2FjY291bnRzLmZpcmVhbnQudm4vcmVzb3VyY2VzIiwiZXhwIjoxOTIzOTE1ODM0LCJuYmYiOjE2MjM5MTU4MzQsImNsaWVudF9pZCI6ImZpcmVhbnQudHJhZGVzdGF0aW9uIiwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSIsInJvbGVzIiwiZW1haWwiLCJhY2NvdW50cy1yZWFkIiwiYWNjb3VudHMtd3JpdGUiLCJvcmRlcnMtcmVhZCIsIm9yZGVycy13cml0ZSIsImNvbXBhbmllcy1yZWFkIiwiaW5kaXZpZHVhbHMtcmVhZCIsImZpbmFuY2UtcmVhZCIsInBvc3RzLXdyaXRlIiwicG9zdHMtcmVhZCIsInN5bWJvbHMtcmVhZCIsInVzZXItZGF0YS1yZWFkIiwidXNlci1kYXRhLXdyaXRlIiwidXNlcnMtcmVhZCIsInNlYXJjaCIsImFjYWRlbXktcmVhZCIsImFjYWRlbXktd3JpdGUiLCJibG9nLXJlYWQiLCJpbnZlc3RvcGVkaWEtcmVhZCJdLCJzdWIiOiI4Rjk4NTk1NS1DQTQ5LTRDMzctOEM0OS0zQUI1RDY1MzQ3MDUiLCJhdXRoX3RpbWUiOjE2MjM5MTU4MzQsImlkcCI6IkZhY2Vib29rIiwibmFtZSI6InZ1bGNhbjIwMTEiLCJzZWN1cml0eV9zdGFtcCI6IjREQTUwNkJCLUIzMzUtNEI0Ni1CQTNELUZBOTAyODlGOEFDNSIsInByZWZlcnJlZF91c2VybmFtZSI6InZ1bGNhbjIwMTEiLCJ1c2VybmFtZSI6InZ1bGNhbjIwMTEiLCJmdWxsX25hbWUiOiJ2dWxjYW4yMDExIiwiZW1haWwiOiJsdHYwOXRpMDRAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOiJ0cnVlIiwianRpIjoiZDQzOTA3Nzg2NDdiNzEzMWYwMDA3YTc3ZjVmYTJlNjUiLCJhbXIiOlsiZXh0ZXJuYWwiXX0.XuVlMuHJqCnUFkHup0LPEzF86TiVkiKVGKUH6yg9KEnfPuAmpC2U3tP4fiU4lr_BYUXtW5gDX0DrztIDBh8L-F-yFfmh7lCqcQ66tqUcaTmEjwb36boTpHVHNLIzDpVzLS9OgO8SbEJC4_Rz25LMrUt331ZtKPr5eFJNE5aPNT8DlpUJsRQamG-f3F8Cs8cWO9eKS623mW3LfK82K32m9I9_clY-tQ3c5c52bQL_Ra3QZtGtTf3gyV4Ed4fhwoVzIxgZlX210VZ8RZz57Ik8icSSzWjQQCTw7KoJD64QwiSCW_pl-6wbP-gZtkE8COMhdpmBaQcYAy6ZhDq9MDrO_A"
const startDate = "2021-01-01";
const endDate = "2021-08-11"
const stockList = ['TCB', 'MBB', 'CTG', 'VCB', 'MSB','VPB', 'HPG', 'HSG', 'NKG', 'SSI', 'VND', 'VIC', 'VHM', 'VRE', 'NVL', 'GVR', 'MSN', 'FPT', 'GMD'];
const stockList2 = ['VRE'];

const getStokeHistory = async (stockCode) => {
    try {
        const data = await fetch(`https://restv2.fireant.vn/symbols/${stockCode}/historical-quotes?startDate=${startDate}&endDate=${endDate}&offset=0&limit=500`, {
          "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "vi,en-US;q=0.9,en;q=0.8",
            "authorization": `Bearer ${token}`,
            "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"91\", \"Chromium\";v=\"91\"",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site"
          },
          "referrerPolicy": "no-referrer",
          "body": null,
          "method": "GET",
          "mode": "cors",
          "credentials": "include"
        });
        const history = await data.json();
        return history;
    } catch (error) {
      throw error;
    }

}

const calculateForeignQuantity = async (listResponseFireant) => {
  const listForeignQuantity = listResponseFireant.map(history => {
    return history.reduce((total, dateData) => {
      return total + (dateData.buyForeignQuantity - dateData.sellForeignQuantity);
    }, 0);
  });
  return listForeignQuantity;
}

const calculateForeignEquity = async (listResponseFireant) => {
  const listForeignEquity = listResponseFireant.map(history => {
    return history.reduce((total, dateData) => {
      return total + (dateData.buyForeignValue - dateData.sellForeignValue);
    }, 0);
  });
  return listForeignEquity;
}

const calculateAverageQuantityByNumberOfSession = async (listResponseFireant, sessionCount) => {
  const listAverageQuantity = listResponseFireant.map((history = []) => {
    const total = history.slice(0, sessionCount).reduce((total, dateData) => {
      return total + dateData.dealVolume;
    }, 0);
    return total / sessionCount;
  });
  return listAverageQuantity;
}

const currentMarketPrice = (listResponseFireant) => {
  const listMarketPrice = listResponseFireant.map((history = []) => {
    return history[0].priceClose * 1000;
  });
  return listMarketPrice;
}

const exec = async (stockListArg) => {
  try {
    const listResponseFireant = await Promise.all(stockListArg.map(stockCode => getStokeHistory(stockCode)));
    const listForeignQuantity = await calculateForeignQuantity(listResponseFireant);
    const listForeignEquity = await calculateForeignEquity(listResponseFireant);
    const listQuantity5 = await calculateAverageQuantityByNumberOfSession(listResponseFireant, 5);
    const listQuantity9 = await calculateAverageQuantityByNumberOfSession(listResponseFireant, 9);
    const listQuantity20 = await calculateAverageQuantityByNumberOfSession(listResponseFireant, 20);
    const listQuantity50 = await calculateAverageQuantityByNumberOfSession(listResponseFireant, 50);
    const listQuantity100 = await calculateAverageQuantityByNumberOfSession(listResponseFireant, 100);
    const listMarketPrice = currentMarketPrice(listResponseFireant);
    const result = stockListArg.map((stockCode, index) => ({
      "Mã": stockCode,
      "Gía đóng cửa": listMarketPrice[index],
      "Luỹ kế khối lượng giao dịch khối ngoại": numeral(listForeignQuantity[index]).format('0,0'),
      "Luỹ kế Giá trị giao dịch khối ngoại": numeral(listForeignEquity[index]).format('0,0.0'),
      "Dư lãi": listForeignQuantity[index] > 0 ? numeral(listMarketPrice[index] * listForeignQuantity[index]).format('0,0.0') : 0,
      "% lãi": listForeignQuantity[index] > 0 ? numeral((listMarketPrice[index] * listForeignQuantity[index] - listForeignEquity[index]) / listForeignEquity[index]).format('0,0.0%') : 0,
      "Khối lương tb 5 phiên": numeral(listQuantity5[index]).format('0,0'),
      "Khối lương tb 9 phiên": numeral(listQuantity9[index]).format('0,0'),
      "Khối lương tb 20 phiên": numeral(listQuantity20[index]).format('0,0'),
      "Khối lương tb 50 phiên": numeral(listQuantity50[index]).format('0,0'),
      "Khối lương tb 100 phiên": numeral(listQuantity100[index]).format('0,0'),
    }));
    fs.writeFileSync('ForeignQuantity.json', JSON.stringify(result), {
      encoding: 'utf8'
    });
  } catch (error) {
    console.log('error', error);
  }
}

exec(stockList);