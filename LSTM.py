import sys
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

# 创建训练集
def GetTrainSet(cityName):
    try:
        dataTime = []
        Temp = []
        i = 0
        with open('set/trainingSet{}.txt'.format(cityName), 'r', encoding='utf-8') as file:
            for line in file:
                line = line.strip()
                line = line.replace('\t',' ')
                line = line.replace('°',' ')
                parts = line.split(" ")
                dataTime.append([i+1])
                Temp.append([float(parts[2]),float(parts[4])])
                i += 1
        return dataTime,Temp
    except Exception as e:
        print("异常" + str(type(e)) + "\n" + str(e))
        sys.exit()

# 定义LSTM模型类
class LSTM(nn.Module):
    def __init__(self,input_size,hidden_size,output_size):
        super(LSTM,self).__init__()
        self.hidden_size = hidden_size
        self.lstm = nn.LSTM(input_size,hidden_size)
        self.fc = nn.Linear(hidden_size,output_size)
    
    def forward(self,input):
        lstm_out, _ = self.lstm(input.view(len(input),1,-1))
        output = self.fc(lstm_out.view(len(input),-1))
        return output
    
# 训练函数
def train(model,train_data,train_labels,learning_rate,num_epochs):

    train_data = np.array(train_data)
    train_labels = np.array(train_labels)

    train_data = train_data.astype(float)
    train_labels = train_labels.astype(float)

    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(),lr=learning_rate)

    

    for epoch in range(num_epochs):
        inputs = torch.from_numpy(train_data).float()
        labels = torch.from_numpy(train_labels).float()

        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs,labels)
        loss.backward()
        optimizer.step()

        if (epoch+1) % 100 == 0:
            print('Epoch [{}/{}], Loss: {:.4f}'.format(epoch+1,num_epochs,loss.item()))


# 测试函数
def test(model,test_data,test_labels):

    test_data = np.array(test_data)
    test_labels = np.array(test_labels)

    test_data = test_data.astype(float)
    test_labels = test_labels.astype(float)

    inputs = torch.from_numpy(test_data).float()
    labels = torch.from_numpy(test_labels).float()

    

    outputs = model(inputs)
    loss = nn.MSELoss()(outputs,labels)
    print('Test Loss: {:.4f}'.format(loss.item()))

    predicted_data = outputs.detach().numpy()
    
    
    return predicted_data

