const apiKey = '1738c81ccec49dcb31842070';

document.addEventListener('DOMContentLoaded', function() {
    flatpickr.localize(flatpickr.l10ns.zh);

    initializeDatePickers();
    fetchExchangeRate();
    setDefaultTransactionDate();
    document.getElementById('currency').addEventListener('change', fetchExchangeRate);
    document.getElementById('calculateBtn').addEventListener('click', calculateAndSend);
});

function initializeDatePickers() {
    flatpickr("#expiryDate", {
        dateFormat: "Y-m-d",
        locale: "zh",
        placeholder: "选择到期日期",
        minDate: "today",
        onChange: function(selectedDates, dateStr) {
            const transactionPicker = document.getElementById('transactionDate')._flatpickr;
            transactionPicker.set('maxDate', dateStr);
            validateDates();
        }
    });

    flatpickr("#transactionDate", {
        dateFormat: "Y-m-d",
        locale: "zh",
        placeholder: "选择交易日期",
        minDate: "today",
        onChange: validateDates
    });
}

function validateDates() {
    const expiryDateInput = document.getElementById('expiryDate').value;
    const transactionDateInput = document.getElementById('transactionDate').value;
    
    if (!expiryDateInput || !transactionDateInput) return;

    const expiryDate = new Date(expiryDateInput);
    const transactionDate = new Date(transactionDateInput);
    const today = new Date();

    // 设置所有时间为当天的开始（00:00:00）
    expiryDate.setHours(0, 0, 0, 0);
    transactionDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (transactionDate < today) {
        showNotification('交易日期不能早于今天', 'error');
        setDefaultTransactionDate();
        return;
    }

    if (expiryDate <= today) {
        showNotification('到期日期必须晚于今天', 'error');
        document.getElementById('expiryDate').value = '';
        return;
    }

    if (transactionDate > expiryDate) {
        showNotification('交易日期不能晚于到期日期', 'error');
        setDefaultTransactionDate();
        return;
    }

    if (expiryDate.getTime() === transactionDate.getTime()) {
        showNotification('交易日期不能等于到期日期', 'error');
        setDefaultTransactionDate();
        return;
    }

    updateRemainingDays();
}

function updateRemainingDays() {
    const expiryDate = document.getElementById('expiryDate').value;
    const transactionDate = document.getElementById('transactionDate').value;

    if (expiryDate && transactionDate) {
        const remainingDays = calculateRemainingDays(expiryDate, transactionDate);
        document.getElementById('remainingDays').textContent = remainingDays;
        
        if (remainingDays === 0) {
            showNotification('剩余天数为0，请检查日期设置', 'warning');
        }
    } else {
        document.getElementById('remainingDays').textContent = '0';
    }
}

function fetchExchangeRate() {
    const currency = document.getElementById('currency').value;
    fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${currency}`)
        .then(response => response.json())
        .then(data => {
            const rate = data.conversion_rates.CNY;
            const utcDate = new Date(data.time_last_update_utc);
            const eastEightTime = new Date(utcDate.getTime() + (8 * 60 * 60 * 1000));
            const formattedDate = `${eastEightTime.getUTCFullYear()}/${String(eastEightTime.getUTCMonth() + 1).padStart(2, '0')}/${String(eastEightTime.getUTCDate()).padStart(2, '0')}`;
            document.getElementById('exchangeRate').value = rate.toFixed(3);
            document.getElementById('customRate').value = rate.toFixed(3);
            document.getElementById('updateDate').innerText = `更新时间: ${formattedDate}`;
        })
        .catch(error => {
            console.error('Error fetching the exchange rate:', error);
            showNotification('获取汇率失败，请稍后再试。', 'error');
        });
}

function setDefaultTransactionDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const defaultDate = `${year}-${month}-${day}`;
    document.getElementById('transactionDate').value = defaultDate;
    if (document.getElementById('transactionDate')._flatpickr) {
        document.getElementById('transactionDate')._flatpickr.setDate(defaultDate);
    }
}

function calculateRemainingDays(expiryDate, transactionDate) {
    const expiry = new Date(expiryDate);
    const transaction = new Date(transactionDate);

    // 设置所有时间为当天的开始（00:00:00）
    expiry.setHours(0, 0, 0, 0);
    transaction.setHours(0, 0, 0, 0);
    
    // 如果到期日早于或等于交易日期，返回0
    if (expiry <= transaction) {
        return 0;
    }

    // 计算天数差异
    const timeDiff = expiry.getTime() - transaction.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

    return daysDiff;
}

function calculateAndSend() {
    const customRate = parseFloat(document.getElementById('customRate').value);
    const amount = parseFloat(document.getElementById('amount').value);
    const cycle = parseInt(document.getElementById('cycle').value);
    const expiryDate = document.getElementById('expiryDate').value;
    const transactionDate = document.getElementById('transactionDate').value;
    const bidAmount = parseFloat(document.getElementById('bidAmount').value);

    if (customRate && amount && cycle && expiryDate && transactionDate && !isNaN(bidAmount)) {
        const localAmount = (amount * customRate).toFixed(2);
        const remainingDays = calculateRemainingDays(expiryDate, transactionDate);
        
        // 计算年化价格
        const annualPrice = localAmount * (12 / cycle);
        
        // 计算每天的价值
        const dailyValue = annualPrice / 365;
        
        // 计算剩余价值
        const remainingValue = (dailyValue * remainingDays).toFixed(2);
        
        // 计算溢价金额
        const premiumValue = (bidAmount - parseFloat(remainingValue)).toFixed(2);

        const result = {
            remainingValue,
            premiumValue
        };

        const data = {
            price: localAmount,
            time: remainingDays,
            customRate,
            amount,
            cycle,
            expiryDate,
            transactionDate,
            bidAmount
        };

        updateResults(result, data);
        showNotification('计算完成！', 'success');
    } else {
        showNotification('请填写所有字段并确保输入有效', 'error');
    }
}

function updateResults(result, data) {
    document.getElementById('resultDate').innerText = data.transactionDate;
    document.getElementById('resultForeignRate').innerText = data.customRate.toFixed(3);
    document.getElementById('resultPrice').innerText = `${data.price} 人民币/年`;
    document.getElementById('resultDays').innerText = data.time;
    document.getElementById('resultExpiry').innerText = data.expiryDate;
    document.getElementById('resultValue').innerText = `${result.remainingValue} 元`;
    document.getElementById('premiumValue').innerText = `${result.premiumValue} 元`;
    
    document.getElementById('calcResult').scrollIntoView({ behavior: 'smooth' });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}