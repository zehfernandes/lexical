/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useEffect} from 'react';

import {Command} from '../../../lexical/flow/Lexical';

type Event2 = {
  x: boolean,
};
const formatBold: Command<string> = new Command<string>();
const doEvent: Command<Event2> = new Command<Event2>();

export default function AutoFocusPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.focus();
  }, [editor]);

  useEffect(() => {
    editor.execCommand2(formatBold, 'bold');
    return editor.registerCommand2(formatBold, (boldString) => {
      // eslint-disable-next-line no-unused-vars
      const _x: string = boldString;
      return true;
    });
  }, [editor]);

  useEffect(() => {
    editor.execCommand2(doEvent, {x: true});
    return editor.registerCommand2(doEvent, (x) => {
      console.log(x.x, x.y);
      return true;
    });
  }, [editor]);

  return null;
}
