// utils/config.js

export default {
  // Кластер нод для отказоустойчивости
  NODE_CLUSTER: [
    'https://nodes.wavesnodes.com',           // Основная публичная нода Waves
    'https://node.turtlenetwork.org',         // Нода Turtle Network
    'https://testnodes.wavesplatform.com'      // Тестовая нода (для отладки)
  ],


  // ВАШИ ДАННЫЕ: адрес вашего смарт‑контракта
  SMART_CONTRACT_ADDRESS: '3PJYK94GQDFQdYfQqPTxtVVmSYBZPWtMmLN',

  // ID токенов (ваши данные из контракта)
  ASSET_IDS: {
    MTKS: 'A6SEU4ppBnqqLJh9VxnFKmz2hNA6S1psQApazwiDynNg',    // MTKS (8 знаков)
    ROME: 'AP4Cb5xLYGH6ZigHreCZHoXpQTWDkPsG2BHqfDUx6taJ',     // Rome (6 знаков)
    WAVES: 'WAVES'                                             // Waves (8 знаков)
  },

  // Ключи хранилища данных контракта (из вашего кода)
  STORAGE_KEYS: {
    BASE_PRICE: 'base_price',           // Базовый курс (в Rome, 6 знаков)
    BUY_PRICE: 'buy_price',             // Цена покупки (в Rome, 6 знаков)
    SELL_PRICE: 'sell_price',          // Цена продажи (в Rome, 6 знаков)
    LAST_UPDATE: 'last_update',        // Timestamp последнего обновления
    TOTAL_SOLD: 'total_sold',         // Всего продано MTKS
    TOTAL_BOUGHT: 'total_bought',     // Всего куплено MTKS
    TOTAL_MINTED: 'total_minted',     // Всего отминчено MTKS
    WAVES_POOL: 'waves_pool',         // Rome в пуле для обмена на Waves
    LOCKED_ROME: 'locked_rome'        // Rome в запертом пуле
  },

  // Начальные значения (дефолтные, если ключи не записаны в хранилище)
  BASE_PRICE_INITIAL: 1050000,     // 1.05 Rome (6 знаков)
  BUY_PRICE_INITIAL: 1050000,      // 1.05 Rome
  SELL_PRICE_INITIAL: 1039500,    // 1.0395 Rome (99 % от base)

  // Параметры контракта (ваши настройки из кода)
  CONTRACT_PARAMETERS: {
    MINT_AMOUNT: 300000000000,         // 3000 MTKS (8 знаков)
    MIN_AMOUNT_MTKS: 100000000,       // 1 MTKS (8 знаков)
    MIN_AMOUNT_ROME: 1000000,        // 1 ROME (6 знаков)
    FEE_PERCENT: 3,                  // 0.3 % комиссия
    WAVES_FEE: 5000000,             // 0.005 WAVES
    PRICE_INCREMENT: 125,            // 0.125 % шаг увеличения цены
    WAVES_POOL_THRESHOLD: 10000000, // 10 ROME (6 знаков)
    SELL_SPREAD_NUMERATOR: 99,       // 99 % (цена продажи ниже на 1 %)
    SELL_SPREAD_DENOMINATOR: 100,   // 100 %
    FREE_PERCENT: 6,               // 0.6 % админу
    LOCKED_PERCENT: 994              // 99.4 % в запертый пул
  },

  // ВАШ адрес администратора (отдельный от контракта)
  ADMIN_ADDRESS: '3PJYK94GQDFQdYfQqPTxtVVmSYBZPWtMmLN',

  // Настройки автоматического обновления цен
  AUTO_UPDATE: {
    ENABLED: true,                     // Включить автообновление
    INTERVAL_MS: 30000,           // Интервал автообновления в мс (30 сек)
    MAX_FAILURES: 3                  // Макс. число ошибок подряд перед остановкой автообновления
  },
 // Параметры расчёта динамической цены
  PRICE_CALCULATION: {
    BASE_PRICE: 1050000,           // 1.05 Rome (в атомах, 6 знаков)
    BASE_DATE: '2026-03-03',     // Дата установки базовой цены
    INCREMENT_PERCENT: 0.125,  // 0.125 % — шаг повышения
    INCREMENT_DATES: [1, 15]     // Дни месяца для повышения цены (1‑е и 15‑е число)
  },

  // Прочие настройки
  APP_SETTINGS: {
    RETRY_ATTEMPTS: 3,               // Число попыток повторных запросов при ошибке
    TIMEOUT_MS: 10000,            // Таймаут запроса в мс (10 сек)
    DECIMAL_PLACES: 6              // Число знаков после запятой для Rome
  }
};
