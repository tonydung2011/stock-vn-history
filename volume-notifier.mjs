import moment from 'moment';
import _ from 'lodash';
import fetch from 'node-fetch';
import child_process from 'child_process';

const config = {
    numberOfDateBeforeTime1: 20,
};

export const getSecondTimeFromEpoch = (time) => Math.round(time / 1000);

const getHistory = async (time1, stockCode) => {
    const currentDate = moment();
    const earliestDate = moment.unix(time1).subtract(config.numberOfDateBeforeTime1, 'd');
    const url = new URL('https://api.vietstock.vn/ta/history');
    url.searchParams.append('symbol', stockCode);
    url.searchParams.append('resolution', '15');
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
    url.searchParams.append('resolution', '15');
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

const formatCandleData = (data, numberOfCandleIndate) => {
    const history = data.map(d => ({
        ...d,
        time: moment.unix(d.time * 1000),
        date: moment.unix(d.time * 1000).format('DD-MM-YYYY'),
    }));
    const groupByDate = _.groupBy(history, d => d.date);
}

export const volumeNotifier = async (stockCode) => {
    console.log('Set Warning notification for stock', stockCode);

    const startYear = moment('01-01-2021', 'DD-MM-YYYY').valueOf();
    const history = await getHistory(startYear, stockCode);
    let shouldNotify = true;

    const interval = setInterval(async () => {
        const data = await getCurrentPrice(stockCode);
        const cal = trendLine.a * data[0].time + trendLine.b;
        
        if (data[0].close < cal) {
            if (shouldNotify) {
                notify({
                    title: 'Trend line notifier',
                    message: `${stockCode} đã cắt xuống đường trendline ở mức giá ${data[0].close}`
                });
                shouldNotify = false;
            } 
        } else {
            shouldNotify = true;
        }
    }, 1000 * 60 * 1);
}