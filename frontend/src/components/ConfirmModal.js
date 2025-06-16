import React from "react";
import Modal from 'react-modal';
import clsx from "clsx";
import style from "./ConfirmModal.module.scss";
import Button from "./Button";

const ConfirmModal = (
  {
    isOpen,
    content,
    onClose,
  }) => {

  return (
    <Modal
      isOpen={isOpen}
      className={clsx(style.ConfirmModal)}
      overlayClassName={clsx(style.ModalOverlay)}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={true}
      appElement={document.getElementsByTagName("body")}
    >
      <Button className={clsx(style.Close)} onClick={onClose}>
        <span className={clsx(style.CloseIcon)}>✖</span>
      </Button>

      <div className={clsx(style.Content)}>
        <span>
          {content}
        </span>
      </div>
    </Modal>
  )
}

export default ConfirmModal;