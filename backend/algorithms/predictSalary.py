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


warnings.filterwarnings("ignore")

# Đọc dữ liệu từ file JSON
# with open('data.json', 'r') as file:
# with open('data1.json', 'r') as file:
# with open("test1.json", "r") as file:
#     data_list = json.load(file)
data = sys.stdin.read()
data_list = json.loads(data)

# Tạo danh sách mới chỉ chứa hai trường 'transactionDate' và 'amount' từ từ điển ban đầu
data_list = [{"transactionDate": data["transactionDate"], "amount": data["amount"]} for data in data_list]

# Sắp xếp data_list theo trường 'date'
data_list = sorted(data_list, key=lambda x: x["transactionDate"])
last_day_of_transaction = data_list[-1]["transactionDate"]


# Kiểm tra và chuyển đổi trường 'transactionDate' thành kiểu datetime trong từng từ điển
for data in data_list:
    if not pd.api.types.is_datetime64_any_dtype(data["transactionDate"]):
        data["transactionDate"] = pd.to_datetime(data["transactionDate"])

# Tạo DataFrame từ danh sách các từ điển
data_positive_amount = pd.DataFrame(data_list)

# Lọc các giá trị 'amount' > 0
data_positive_amount = data_positive_amount[data_positive_amount["amount"] > 0]

# Tạo cột mới 'day' chỉ lấy ngày từ cột 'transactionDate'
data_positive_amount["day"] = pd.to_datetime(data_positive_amount["transactionDate"]).dt.day

# In dữ liệu sau khi lọc và số giao dịch nhận vào
# print(data_positive_amount)
# print("Số giao dịch nhận vào (amount > 0): ", len(data_positive_amount))

# Vẽ biểu đồ phân tán
# plt.figure(figsize=(10, 5))
# plt.scatter(data_positive_amount['day'], data_positive_amount['amount'], color='red')
# plt.xlabel('Ngày')
# plt.ylabel('Số tiền')
# plt.title('Biểu đồ phân bố tiền theo ngày (amount > 0)')
# plt.xticks(data_positive_amount['day'].unique())
# plt.tight_layout()
# plt.show()

# Chuẩn hóa dữ liệu sử dụng Min-Max Scaling
scaler = MinMaxScaler()
data_scaled = scaler.fit_transform(data_positive_amount[["day", "amount"]])
# print(data_scaled)


# Tạo danh sách số lượng clusters để thử nghiệm

minCluster = 2
maxCluster = len(data_scaled)
if maxCluster > 12:
    maxCluster = 12

num_clusters_list = range(minCluster, maxCluster)  # Thử nghiệm từ 2 đến 10 clusters

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

# Vẽ biểu đồ Silhouette
# plt.figure(figsize=(10, 5))
# plt.plot(range(minCluster, maxCluster), silhouette_scores, marker="o")
# plt.xlabel("Số lượng clusters")
# plt.ylabel("Điểm Silhouette")
# plt.title("Biểu đồ Silhouette")
# plt.show()

# Hiển thị số lượng clusters có điểm Silhouette trung bình cao nhất
# print("Số lượng clusters có điểm Silhouette trung bình cao nhất:", best_num_clusters)


# Áp dụng thuật toán K-Means với số lượng nhóm tập trung là best_num_clusters
kmeans = KMeans(n_clusters=best_num_clusters)
kmeans.fit(data_scaled)
data_positive_amount["cluster"] = kmeans.labels_
# Tạo một colormap với số lượng màu tương ứng với số lượng cluster
num_clusters = len(data_positive_amount["cluster"].unique())
colors = cm.rainbow(np.linspace(0, 1, num_clusters))

# Vẽ biểu đồ phân tán với màu sắc tương ứng cho từng nhóm
plt.figure(figsize=(10, 5))
for cluster_id, color in zip(range(num_clusters), colors):
    cluster_data = data_positive_amount[data_positive_amount["cluster"] == cluster_id]
    plt.scatter(cluster_data["day"], cluster_data["amount"], color=color, label=f"Cluster {cluster_id}")

# plt.legend()
# plt.xlabel("Ngày")
# plt.ylabel("Số tiền")
# plt.title(f"Biểu đồ phân bố giao dịch nhận vào theo ngày với số cụm là {best_num_clusters}")
# plt.xticks(data_positive_amount["day"].unique())
# plt.tight_layout()
# plt.show()


# Khởi tạo một từ điển để lưu trữ dữ liệu của tất cả các cụm sau khi lọc
cluster_data_filtered_dict = {}


