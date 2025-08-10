import Chart from 'chart.js/auto';

// 天气预测类
class WeatherPredictor {
    constructor() {
        this.historicalData = [];
        this.generateSampleData();
    }

    generateSampleData() {
        const baseTemp = 20;
        for (let i = 0; i < 365; i++) {
            const seasonal = 10 * Math.sin(2 * Math.PI * i / 365);
            const noise = (Math.random() - 0.5) * 10;
            const temp = baseTemp + seasonal + noise;
            this.historicalData.push(Math.round(temp * 10) / 10);
        }
    }

    simpleMovingAverage(data, window = 7) {
        if (data.length < window) {
            return data.reduce((a, b) => a + b, 0) / data.length;
        }
        return data.slice(-window).reduce((a, b) => a + b, 0) / window;
    }

    predictTemperature(cityName, daysAhead = 7) {
        const recentData = this.historicalData.slice(-30);
        const basePrediction = this.simpleMovingAverage(recentData, 7);
        
        const predictions = [];
        for (let day = 1; day <= daysAhead; day++) {
            const trend = (recentData[recentData.length - 1] - recentData[recentData.length - 7]) / 7;
            const seasonalFactor = Math.sin(2 * Math.PI * day / 365) * 2;
            const variation = (Math.random() - 0.5) * 4;
            
            const predictedTemp = basePrediction + (trend * day) + seasonalFactor + variation;
            const windSpeed = Math.max(5, Math.min(35, 15 + (Math.random() - 0.5) * 20));
            
            predictions.push({
                day: day,
                date: new Date(Date.now() + day * 24 * 60 * 60 * 1000),
                temperature: Math.round(predictedTemp * 10) / 10,
                windSpeed: Math.round(windSpeed * 10) / 10
            });
        }
        
        return predictions;
    }
}

// 铁塔风荷载计算类
class TowerWindLoadCalculator {
    constructor() {
        this.terrainParameters = {
            'A': { alpha: 0.12, z0: 0.01 },  // 平坦开阔地面
            'B': { alpha: 0.16, z0: 0.05 },  // 农田、村镇
            'C': { alpha: 0.22, z0: 0.20 },  // 有密集建筑群的城市市区
            'D': { alpha: 0.30, z0: 1.00 }   // 有密集建筑群且房屋较高的城市市区
        };
    }

    // 计算风速剖面（考虑高度效应）
    calculateWindProfile(baseWindSpeed, height, terrainType, referenceHeight = 10) {
        const terrain = this.terrainParameters[terrainType];
        const windSpeed = baseWindSpeed * Math.pow(height / referenceHeight, terrain.alpha);
        return Math.max(windSpeed, 0);
    }

    // 计算风压
    calculateWindPressure(windSpeed, airDensity = 1.225) {
        return 0.5 * airDensity * Math.pow(windSpeed, 2);
    }

    // 计算铁塔截面积（线性变化）
    calculateCrossSection(height, totalHeight, baseWidth, topWidth) {
        const ratio = height / totalHeight;
        const width = baseWidth - (baseWidth - topWidth) * ratio;
        // 假设铁塔为方形截面，考虑镂空率
        const solidityRatio = 0.3; // 实体率30%
        return width * width * solidityRatio;
    }

    // 主计算函数
    calculateWindLoad(params) {
        const {
            towerHeight,
            segments,
            baseWidth,
            topWidth,
            dragCoefficient,
            baseWindSpeed,
            terrainType,
            altitude,
            turbulence
        } = params;

        const results = [];
        const segmentHeight = towerHeight / segments;
        let totalLoad = 0;
        let maxLoad = 0;
        let totalWindSpeed = 0;

        // 海拔修正系数
        const altitudeCorrection = Math.pow(1 - altitude / 44300, 5.256);
        const correctedAirDensity = 1.225 * altitudeCorrection;

        for (let i = 0; i < segments; i++) {
            const height = (i + 0.5) * segmentHeight; // 取段中点高度
            
            // 计算该高度的风速
            let windSpeed = this.calculateWindProfile(baseWindSpeed, height, terrainType);
            
            // 湍流修正
            windSpeed *= (1 + turbulence * Math.random());
            
            // 计算风压
            const windPressure = this.calculateWindPressure(windSpeed, correctedAirDensity);
            
            // 计算截面积
            const crossSection = this.calculateCrossSection(height, towerHeight, baseWidth, topWidth);
            
            // 计算风荷载
            const windLoad = windPressure * crossSection * dragCoefficient;
            
            results.push({
                height: Math.round(height * 100) / 100,
                windSpeed: Math.round(windSpeed * 100) / 100,
                windPressure: Math.round(windPressure * 100) / 100,
                crossSection: Math.round(crossSection * 1000) / 1000,
                windLoad: Math.round(windLoad * 100) / 100
            });
            
            totalLoad += windLoad;
            maxLoad = Math.max(maxLoad, windLoad);
            totalWindSpeed += windSpeed;
        }

        return {
            results,
            summary: {
                totalLoad: Math.round(totalLoad * 100) / 100,
                maxLoad: Math.round(maxLoad * 100) / 100,
                avgWindSpeed: Math.round((totalWindSpeed / segments) * 100) / 100
            }
        };
    }

