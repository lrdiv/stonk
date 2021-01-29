import { Command, flags } from '@oclif/command';
import { exec } from 'child_process';
import fetch from 'node-fetch';

class Stonk extends Command {
  static description = 'describe the command here'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
    purchase: flags.string({ char: 'p', description: 'What was your purchase price' }),
    shares: flags.string({ char: 'n', description: 'How many shares do you own?' }),
    int: flags.integer({ char: 'i', description: 'How often to check in seconds (defaults to 20)', default: 20 }),
  }

  static args = [
    { name: 'symbol' },
  ];

  currentProfit = 0;

  async run() {
    const { args, flags } = this.parse(Stonk);
    const { symbol } = args;

    if (!flags.purchase || !flags.shares) {
      return;
    }

    const shares = Number.parseFloat(flags.shares!);
    const purchase = Number.parseFloat(flags.purchase!);

    this.fetchAndPrintData(symbol, shares, purchase);
    setInterval(() => this.fetchAndPrintData(symbol, shares, purchase), flags.int * 1000);
  }

  async fetchAndPrintData(symbol: string, shares: number, purchase: number): Promise<void> {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?lang=en-US&region=US&corsDomain=finance.yahoo.com&fields=symbol,regularMarketPrice&symbols=${symbol}`;
    const resp = await fetch(url);
    const data = await resp.json();
    const curr = data.quoteResponse.result[0].regularMarketPrice;

    this.printData(shares, purchase, curr);
  }

  printData(shares: number, purchasePrice: number, currentPrice: number): void {
    this.log(`Current Price: $${currentPrice.toFixed(2)}`);

    if (!shares || !purchasePrice) {
      return;
    }

    const originalBuy = shares * purchasePrice;
    const currVal = currentPrice! * shares;
    const currProfit = currVal - originalBuy;
    const profitPos = currProfit > 0;
    const change = currProfit - this.currentProfit;
    const changePos = change > 0;
    const text = `Your ${profitPos ? 'profit' : 'loss'}: $${currProfit.toFixed(2)} (${changePos ? '+' : ''}$${change.toFixed(2)})`;

    this.log(text);
    exec(`osascript -e 'display notification "${text}" with title "STONK ALERT"'`);
    this.currentProfit = currProfit;
  }
}

export = Stonk
