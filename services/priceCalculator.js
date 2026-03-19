import CONFIG from '../config.js';

class PriceCalculator {
  calculateBasePrice(monthsPassed) {
    return Math.round(
      CONFIG.INITIAL_BASE_PRICE * Math.pow(1 + CONFIG.PRICE_INCREMENT_PERCENT, monthsPassed)
    );
  }

  getCurrentPrices() {
    const now = new Date();
    const initialDate = new Date('2026-03-03');
    const monthsPassed = Math.floor((now - initialDate) / (30 * 24 * 60 * 60 * 1000));

    const basePrice = this.calculateBasePrice(monthsPassed);
    const buyPrice = basePrice;
    const sellPrice = Math.round(basePrice * (1 - CONFIG.SELL_SPREAD_PERCENT));

    return { basePrice, buyPrice, sellPrice };
  }
}

export default PriceCalculator;
