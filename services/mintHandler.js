class MintHandler {
  async shouldMint(adminAddress, mtksAssetId, config) {
    try {
      const balance = await this.getAdminMTKSBalance(adminAddress, mtksAssetId, config);
      return balance <= 1; // Если ≤ 1 MTKS, нужно минтить
    } catch (error) {
      console.error('Ошибка проверки баланса для минта:', error);
      return false;
    }
  }

  async getAdminMTKSBalance(adminAddress, mtksAssetId, config) {
    try {
      const response = await fetch(`${config.wavesNode}/assets/balance/${adminAddress}/${mtksAssetId}`);
      const data = await response.json();
      return data.balance / Math.pow(10, config.MTKS_DECIMALS); // Конвертируем в привычные единицы
    } catch (error) {
      console.error('Ошибка получения баланса MTKS:', error);
      throw error;
    }
  }

  buildMintTransaction(adminAddress, amountMTKS, config) {
    const amountInWaves = amountMTKS * Math.pow(10, config.MTKS_DECIMALS);

    return {
      type: 4, // IssueTransaction
      sender: adminAddress,
      name: 'MTKS Token',
      description: 'Minted 3000 MTKS for admin due to low balance',
      quantity: amountInWaves,
      decimals: config.MTKS_DECIMALS,
      reissuable: false,
      fee: config.transactionFee,
      chainId: config.networkByte.charCodeAt(0)
    };
  }
}

module.exports = new MintHandler();
