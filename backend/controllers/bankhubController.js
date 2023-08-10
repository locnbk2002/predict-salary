import dotenv from "dotenv";
import axios from "axios";
import { PythonShell } from "python-shell";
dotenv.config();
dotenv.config({ path: `.env.local` });

const grant_token = (req, res) => {
    let redirectUri = req.headers.origin;

    // console.log(redirectUri);
    let data = JSON.stringify({
        scopes: "identity,transaction",
        redirectUri: redirectUri,
        language: "vi",
    });

    let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://sandbox.bankhub.dev/grant/token",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "x-client-id": process.env.CLIENT_ID,
            "x-secret-key": process.env.SECRET_KEY,
        },
        data: data,
    };

    axios(config)
        .then((response) => {
            let bankhubLink = `https://dev.link.bankhub.dev/?redirectUri=${redirectUri}&grantToken=${response.data.grantToken}&iframe=true&feature=personal`;
            res.status(200).json({ link: bankhubLink });
        })
        .catch((error) => {
            res.status(500).json({ error: error });
        });
};

const grant_exchange = (req, res) => {
    let publicToken = req.body.publicToken;
    let data = JSON.stringify({
        publicToken: publicToken,
    });

    let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://sandbox.bankhub.dev/grant/exchange",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "x-client-id": process.env.CLIENT_ID,
            "x-secret-key": process.env.SECRET_KEY,
        },
        data: data,
    };

    axios(config)
        .then((response) => {
            // console.log(JSON.stringify(response.data));
            res.status(200).json({ accessToken: response.data.accessToken });
        })
        .catch((error) => {
            // console.log(error.data);
            res.status(500).json({ error: error });
        });
};

const transactions = async (req, res) => {
    const isDonate = req.body.isDonate;

    try {
        const date = new Date();
        const toDate = date.toISOString().slice(0, 10);
        date.setMonth(date.getMonth() - 12);
        const fromDate = date.toISOString().slice(0, 10);
        console.log(fromDate, toDate);
        let accessToken = req.body.accessToken;
        let config = {
            method: "get",
            maxBodyLength: Infinity,
            url: "https://sandbox.bankhub.dev/transactions",
            headers: {
                Accept: "application/json",
                "x-client-id": process.env.CLIENT_ID,
                "x-secret-key": process.env.SECRET_KEY,
                Authorization: accessToken,
            },
            params: {
                fromDate: fromDate,
                toDate: toDate,
            },
        };
        const response = await axios(config);

        if (response.data.transactions.length === 0)
            return res.status(404).json({ err: "Không lấy được giao dịch" });
        const transactions = response.data.transactions;
        const kyc = await getKyc(accessToken);
        if (kyc !== "error") {
            const personalInfo = kyc.owner;
            // Lấy dữ liệu trường description từ response.data.transactions

            // Lọc dữ liệu cá nhân từ kyc
            const personalData = [
                personalInfo.name,
                personalInfo.legalId,
                personalInfo.address,
                personalInfo.phone,
                personalInfo.birthday,
            ];

            console.log(personalData);

            const sensitivePatterns = personalData.map((item) => new RegExp(item, "gi"));

            for (const transaction of transactions) {
                let cleanedDescription = transaction.description;

                for (const pattern of sensitivePatterns) {
                    cleanedDescription = cleanedDescription.replace(pattern, "***");
                }

                transaction.description = cleanedDescription;
            }
            // Nếu isDonate = true thì xuất dữ liệu giao dịch ra file csv trong thư mục data
            if (isDonate) {
                const createCsvWriter = require("csv-writer").createObjectCsvWriter;

                // Tạo tên tệp dựa trên thời gian hiện tại
                const timestamp = new Date().getTime();
                const fileName = `./data/data_${timestamp}.csv`;

                const csvWriter = createCsvWriter({
                    path: fileName,
                    header: [
                        { id: "reference", title: "reference" },
                        { id: "transactionDate", title: "transactionDate" },
                        { id: "transactionDateTime", title: "transactionDateTime" },
                        { id: "amount", title: "amount" },
                        { id: "description", title: "description" },
                        { id: "runningBalance", title: "runningBalance" },
                        { id: "virtualAccountNumber", title: "virtualAccountNumber" },
                        { id: "virtualAccountName", title: "virtualAccountName" },
                        { id: "paymentChannel", title: "paymentChannel" },
                        { id: "counterAccountNumber", title: "counterAccountNumber" },
                        { id: "counterAccountName", title: "counterAccountName" },
                        { id: "counterAccountBankId", title: "counterAccountBankId" },
                        { id: "counterAccountBankName", title: "counterAccountBankName" },
                    ],
                });

                csvWriter.writeRecords(transactions)
                    .then(() => console.log(`The CSV file (${fileName}) was written successfully`))
                    .catch((error) => console.error("Error writing CSV file:", error));
            }

        }

        let options = {
            mode: "json",
            args: [], // Sử dụng mảng args để truyền tham số vào Python script
        };

        // Dùng stdin để truyền dữ liệu vào Python script
        let pyshell = new PythonShell("./algorithms/predictSalary.py", options);

        pyshell.send(JSON.parse(JSON.stringify(transactions)));

        pyshell.on("message", function (message) {
            console.log(message);
            res.status(200).send(message);
        });

        pyshell.end(function (err, code, signal) {
            if (err) res.status(500).json({ error: err });
            console.log("finished");
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error });
    }
};

