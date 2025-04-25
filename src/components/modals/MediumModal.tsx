import React, { ReactNode } from "react";
import { Dialog, IconButton, Stack } from "@mui/material";
import { useTheme } from "next-themes";
import { DefaultModalProps } from "./ModalType";
import Button from "../buttonTP";
import { lightTheme } from "../theme/theme";
import useThemeSync from "../../hooks/useThemeSync";
import ImageComponent from "../ImageComponent";

const MediumModal: React.FC<DefaultModalProps> = ({
  children,
  closeDialog,
  open,
  style,
  decrementPage,
  incrementPage,
  buttons,
  buttonStyles,
  hideCloseButton,
}) => {
  const theme = useTheme();
  const iconColor = useThemeSync("--primary-text");
  return (
    <>
      <Dialog
        open={open}
        PaperProps={{
          style: {
            padding: "1em",
            display: "flex",
            alignItems: "center",
            width: "70vw",
            maxWidth: "none",
            height: "90%",
            backgroundColor:
              theme.theme == "light" ? lightTheme.modal : "#181818",
            overflow: "hidden",
            ...style,
          },
        }}
      >
        {!hideCloseButton && (
          <IconButton
            sx={{ position: "absolute", right: 8, top: 8 }}
            onClick={closeDialog}
          >
            <ImageComponent src="close.svg" />
          </IconButton>
        )}
        <section
          // style={{
          //   maxHeight: "90%",
          //   width: "100%",
          //   overflow: "scroll",
          //   justifyItems: "center",
          //   display: "grid",
          //   minHeight: "90%",
          // }}
          className="medium-modal-inner-section"
        >
          {children}
        </section>
        {!buttons ? (
          <Stack
            style={buttonStyles!}
            direction="row-reverse"
            alignItems="center"
            width="95%"
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

export default MediumModal;
