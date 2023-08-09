import React from "react";
import { Box, Typography, } from "@mui/material";
import Navbar from "../../component/Navbar";
import Footer from "../../component/Footer";

const About = () => {
    return (
        <Box
            style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
            }}
        >
            <Navbar />
            <Box
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    padding: "2%",
                    textAlign: "justify",
                }}
            >
                <Typography variant="h5" component="h1" gutterBottom>
                    Dự án BKU Salary Prediction
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Chào bạn,
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Chúng tôi là Nguyễn Văn Dũng và Bùi Tiến Lộc, sinh viên năm cuối trường Đại học Bách Khoa - ĐHQG HCM,
                    Chúng tôi đang nghiên cứu một thuật toán ứng dụng trí tuệ nhân tạo để dự đoán lương dựa vào lịch sử giao dịch của tài khoản ngân hàng thông qua BankHub API.
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Công nghệ này sẽ giúp cho quy trình vay dựa vào lương ở các ngân hàng, công ty tài chính trở nên đơn giản, nhanh chóng hơn với chi phí hợp lý hơn và tiết kiệm thời gian cho cả người vay và người cho vay.
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Để có thể hoàn thiện thuật toán này, chúng tôi cần sự đóng góp của bạn. Bạn có thể đóng góp bằng cách cho phép chúng tôi sử dụng lịch sử giao dịch của bạn thông qua BankHub API.
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Chúng tôi cam kết :
                    <ul>
                        <li> Giữ bảo mật toàn bộ dữ liệu bạn cung cấp.</li>
                        <li> Không sử dụng thông tin của bạn cho bất kỳ mục đích nào khác ngoài nghiên cứu cải thiện thuật toán.</li>
                        <li> Xóa hết các thông tin cá nhân trên sao kê (Tên gọi, STK,...) trước khi lưu trữ.</li>
                        <li> Lưu trữ dữ liệu này tối đa 3 năm.</li>
                        <li> Xóa ngay lập tức nếu bạn yêu cầu.</li>
                    </ul>
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Nếu bạn đồng ý cho phép chúng tôi sử dụng lịch sử giao dịch của bạn, vui lòng chọn "Đóng góp" khi chạy thuật toán của chúng tôi.
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Bạn có thể liên hệ với chúng tôi qua email: <a href="mailto:luongoi.autolending@gmail.com">
                        luongoi.autolending@gmail.com </a>

                </Typography>
                <Typography variant="body1" gutterBottom>
                    Sự đóng góp của bạn là một sự giúp đỡ to lớn với chúng tôi.
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Nhóm nghiên cứu BKU Salary Prediction - Nguyễn Văn Dũng và Bùi Tiến Lộc
                </Typography>
            </Box>
            <Footer />
        </Box>
    );
};

export default About;