import { AppBar, Toolbar, Typography, Link, useMediaQuery, Grid, Drawer, MenuItem, Box, IconButton } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from "react";

const Navbar = () => {
    const [anchorElNav, setAnchorElNav] = useState(null);
    const isMdScreen = useMediaQuery((theme) => theme.breakpoints.up("md"));

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Grid container alignItems="center" justifyContent={isMdScreen ? "flex-start" : "space-between"}>
                    <Grid item xs={6} md={'auto'}>
                        <Typography variant="h6">
                            DuDoanLuong.com
                        </Typography>
                    </Grid>
                    {isMdScreen ? (
                        <Grid item md={6}>
                            <Grid container>
                                <Link
                                    component={RouterLink}
                                    to="/"
                                    color="inherit"
                                    underline="none"
                                    style={{ margin: "0 10px" }}
                                >
                                    Trang chủ
                                </Link>
                                <Link
                                    component={RouterLink}
                                    to="/about"
                                    color="inherit"
                                    underline="none"
                                    style={{ margin: "0 10px" }}
                                >
                                    Giới thiệu
                                </Link>
                            </Grid>
                        </Grid>
                    ) : (
                        <Grid item md={6}>
                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleOpenNavMenu}
                                color="inherit"
                            >
                                <MenuIcon />
                            </IconButton>
                            <Drawer
                                anchor="right"
                                open={Boolean(anchorElNav)}
                                onClose={handleCloseNavMenu}
                            >
                                <Box sx={{ width: 250 }}>
                                    <MenuItem>
                                        <Link
                                            component={RouterLink}
                                            to="/"
                                            color="inherit"
                                            style={styles.Link}
                                        >
                                            Trang chủ
                                        </Link>
                                    </MenuItem>
                                    <MenuItem>
                                        <Link
                                            component={RouterLink}
                                            to="/about"
                                            color="inherit"
                                            style={styles.Link}
                                        >
                                            Giới thiệu
                                        </Link>
                                    </MenuItem>
                                </Box>
                            </Drawer>
                        </Grid>
                    )}
                </Grid>
            </Toolbar>
        </AppBar>
    );
};
const styles = {
    Link: {
        fontSize: 16,
        color: "#1E1E1E",
        textAlign: "left",
        textDecoration: "none",
        marginRight: 10,
        paddingRight: 20,
        textTransform: "none",
        width: "100%",
    },
};

export default Navbar;