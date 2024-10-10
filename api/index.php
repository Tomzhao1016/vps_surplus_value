<?php
// calculate.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

function calculateRemainingDays($expiryDate, $transactionDate) {
    $transaction = new DateTime($transactionDate);
    $expiry = new DateTime($expiryDate);
    $today = new DateTime(); // 获取当前日期

    // 如果交易日期在今天之后，使用今天作为起始日期
    if ($transaction > $today) {
        $transaction = $today;
    }

    // 如果到期日在交易日之前，返回0
    if ($expiry < $transaction) {
        return 0;
    }

    $interval = $transaction->diff($expiry);
    return $interval->days;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['expiryDate']) || !isset($input['transactionDate'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required date information']);
        exit;
    }

    $price = isset($input['price']) ? floatval($input['price']) : 0;
    $bidAmount = isset($input['bidAmount']) ? floatval($input['bidAmount']) : 0;
    $cycle = isset($input['cycle']) ? intval($input['cycle']) : 12; // cycle 代表月数
    $customRate = isset($input['customRate']) ? floatval($input['customRate']) : 100;

    // 计算剩余天数
    $remainingDays = calculateRemainingDays($input['expiryDate'], $input['transactionDate']);

    // 使用 customRate 调整价格
    $adjustedPrice = $price * ($customRate / 100);

    // 计算年化价格
    $annualPrice = $adjustedPrice * (12 / $cycle);
    
    // 计算每天的价值
    $dailyValue = $annualPrice / 365;
    
    // 计算原始周期的总天数
    $cycleDays = (365 * $cycle) / 12;
    
    // 计算剩余价值（考虑原始周期和实际剩余天数）
    $remainingValue = round($dailyValue * $remainingDays, 2);
    
    // 计算溢价金额
    $premiumValue = round($bidAmount - $remainingValue, 2);
    
    echo json_encode([
        'remainingValue' => $remainingValue,
        'premiumValue' => $premiumValue,
        'annualPrice' => $annualPrice,
        'dailyValue' => $dailyValue,
        'cycleDays' => $cycleDays,
        'remainingDays' => $remainingDays,
        'adjustedPrice' => $adjustedPrice
    ]);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}