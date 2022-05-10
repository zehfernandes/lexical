/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */
import type {
  DOMConversionMap,
  DOMConversionOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  RangeSelection,
  LexicalCommand,
} from 'lexical';
import {ElementNode} from 'lexical';

export declare class ExcalidrawNode extends ElementNode {
  __data: string;
  static getType(): string;
  static clone(node: ExcalidrawNode): ExcalidrawNode;
  constructor(data: string, key?: NodeKey);
  createDOM(config: EditorConfig): HTMLElement;
  updateDOM(
    prevNode: ExcalidrawNode,
    dom: HTMLElement,
    config: EditorConfig,
  ): boolean;
  static importDOM(): DOMConversionMap | null;
  getData(): string;
  setData(data: string): void;
  insertNewAfter(selection: RangeSelection): null | ElementNode;
  canInsertTextBefore(): false;
  canInsertTextAfter(): boolean;
  canBeEmpty(): false;
  isInline(): true;
}
export function $createExcalidrawNode(): ExcalidrawNode;
export function $isExcalidrawNode(
  node: ExcalidrawNode | LexicalNode | null | undefined,
): node is ExcalidrawNode;

export type ExcalidrawElementFragment = {
  isDeleted?: boolean;
};

export const INSERT_EXCALIDRAW_COMMAND: LexicalCommand<void>;
