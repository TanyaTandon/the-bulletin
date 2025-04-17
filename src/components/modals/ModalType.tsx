import React from "react";
import SmallModal from "./SmallModal";
import MediumModal from "./MediumModal";
import LargeModal from "./LargeModal";

export enum ModalTypeEnum {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
}

export interface DefaultModalProps {
  open: boolean;
  style?: React.CSSProperties;
  closeDialog: () => void;
  children: any;
  incrementPage?: any;
  decrementPage?: any;
  buttons?: any;
  buttonStyles?: React.CSSProperties | null;
  hideCloseButton?: boolean;
}

type WrapperProps = { type: ModalTypeEnum } & DefaultModalProps;

const ModalType: React.FC<WrapperProps> = ({
  type,
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
  function switchModal(mType: ModalTypeEnum) {
    switch (mType) {
      case ModalTypeEnum.SMALL:
        return (
          <SmallModal
            incrementPage={incrementPage}
            decrementPage={decrementPage}
            buttons={buttons}
            style={style}
            open={open}
            closeDialog={closeDialog}
            buttonStyles={buttonStyles}
            hideCloseButton={hideCloseButton}
          >
            {children}
          </SmallModal>
        );
      case ModalTypeEnum.MEDIUM: {
        return (
          <MediumModal
            incrementPage={incrementPage}
            decrementPage={decrementPage}
            buttons={buttons}
            style={style}
            open={open}
            closeDialog={closeDialog}
            buttonStyles={buttonStyles}
            hideCloseButton={hideCloseButton}
          >
            {children}
          </MediumModal>
        );
      }
      case ModalTypeEnum.LARGE: {
        return (
          <LargeModal
            incrementPage={incrementPage}
            decrementPage={decrementPage}
            buttons={buttons}
            style={style}
            open={open}
            closeDialog={closeDialog}
            buttonStyles={buttonStyles}
            hideCloseButton={hideCloseButton}
          >
            {children}
          </LargeModal>
        );
      }
    }
  }

  return <>{switchModal(type)}</>;
};

export default ModalType;
