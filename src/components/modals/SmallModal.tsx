
import React, { ReactNode } from "react";
import { Dialog, Stack } from "@mui/material";
import { DefaultModalProps } from "./ModalType";

import ImageComponent from "../ImageComponent";
import { Button } from "../ui/button";

const SmallModal: React.FC<DefaultModalProps> = ({
  children,
  closeDialog,
  open,
  style,
  incrementPage,
  decrementPage,
  buttons,
  buttonStyles,
  hideCloseButton,
}) => {

  return (
    <Dialog
      open={open}
      PaperProps={{
        style: {
          padding: "1em",
          display: "flex",
          alignItems: "center",
          width: "52vw",
          maxWidth: "none",
          ...style,
        },
      }}
    >
      {!hideCloseButton && (
        <div
          style={{ position: "absolute", right: 8, top: 8 }}
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
          <Button className={"pop-btn"} onClick={incrementPage} >Next</Button>

          <Button
            className={"popBtnNeg"}
            onClick={decrementPage}
          >
            Back
          </Button>
        </Stack>
      ) : (
        <>{buttons}</>
      )}
    </Dialog>
  );
};

export default SmallModal;
