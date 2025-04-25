import React, { ReactNode } from "react";
import { Dialog, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DefaultModalProps } from "./ModalType";
import Button from "../buttonTP";
import useThemeSync from "../../hooks/useThemeSync";
import ImageComponent from "../ImageComponent";

const LargeModal: React.FC<DefaultModalProps> = ({
  children,
  closeDialog,
  open,
  style,
  decrementPage,
  incrementPage,
  buttons,
  hideCloseButton,
  buttonStyles,
}) => {
  const iconColor = useThemeSync("--primary-text");
  return (
    <>
      <Dialog
        open={open}
        PaperProps={{
          style: {
            height: "auto",
            minHeight: "90vh",
            padding: "1em",
            display: "flex",
            alignItems: "center",
            width: "96vw",
            maxWidth: "none",
            ...style,
          },
        }}
      >
        {!hideCloseButton && (
          <div
            sx={{ position: "absolute", right: 8, top: 8 }}
            onClick={closeDialog}
          >
            <ImageComponent src="close.svg" />
          </div>
        )}
        {children}
        {!buttons ? (
          <Stack
            style={buttonStyles!}
            direction="row-reverse"
            alignItems="center"
            width="97%"
            mt="1em"
            spacing={2}
          >
            <Button
              className={"pop-btn"}
              label="Next"
              onClick={incrementPage}
            />

            <Button
              className={"popBtnNeg"}
              label="Back"
              onClick={decrementPage}
            />
          </Stack>
        ) : (
          <>{buttons}</>
        )}
      </Dialog>
    </>
  );
};

export default LargeModal;
