import { Command, flags } from '@oclif/command';
import { exec } from 'child_process';
import fetch from 'node-fetch';

class Stonk extends Command {
  static description = 'describe the command here'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
    symbol: flags.string({ char: 's', description: 'symbol' }),
    purchase: flags.string({ char: 'p', description: 'What was your purchase price' }),
    shares: flags.string({ char: 'n', description: 'How many shares do you own?' }),
  }

  static args = [];

  currentProfit = 0;

  async run() {
    const { flags } = this.parse(Stonk);

    if (!flags.purchase || !flags.shares) {
      return;
    }

    const shares = Number.parseFloat(flags.shares!);
    const purchase = Number.parseFloat(flags.purchase!);

    this.fetchAndPrintData(flags, shares, purchase);
    setInterval(() => this.fetchAndPrintData(flags, shares, purchase), 20000);
  }

  async fetchAndPrintData(flags: any, shares: number, purchase: number): Promise<void> {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?lang=en-US&region=US&corsDomain=finance.yahoo.com&fields=symbol,regularMarketPrice&symbols=${flags.symbol}`;
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