    // 生成工程报告
    generateReport(params, results) {
        const report = {
            title: "铁塔风荷载计算报告",
            timestamp: new Date().toLocaleString('zh-CN'),
            parameters: params,
            results: results,
            recommendations: this.generateRecommendations(results)
        };
        return report;
    }

    generateRecommendations(results) {
        const recommendations = [];
        const maxLoad = results.summary.maxLoad;
        
        if (maxLoad > 5000) {
            recommendations.push("建议加强铁塔结构设计，最大风荷载较大");
        }
        if (results.summary.avgWindSpeed > 25) {
            recommendations.push("平均风速较高，建议考虑抗风措施");
        }
        if (results.results.length > 0) {
            const topLoad = results.results[results.results.length - 1].windLoad;
            if (topLoad > maxLoad * 0.8) {
                recommendations.push("塔顶风荷载较大，建议重点关注顶部结构");
            }
        }
        
        return recommendations;
    }
}

// 主应用类
class App {
    constructor() {
        this.weatherPredictor = new WeatherPredictor();
        this.towerCalculator = new TowerWindLoadCalculator();
        this.currentWeatherData = null;
        this.charts = {};
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // 标签切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // 天气预测
        document.getElementById('predict-btn').addEventListener('click', () => {
            this.predictWeather();
        });

        // 风荷载计算
        document.getElementById('calculate-btn').addEventListener('click', () => {
            this.calculateWindLoad();
        });

        // 导出报告
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportReport();
        });

        // 回车键触发预测
        document.getElementById('city-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.predictWeather();
            }
        });
    }

    switchTab(tabName) {
        // 更新按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 更新内容显示
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    async predictWeather() {
        const cityInput = document.getElementById('city-input');
        const cityName = cityInput.value.trim();
        
        if (!cityName) {
            alert('请输入城市名称');
            return;
        }

        const loadingEl = document.getElementById('weather-loading');
        const dataEl = document.getElementById('weather-data');
        
        loadingEl.classList.remove('hidden');
        dataEl.innerHTML = '';

        // 模拟异步预测过程
        setTimeout(() => {
            const predictions = this.weatherPredictor.predictTemperature(cityName, 7);
            this.currentWeatherData = { city: cityName, predictions };
            this.displayWeatherResults(predictions, cityName);
            loadingEl.classList.add('hidden');
        }, 1500);
    }

    displayWeatherResults(predictions, cityName) {
        const dataEl = document.getElementById('weather-data');
        
        let html = `
            <div class="weather-prediction">
                <h3>${cityName} 未来7天天气预测</h3>
        `;
        
        predictions.forEach(pred => {
            html += `
                <div class="prediction-item">
                    <span class="prediction-date">
                        第${pred.day}天 (${pred.date.toLocaleDateString('zh-CN')})
                    </span>
                    <span class="prediction-temp">
                        ${pred.temperature}°C | 风速: ${pred.windSpeed} m/s
                    </span>
                </div>
            `;
        });
        
        const avgTemp = predictions.reduce((sum, p) => sum + p.temperature, 0) / predictions.length;
        const avgWind = predictions.reduce((sum, p) => sum + p.windSpeed, 0) / predictions.length;
        
        html += `
            </div>
            <div class="summary-stats">
                <div class="stat-item">
                    <span class="stat-label">平均气温</span>
                    <span class="stat-value">${Math.round(avgTemp * 10) / 10}°C</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">平均风速</span>
                    <span class="stat-value">${Math.round(avgWind * 10) / 10} m/s</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">最高气温</span>
                    <span class="stat-value">${Math.max(...predictions.map(p => p.temperature))}°C</span>
                </div>
            </div>
        `;
        
        dataEl.innerHTML = html;
    }

    async calculateWindLoad() {
        const loadingEl = document.getElementById('tower-loading');
        const tableEl = document.getElementById('results-table');
        const chartsEl = document.getElementById('charts-container');
        
        // 获取输入参数
        const params = {
            towerHeight: parseFloat(document.getElementById('tower-height').value),
            segments: parseInt(document.getElementById('tower-segments').value),
            baseWidth: parseFloat(document.getElementById('base-width').value),
            topWidth: parseFloat(document.getElementById('top-width').value),
            dragCoefficient: parseFloat(document.getElementById('drag-coefficient').value),
            baseWindSpeed: parseFloat(document.getElementById('base-wind-speed').value),
            terrainType: document.getElementById('terrain-type').value,
            altitude: parseFloat(document.getElementById('altitude').value),
            turbulence: parseFloat(document.getElementById('turbulence').value)
        };

        // 验证输入
        if (params.towerHeight <= 0 || params.segments <= 0) {
            alert('请输入有效的铁塔参数');
            return;
        }

        loadingEl.classList.remove('hidden');
        tableEl.classList.add('hidden');
        chartsEl.classList.add('hidden');

        // 模拟计算过程
        setTimeout(() => {
            const results = this.towerCalculator.calculateWindLoad(params);
            this.displayTowerResults(results);
            this.createCharts(results);
            
            loadingEl.classList.add('hidden');
            tableEl.classList.remove('hidden');
            chartsEl.classList.remove('hidden');
        }, 2000);
    }

    displayTowerResults(results) {
        // 更新统计数据
        document.getElementById('total-load').textContent = `${results.summary.totalLoad} N`;
        document.getElementById('max-load').textContent = `${results.summary.maxLoad} N`;
        document.getElementById('avg-wind-speed').textContent = `${results.summary.avgWindSpeed} m/s`;

        // 更新表格
        const tbody = document.getElementById('table-body');
        tbody.innerHTML = '';
        
        results.results.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.height}</td>
                <td>${row.windSpeed}</td>
                <td>${row.windPressure}</td>
                <td>${row.crossSection}</td>
                <td>${row.windLoad}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    createCharts(results) {
        // 销毁现有图表
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });

        const heights = results.results.map(r => r.height);
        const loads = results.results.map(r => r.windLoad);
        const windSpeeds = results.results.map(r => r.windSpeed);

        // 风荷载分布图
        const loadCtx = document.getElementById('load-chart').getContext('2d');
        this.charts.load = new Chart(loadCtx, {
            type: 'line',
            data: {
                labels: heights,
                datasets: [{
                    label: '风荷载 (N)',
                    data: loads,
                    borderColor: 'rgb(102, 126, 234)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '高度 (m)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '风荷载 (N)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });

        // 风速剖面图
        const windCtx = document.getElementById('wind-profile-chart').getContext('2d');
        this.charts.wind = new Chart(windCtx, {
            type: 'line',
            data: {
                labels: heights,
                datasets: [{
                    label: '风速 (m/s)',
                    data: windSpeeds,
                    borderColor: 'rgb(40, 167, 69)',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '高度 (m)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '风速 (m/s)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    exportReport() {
        if (!document.getElementById('results-table').classList.contains('hidden')) {
            // 获取当前计算参数和结果
            const params = {
                towerHeight: document.getElementById('tower-height').value,
                segments: document.getElementById('tower-segments').value,
                baseWidth: document.getElementById('base-width').value,
                topWidth: document.getElementById('top-width').value,
                dragCoefficient: document.getElementById('drag-coefficient').value,
                baseWindSpeed: document.getElementById('base-wind-speed').value,
                terrainType: document.getElementById('terrain-type').value,
                altitude: document.getElementById('altitude').value,
                turbulence: document.getElementById('turbulence').value
            };

            // 生成报告内容
            let reportContent = `铁塔风荷载计算报告\n`;
            reportContent += `生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
            reportContent += `计算参数:\n`;
            reportContent += `铁塔总高度: ${params.towerHeight} m\n`;
            reportContent += `分段数量: ${params.segments}\n`;
            reportContent += `塔底宽度: ${params.baseWidth} m\n`;
            reportContent += `塔顶宽度: ${params.topWidth} m\n`;
            reportContent += `阻力系数: ${params.dragCoefficient}\n`;
            reportContent += `基准风速: ${params.baseWindSpeed} m/s\n`;
            reportContent += `地形类别: ${params.terrainType}\n`;
            reportContent += `海拔高度: ${params.altitude} m\n`;
            reportContent += `湍流强度: ${params.turbulence}\n\n`;

            reportContent += `计算结果:\n`;
            reportContent += `总风荷载: ${document.getElementById('total-load').textContent}\n`;
            reportContent += `最大单点荷载: ${document.getElementById('max-load').textContent}\n`;
            reportContent += `平均风速: ${document.getElementById('avg-wind-speed').textContent}\n\n`;

            reportContent += `详细数据:\n`;
            reportContent += `高度(m)\t风速(m/s)\t风压(Pa)\t截面积(m²)\t风荷载(N)\n`;
            
            const rows = document.querySelectorAll('#table-body tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                reportContent += `${cells[0].textContent}\t${cells[1].textContent}\t${cells[2].textContent}\t${cells[3].textContent}\t${cells[4].textContent}\n`;
            });

            // 下载报告
            const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `铁塔风荷载计算报告_${new Date().toISOString().slice(0, 10)}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            alert('请先进行风荷载计算');
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new App();
});