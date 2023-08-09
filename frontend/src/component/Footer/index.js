import { Container, Typography } from "@mui/material";

const Footer = () => {
    return (
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
    );
};

export default Footer;