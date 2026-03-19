import CONFIG from './config.js';
import WavesApiClient from './utils/apiclient.js';
import PriceCalculator from './services/priceCalculator.js';

const api = new WavesApiClient();
const priceCalc = new PriceCalculator();

async function initApp() {
  try {
    // Получаем цены из блокчейна
    const prices = await api.getCurrentPrices();

    // Заполняем блок с ценами
    document.getElementById('prices').innerHTML = `
      <div class="price-card">
        <h3>Текущие цены</h3>
        <p><strong>Цена покупки:</strong> ${(prices.buyPrice / 1000000).toFixed(4)} Rome</p>
        <p><strong>Цена продажи:</strong> ${(prices.sellPrice / 1000000).toFixed(4)} Rome</p>
        <p><small>Обновление: каждые 5 минут</small></p>
      </div>
    `;

    // Заполняем виджет торговли
    document.getElementById('trade-widget').innerHTML = `
      <div class="trade-card">
        <h3>Торговля MTKS</h3>

        <!-- Форма покупки -->
        <div class="trade-section">
          <h4>Купить MTKS</h4>
          <input type="number" id="buyAmount" placeholder="Сумма в Rome" min="${CONFIG.MIN_BUY_AMOUNT_ROME / 1000000}">
          <button onclick="handleBuy()">Купить</button>
          <p class="info">Мин. сумма: ${CONFIG.MIN_BUY_AMOUNT_ROME / 1000000} Rome</p>
        </div>

        <!-- Форма продажи -->
        <div class="trade-section">
          <h4>Продать MTKS</h4>
          <input type="number" id="sellAmount" placeholder="Количество MTKS" min="${CONFIG.MIN_SELL_AMOUNT_MTKS / 100000000}">
          <button onclick="handleSell()">Продать</button>
          <p class="info">Мин. сумма: ${CONFIG.MIN_SELL_AMOUNT_MTKS / 100000000} MTKS</p>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    document.getElementById('prices').innerHTML = '<p style="color: red;">Ошибка загрузки цен</p>';
  }
}

// Заглушки для обработчиков торговли (реализация позже)
function handleBuy() {
  alert('Покупка MTKS (реализация в следующих шагах)');
}

function handleSell() {
  alert('Продажа MTKS (реализация в следующих шагах)');
}

// Запуск приложения
initApp();