async function getKyc(accessToken) {
    try {
        const config = {
            method: "get",
            maxBodyLength: Infinity,
            url: "https://sandbox.bankhub.dev/auth",
            headers: {
                Accept: "application/json",
                "x-client-id": process.env.CLIENT_ID,
                "x-secret-key": process.env.SECRET_KEY,
                Authorization: accessToken,
            },
        };

        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.log(error);
        return "error";
    }
}

const kyc = (req, res) => {
    let accessToken = req.body.accessToken;
    // console.log(accessToken);
    let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: "https://sandbox.bankhub.dev/auth",
        headers: {
            Accept: "application/json",
            "x-client-id": process.env.CLIENT_ID,
            "x-secret-key": process.env.SECRET_KEY,
            Authorization: accessToken,
        },
    };

    axios(config)
        .then((response) => {
            res.status(200).json(response.data);
        })
        .catch((error) => {
            // console.log(error);
            res.status(500).json({ error: error });
        });
};

function discreteFourierTransform(values) {
    const N = values.length;
    const real = new Array(N);
    const imag = new Array(N);

    for (let k = 0; k < N; k++) {
        let sumReal = 0;
        let sumImag = 0;
        for (let n = 0; n < N; n++) {
            const angle = (2 * Math.PI * k * n) / N;
            sumReal += values[n] * Math.cos(angle);
            sumImag -= values[n] * Math.sin(angle);
        }
        real[k] = sumReal;
        imag[k] = sumImag;
    }

    return { real, imag };
}

// Inverse Discrete Fourier Transform Implementation
function inverseDiscreteFourierTransform(real, imag) {
    const N = real.length;
    const values = new Array(N);

    for (let n = 0; n < N; n++) {
        let sum = 0;
        for (let k = 0; k < N; k++) {
            const angle = (2 * Math.PI * k * n) / N;
            sum += (real[k] * Math.cos(angle) - imag[k] * Math.sin(angle)) / N;
        }
        values[n] = sum;
    }

    return values;
}

function predictSalary(allTransactions) {
    // Step 1: Filter Transactions (Credit Transactions)
    const creditTransactions = allTransactions.filter(
        (transaction) => transaction.amount > 0
    );

    // Step 2: Round Numbers
    const roundedTransactions = creditTransactions.map((transaction) => ({
        date: transaction.transactionDate,
        amount: Math.round(transaction.amount / 100) * 100, // Change accuracy level as needed
    }));

    // Step 3: Group Transactions by Day and Calculate Total Amount Added
    const dailyTotals = {};
    roundedTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    roundedTransactions.forEach((deposit) => {
        if (dailyTotals[deposit.date]) {
            dailyTotals[deposit.date] += deposit.amount;
        } else {
            dailyTotals[deposit.date] = deposit.amount;
        }
    });

    // Step 4: Apply Discrete Fourier Transform
    const dailyValues = Object.values(dailyTotals);
    const { real, imag } = discreteFourierTransform(dailyValues);

    // Step 5: Filter Periodic Components
    const periodicData = {};
    let prevDate = new Date(Object.keys(dailyTotals)[0]);
    const beginDate = new Date(Object.keys(dailyTotals)[0]);
    Object.keys(dailyTotals).forEach((date, index) => {
        const currDate = new Date(date);
        const timeDiff = Math.abs(currDate - prevDate) / (1000 * 60 * 60 * 24);
        if (timeDiff === 0 || timeDiff > 25) {
            periodicData[date] = dailyTotals[date];
            if (timeDiff > 30) prevDate = currDate;
        } else {
            periodicData[date] = 0;
        }
    });
    // Step 6: Group Transactions by Month and Calculate Total Amount Added
    const monthlyTotals = {};
    Object.keys(periodicData).forEach((date) => {
        const month = new Date(date).toISOString().slice(0, 7);
        if (monthlyTotals[month]) {
            monthlyTotals[month] += periodicData[date];
        } else {
            monthlyTotals[month] = periodicData[date];
        }
    });
    console.log(monthlyTotals);

    // Step 7: Apply Inverse Discrete Fourier Transform
    const { real: invertedReal, imag: invertedImag } = discreteFourierTransform(
        Object.values(monthlyTotals)
    );
    const invertedValues = inverseDiscreteFourierTransform(
        invertedReal,
        invertedImag
    );
    const roundedInvertedValues = invertedValues
        .map((value) => Math.round(value))
        .filter((value) => value > 0);
    const median = roundedInvertedValues.sort((a, b) => a - b)[
        Math.floor(roundedInvertedValues.length / 2)
    ];
    console.log(median);
    const predictedSalary = roundedInvertedValues.filter(
        (value) => value > median * 0.8 && value < median * 1.8
    );
    const filteredObject = Object.fromEntries(
        Object.entries(monthlyTotals).filter(([key, value]) =>
            predictedSalary.includes(value)
        )
    );
    console.log(filteredObject);
    return {
        salary:
            Math.round(
                predictedSalary.reduce((acc, value) => acc + value, 0) /
                predictedSalary.length /
                100
            ) * 100,
        transactions: filteredObject,
        lastSalaryDate: prevDate,
        firstSalaryDate: beginDate,
        monthSalary: Object.keys(filteredObject).length,
    };
}
module.exports = { grant_token, grant_exchange, transactions, kyc };
