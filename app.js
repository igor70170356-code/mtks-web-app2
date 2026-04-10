// app.js
import WavesApiClient from './utils/apiclient.js';
import CONFIG from './utils/config.js';

class MTKSDApp {
constructor() {
this.apiClient = new WavesApiClient();
this.priceUpdateInterval = null;
this.balanceUpdateInterval = null;
}

async init() {
console.log('=== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ===');

try {
console.log('Проверка доступности ноды...');
const isNodeAvailable = await this.checkNodeAvailability();
console.log('Доступность ноды:', isNodeAvailable);

if (!isNodeAvailable) {
this.showConnectionError();
return;
}

console.log('Загрузка конфигурации...');
console.log('CONFIG:', CONFIG);

console.log('Обновление цен...');
await this.updatePrices();

console.log('Обновление балансов...');
await this.updateBalances();

this.setupEventListeners();
this.setupTrading();
this.startAutoPriceUpdates();
this.startBalanceUpdates();

console.log('✅ Приложение инициализировано успешно');
} catch (error) {
console.error('❌ Ошибка инициализации:', error);
this.showConnectionError();
}
}

async checkNodeAvailability() {
for (const node of CONFIG.NODE_CLUSTER) {
try {
const response = await fetch(`${node}/blocks/height`);
if (response.ok) {
console.log('Нода доступна:', node);
return true;
}
} catch (error) {
console.warn('Нода недоступна:', node, error.message);
}
}
return false;
}

async updatePrices() {
console.log('=== ЗАПУСК updatePrices() ===');

try {
console.log('Вызов getPrices() из API...');
const prices = await this.apiClient.getPrices();
console.log('Получены цены:', prices);

const buyPriceElement = document.getElementById('buy-price');
const sellPriceElement = document.getElementById('sell-price');

console.log('Элемент #buy-price найден:', !!buyPriceElement);
console.log('Элемент #sell-price найден:', !!sellPriceElement);

if (buyPriceElement) {
buyPriceElement.textContent = (prices.buy / 1000000).toFixed(6);
console.log('Цена покупки обновлена:', (prices.buy / 1000000).toFixed(6));
} else {
console.warn('❌ Элемент #buy-price не найден в DOM!');
}

if (sellPriceElement) {
sellPriceElement.textContent = (prices.sell / 1000000).toFixed(6);
console.log('Цена продажи обновлена:', (prices.sell / 1000000).toFixed(6));
} else {
console.warn('❌ Элемент #sell-price не найден в DOM!');
}
} catch (error) {
console.error('❌ Критическая ошибка загрузки цен:', error);
this.showPriceError();
}
}

showPriceError() {
const buyPriceElement = document.getElementById('buy-price');
const sellPriceElement = document.getElementById('sell-price');

if (buyPriceElement) buyPriceElement.textContent = 'Ошибка загрузки';
if (sellPriceElement) sellPriceElement.textContent = 'Ошибка загрузки';
}

async updateBalances() {
try {
const balances = await this.apiClient.getBalances(CONFIG.ADMIN_ADDRESS);
const mtksBalanceElement = document.getElementById('mtks-balance');
const romeBalanceElement = document.getElementById('rome-balance');

if (mtksBalanceElement) mtksBalanceElement.textContent = balances.mtks;
if (romeBalanceElement) romeBalanceElement.textContent = balances.rome;
} catch (error) {
console.error('Ошибка обновления балансов:', error);
}
}

setupEventListeners() {
const buyButton = document.getElementById('buy-button');
const sellButton = document.getElementById('sell-button');

if (buyButton) {
buyButton.addEventListener('click', () => this.handleBuy());
} else {
console.warn('Кнопка покупки не найдена');
}

if (sellButton) {
sellButton.addEventListener('click', () => this.handleSell());
} else {
console.warn('Кнопка продажи не найдена');
}
}

setupTrading() {
const buyAmountInput = document.getElementById('buy-amount');
const sellAmountInput = document.getElementById('sell-amount');

if (buyAmountInput) {
buyAmountInput.addEventListener('input', () => this.updateBuyTotal());
} else {
console.warn('Поле ввода покупки не найдено');
}

if (sellAmountInput) {
sellAmountInput.addEventListener('input', () => this.updateSellTotal());
} else {
console.warn('Поле ввода продажи не найдено');
}
}

updateBuyTotal() {
const buyAmountInput = document.getElementById('buy-amount');
const priceElement = document.getElementById('buy-price');
const totalElement = document.getElementById('buy-total');

if (!buyAmountInput || !priceElement || !totalElement) {
console.warn('Один из элементов для расчёта покупки не найден в DOM');
return;
}

const amount = parseFloat(buyAmountInput.value) || 0;
const price = parseFloat(priceElement.textContent) || 0;

totalElement.textContent = (amount * price).toFixed(6);
console.log('Сумма покупки обновлена:', totalElement.textContent);
}

updateSellTotal() {
const sellAmountInput = document.getElementById('sell-amount');
const priceElement = document.getElementById('sell-price');
const totalElement = document.getElementById('sell-total');

if (!sellAmountInput || !priceElement || !totalElement) {
console.warn('Один из элементов для расчёта продажи не найден в DOM');
return;
}

const amount = parseFloat(sellAmountInput.value) || 0;
const price = parseFloat(priceElement.textContent) || 0;

totalElement.textContent = (amount * price).toFixed(6);
console.log('Сумма продажи обновлена:', totalElement.textContent);
}

handleBuy() {
const buyAmountInput = document.getElementById('buy-amount');

if (!buyAmountInput) {
console.error('Поле ввода количества для покупки не найдено');
alert('Ошибка: поле ввода количества не доступно');
return;
}

const amount = parseFloat(buyAmountInput.value);
if (amount > 0) {
alert(`Покупка ${amount} MTKS выполнена!`);
this.updateBalances();
} else {
alert('Введите корректное количество для покупки');
}
}

handleSell() {
const sellAmountInput = document.getElementById('sell-amount');

if (!sellAmountInput) {
console.error('Поле ввода количества для продажи не найдено');
alert('Ошибка: поле ввода количества не доступно');
return;
}

const amount = parseFloat(sellAmountInput.value);
if (amount > 0) {
alert(`Продажа ${amount} MTKS выполнена!`);
this.updateBalances();
} else {
alert('Введите корректное количество для продажи');
}
}

startAutoPriceUpdates() {
console.log('Запуск автообновления цен каждые 30 секунд');
this.priceUpdateInterval = setInterval(() => {
console.log('Автообновление цен...');
this.updatePrices();
}, 30000);
}

startBalanceUpdates() {
this.balanceUpdateInterval = setInterval(() => {
this.updateBalances();
}, 60000);
}

showConnectionError() {
alert('Ошибка подключения к ноде Waves. Проверьте интернет‑соединение и доступность нод.');
}
}

document.addEventListener('DOMContentLoaded', () => {
window.app = new MTKSDApp();
window.app.init();
});
