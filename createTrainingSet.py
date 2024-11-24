import sys
import requests
from bs4 import BeautifulSoup

url="https://tianqi.2345.com/wea_history/{}.htm"

# 定义请求头
user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
headers = {
    'User-Agent': user_agent
}




# 在cityCode.txt中查找cityName对应的cityCode
def findCityCode(cityName):
    with open('cityCode.txt', 'r', encoding='utf-8') as file:
        for line in file:
            line = line.strip()
            parts = line.split(" ")
            if cityName == parts[0]:
                cityCode = parts[1]
                break
    return cityCode

# 获取网站内容
def getHTMLtext(cityCode):
    try:
        r=requests.get(url.format(str(cityCode)),headers=headers,timeout=30)
        r.raise_for_status()
        r.encoding='utf-8'
        return r.text
    except Exception as e:
        print("异常"+str(type(e))+"\n"+str(e))
        return None
    
# 处理网站内容并提取数据
def dataExtract(r):
    if r is None:
        sys.exit() # 中断程序运行
    else:
        try:
            soup=BeautifulSoup(r,'lxml')
            return fillData(soup)
        except Exception as e:
            print("异常" + str(type(e)) + "\n" + str(e))
            sys.exit()


# 提取数据
def fillData(soup):
    allData = [] # 二维列表
    data = soup.find_all('tr')
    for tr in data:
        ltd = tr.find_all('td')
        if len(ltd) == 0:
            continue
        singleData = []
        for td in ltd:
            singleData.append(td.string)
        allData.append(singleData)
    return allData




# 将爬虫数据写入文件作为训练集
def CreateTrainingSet(allData,cityName):
    try:
        filePath = 'Set/trainingSet{}.txt'.format(cityName)

        lines = []
        for sublist in allData:
            line = '\t'.join(map(str, sublist))
            lines.append(line + '\n')

        with open(filePath, 'w', encoding='utf-8') as file:
            file.writelines(lines)
        print("Success!")
    except Exception as e:
        print("异常" + str(type(e)) + "\n" + str(e))




