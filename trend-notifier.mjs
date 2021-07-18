import moment from 'moment';
import fetch from 'node-fetch';
import nodeNotifier from 'node-notifier';

const config = {
    numberOfDateBeforeTime1: 20,
};

const getSecondTimeFromEpoch = (time) => Math.round(time / 1000);

const getHistory = async (time1, stockCode) => {
    const currentDate = moment();
    const earliestDate = moment.unix(time1).subtract(config.numberOfDateBeforeTime1, 'd');
    const url = new URL('https://api.vietstock.vn/ta/history');
    url.searchParams.append('symbol', stockCode);
    url.searchParams.append('resolution', 'D');
    url.searchParams.append('from', getSecondTimeFromEpoch(earliestDate.valueOf()));
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

const calculateTrendLine = (time1, time2, data) => {
    const mTime1 = moment.unix(time1);
    const mTime2 = moment.unix(time2);
    const point1 = data.find(p => mTime1.isSame(moment.unix(p.time), 'd'));
    const point2 = data.find(p => mTime2.isSame(moment.unix(p.time), 'd'));
    const lowest1 = Math.min(point1.close, point1.open);
    const lowest2 = Math.min(point2.close, point2.open);
    const xVector = time2 - time1;
    const yVector = lowest2 - lowest1;
    const c = (xVector * lowest1 + yVector * time1) * -1;
    return {
        a: xVector,
        b: yVector,
        c,
    }
}

const run = async () => {
    const stockCode = process.argv[2];
    const time1 = parseInt(process.argv[3], 10);
    const time2 = parseInt(process.argv[4], 10);

    console.log('Set Warning notification for stock', stockCode);

    const history = await getHistory(time1, stockCode);
    const trendLine = calculateTrendLine(time1, time2, history);

    const interval = setInterval(async () => {
        const data = await getCurrentPrice(stockCode);
        const cal = trendLine.a * data[0].close + trendLine.b * data[0].time + trendLine.c;
        if (cal < 0) {
            nodeNotifier.notify({
                title: 'Trend line notifier',
                message: `${stockCode} đã cắt xuống đường trendline ở mức giá ${data[0].close}`
            });
            clearInterval(interval);
        }
    }, 1000 * 60 * 5);
}

run()