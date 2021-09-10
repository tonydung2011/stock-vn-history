import { priceNotifier } from './price-notifier.mjs';
import trendList from './trend.json';


const run = () => {
    trendList.stocks.forEach(stock => {
        priceNotifier(
            stock.stockCode,
            stock.priceLine
        );
    })
}

run();