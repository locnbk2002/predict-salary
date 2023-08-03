# -*- coding: utf-8 -*-
"""Predict salary

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1qgrgfH1p7qPRM9BgjDBBB_-T8bprFwpA

---
# **ĐỌC DỮ LIỆU GIAO DỊCH (data.csv) TỪ FILE CSV(/content/data.csv) VÀO**

CTRL + F9 để chạy code
"""

# Đọc dữ liệu từ file data1
import sys
import pandas as pd
import json
import warnings
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from sklearn.cluster import KMeans
import matplotlib.cm as cm
import numpy as np
from sklearn.metrics import silhouette_score
import pandas as pd
import warnings

warnings.filterwarnings("ignore")

data = sys.stdin.read()
data_list = json.loads(data)

# Chuyển dữ liệu JSON thành DataFrame
data = pd.DataFrame(data_list)

# Chọn các cột cần thiết
data = data.loc[:, ["transactionDate", "description", "amount"]]

# Loại bỏ các hàng trùng lặp dựa trên các cột đã chọn
data = data.drop_duplicates()

# Chuyển đổi định dạng 'transactionDate' sang kiểu datetime
data["transactionDate"] = pd.to_datetime(data["transactionDate"])

# Sắp xếp DataFrame tăng dần dựa trên cột 'transactionDate'
data = data.sort_values(by="transactionDate", ascending=True)

last_day_of_transaction = data["transactionDate"].iloc[-1]
# print("Last day of transaction:", last_day_of_transaction)


# print(data.head)

"""---
#**GIỮ LẠI (AMOUNT > 1.000.000) VÀ VẼ BIỂU ĐỒ PHÂN TÁN THEO NGÀY**

## **Giữ lại giao dịch nhận vào (amount > 1.000.000)**
"""

# Kiểm tra kiểu dữ liệu của cột 'transactionDate' và chuyển sang đối tượng datetime nếu cần

if not pd.api.types.is_datetime64_any_dtype(data["transactionDate"]):
    data["transactionDate"] = pd.to_datetime(data["transactionDate"])
    data["transactionDate"] = data["transactionDate"].dt.strftime("%Y-%m-%d")

# Lọc các giá trị 'amount' > 1000000
data_positive_amount = data[data["amount"] >= 1000000]
# Tạo cột mới 'day' chỉ lấy ngày từ cột 'transactionDate'
data_positive_amount["day"] = pd.to_datetime(data_positive_amount["transactionDate"]).dt.day
data_positive_amount["month"] = pd.to_datetime(data_positive_amount["transactionDate"]).dt.month
# print(data_positive_amount)
# print("Số giao dịch nhận vào (amount > 0): ", len(data_positive_amount))
# # Trích xuất thông tin ngày, tháng và năm từ cột "transactionDate"
start_date_transaction = pd.to_datetime(data_positive_amount["transactionDate"].iloc[0])
end_date_transaction = pd.to_datetime(data_positive_amount["transactionDate"].iloc[-1])

# Tính khoảng cách tháng giữa hai ngày
months_diff_transaction = (end_date_transaction.year - start_date_transaction.year) * 12 + (
    end_date_transaction.month - start_date_transaction.month + 1
)

best_num_clusters = 0
if len(data_positive_amount) <= 2 * months_diff_transaction:
    best_num_clusters = 1

"""
## **Biểu đồ phân tán theo ngày**"""

import matplotlib.pyplot as plt

# # Vẽ biểu đồ phân tán
# plt.figure(figsize=(10, 5))
# plt.scatter(data_positive_amount["day"], data_positive_amount["amount"], color="red")
# plt.xlabel("Ngày")
# plt.ylabel("Số tiền")
# plt.title("Biểu đồ phân bố tiền theo ngày (amount > 0)")
# plt.xticks(data_positive_amount["day"].unique())
# plt.tight_layout()
# plt.show()

"""---
#**PHÂN CỤM DỮ LIỆU BẰNG K-MEANS**

## **Chuẩn hóa dữ liệu bằng Min-Max Scaling**
"""


# Chuẩn hóa dữ liệu sử dụng Min-Max Scaling
# Tạo một bản sao của DataFrame 'data_positive_amount'
data_positive_amount_copy = data_positive_amount.copy()

# Tạo một bản đồ từ ngày sang số tương ứng
day_mapping = {
    20: 1,
    21: 2,
    22: 3,
    23: 4,
    24: 5,
    25: 6,
    26: 7,
    27: 8,
    28: 9,
    29: 10,
    30: 11,
    31: 12,
    1: 13,
    2: 14,
    3: 15,
    4: 16,
    5: 17,
    6: 18,
    7: 19,
    8: 20,
    9: 21,
    10: 22,
    11: 23,
    12: 24,
    13: 25,
    14: 26,
    15: 27,
    16: 28,
    17: 29,
    18: 30,
    19: 31,
}

