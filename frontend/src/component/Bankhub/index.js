import React from "react";

const BankHub = (props) => {
    return <iframe src={props.src} style={styles.iframe} title="bankhub" />;
};

const styles = {
    iframe: {
        width: "100%",
        height: "100%",
        top: "0px",
        left: "0px",
        right: "0px",
        bottom: "0px",
        position: "fixed",
        display: "block",
        overflow: "hidden",
        zIndex: "2000",
    },
};

export default BankHub;
