import CONFIG from './config.js';

class CommissionHandler {
  static calculateBuyCommissions(romeAmount) {
    const feeRome = Math.round(romeAmount * CONFIG.COMMISSION_BUY_PERCENT);
    const netRome = romeAmount - feeRome;
    const adminShare = Math.round(netRome * 0.006); // 0.6% админу
    const lockedShare = netRome - adminShare; // 99.4% в пул

    return { feeRome, adminShare, lockedShare, wavesFee: CONFIG.WAVES_FEE };
  }

  static calculateSellCommissions(mtksAmount) {
    const feeMtks = Math.round(mtksAmount * CONFIG.COMMISSION_SELL_PERCENT);
    return { feeMtks, wavesFee: CONFIG.WAVES_FEE };
  }
}

export default CommissionHandler;
