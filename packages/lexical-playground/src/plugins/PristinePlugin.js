/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import useLayoutEffect from 'shared/useLayoutEffect';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

import {useState} from 'react';
import * as React from 'react';
import {$getSelection} from 'lexical';
import {$isRangeSelection} from 'lexical';

export default function PristinePlugin(): React$Node {
  const [editor] = useLexicalComposerContext();
  const [pristine, setPristine] = useState(true);

  useLayoutEffect(() => {
    return editor.addListener(
      'command',
      (type, payload) => {
        console.info(type);
        if (type === 'canUndo') {
          setPristine(!payload);
        }
        return false;
      },
      4,
    );
  }, [editor]);

  // Simulate initial content/late update reaction
  useLayoutEffect(() => {
    editor.update(
      () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertText('foo');
        }
      },
      {
        tag: 'history-merge',
      },
    );
  }, [editor]);

  return <span>Pristine: {pristine ? 'true' : 'false'}</span>;
}