# Định nghĩa hàm để lọc dữ liệu từ cuối trở về và loại bỏ các hàng có khoảng cách ngày lớn hơn 31 trong mỗi nhóm cluster
def filter_cluster_data(cluster_data):
    # print(cluster_data)
    data_positive_amount["transactionDate"] = pd.to_datetime(data_positive_amount["transactionDate"])
    # Sắp xếp DataFrame theo cột 'transactionDate' theo thứ tự giảm dần
    # cluster_data.sort_values(by='transactionDate', ascending=False, inplace=True)

    # Xác định các chỉ số cần loại bỏ
    indices_to_remove = 0
    # Chuyển cột 'transactionDate' sang kiểu datetimelike

    for i in range(len(cluster_data) - 1, 0, -1):
        # Chuyển cột 'transactionDate' sang định dạng chỉ gồm tháng và năm
        cluster_data["month_year"] = cluster_data["transactionDate"].dt.to_period("M")
        # Xác định chỉ số mà khoảng cách từ tháng đó tới tháng sau lớn hơn 1 tháng
        if (cluster_data["month_year"].iloc[i] - cluster_data["month_year"].iloc[i - 1]).n > 1:
            indices_to_remove = i
            break
    # Loại bỏ các hàng từ các chỉ số indices_to_remove

    cluster_data_filtered = cluster_data.iloc[indices_to_remove:]

    return cluster_data_filtered


# # Hiển thị các giá trị trong từng nhóm
for cluster_id in data_positive_amount["cluster"].unique():
    # print(f"\n\n======================Cụm {cluster_id}=========================")
    cluster_data = data_positive_amount[data_positive_amount["cluster"] == cluster_id]
    cluster_data_filtered = filter_cluster_data(cluster_data)
    # So sánh transactionDate cuối cùng của cụm với ngày hiện tại
    # Nếu transactionDate cuối cùng của cụm nhỏ hơn ngày hiện tại quá 2 tháng thì bỏ qua cụm đó
    if (
        pd.to_datetime(last_day_of_transaction) - pd.to_datetime(cluster_data_filtered["transactionDate"].iloc[-1])
    ).days > 60:
        continue
    # Lưu trữ dữ liệu của cụm sau khi lọc vào từ điển
    cluster_data_filtered_dict[cluster_id] = cluster_data_filtered
    # In dữ liệu trước
    # print(f"---------------------TRƯỚC---------------Số lượng: {len(cluster_data)}")
    # print(cluster_data)
    # print(f"\n---------------------SAU-----------------Số lượng: {len(cluster_data_filtered)}")
    # # In dữ liệu của cụm sau khi lọc
    # print(cluster_data_filtered)
    # print("=====================================================================\n\n\n\n")


# cluster_data_filtered_dict là dictionary chứa các cụm dữ liệu sau khi lọc
# Tính độ lệch chuẩn cho từng cụm

std_dev_dict = {}
for cluster_id, cluster_data_filtered in cluster_data_filtered_dict.items():
    # Chuẩn hóa dữ liệu bằng cách chia tất cả các giá trị trong cụm cho giá trị nhỏ nhất
    normalized_data = cluster_data_filtered["amount"] / cluster_data_filtered["amount"].min()
    # print("======================================")
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

# Lọc ra các cụm có độ lệch chuẩn không phải None
valid_std_dev_dict = {k: v for k, v in std_dev_dict.items() if v is not None}

# Tìm cụm có độ lệch chuẩn nhỏ nhất (nếu có)
if valid_std_dev_dict:
    min_std_dev_cluster = min(valid_std_dev_dict, key=valid_std_dev_dict.get)
    # print(f"Cụm có độ lệch chuẩn nhỏ nhất: Cụm {min_std_dev_cluster}")
    # print("Độ lệch chuẩn của các cụm:")
    # for cluster_id, std_dev in valid_std_dev_dict.items():
    # print(f"Cụm {cluster_id}: {std_dev}")

else:
    # print("Không có cụm nào có độ lệch chuẩn được tính do chỉ có 1 hoặc 0 phần tử.")
    print({"data": "none"})

# print(f"Cụm dự đoán  là lương : {min_std_dev_cluster}")
clusterPredict = cluster_data_filtered_dict[min_std_dev_cluster]
# print(clusterPredict)

# Tính trung bình của cột "amount"
average_amount = round(clusterPredict["amount"].mean())

# Trích xuất thông tin ngày, tháng và năm từ cột "transactionDate"
start_date = clusterPredict["transactionDate"].iloc[0]
end_date = clusterPredict["transactionDate"].iloc[-1]

# Tính khoảng cách tháng giữa hai ngày
months_diff = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month + 1)

# Lấy giá trị ngày cuối cùng của cột "day"
last_day_value = clusterPredict["transactionDate"].iloc[-1].strftime("%Y-%m-%d")


# In kết quả
# print("\n\n=============================================================")
# print(f"\nGiá trị lương dụ đoán là: {average_amount}")
# print(f"\nSố tháng lương: {months_diff}")
# print(f"\nNgày nhận lương cuối cùng: {last_day_value}")
# print("\n=============================================================")

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
