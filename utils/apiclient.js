import CONFIG from './config.js';

class WavesApiClient {
  constructor() {
    this.nodeUrl = CONFIG.NODE_URL;
  }

async getCurrentPrices() {
  try {
    if (!CONFIG.SMART_CONTRACT_ADDRESS) {
      throw new Error('SMART_CONTRACT_ADDRESS не задан в config.js');
    }

    const url = `${this.nodeUrl}/addresses/data/${CONFIG.SMART_CONTRACT_ADDRESS}`;
    console.log('Запрос цен: URL =', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Полный ответ ноды:', data); // ВАЖНО: посмотрите, что возвращает нода

    // Поиск записей с ценами
    const basePriceEntry = data.find(d => d.key === 'base_price');
    const buyPriceEntry = data.find(d => d.key === 'buy_price');
    const sellPriceEntry = data.find(d => d.key === 'sell_price');

    console.log('Найденные записи:', {
      basePrice: basePriceEntry,
      buyPrice: buyPriceEntry,
      sellPrice: sellPriceEntry
    });

    // Формирование результата
    const result = {
      basePrice: basePriceEntry ? Number(basePriceEntry.value) : CONFIG.INITIAL_BASE_PRICE,
      buyPrice: buyPriceEntry ? Number(buyPriceEntry.value) : Math.round(CONFIG.INITIAL_BASE_PRICE * 0.99),
      sellPrice: sellPriceEntry ? Number(sellPriceEntry.value) : Math.round(CONFIG.INITIAL_BASE_PRICE * 1.01)
    };

    console.log('Возвращаемые цены:', result);
    return result;
  } catch (error) {
    console.error('Ошибка получения цен из блокчейна:', error);
    throw error;
  }
}


  parsePriceData(data) {
    // Вспомогательный метод для парсинга данных (можно расширить при необходимости)
    return data;
  }
}

export default WavesApiClient;
