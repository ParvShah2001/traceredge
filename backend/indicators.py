"""
Technical indicator computation for Indian Stock Screener.
Includes RSI, Moving Averages (SMA/EMA), MACD, Bollinger Bands, and Consensus Scores.
"""
from typing import List, Dict, Any, Tuple
import math


def calculate_rsi(prices: List[float], period: int = 14) -> float:
    """Calculates 14-period Relative Strength Index (RSI)."""
    if len(prices) < period + 1:
        return 50.0

    gains = []
    losses = []
    for i in range(1, len(prices)):
        change = prices[i] - prices[i - 1]
        if change > 0:
            gains.append(change)
            losses.append(0.0)
        else:
            gains.append(0.0)
            losses.append(abs(change))

    # Wilder's smoothing
    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period

    for i in range(period, len(gains)):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period

    if avg_loss == 0:
        return 100.0
    
    rs = avg_gain / avg_loss
    rsi = 100.0 - (100.0 / (1.0 + rs))
    return round(rsi, 2)


def calculate_sma(prices: List[float], period: int) -> float:
    """Calculates Simple Moving Average."""
    if len(prices) < period or period <= 0:
        return prices[-1] if prices else 0.0
    return round(sum(prices[-period:]) / period, 2)


def calculate_ema(prices: List[float], period: int) -> float:
    """Calculates Exponential Moving Average."""
    if len(prices) < period or period <= 0:
        return prices[-1] if prices else 0.0
    
    multiplier = 2 / (period + 1)
    ema = sum(prices[:period]) / period
    for price in prices[period:]:
        ema = (price - ema) * multiplier + ema
    return round(ema, 2)


def calculate_macd(prices: List[float]) -> Tuple[float, float, float]:
    """Calculates MACD (12, 26, 9) -> (macd_line, signal_line, histogram)."""
    if len(prices) < 26:
        return (0.0, 0.0, 0.0)
    
    ema12 = calculate_ema(prices, 12)
    ema26 = calculate_ema(prices, 26)
    macd_line = round(ema12 - ema26, 2)
    
    # Calculate MACD series for signal line
    macd_series = []
    for i in range(26, len(prices) + 1):
        sub_prices = prices[:i]
        sub_ema12 = calculate_ema(sub_prices, 12)
        sub_ema26 = calculate_ema(sub_prices, 26)
        macd_series.append(sub_ema12 - sub_ema26)
    
    if len(macd_series) >= 9:
        signal_line = calculate_ema(macd_series, 9)
    else:
        signal_line = macd_line

    histogram = round(macd_line - signal_line, 2)
    return (macd_line, signal_line, histogram)


def calculate_bollinger_bands(prices: List[float], period: int = 20, num_std: float = 2.0) -> Dict[str, float]:
    """Calculates Bollinger Bands (upper, middle, lower)."""
    if len(prices) < period:
        last = prices[-1] if prices else 0.0
        return {"upper": last, "middle": last, "lower": last}

    slice_prices = prices[-period:]
    mean = sum(slice_prices) / period
    variance = sum((p - mean) ** 2 for p in slice_prices) / period
    std_dev = math.sqrt(variance)

    upper = round(mean + (num_std * std_dev), 2)
    middle = round(mean, 2)
    lower = round(mean - (num_std * std_dev), 2)
    return {"upper": upper, "middle": middle, "lower": lower}


def evaluate_technical_score(price: float, rsi: float, sma20: float, sma50: float, sma200: float, ema20: float, macd_hist: float) -> Dict[str, Any]:
    """
    Evaluates multi-indicator consensus score between 0 (Extreme Bearish) and 100 (Strong Bullish).
    """
    bull_points = 0
    total_checks = 6

    # 1. Price above 20 EMA
    if price > ema20:
        bull_points += 1

    # 2. Price above 50 SMA
    if price > sma50:
        bull_points += 1

    # 3. Golden cross or 50 SMA above 200 SMA
    if sma50 > sma200:
        bull_points += 1

    # 4. RSI condition (Bullish if between 45 and 70)
    if 45 <= rsi <= 70:
        bull_points += 1
    elif rsi > 70:
        bull_points += 0.5  # Strong momentum but overbought
    elif rsi < 30:
        bull_points += 0.5  # Oversold bounce potential

    # 5. MACD histogram positive
    if macd_hist > 0:
        bull_points += 1

    # 6. Price above 200 SMA (Long-term Bull Market)
    if price > sma200:
        bull_points += 1

    score = round((bull_points / total_checks) * 100)
    
    if score >= 80:
        signal = "Strong Buy"
        badge_color = "emerald"
    elif score >= 60:
        signal = "Buy"
        badge_color = "teal"
    elif score >= 40:
        signal = "Neutral"
        badge_color = "amber"
    elif score >= 20:
        signal = "Sell"
        badge_color = "rose"
    else:
        signal = "Strong Sell"
        badge_color = "red"

    return {
        "score": score,
        "signal": signal,
        "badge_color": badge_color,
        "bull_points": bull_points,
        "total_checks": total_checks
    }
