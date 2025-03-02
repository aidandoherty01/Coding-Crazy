import { Box } from "@mui/material";
import PropTypes from "prop-types";

const StyleWrapper = ({ children }) => {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "background.default", 
                color: "text.primary",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {children}
        </Box>
    );
};

StyleWrapper.propTypes = {
    children: PropTypes.node.isRequired, // Ensures 'children' is a valid React node and required
};

export default StyleWrapper;
