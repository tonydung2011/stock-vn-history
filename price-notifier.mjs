import moment from 'moment';
import fetch from 'node-fetch';
import child_process from 'child_process';

const config = {
    numberOfDateBeforeTime1: 20,
};

export const getSecondTimeFromEpoch = (time) => Math.round(time / 1000);

const getCurrentPrice = async (stockCode) => {
    const currentDate = moment();
    const url = new URL('https://api.vietstock.vn/ta/history');
    url.searchParams.append('symbol', stockCode);
    url.searchParams.append('resolution', 'D');
    url.searchParams.append('from', getSecondTimeFromEpoch(currentDate.valueOf()));
    url.searchParams.append('to', getSecondTimeFromEpoch(currentDate.valueOf()));
    const history = await fetch(url);
    const json = await history.json();
    const parsed = JSON.parse(json);
    const data = parsed.t.map((time, index) => ({
        open: parsed.o[index],
        close: parsed.c[index],
        high: parsed.h[index],
        low: parsed.l[index],
        time: time,
    }));
    return data;
}

const notify = ({ title, message }) => {
    child_process.exec(`terminal-notifier -title "${title}" -message "${message}"`);
}

export const priceNotifier = async (stockCode, price) => {
    console.log('Set Warning notification for stock', stockCode);
    let shouldNotify = true;

    const interval = setInterval(async () => {
        const data = await getCurrentPrice(stockCode);
        
        if (data[0].close <= price) {
            if (shouldNotify) {
                notify({
                    title: 'Trend line notifier',
                    message: `${stockCode} đã cắt xuống đường giá ${data[0].close}`
                });
                shouldNotify = false;
            } 
        } else {
            shouldNotify = true;
        }
    }, 1000 * 60 * 1);
}