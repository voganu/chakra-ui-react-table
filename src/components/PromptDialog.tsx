import React from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Scale,
} from '@chakra-ui/core';

interface PromptDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  okText?: string;
  cancelText?: string;
  title: string;
  message: string;
  finalFocusRef?: React.RefObject<HTMLElement>;
}

export default function PromptDialog(props: PromptDialogProps) {
  const {
    isOpen,
    onCancel,
    onConfirm,
    finalFocusRef,
    title,
    message,
    okText = 'Ok',
    cancelText = 'Cancel',
  } = props;
  const cancelRef = React.useRef(null);

  return (
    // @ts-ignore
    <Scale in={isOpen}>
      {(styles: any) =>
        (
          <AlertDialog
            leastDestructiveRef={cancelRef}
            finalFocusRef={finalFocusRef}
            onClose={onCancel}
            isOpen={true}
          >
            <AlertDialogOverlay opacity={styles.opacity} />
            <AlertDialogContent {...styles}>
              <AlertDialogHeader>{title}</AlertDialogHeader>
              {onCancel && <AlertDialogCloseButton />}
              <AlertDialogBody>{message}</AlertDialogBody>
              <AlertDialogFooter>
                {onCancel && (
                  <Button ref={cancelRef} onClick={onCancel}>
                    {cancelText}
                  </Button>
                )}
                <Button variantColor="red" ml={3} onClick={onConfirm}>
                  {okText}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) as any
      }
    </Scale>
  );
}
