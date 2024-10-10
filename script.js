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
        onChange: function(selectedDates, dateStr) {
            // 更新交易日期选择器的最大日期
            const transactionPicker = document.getElementById('transactionDate')._flatpickr;
            transactionPicker.set('maxDate', dateStr);
            validateDates();
        }
    });

    flatpickr("#transactionDate", {
        dateFormat: "Y-m-d",
        locale: "zh",
        placeholder: "选择交易日期",
        onChange: validateDates
    });
}

function validateDates() {
    const expiryDate = new Date(document.getElementById('expiryDate').value);
    const transactionDate = new Date(document.getElementById('transactionDate').value);

    // 设置时间为 00:00:00 以确保只比较日期
    expiryDate.setHours(0, 0, 0, 0);
    transactionDate.setHours(0, 0, 0, 0);

    if (transactionDate > expiryDate) {
        showNotification('交易日期不能晚于到期日期', 'error');
        document.getElementById('transactionDate').value = '';
    } else if (expiryDate.getTime() === transactionDate.getTime()) {
        showNotification('交易日期不能是到期当天', 'error');
        document.getElementById('transactionDate').value = '';
    }

    updateRemainingDays();
}

function updateRemainingDays() {
    const expiryDate = new Date(document.getElementById('expiryDate').value);
    const transactionDate = new Date(document.getElementById('transactionDate').value);

    if (expiryDate && transactionDate && transactionDate <= expiryDate) {
        const timeDiff = expiryDate.getTime() - transactionDate.getTime();
        const remainingDays = Math.max(Math.ceil(timeDiff / (1000 * 3600 * 24)), 0);

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
    const currentDate = new Date();
    const eastEightTime = new Date(currentDate.getTime() + (8 * 60 * 60 * 1000));
    const year = eastEightTime.getUTCFullYear();
    const month = String(eastEightTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(eastEightTime.getUTCDate()).padStart(2, '0');
    document.getElementById('transactionDate').value = `${year}-${month}-${day}`;
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
        const expiry = new Date(expiryDate);
        const transaction = new Date(transactionDate);
        
        const timeDiff = expiry.getTime() - transaction.getTime();
        const remainingDays = Math.max(Math.ceil(timeDiff / (1000 * 3600 * 24)), 0);

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

        fetch('api/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(result => {
            updateResults(result, data);
            showNotification('计算完成！', 'success');
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('计算过程中出现错误，请稍后再试。', 'error');
        });
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