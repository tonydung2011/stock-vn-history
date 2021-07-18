import moment from 'moment';
import { getSecondTimeFromEpoch, trendNotifier } from './trend-notifier.mjs';
import trendList from './trend.json';


const run = () => {
    trendList.stocks.forEach(stock => {
        trendNotifier(
            stock.stockCode,
            getSecondTimeFromEpoch(moment(stock.time1, 'DD-MM-YYYY').valueOf()),
            getSecondTimeFromEpoch(moment(stock.time2, 'DD-MM-YYYY').valueOf()),
        );
    })
}

run();