import React, { useState, useEffect } from "react";
import {
    Button,
    Modal,
    AppBar,
    Toolbar,
    Typography,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    Grid,
} from "@mui/material";

import BankHub from "./component/Bankhub";
import "./App.css";

const server = process.env.REACT_APP_SERVER_URL;
const containerStyle = {
    backgroundColor: "#f8f8f8",
    flex: "1",
    padding: "50px",
};

const textContainerStyle = {
    backgroundColor: "#fff",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    height: "100%",
    padding: "50px",
    boxSizing: "border-box",
};

const buttonStyle = {
    marginTop: "16px",
    minWidth: "150px",
};
const App = () => {
    // Mo owraa aa  aaa
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
        setLoadingData(true);

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
                setLoadingData(false);

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

    console.log(isModalOpen);

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
                    setDataTransactions({});

                    localStorage.setItem("accessToken", data.accessToken);
                }

                handleGetTransaction();
            });
        setIsModalOpen(false);

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
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
            }}
        >
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6">DuDoanLuong.com</Typography>
                </Toolbar>
            </AppBar>

            <Grid container style={containerStyle}>
                <Grid
                    sx={{ border: "1px solid #ccc", background: "#fff" }}
                    item
                    xs={8}
                >
                    {show ? <BankHub src={link} /> : null}
                    <Modal open={isModalOpen} onClose={handleCloseModal}>
                        <div
                            style={{
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                position: "absolute",
                                backgroundColor: "#fff",
                                padding: 20,
                                borderRadius: 8,
                            }}
                        >
                            <Typography variant="h5">
                                Chọn một trong hai lựa chọn:
                            </Typography>
                            <Box
                                mt={2}
                                display="flex"
                                justifyContent="space-between"
                            >
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleBanklink(true)}
                                >
                                    Đóng góp
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => handleBanklink(false)}
                                >
                                    Không
                                </Button>
                            </Box>
                        </div>
                    </Modal>
                    {dataTransactions.length > 0 ? (
                        <>
                            <Box sx={{ paddingLeft: "20px" }} mt={3}>
                                <Typography
                                    sx={{
                                        textAlign: "center",
                                        fontSize: "33px",
                                        marginBottom: "15px",
                                        fontWeight: "700",
                                        color: "blue",
                                    }}
                                    variant="h2"
                                >
                                    Kết quả dự đoán
                                </Typography>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{ flex: "50%" }}
                                    >
                                        <strong>Lương dự đoán: </strong>
                                        <i>{salary.toLocaleString()}</i>
                                    </Typography>

                                    <Typography
                                        variant="h6"
                                        sx={{ flex: "50%" }}
                                    >
                                        <strong>Số tháng nhận lương </strong>
                                        <i>{monthSalary}</i>
                                    </Typography>
                                </Box>
                                <Box sx={{ marginTop: "10px" }}>
                                    <Typography variant="h6">
                                        <strong>
                                            Ngày nhận lương gần nhất:{" "}
                                        </strong>
                                        <i>{lastestSalary}</i>
                                    </Typography>
                                </Box>
                            </Box>
                            {dataTransactions.length > 0 && (
                                <Box mt={3}>
                                    <TableContainer
                                        component={Paper}
                                        style={{
                                            maxHeight: 300,
                                            overflowY: "auto",
                                            padding: "0 20px",
                                            width: "100%",
                                            boxSizing: "border-box",
                                        }}
                                    >
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>STT</TableCell>
                                                    <TableCell>
                                                        Ngày giao dịch
                                                    </TableCell>
                                                    <TableCell>
                                                        Số tiền
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {dataTransactions.map(
                                                    (transaction, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                {index + 1}
                                                            </TableCell>
                                                            <TableCell>
                                                                {
                                                                    transaction.transactionDate
                                                                }
                                                            </TableCell>
                                                            <TableCell>
                                                                {
                                                                    transaction.amount
                                                                }
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}
                        </>
                    ) : (
                        ""
                    )}
                </Grid>
                <Grid item xs={4}>
                    <Box style={textContainerStyle}>
                        <Typography variant="h5" gutterBottom>
                            Chào bạn,
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Chúng tôi đang phát triển thuật toán để dự đoán
                            lương tự động dựa vào lịch sử giao dịch của tài
                            khoản ngân hàng thông qua
                            <strong> BankHub</strong>. Để thuật toán chính xác
                            hơn, chúng tôi cần một lượng lớn dữ liệu để cải
                            thiện thuật toán của mình.
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            <strong>
                                Sự đóng góp của bạn là một sự giúp đỡ to lớn với
                                chúng tôi.
                            </strong>
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            <strong>Người thực hiện:</strong> Nguyễn Văn Dũng,
                            Búi Tiến Lộc.
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            style={buttonStyle}
                            onClick={handleOpenModal}
                            className={`${loadingData ? "lds_hourglass" : ""}`}
                            disabled={loadingData}
                        >
                            {loadingData ? "Đang xử lý" : "Chạy thử thuật toán"}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
            <footer
                style={{
                    marginTop: "auto",
                    backgroundColor: "#f0f0f0",
                    padding: 20,
                }}
            >
                <Container maxWidth="md">
                    <Typography variant="body1" align="center">
                        © {new Date().getFullYear()} DuDoanLuong. All rights
                        reserved.
                    </Typography>
                </Container>
            </footer>
        </div>
    );
};

export default App;
