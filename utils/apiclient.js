// utils/apiclient.js
import CONFIG from './config.js';

export default class WavesApiClient {
  /**
   * Получает актуальные цены покупки и продажи
   * @returns {Promise<{buy: number, sell: number}>} Цены в атомах Rome
   */
 // utils/apiclient.js
async getPrices() {
  try {
    const basePrice = CONFIG.PRICE_CALCULATION.BASE_PRICE;
    const currentPrice = this.calculateDynamicPrice(basePrice);
    const sellPrice = Math.floor(currentPrice * 0.99);

    console.log('Рассчитанные цены:', {
      buy: currentPrice,
      sell: sellPrice
    });

    return {
      buy: currentPrice,
      sell: sellPrice
    };
  } catch (error) {
    console.error('Ошибка расчёта цен в API:', error);
    throw error;
  }
}


  /**
   * Рассчитывает динамическую цену на текущую дату
   * @param {number} basePrice - Базовая цена в атомах (6 знаков после запятой)
   * @returns {number} Текущая цена в атомах
   */
  calculateDynamicPrice(basePrice) {
    const baseDate = new Date(CONFIG.PRICE_CALCULATION.BASE_DATE);
    const today = new Date();
    const incrementPercent = CONFIG.PRICE_CALCULATION.INCREMENT_PERCENT;
    const incrementDates = CONFIG.PRICE_CALCULATION.INCREMENT_DATES;

    let periods = 0;
    let currentDate = new Date(baseDate);

    // Подсчёт количества периодов повышения цены (1-го и 15-го числа каждого месяца)
    while (currentDate <= today) {
      for (const day of incrementDates) {
        const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

        // Проверяем, что дата повышения находится в будущем относительно текущей даты периода
        // и не превышает текущую дату (today)
        if (nextDate > currentDate && nextDate <= today) {
          periods++;
        }
      }
      // Переходим к следующему месяцу
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Расчёт цены: basePrice × (1 + incrementPercent/100)^periods
    const multiplier = Math.pow(1 + incrementPercent / 100, periods);
    return Math.floor(basePrice * multiplier);
  }

  /**
   * Получает данные из хранилища DApp
   * @param {string} contractAddress -Адрес контракта
   * @param {string} key -Ключ данных
   * @returns {Promise<any>} Значение из хранилища
   */
  async getDataFromDApp(contractAddress, key) {
    for (const nodeUrl of CONFIG.NODE_CLUSTER) {
      try {
        const response = await fetch(
          `${nodeUrl}/contracts/data/${contractAddress}?keys=${encodeURIComponent(key)}`
        );

        if (!response.ok) {
          console.warn(`Нода недоступна или ошибка ответа: ${nodeUrl}`);
          continue;
        }

        const data = await response.json();

        if (data.data && data.data.length > 0) {
          return data.data[0].value;
        } else {
          console.warn(`Данные по ключу ${key} не найдены на ноде ${nodeUrl}`);
        }
      } catch (error) {
        console.warn(`Ошибка запроса к ноде ${nodeUrl}:`, error.message);
      }
    }

    throw new Error('Не удалось получить данные ни от одной ноды');
  }

  async getMTKSBalance() {
  const address = await this.getWalletAddress();
  const response = await fetch(`${CONFIG.NODE_CLUSTER[0]}/addresses/balance/${address}/${CONFIG.ASSET_IDS.MTKS}`);
  const data = await response.json();
  return data.balance;
}

  /**
   * Проверяет доступность нод
   * @returns {Promise<boolean>} true, если хотя бы одна нода доступна
   */
  async checkNodeAvailability() {
    for (const nodeUrl of CONFIG.NODE_CLUSTER) {
      try {
        const response = await fetch(`${nodeUrl}/blocks/height`);
        if (response.ok) {
          console.log(`Нода доступна: ${nodeUrl}`);
          return true;
        }
      } catch (error) {
        console.warn(`Нода недоступна: ${nodeUrl}`, error.message);
      }
    }
    return false;
  }
}
