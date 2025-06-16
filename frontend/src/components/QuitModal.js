import React from "react";
import Modal from 'react-modal';
import clsx from "clsx";
import style from './QuitModal.module.scss';
import Button from "./Button";

export function QuitModal({isOpen, onClickOk, onClickCancel}) {
  return (
    <Modal
      isOpen={isOpen}
      className={clsx(style.QuitModal)}
      overlayClassName={clsx(style.OverlayModal)}
      onRequestClose={onClickCancel}
      shouldCloseOnOverlayClick={true}
      appElement={document.getElementsByTagName("body")}
    >
      <div className="text-center">
        <h2>
          ARE YOU SURE YOU WANT TO QUIT?
        </h2>
      </div>

      <div className="d-flex justify-content-around" style={{marginTop: '40px'}}>
        <Button onClick={onClickOk}>
          <button className="button">
            Quit
          </button>
        </Button>
        <Button onClick={onClickCancel}>
          <button className="button">
            Stay
          </button>
        </Button>
      </div>
    </Modal>
  )
}