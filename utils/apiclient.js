// utils/apiclient.js
import CONFIG from './config.js';

class WavesApiClient {
constructor() {
this.nodeUrls = CONFIG.NODE_CLUSTER;
this.assetIds = CONFIG.ASSET_IDS;
}

/**
* Проверяет доступность нод кластера
* @id70533735 (@returns) {Promise<string|null>} URL доступной ноды или null
*/
async checkNodeAvailability() {
for (const nodeUrl of this.nodeUrls) {
try {
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

const response = await fetch(`${nodeUrl}/blocks/height`, {
method: 'GET',
headers: {
'Content-Type': 'application/json'
},
signal: controller.signal
});

clearTimeout(timeoutId);

if (response.ok) {
console.log(`✅ Нода доступна: ${nodeUrl}`);
return nodeUrl;
}
} catch (error) {
console.warn(`❌ Нода недоступна: ${nodeUrl}`, error.message);
}
}
return null;
}

/**
* Получает балансы всех активов для указанного адреса
* @param {string} address - Адрес кошелька Waves
* @id70533735 (@returns) {Promise<Object>} Объект с балансами активов
*/
async getBalances(address) {
console.log('=== ЗАПУСК getBalances() ===');
console.log('Адрес для запроса балансов:', address);

if (!this.validateAddress(address)) {
throw new Error('Некорректный адрес Waves: должен содержать 35+ символов');
}

const activeNode = await this.checkNodeAvailability();
if (!activeNode) {
throw new Error('Нет доступных нод для выполнения запроса');
}

try {
const balances = {};

const wavesBalance = await this.fetchWavesBalance(activeNode, address);
balances.waves = wavesBalance;

const assetsBalances = await this.fetchAssetsBalances(activeNode, address);
Object.assign(balances, assetsBalances);

console.log('✅ Балансы успешно получены:', balances);
return balances;
} catch (error) {
console.error('❌ Ошибка получения балансов:', error);
throw error;
}
}

/**
* Валидирует адрес Waves
* @param {string} address
* @id70533735 (@returns) {boolean}
*/
validateAddress(address) {
return address && typeof address === 'string' && address.length >= 35;
}

/**
* Запрашивает баланс WAVES
* @param {string} nodeUrl
* @param {string} address
* @id70533735 (@returns) {Promise<string>}
*/
async fetchWavesBalance(nodeUrl, address) {
try {
const response = await fetch(`${nodeUrl}/addresses/balance/${address}`);

if (!response.ok) {
throw new Error(`HTTP ${response.status}: Ошибка получения баланса WAVES`);
}

const data = await response.json();
return (data.balance / 100000000).toFixed(6);
} catch (error) {
console.warn('⚠ Не удалось получить баланс WAVES, используем 0.000000');
return '0.000000';
}
}

/**
* Запрашивает балансы кастомных активов
* @param {string} nodeUrl
* @param {string} address
* @id70533735 (@returns) {Promise<Object>}
*/
async fetchAssetsBalances(nodeUrl, address) {
try {
const response = await fetch(`${nodeUrl}/assets/balance/${address}`);

if (!response.ok) {
throw new Error(`HTTP ${response.status}: Ошибка получения балансов активов`);
}

const data = await response.json();
const balances = {};

const mtksAsset = data.balances.find(a => a.assetId === this.assetIds.MTKS);
if (mtksAsset) {
balances.mtks = (mtksAsset.balance / Math.pow(10, mtksAsset.decimals)).toFixed(8);
} else {
balances.mtks = '0.00000000';
}

const romeAsset = data.balances.find(a => a.assetId === this.assetIds.ROME);
if (romeAsset) {
balances.rome = (romeAsset.balance / Math.pow(10, romeAsset.decimals)).toFixed(6);
} else {
balances.rome = '0.000000';
}

return balances;
} catch (error) {
console.warn('⚠ Не удалось получить балансы активов, используем нулевые значения');
return {
mtks: '0.00000000',
rome: '0.000000'
};
}
}

/**
* Рассчитывает динамическую цену на текущую дату
* @param {number} basePrice - Базовая цена в атомах
* @id70533735 (@returns) {number} Текущая цена в атомах
*/
calculateDynamicPrice(basePrice) {
const baseDate = new Date(CONFIG.PRICE_CALCULATION.BASE_DATE);
const today = new Date();
const incrementPercent = CONFIG.PRICE_CALCULATION.INCREMENT_PERCENT;
const incrementDates = CONFIG.PRICE_CALCULATION.INCREMENT_DATES;

let periods = 0;
let currentDate = new Date(baseDate);

while (currentDate <= today) {
for (const day of incrementDates) {
const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
if (nextDate > currentDate && nextDate <= today) {
periods++;
}
}
currentDate.setMonth(currentDate.getMonth() + 1);
}

const multiplier = Math.pow(1 + incrementPercent / 100, periods);
return Math.floor(basePrice * multiplier);
}

/**
* Получает текущие цены покупки/продажи
* @id70533735 (@returns) {Promise<Object>} { buy: number, sell: number }
*/
async getPrices() {
try {
const basePrice = CONFIG.PRICE_CALCULATION.BASE_PRICE;
const currentPrice = this.calculateDynamicPrice(basePrice);
const sellPrice = Math.floor(currentPrice * 0.99);

console.log('💹 Рассчитанные цены:', { buy: currentPrice, sell: sellPrice });
return { buy: currentPrice, sell: sellPrice };
} catch (error) {
console.error('❌ Ошибка расчёта цен:', error);
throw error;
}
}

/**
* Получает данные из хранилища DApp
* @param {string} contractAddress - Адрес контракта
* @param {string} key - Ключ данных
* @id70533735 (@returns) {Promise<any>} Значение из хранилища
*/
async getDataFromDApp(contractAddress, key) {
for (const nodeUrl of this.nodeUrls) {
try {
const response = await fetch(
`${nodeUrl}/contracts/data/${contractAddress}?keys=${encodeURIComponent(key)}`
);

if (!response.ok) continue;

const data = await response.json();
if (data.data && data.data.length > 0) {
return data.data[0].value;
}
} catch (error) {
console.warn(`⚠ Ошибка запроса к ноде ${nodeUrl}:`, error.message);
}
}
throw new Error('Не удалось получить данные ни от одной ноды');
}
}

export default WavesApiClient;
