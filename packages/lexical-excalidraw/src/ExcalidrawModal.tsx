/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Excalidraw from '@excalidraw/excalidraw';
import * as React from 'react';
import {ReactPortal, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

import Modal from '../../lexical-playground/src/ui/Modal';

export type ExcalidrawElementFragment = {
  isDeleted?: boolean;
};

type ModalProps = {
  closeOnClickOutside?: boolean;
  /**
   * The initial set of elements to draw into the scene
   */
  initialElements: ReadonlyArray<ExcalidrawElementFragment>;
  /**
   * Controls the visibility of the modal
   */
  isShown?: boolean;
  /**
   * Completely remove Excalidraw component
   */
  onDelete: () => boolean;
  /**
   * Handle modal closing
   */
  onHide: () => void;
  /**
   * Callback when the save button is clicked
   */
  onSave: (elements: ReadonlyArray<ExcalidrawElementFragment>) => void;
};

const ExcalidrawModalOverlayStyles = {
  display: 'flex',
  alignItems: 'center',
  position: 'fixed',
  flexDirection: 'column',
  top: '0px',
  bottom: '0px',
  left: '0px',
  right: '0px',
  flexGrow: '0px',
  flexShrink: '1px',
  zIndex: '100',
  backgroundColor: 'rgba(40, 40, 40, 0.6)',
} as const;

const ExcalidrawModalActions = {
  textAlign: 'end',
  position: 'absolute',
  right: '5px',
  top: '5px',
  zIndex: '1',
} as const;

const ExcalidrawModalActionButton = {
  backgroundColor: '#fff',
  borderRadius: '5px',
  border: '0',
  padding: '8px 12px',
  position: 'relative',
  marginLeft: '5px',
  color: '#222',
  display: 'inline-block',
  cursor: 'pointer',
} as const;

const ExcalidrawModalDiscardActionButton = {
  ...ExcalidrawModalActionButton,
  backgroundColor: '#eee',
}

const ExcalidrawModalRow = {
  position: 'relative',
  padding: '40px 5px 5px',
  width: '70vw',
  height: '70vh',
  borderRadius: '8px',
  boxShadow: '0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.5)',
} as const;

const ExcalidrawModalModal = {
  position: 'relative',
  zIndex: '10',
  top: '50px',
  width: 'auto',
  left: '0',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '8px',
  backgroundColor: '#eee',
} as const;

const ExcalidrawModalDiscardModal = {
  marginTop: '60px',
  textAlign: 'center',
} as const;



/**
 * @explorer-desc
 * A component which renders a modal with Excalidraw (a painting app)
 * which can be used to export an editable image
 */
export default function ExcalidrawModal({
  closeOnClickOutside = false,
  onSave,
  initialElements,
  isShown = false,
  onHide,
  onDelete,
}: ModalProps): ReactPortal | null {
  const excalidrawRef = useRef(null);
  const excaliDrawModelRef = useRef(null);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [elements, setElements] =
    useState<ReadonlyArray<ExcalidrawElementFragment>>(initialElements);

  useEffect(() => {
    if (excaliDrawModelRef.current !== null) {
      excaliDrawModelRef.current.focus();
    }
  }, []);

  useEffect(() => {
    let modalOverlayElement = null;
    const clickOutsideHandler = (event: MouseEvent) => {
      const target = event.target;
      if (
        excaliDrawModelRef.current !== null &&
        !excaliDrawModelRef.current.contains(target) &&
        closeOnClickOutside
      ) {
        onDelete();
      }
    };
    if (excaliDrawModelRef.current !== null) {
      modalOverlayElement = excaliDrawModelRef.current?.parentElement;
      if (modalOverlayElement !== null) {
        modalOverlayElement?.addEventListener('click', clickOutsideHandler);
      }
    }

    return () => {
      if (modalOverlayElement !== null) {
        modalOverlayElement?.removeEventListener('click', clickOutsideHandler);
      }
    };
  }, [closeOnClickOutside, onDelete]);

  const save = () => {
    if (elements.filter((el) => !el.isDeleted).length > 0) {
      onSave(elements);
    } else {
      // delete node if the scene is clear
      onDelete();
    }
    onHide();
  };

  const discard = () => {
    if (elements.filter((el) => !el.isDeleted).length === 0) {
      // delete node if the scene is clear
      onDelete();
    } else {
      //Otherwise, show confirmation dialog before closing
      setDiscardModalOpen(true);
    }
  };

  function ShowDiscardDialog(): JSX.Element {
    return (
      <Modal
        title="Discard"
        onClose={() => {
          setDiscardModalOpen(false);
        }}
        closeOnClickOutside={true}>
        Are you sure you want to discard the changes?
        <div style={ExcalidrawModalDiscardModal}>
          <button
            style={ExcalidrawModalDiscardActionButton}
            onClick={() => {
              setDiscardModalOpen(false);
              onHide();
            }}>
            Discard
          </button>{' '}
          <button
            style={ExcalidrawModalDiscardActionButton}
            onClick={() => {
              setDiscardModalOpen(false);
            }}>
            Cancel
          </button>
        </div>
      </Modal>
    );
  }

  useEffect(() => {
    excalidrawRef?.current?.updateScene({elements: initialElements});
  }, [initialElements]);

  if (isShown === false) {
    return null;
  }

  const onChange = (els) => {
    setElements(els);
  };

  // This is a hacky work-around for Excalidraw + Vite.
  // In DEV, Vite pulls this in fine, in prod it doesn't. It seems
  // like a module resolution issue with ESM vs CJS?
  const _Excalidraw =
    Excalidraw.$$typeof != null ? Excalidraw : Excalidraw.default;

  return createPortal(
    <div style={ExcalidrawModalOverlayStyles} role="dialog">
      <div
        style={ExcalidrawModalModal}
        ref={excaliDrawModelRef}
        tabIndex={-1}>
        <div style={ExcalidrawModalRow}>
          {discardModalOpen && <ShowDiscardDialog />}
          <_Excalidraw
            onChange={onChange}
            initialData={{
              appState: {isLoading: false},
              elements: initialElements,
            }}
          />
          <div style={ExcalidrawModalActions}>
            <button className="action-button" style={ExcalidrawModalActionButton} onClick={discard}>
              Discard
            </button>
            <button className="action-button" style={ExcalidrawModalActionButton} onClick={save}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
