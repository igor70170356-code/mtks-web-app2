// app.js
import WavesApiClient from './utils/apiclient.js';
import CONFIG from './utils/config.js';

class MTKSDApp {
  constructor() {
    this.apiClient = new WavesApiClient();
    this.priceUpdateInterval = null;
    this.balanceUpdateInterval = null;
    this.init();
  }

  async init() {
    try {
      const isNodeAvailable = await this.checkNodeAvailability();

      if (!isNodeAvailable) {
        this.showConnectionError();
        return;
      }

      await this.updatePrices();
      await this.updateBalances(); // Обновляем балансы при инициализации
      this.setupEventListeners();
      this.setupTrading(); // Инициализируем торговлю
      this.startAutoPriceUpdates();
      this.startBalanceUpdates(); // Запускаем автообновление балансов

      console.log('Приложение инициализировано успешно');
    } catch (error) {
      console.error('Ошибка инициализации:', error);
      this.showConnectionError();
    }
  }
async updatePrices() {
  try {
    const prices = await this.apiClient.getPrices();

    const buyPriceElement = document.getElementById('buy-price');
    const sellPriceElement = document.getElementById('sell-price');

    if (buyPriceElement) buyPriceElement.textContent = (prices.buy / 1000000).toFixed(6);
    if (sellPriceElement) sellPriceElement.textContent = (prices.sell / 1000000).toFixed(6);

    console.log('Цены обновлены:', prices);
  } catch (error) {
    console.error('Ошибка загрузки цен:', error);
    this.showPriceError();
  }
}
showPriceError() {
  const buyPriceElement = document.getElementById('buy-price');
  const sellPriceElement = document.getElementById('sell-price');

  if (buyPriceElement) buyPriceElement.textContent = 'Ошибка загрузки';
  if (sellPriceElement) sellPriceElement.textContent = 'Ошибка загрузки';
}

  // Существующие методы (оставляем без изменений)
  async checkNodeAvailability() { /* ... */ }
  async updatePrices() { /* ... */ }
  setupEventListeners() { /* ... */ }
  startAutoPriceUpdates() { /* ... */ }
  stopAutoPriceUpdates() { /* ... */ }
  showConnectionError() { /* ... */ }

  // --- НОВЫЕ МЕТОДЫ ДЛЯ ТОРГОВЛИ ---

  setupTrading() {
    this.updateBuyTotal();
    this.updateSellTotal();
    this.setupTradeEventListeners();
  }

  setupTradeEventListeners() {
    const buyAmountInput = document.getElementById('buy-amount');
    const sellAmountInput = document.getElementById('sell-amount');

    if (buyAmountInput) {
      buyAmountInput.addEventListener('input', () => this.updateBuyTotal());
    }
    if (sellAmountInput) {
      sellAmountInput.addEventListener('input', () => this.updateSellTotal());
    }

    const buyButton = document.getElementById('buy-button');
    const sellButton = document.getElementById('sell-button');

    if (buyButton) {
      buyButton.addEventListener('click', () => this.handleBuy());
    }
    if (sellButton) {
      sellButton.addEventListener('click', () => this.handleSell());
    }
  }

  updateBuyTotal() {
    const amount = parseFloat(document.getElementById('buy-amount')?.value) || 0;
    const buyPrice = parseFloat(document.getElementById('buy-price')?.textContent) || 0;
    const total = amount * buyPrice;

    const buyTotalElement = document.getElementById('buy-total');
    if (buyTotalElement) {
      buyTotalElement.textContent = total.toFixed(6);
    }
    this.enableBuyButton(amount > 0 && amount <= this.getMaxBuyAmount());
  }

  updateSellTotal() {
    const amount = parseFloat(document.getElementById('sell-amount')?.value) || 0;
    const sellPrice = parseFloat(document.getElementById('sell-price')?.textContent) || 0;
    const total = amount * sellPrice;

    const sellTotalElement = document.getElementById('sell-total');
    if (sellTotalElement) {
      sellTotalElement.textContent = total.toFixed(6);
    }
    this.enableSellButton(amount > 0 && amount <= this.getCurrentMTKSBalance());
  }

  enableBuyButton(enabled) {
    const button = document.getElementById('buy-button');
    if (button) button.disabled = !enabled;
  }

  enableSellButton(enabled) {
    const button = document.getElementById('sell-button');
    if (button) button.disabled = !enabled;
  }

  getMaxBuyAmount() {
    // Здесь можно рассчитать максимальное количество MTKS для покупки
    // на основе баланса Rome и текущей цены
    return 1000; // Пример: максимум 1000 MTKS
  }

  getCurrentMTKSBalance() {
    const balanceElement = document.getElementById('mtks-balance');
    return parseFloat(balanceElement?.textContent) || 0;
  }

  async handleBuy() {
    const amount = parseFloat(document.getElementById('buy-amount').value);
    const price = parseFloat(document.getElementById('buy-price').textContent);
    const total = amount * price;

    if (!confirm(`Купить ${amount} MTKS за ${total.toFixed(6)} Rome?`)) return;

    try {
      await this.apiClient.executeBuyOrder(amount, price);
      alert('Покупка выполнена успешно!');
      await this.updateBalances();
      document.getElementById('buy-amount').value = '';
      this.updateBuyTotal();
    } catch (error) {
      alert(`Ошибка покупки: ${error.message}`);
      console.error('Ошибка покупки:', error);
    }
  }

