/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type {LexicalEditor} from 'lexical';

import {useEffect} from 'react';
import {$createTextNode, $getRoot, $createParagraphNode} from 'lexical';
import {$isHeadingNode} from 'lexical/HeadingNode';
import {$createLinkNode} from 'lexical/LinkNode';
import {$createListNode, $createListItemNode} from '@lexical/list';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

function useContents(editor: LexicalEditor): void {
  useEffect(() => {
    return editor.addListener(
      'command',
      (type) => {
        if (type === 'insertContents') {
          editor.update(() => {
            const root = $getRoot();
            const list = $createListNode('ul');
            root.getFirstChildOrThrow().insertBefore(list);
            root.getChildren().forEach((heading) => {
              if ($isHeadingNode(heading)) {
                const listItem = $createListItemNode();
                const link = $createLinkNode('#' + heading.getAnchorId());
                const text = $createTextNode(heading.getTextContent());
                link.append(text);
                listItem.append(link);
                list.append(listItem);
                listItem.setIndent(Number(heading.__tag[1]) - 1);
              }
            });
            // Need list to be appened to allow `setIndent` calls, but cleanup if it's empty
            if (list.isEmpty()) {
              list.remove();
            } else {
              list.insertAfter($createParagraphNode());
            }
          });
          return true;
        }
        return false;
      },
      0,
    );
  }, [editor]);
}

export default function ContentsPlugin(): React$Node {
  const [editor] = useLexicalComposerContext();
  useContents(editor);
  return null;
}