# Áp dụng bản đồ để chuyển đổi cột 'day' trong bản sao
data_positive_amount_copy["day"] = data_positive_amount_copy["day"].map(day_mapping)
data_positive_amount_copy["transactionDate"] = data["transactionDate"] + pd.Timedelta(days=10)

# print(data_positive_amount_copy)
# print(data_positive_amount)
scaler = MinMaxScaler()
data_scaled = scaler.fit_transform(data_positive_amount_copy[["day", "amount"]])
# data_scaled = scaler.fit_transform(data_positive_amount[['day', 'amount']])
# print(data_scaled)

"""
## **Tính số lượng cụm phù hợp bằng Silhouette**"""


if best_num_clusters == 0:
    # Tạo danh sách số lượng clusters để thử nghiệm
    num_clusters_list = range(2, 6)  # Thử nghiệm từ 2 đến 10 clusters

    # Khởi tạo danh sách để lưu giá trị Silhouette
    silhouette_scores = []

    # Thử nghiệm số lượng clusters và tính Silhouette cho mỗi giá trị
    for num_clusters in num_clusters_list:
        kmeans = KMeans(n_clusters=num_clusters)
        kmeans.fit(data_scaled)

        silhouette_avg = silhouette_score(data_scaled, kmeans.labels_)
        silhouette_scores.append(silhouette_avg)

    # Tìm số lượng clusters có điểm Silhouette trung bình cao nhất
    best_num_clusters = num_clusters_list[np.argmax(silhouette_scores)]

    # # Vẽ biểu đồ Silhouette
    # plt.figure(figsize=(10, 5))
    # plt.plot(range(2, 6), silhouette_scores, marker="o")
    # plt.xlabel("Số lượng clusters")
    # plt.ylabel("Điểm Silhouette")
    # plt.title("Biểu đồ Silhouette")
    # plt.show()

    # Hiển thị số lượng clusters có điểm Silhouette trung bình cao nhất

# print("Số cluste phù hợp là:", best_num_clusters)

"""
## **Biểu đồ phân cụm các giao dịch nhận vào theo ngày**"""


# best_num_clusters = 1
# Áp dụng thuật toán K-Means với số lượng nhóm tập trung là best_num_clusters
kmeans = KMeans(n_clusters=best_num_clusters)
kmeans.fit(data_scaled)

data_positive_amount["cluster"] = kmeans.labels_
# Tạo một colormap với số lượng màu tương ứng với số lượng cluster
num_clusters = len(data_positive_amount["cluster"].unique())
colors = cm.rainbow(np.linspace(0, 1, num_clusters))

# # Vẽ biểu đồ phân tán với màu sắc tương ứng cho từng nhóm
# plt.figure(figsize=(10, 5))
# for cluster_id, color in zip(range(num_clusters), colors):
#     cluster_data = data_positive_amount[data_positive_amount["cluster"] == cluster_id]
#     plt.scatter(
#         cluster_data["day"],
#         cluster_data["amount"],
#         color=color,
#         label=f"Cluster {cluster_id}",
#     )

# plt.legend()
# plt.xlabel("Ngày")
# plt.ylabel("Số tiền")
# plt.title(
#     f"Biểu đồ phân bố giao dịch nhận vào theo ngày với số cụm là {best_num_clusters}"
# )
# plt.xticks(data_positive_amount["day"].unique())
# plt.tight_layout()
# plt.show()

"""---
#**PHÂN TÍCH DỮ LIỆU TỪ CÁC CỤM ĐỂ DỰ ĐOÁN GIÁ TRỊ LƯƠNG**

##**Loại bỏ giá trị trong các cụm (không có giao dịch 2 tháng liên tiếp)**
"""

# Khởi tạo một từ điển để lưu trữ dữ liệu của tất cả các cụm sau khi lọc
cluster_data_filtered_dict = {}
mean_amount_all = 0
# prev_filter_transactionDate = None


