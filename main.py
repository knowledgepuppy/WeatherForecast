import createTrainingSet
import LSTM
import sys
from sklearn.model_selection import train_test_split
import time

input_size = 1
hidden_size = 256
output_size = 2
num_epochs = 1000
learning_rate = 0.001

t1 = time.time()

try:
    cityName = input("Please Enter the City Which Temperature You Want to Predict:")
    cityCode = createTrainingSet.findCityCode(cityName)
    text = createTrainingSet.getHTMLtext(cityCode)
    Data = createTrainingSet.dataExtract(text)
    createTrainingSet.CreateTrainingSet(Data, cityName)
    dataTime,Temp = LSTM.GetTrainSet(cityName)
    dataTime_Train, dataTime_Test, Temp_Train, Temp_Test = train_test_split(dataTime, Temp, test_size=0.4, random_state=0)
    # 创建LSTM模型
    model = LSTM.LSTM(input_size, hidden_size, output_size)

    # 训练模型
    LSTM.train(model, dataTime_Train, Temp_Train, learning_rate, num_epochs)

    # 测试模型
    predicted_data = LSTM.test(model, dataTime_Test, Temp_Test)

    print("Predicted Data:", predicted_data)


except Exception as e:
    print("异常" + str(type(e)) + "\n" + str(e))
    sys.exit()

t2 = time.time()
print("程序运行时间：", t2 - t1,"s")