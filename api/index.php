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
    $today = new DateTime();

    $startDate = max($transaction, $today);
    return max(0, $expiry->diff($startDate)->days);
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

    // 计算剩余天数
    $remainingDays = calculateRemainingDays($input['expiryDate'], $input['transactionDate']);

    // 计算年化价格
    $annualPrice = $price * (12 / $cycle);
    
    // 计算每天的价值
    $dailyValue = $annualPrice / 365;
    
    // 直接计算剩余价值
    $remainingValue = round($dailyValue * $remainingDays, 2);
    
    // 计算溢价金额
    $premiumValue = round($bidAmount - $remainingValue, 2);
    
    echo json_encode([
        'remainingValue' => $remainingValue,
        'premiumValue' => $premiumValue,
        'annualPrice' => $annualPrice,
        'dailyValue' => $dailyValue,
        'remainingDays' => $remainingDays
    ]);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}