# Định nghĩa hàm để lọc dữ liệu từ cuối trở về và loại bỏ các hàng có khoảng cách ngày lớn hơn 31 trong mỗi nhóm cluster
def filter_cluster_data(cluster_data):
    # print(cluster_data)
    data_positive_amount["transactionDate"] = pd.to_datetime(data_positive_amount["transactionDate"])
    # Sắp xếp DataFrame theo cột 'transactionDate' theo thứ tự giảm dần
    # cluster_data.sort_values(by='transactionDate', ascending=False, inplace=True)

    # Xác định các chỉ số cần loại bỏ
    indices_to_remove = 0
    # Chuyển cột 'transactionDate' sang kiểu datetimelike
    # Tính số trung vị của cột 'amount'
    # median_cluster = cluster_data['amount'].median()
    # Lọc các giá trị 'amount' lớn hơn 0.3 lần số trung vị
    # cluster_data = cluster_data[(cluster_data['amount'] > 0.2 * median_cluster) & (cluster_data['amount'] < 5 * median_cluster)]

    for i in range(len(cluster_data) - 1, 0, -1):
        # Chuyển cột 'transactionDate' sang định dạng chỉ gồm tháng và năm
        cluster_data["month_year"] = pd.to_datetime(cluster_data["transactionDate"]).dt.to_period("M")
        # Xác định chỉ số mà khoảng cách từ tháng đó tới tháng sau lớn hơn 1 tháng
        if (cluster_data["month_year"].iloc[i] - cluster_data["month_year"].iloc[i - 1]).n > 2:
            indices_to_remove = i
            break

    # Loại bỏ các hàng từ các chỉ số indices_to_remove

    cluster_data_filtered = cluster_data.iloc[indices_to_remove:]

    # Chuyển cột 'transactionDate' sang định dạng chỉ gồm tháng và năm
    cluster_data_filtered["month_year"] = pd.to_datetime(cluster_data_filtered["transactionDate"]).dt.to_period("M")

    # Gom nhóm các hàng theo cột 'month_year'
    grouped_data = cluster_data_filtered.groupby("month_year")

    # Lọc ra giá trị 'amount' gần  giá trị trung bình nhất trong mỗi nhóm tháng
    def filter_data(x):
        global mean_amount_all
        # global prev_filter_transactionDate
        # print("zzz")
        # print(mean_amount_all)
        if mean_amount_all == 0:
            mean_amount_all = x["amount"].mean()

        # Lọc ra các giá trị lớn hơn mean_amount_all
        filtered_data = x[x["amount"] >= mean_amount_all]

        if not filtered_data.empty:
            # if prev_filter_transactionDate:
            #     # Lọc lại dữ liệu đã lọc trước đó với điều kiện < 45 ngày
            #     filtered_data = x[(pd.to_datetime(x['transactionDate']) - pd.to_datetime(prev_filter_transactionDate)).dt.days <= 45]

            # Kiểm tra nếu có ít nhất một giá trị lớn hơn mean_amount_all sau khi đã lọc lại dữ liệu
            if not filtered_data.empty:
                # Sắp xếp các giá trị lớn hơn mean_amount_all theo thứ tự tăng dần
                filtered_data = filtered_data.sort_values(by="amount")
                filtered_data = filtered_data.head(1)

                # Lưu lại 'transactionDate' cuối cùng vào biến last_transaction_date
                last_transaction_date = filtered_data.iloc[-1]["transactionDate"]
                # prev_filter_transactionDate = filtered_data.iloc[-1]['transactionDate']
                # print(prev_filter_transactionDate)
                mean_amount_all = filtered_data["amount"].iloc[0]

        else:
            # Nếu không có giá trị nào lớn hơn mean_amount_all, lấy giá trị lớn nhất trong nhóm tháng
            filtered_data = x[x["amount"] == x["amount"].max()]
            mean_amount_all = filtered_data["amount"].iloc[0]
            # prev_filter_transactionDate = filtered_data.iloc[-1]['transactionDate']

        return filtered_data

    cluster_data_filtered = grouped_data.apply(filter_data).reset_index(drop=True)
    # global prev_filter_transactionDate
    # prev_filter_transactionDate = None

    return cluster_data_filtered


# # Hiển thị các giá trị trong từng nhóm
for cluster_id in data_positive_amount["cluster"].unique():
    # print(f"\n\n======================Cụm {cluster_id}=========================")
    cluster_data = data_positive_amount[data_positive_amount["cluster"] == cluster_id]
    cluster_data_filtered = filter_cluster_data(cluster_data)
    # In dữ liệu trước
    # print(f"---------------------TRƯỚC---------------Số lượng: {len(cluster_data)}")
    # print(cluster_data)
    # So sánh transactionDate cuối cùng của cụm với ngày hiện tại
    # Nếu transactionDate cuối cùng của cụm nhỏ hơn ngày hiện tại quá 2 tháng thì bỏ qua cụm đó

    if (
        (
            pd.to_datetime(last_day_of_transaction) - pd.to_datetime(cluster_data_filtered["transactionDate"].iloc[-1])
        ).days
        > 45
    ) | (len(cluster_data_filtered) < 3):
        continue

    # Lưu trữ dữ liệu của cụm sau khi lọc vào từ điển
    cluster_data_filtered_dict[cluster_id] = cluster_data_filtered

    print(
        # f"\n---------------------SAU-----------------Số lượng: {len(cluster_data_filtered)}"
    )
    # In dữ liệu của cụm sau khi lọc
    # print(cluster_data_filtered)
    print(
        # "=====================================================================\n\n\n\n"
    )

