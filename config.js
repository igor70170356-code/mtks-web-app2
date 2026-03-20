export default {
  // Базовые параметры ценообразования
  INITIAL_BASE_PRICE: 1050000,        // 1.05 Rome (6 знаков)
  PRICE_INCREMENT_PERCENT: 0.125,     // Ежемесячное повышение на 0.125 %
  SELL_SPREAD_PERCENT: 1,            // Цена продажи на 1 % ниже базовой

  // Минимальные суммы
  MIN_BUY_AMOUNT_ROME: 1000000,     // 1 Rome (6 знаков)
  MIN_SELL_AMOUNT_MTKS: 100000000, // 1 MTKS (8 знаков)

  // Комиссии
  BUY_COMMISSION_PERCENT: 0.3,      // 0.3 % Rome в пул при покупке
  SELL_COMMISSION_PERCENT: 0.3,     // 0.3 % MTKS админу при продаже
  WAVES_FEE: 5000000,             // 0.005 WAVES админу (в атомах)
  FREE_PERCENT: 0.6,               // 0.6 % от выручки Rome админу
  LOCKED_PERCENT: 99.4,           // 99.4 % в запертый пул

  // Параметры минта
  MINT_AMOUNT: 30000000000,       // 3000 MTKS (8 знаков)
  MIN_ADMIN_MTKS_FOR_MINT: 100000000, // Если на кошельке админа ≤ 1 MTKS

  // Порог для покупки WAVES
  WAVES_POOL_THRESHOLD: 10000000,  // 10 Rome (6 знаков) в пуле

  // Адреса и ID активов
  DAPP_ADDRESS: '3PJYK94GQDFQdYfQqPTxtVVmSYBZPWtMmLN', // Адрес DApp
  MTKS_ASSET_ID: 'A6SEU4ppBnqqLJh9VxnFKmz2hNA6S1psQApazwiDynNg', // ID MTKS (8 знаков)
  ROME_ASSET_ID: 'AP4Cb5xLYGH6ZigHreCZHoXpQTWDkPsG2BHqfDUx6taJ', // ID Rome (6 знаков)
  WAVES_ASSET_ID: 'WAVES',           // ID WAVES
  ADMIN_ADDRESS: '3PJYK94GQDFQdYfQqPTxtVVmSYBZPWtMmLN', // Кошелёк админа

  // Кластер нод Waves (мультинода для отказоустойчивости)
  NODE_CLUSTER: [
    'https://nodes.wavesnodes.com',
    'https://eu-west-1.wavesnodes.com',
    'https://us-east-1.wavesnodes.com'
  ],

  // Ключи хранилища DApp (должны совпадать с контрактом)
  STORAGE_KEYS: {
    BASE_PRICE: 'base_price',
    BUY_PRICE: 'buy_price',
    SELL_PRICE: 'sell_price',
    LAST_UPDATE: 'last_update',
    TOTAL_SOLD: 'total_sold',
    TOTAL_BOUGHT: 'total_bought',
    TOTAL_MINTED: 'total_minted',
    WAVES_POOL: 'waves_pool',
    LOCKED_ROME: 'locked_rome'
  },

  // Настройки для автоматического повышения цены
  AUTO_PRICE_INCREASE: {
    ENABLED: true,
    DAYS: [1, 15], // Каждое 1‑е и 15‑е число месяца
    TIME: '00:00' // В полночь
  },

  // Прочие настройки
  DECIMALS: {
    MTKS: 8,    // 8 знаков для MTKS
    ROME: 6,   // 6 знаков для Rome
    WAVES: 8   // 8 знаков для WAVES
  }
};
