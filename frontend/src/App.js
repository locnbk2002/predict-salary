import React, { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";

import BankHub from "./component/Bankhub";

const server = process.env.REACT_APP_SERVER_URL;
const TransactionsTable = ({ dataTransaction }) => {
    return (
        <div>
            <h2>Danh sách giao dịch:</h2>
            <table>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Ngày giao dịch</th>
                        <th>Số tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {dataTransaction.map((transaction, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{transaction.transactionDate}</td>
                            <td>{transaction.amount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
const App = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    //   Biến showw iframe
    const [show, setShow] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    // Lưu link iframe
    const [link, setLink] = useState("");

    //Lấy giao dịch, xử lý thuật toán
    const [dataTransactions, setDataTransactions] = useState({});

    //  Gía trị dự đoán lương
    const [salary, setSalary] = useState(0);
    // Lần nhận lương gần nhất, số tháng nhận lương
    const [monthSalary, setMonthSalary] = useState();
    const [lastestSalary, setLastestSalary] = useState();

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const [publicToken, setPublicToken] = useState();

    console.log(publicToken);

    const [isDonate, setIsDonate] = useState(false);

    function handleGetTransaction() {
        let accessToken = localStorage.getItem("accessToken");
        return fetch(`${server}/api/transactions`, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ accessToken, isDonate }),
        })
            .then((response) => {
                if (response.status === 404) {
                    // toast.error(
                    //     "Chúng tôi không thể lấy được giao dịch của bạn. Vui lòng thử lại sau",
                    //     {
                    //         position: "top-right",
                    //         autoClose: 5000,
                    //         hideProgressBar: false,
                    //         closeOnClick: true,
                    //         pauseOnHover: true,
                    //         draggable: true,
                    //         progress: undefined,
                    //         theme: "light",
                    //     }
                    // );
                    throw new Error("Err");
                }
                return response.json();
            })
            .then((data) => {
                if (data.err) {
                    return;
                } else {
                    console.log(data);
                    setDataTransactions(data.transactions);
                    setSalary(data.salary);

                    setMonthSalary(data.monthSalary);

                    setLastestSalary(data.lastSalaryDate);
                }
            });
    }

    function handleExchangeTokenAndGetData(publicToken) {
        fetch(`${server}/api/grant_exchange`, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(publicToken),
        })
            .then((response) => response.json())
            .then((data) => {
                if (!data.error) {
                    setLoadingData(true);

                    setDataTransactions({});

                    localStorage.setItem("accessToken", data.accessToken);
                } else {
                    setLoadingData(false);
                }

                handleGetTransaction();
            });

        setShow(false);
    }

    useEffect(() => {
        function handleMessage(event) {
            if (event.origin === "https://dev.link.bankhub.dev") {
                let eventData = JSON.parse(event.data);
                let publicToken = {
                    publicToken: eventData.data.publicToken,
                };
                setPublicToken(publicToken);
            }
        }

        window.addEventListener("message", handleMessage);
        return () => {
            window.removeEventListener("message", handleMessage);
        };
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (publicToken) {
            handleExchangeTokenAndGetData(publicToken);
        }
    }, [publicToken]);

    const handleBanklink = (pa) => {
        setIsDonate(pa);
        fetch(`${server}/api/grant_token`)
            .then((response) => response.json())
            .then((data) => {
                setLink(data.link);
            });
        setShow(true);
    };

    return (
        <div>
            <Button
                variant="contained"
                color="primary"
                onClick={handleOpenModal}
            >
                Chạy thử thuật toán
            </Button>
            {show ? <BankHub src={link} /> : null}
            <Modal open={isModalOpen} onClose={handleCloseModal}>
                <div
                    style={{
                        backgroundColor: "#fff",
                        padding: 20,
                        borderRadius: 8,
                    }}
                >
                    <h2>Chọn một trong hai lựa chọn:</h2>
                    {/* <Button onClick={() => handleRunAlgorithm("contribute")}> */}
                    <Button onClick={() => handleBanklink(true)}>
                        Đóng góp
                    </Button>
                    <Button
                        // onClick={() => handleRunAlgorithm("not-contribute")}
                        onClick={() => handleBanklink(false)}
                    >
                        Không
                    </Button>
                </div>
            </Modal>
            {/* Hiển thị dữ liệu trả về dưới dạng danh sách */}
            <div>Lương dự đoán: {salary}</div>
            <div>Ngày cuối cùng nhận lương: {lastestSalary}</div>
            <div>
                {dataTransactions.length > 0 ? (
                    <TransactionsTable dataTransaction={dataTransactions} />
                ) : (
                    ""
                )}
            </div>
        </div>
    );
};

export default App;
