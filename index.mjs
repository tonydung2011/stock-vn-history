import { trendNotifier } from './trend-notifier.mjs';
import trendList from './trend.json';


const run = () => {
    trendList.stocks.forEach(stock => {
        trendNotifier(stock.stockCode, stock.time1, stock.time2);
    })
}

run();