"""##**Chuẩn hóa dữ liệu trong các cụm**"""

# cluster_data_filtered_dict là dictionary chứa các cụm dữ liệu sau khi lọc
# Tính độ lệch chuẩn cho từng cụm

std_dev_dict = {}
for cluster_id, cluster_data_filtered in cluster_data_filtered_dict.items():
    # Chuẩn hóa dữ liệu bằng cách chia tất cả các giá trị trong cụm cho giá trị nhỏ nhất
    normalized_data = cluster_data_filtered["amount"] / cluster_data_filtered["amount"].min()
    # print(f"================{cluster_id}======================")
    # print(cluster_data_filtered)
    # print("Trước khi chuẩn hóa")
    # print(f"{cluster_data_filtered['amount'] }")
    # print("Sau khi chuẩn hóa")
    # print(f"{normalized_data}")
    # print("======================================")

    if len(cluster_data_filtered) > 1:  # Nếu số lượng phần tử trong cụm lớn hơn 1
        # Tính độ lệch chuẩn sau khi chuẩn hóa
        std_dev = normalized_data.std()
    else:  # Nếu số lượng phần tử trong cụm là 1 hoặc 0, gán độ lệch chuẩn là None
        std_dev = None
    std_dev_dict[cluster_id] = std_dev

"""##**Cụm có độ lệch giữa các phân tử nhỏ nhất có thể là lương**"""

# Lọc ra các cụm có độ lệch chuẩn không phải None
valid_std_dev_dict = {k: v for k, v in std_dev_dict.items() if v is not None}

# Tìm cụm có độ lệch chuẩn nhỏ nhất (nếu có)
if valid_std_dev_dict:
    min_std_dev_cluster = min(valid_std_dev_dict, key=valid_std_dev_dict.get)
    # print(f"Cụm có độ lệch chuẩn nhỏ nhất: Cụm {min_std_dev_cluster}")
    # print("Độ lệch chuẩn của các cụm:")
    # for cluster_id, std_dev in valid_std_dev_dict.items():
    #     print(f"Cụm {cluster_id}: {std_dev}")

    # print(f"\nCụm dự đoán  là lương : {min_std_dev_cluster}")
    clusterPredict = cluster_data_filtered_dict[min_std_dev_cluster]

    # print(clusterPredict)

    # Tính trung bình của cột "amount"
    average_amount = clusterPredict["amount"].mean()

    # # Trích xuất thông tin ngày, tháng và năm từ cột "transactionDate"
    # start_date = pd.to_datetime(clusterPredict['transactionDate'].iloc[0])
    # end_date = pd.to_datetime(clusterPredict['transactionDate'].iloc[-1])

    # # Tính khoảng cách tháng giữa hai ngày
    # months_diff = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month + 1)
    months_diff = len(clusterPredict)

    # Lấy giá trị ngày cuối cùng của cột "day"
    last_day_value = pd.to_datetime(clusterPredict["transactionDate"].iloc[-1]).strftime("%Y-%m-%d")

    # In kết quả
    # print("\n\n=============================================================")
    # print(f"\nGiá trị lương dụ đoán là: {average_amount}")
    # print(f"\nSố tháng lương: {months_diff}")
    # print(f"\nNgày nhận lương cuối cùng: {last_day_value}")

    # Tạo một từ điển để lưu trữ kết quả
    # Đổi định dạng cột "transactionDate" thành chuỗi
    clusterPredict["transactionDate"] = clusterPredict["transactionDate"].dt.strftime("%Y-%m-%d")
    transactions = clusterPredict.to_json(orient="records", default_handler=str)
    result_dict = {
        "salary": average_amount,
        "monthSalary": months_diff,
        "lastSalaryDate": last_day_value,
        "transactions": json.loads(transactions),
    }

    # Chuyển đổi từ điển thành chuỗi JSON
    result_json = json.dumps(result_dict)

    # In chuỗi JSON
    print(result_json)


else:
    result_dict = {
        "salary": 0,
        "monthSalary": 0,
        "lastSalaryDate": 0,
        "transactions": {},
    }

    # Chuyển đổi từ điển thành chuỗi JSON
    result_json = json.dumps(result_dict)

    # In chuỗi JSON
    print(result_json)