  async handleSell() {
    const amount = parseFloat(document.getElementById('sell-amount').value);
    const price = parseFloat(document.getElementById('sell-price').textContent);
    const total = amount * price;

    if (!confirm(`Продать ${amount} MTKS за ${total.toFixed(6)} Rome?`)) return;

    try {
      await this.apiClient.executeSellOrder(amount, price);
      alert('Продажа выполнена успешно!');
      await this.updateBalances();
      document.getElementById('sell-amount').value = '';
      this.updateSellTotal();
    } catch (error) {
      alert(`Ошибка продажи: ${error.message}`);
      console.error('Ошибка продажи:', error);
    }
  }

  async updateBalances() {
    try {
      const [mtksBalance, romeBalance] = await Promise.all([
        this.apiClient.getMTKSBalance(),
        this.apiClient.getRomeBalance()
      ]);

      const mtksElement = document.getElementById('mtks-balance');
      const romeElement = document.getElementById('rome-balance');

      if (mtksElement) mtksElement.textContent = (mtksBalance / 1000000).toFixed(6);
      if (romeElement) romeElement.textContent = (romeBalance / 1000000).toFixed(6);
    } catch (error) {
      console.error('Ошибка обновления балансов:', error);
    }
  }

  startBalanceUpdates() {
    this.balanceUpdateInterval = setInterval(() => this.updateBalances(), 15000); // Каждые 15 секунд
  }setupTrading() {
  this.updateBalances();
  this.setupTradeEventListeners();
  this.startBalanceUpdates();
}

async updateBalances() {
  try {
    const [mtksBalance, romeBalance] = await Promise.all([
      this.apiClient.getMTKSBalance(),
      this.apiClient.getRomeBalance()
    ]);

    const mtksElement = document.getElementById('mtks-balance');
    const romeElement = document.getElementById('rome-balance');

    if (mtksElement) mtksElement.textContent = (mtksBalance / 1000000).toFixed(6);
    if (romeElement) romeElement.textContent = (romeBalance / 1000000).toFixed(6);
  } catch (error) {
    console.error('Ошибка обновления балансов:', error);
  }
}

setupTradeEventListeners() {
  const buyAmountInput = document.getElementById('buy-amount');
  const sellAmountInput = document.getElementById('sell-amount');

  buyAmountInput.addEventListener('input', () => this.updateBuyTotal());
  sellAmountInput.addEventListener('input', () => this.updateSellTotal());

  document.getElementById('buy-button').addEventListener('click', () => this.handleBuy());
  document.getElementById('sell-button').addEventListener('click', () => this.handleSell());
}

updateBuyTotal() {
  const amount = parseFloat(document.getElementById('buy-amount').value) || 0;
  const buyPrice = parseFloat(document.getElementById('buy-price').textContent) || 0;
  const total = amount * buyPrice;

  document.getElementById('buy-total').textContent = total.toFixed(6);
  this.enableBuyButton(amount > 0 && amount <= this.getMaxBuyAmount());
}

updateSellTotal() {
  const amount = parseFloat(document.getElementById('sell-amount').value) || 0;
  const sellPrice = parseFloat(document.getElementById('sell-price').textContent) || 0;
  const total = amount * sellPrice;

  document.getElementById('sell-total').textContent = total.toFixed(6);
  this.enableSellButton(amount > 0 && amount <= this.getCurrentMTKSBalance());
}

enableBuyButton(enabled) {
  const button = document.getElementById('buy-button');
  button.disabled = !enabled;
  button.style.cursor = enabled ? 'pointer' : 'not-allowed';
  button.style.background = enabled ? '#4CAF50' : '#a5d6a7';
}

enableSellButton(enabled) {
  const button = document.getElementById('sell-button');
  button.disabled = !enabled;
  button.style.cursor = enabled ? 'pointer' : 'not-allowed';
  button.style.background = enabled ? '#f44336' : '#ef9a9a';
}

getMaxBuyAmount() {
  // Здесь можно рассчитать максимальное количество MTKS для покупки
  // на основе баланса Rome и текущей цены
  return 1000; // Пример: максимум 1000 MTKS
}

getCurrentMTKSBalance() {
  const balanceElement = document.getElementById('mtks-balance');
  return parseFloat(balanceElement.textContent) || 0;
}

async handleBuy() {
  const amount = parseFloat(document.getElementById('buy-amount').value);
  const price = parseFloat(document.getElementById('buy-price').textContent);
  const total = amount * price;

  if (!confirm(`Купить ${amount} MTKS за ${total.toFixed(6)} Rome?`)) return;

  try {
    await this.apiClient.executeBuyOrder(amount, price);
    alert('Покупка выполнена успешно!');
    await this.updateBalances();
    document.getElementById('buy-amount').value = '';
    this.updateBuyTotal();
  } catch (error) {
    alert(`Ошибка покупки: ${error.message}`);
    console.error('Ошибка покупки:', error);
  }
}

async handleSell() {
  const amount = parseFloat(document.getElementById('sell-amount').value);
  const price = parseFloat(document.getElementById('sell-price').textContent);
  const total = amount * price;

  if (!confirm(`Продать ${amount} MTKS за ${total.toFixed(6)} Rome?`)) return;

  try {
    await this.apiClient.executeSellOrder(amount, price);
    alert('Продажа выполнена успешно!');
    await this.updateBalances();
    document.getElementById('sell-amount').value = '';
    this.updateSellTotal();
  } catch (error) {
    alert(`Ошибка продажи: ${error.message}`);
    console.error('Ошибка продажи:', error);
  }
}

startBalanceUpdates() {
  setInterval(() => this.updateBalances(), 15000); // Обновление каждые 15 секунд
}


}

document.addEventListener('DOMContentLoaded', () => {
  new MTKSDApp();
});
