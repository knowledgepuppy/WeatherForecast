#!/usr/bin/env python3
"""
Simplified weather prediction using only Python standard library
This version demonstrates the concept without external dependencies
"""

import random
import math
import json
from datetime import datetime, timedelta

class SimpleWeatherPredictor:
    def __init__(self):
        # Simulate historical temperature data
        self.historical_data = []
        self.generate_sample_data()
    
    def generate_sample_data(self):
        """Generate sample temperature data for demonstration"""
        base_temp = 20  # Base temperature in Celsius
        for i in range(365):  # One year of data
            # Simulate seasonal variation
            seasonal = 10 * math.sin(2 * math.pi * i / 365)
            # Add some random noise
            noise = random.uniform(-5, 5)
            temp = base_temp + seasonal + noise
            self.historical_data.append(round(temp, 1))
    
    def simple_moving_average(self, data, window=7):
        """Calculate simple moving average"""
        if len(data) < window:
            return sum(data) / len(data)
        return sum(data[-window:]) / window
    
    def predict_temperature(self, city_name, days_ahead=7):
        """Predict temperature for the next few days"""
        print(f"\n预测 {city_name} 未来 {days_ahead} 天的气温:")
        print("-" * 40)
        
        # Use last 30 days for prediction base
        recent_data = self.historical_data[-30:]
        base_prediction = self.simple_moving_average(recent_data, 7)
        
        predictions = []
        for day in range(1, days_ahead + 1):
            # Simple trend analysis
            trend = (recent_data[-1] - recent_data[-7]) / 7
            
            # Add some seasonal adjustment
            seasonal_factor = math.sin(2 * math.pi * day / 365) * 2
            
            # Random variation
            variation = random.uniform(-2, 2)
            
            predicted_temp = base_prediction + (trend * day) + seasonal_factor + variation
            predictions.append(round(predicted_temp, 1))
            
            date = datetime.now() + timedelta(days=day)
            print(f"第{day}天 ({date.strftime('%Y-%m-%d')}): {predicted_temp:.1f}°C")
        
        return predictions
    
    def show_recent_data(self):
        """Show recent historical data"""
        print("\n最近7天的模拟历史数据:")
        print("-" * 30)
        for i, temp in enumerate(self.historical_data[-7:], 1):
            date = datetime.now() - timedelta(days=7-i)
            print(f"{date.strftime('%Y-%m-%d')}: {temp}°C")

def main():
    print("=" * 50)
    print("简化版天气预测系统")
    print("(使用Python标准库实现)")
    print("=" * 50)
    
    predictor = SimpleWeatherPredictor()
    
    # Show some sample historical data
    predictor.show_recent_data()
    
    while True:
        try:
            city = input("\n请输入城市名称 (输入 'quit' 退出): ").strip()
            
            if city.lower() in ['quit', 'exit', '退出']:
                print("感谢使用天气预测系统!")
                break
            
            if not city:
                print("请输入有效的城市名称")
                continue
            
            # Make prediction
            predictions = predictor.predict_temperature(city)
            
            # Show some statistics
            avg_temp = sum(predictions) / len(predictions)
            max_temp = max(predictions)
            min_temp = min(predictions)
            
            print(f"\n预测统计:")
            print(f"平均气温: {avg_temp:.1f}°C")
            print(f"最高气温: {max_temp:.1f}°C")
            print(f"最低气温: {min_temp:.1f}°C")
            
        except KeyboardInterrupt:
            print("\n\n程序被用户中断")
            break
        except Exception as e:
            print(f"发生错误: {e}")

if __name__ == "__main__":
    main()