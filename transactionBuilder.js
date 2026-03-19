const PriceCalculator = require('./priceCalculator');
const CommissionHandler = require('./commissionHandler');
const MintHandler = require('./mintHandler');

class TransactionBuilder {
  constructor(config) {
    this.config = config;
  }

  /**
   * Строит транзакцию покупки MTKS за ROME с учётом всех комиссий
   * @param {string} userWavesAddress — адрес кошелька пользователя
   * @param {number} romeAmount — сумма в ROME (в привычных единицах)
   * @returns {Object} — готовая транзакция для отправки в блокчейн
   */
  buildBuyMtks(userWavesAddress, romeAmount) {
    // Проверка минимальной суммы: эквивалент 1 MTKS по текущей цене покупки
    const buyPrice = PriceCalculator.getBuyPrice();
    const minRomeAmount = buyPrice * 1; // Минимальная сумма в ROME для покупки 1 MTKS

    if (romeAmount < minRomeAmount) {
      throw new Error(`Минимальная сумма покупки — ${minRomeAmount.toFixed(6)} ROME (эквивалент 1 MTKS)`);
    }

    const commissions = CommissionHandler.calculateBuyCommissions(romeAmount);

    // Конвертируем ROME в вейты (с учётом десятичных знаков)
    const romeInWaves = romeAmount * Math.pow(10, this.config.ROME_DECIMALS);
    const pool99_4InWaves = commissions.pool99_4 * Math.pow(10, this.config.ROME_DECIMALS);
    const admin0_6InWaves = commissions.admin0_6 * Math.pow(10, this.config.ROME_DECIMALS);
    const accumulationPool0_3InWaves = commissions.accumulationPool0_3 * Math.pow(10, this.config.ROME_DECIMALS);

    return {
      type: 16, // InvokeScriptTransaction
      sender: userWavesAddress,
      dApp: this.config.dAppAddress,
      call: {
        function: 'buyMtks',
        args: [
          { type: 'integer', value: romeInWaves },
          { type: 'integer', value: pool99_4InWaves },
          { type: 'integer', value: admin0_6InWaves },
          { type: 'integer', value: accumulationPool0_3InWaves }
        ]
      },
      payment: [{
        assetId: this.config.romeAssetId,
        amount: romeInWaves
      }],
      fee: this.config.transactionFee + (commissions.adminWaves * Math.pow(10, 8)), // Учитываем комиссию 0.005 WAVES
      chainId: this.config.networkByte.charCodeAt(0)
    };
  }

  /**
   * Строит транзакцию продажи MTKS за ROME с учётом комиссий
   * @param {string} userWavesAddress — адрес кошелька пользователя
   * @param {number} mtksAmount — количество MTKS (в привычных единицах)
   * @returns {Object} — готовая транзакция для отправки в блокчейн
   */
  buildSellMtks(userWavesAddress, mtksAmount) {
    // Проверка минимальной суммы продажи — 1 MTKS
    if (mtksAmount < 1) {
      throw new Error('Минимальная сумма продажи — 1 MTKS');
    }

    const sellPrice = PriceCalculator.getSellPrice();
    const commissions = CommissionHandler.calculateSellCommissions(mtksAmount);

    // Конвертируем MTKS в вейты
    const mtksInWaves = mtksAmount * Math.pow(10, this.config.MTKS_DECIMALS);
    const adminMTKSInWaves = commissions.adminMTKS * Math.pow(10, this.config.MTKS_DECIMALS);

    return {
      type: 16, // InvokeScriptTransaction
      sender: userWavesAddress,
      dApp: this.config.dAppAddress,
      call: {
        function: 'sellMtks',
        args: [
          { type: 'integer', value: mtksInWaves },
          { type: 'integer', value: adminMTKSInWaves }
        ]
      },
      fee: this.config.transactionFee + (commissions.adminWaves * Math.pow(10, 8)), // Учитываем комиссию 0.005 WAVES
      chainId: this.config.networkByte.charCodeAt(0)
    };
  }

  /**
   * Строит транзакцию минта 3000 MTKS на кошелёк администратора, если его баланс ≤ 1 MTKS
   * @returns {Promise<Object|null>} — готовая транзакция или null, если минт не требуется
   */
  async buildMintIfNeeded() {
    const shouldMint = await MintHandler.shouldMint(
      this.config.adminAddress,
      this.config.mtksAssetId,
      this.config
    );

    if (!shouldMint) {
      return null;
    }

    const mintTransaction = MintHandler.buildMintTransaction(
      this.config.adminAddress,
      3000, // Минтим 3000 MTKS
      this.config
    );

    return mintTransaction;
  }
}

module.exports = TransactionBuilder;
