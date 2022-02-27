/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type {LexicalComposerProps} from '@react/LexicalComposer';
import type {LexicalEditor} from 'lexical';

import {
  createLexicalComposerContext,
  LexicalComposerContext,
} from '@lexical/react/LexicalComposerContext';
import LexicalComposer from '@react/LexicalComposer';
import React, {useContext, useLayoutEffect, useMemo} from 'react';
import {CAN_USE_DOM} from 'shared/canUseDOM';

export default function LexicalComposerSSRCompat({
  initialConfig = {},
  children,
}: LexicalComposerProps): React$MixedElement {
  return CAN_USE_DOM ? (
    <LexicalComposer initialConfig={initialConfig}>{children}</LexicalComposer>
  ) : (
    <Dummy>{children}</Dummy>
  );
}

function Dummy({
  initialConfig = {},
  children,
}: LexicalComposerProps): React$MixedElement {
  const parentContext = useContext(LexicalComposerContext);
  const composerContext = useMemo(
    () => {
      let composerTheme: void | EditorThemeClasses;
      let parentEditor;
      const {
        theme,
        namespace,
        editor: initialEditor,
        nodes,
        onError,
      } = initialConfig;

      if (theme != null) {
        composerTheme = theme;
      } else if (parentContext != null) {
        parentEditor = parentContext[0];
        const parentTheme = parentContext[1].getTheme();
        if (parentTheme != null) {
          composerTheme = parentTheme;
        }
      }

      const context: LexicalComposerContextType = createLexicalComposerContext(
        parentContext,
        composerTheme,
      );
      let editor = initialEditor || null;

      if (editor === null) {
        const newEditor = createEditor<LexicalComposerContextType>({
          context,
          namespace,
          nodes,
          onError: (error) => onError(error, newEditor),
          parentEditor,
          theme: composerTheme,
        });
        newEditor.setReadOnly(true);
        editor = newEditor;
      }

      return [editor, context];
    },

    // We only do this for init
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useLayoutEffect(() => {
    const isReadOnly = initialConfig.isReadOnly;
    const [editor] = composerContext;
    editor.setReadOnly(isReadOnly || false);
    // We only do this for init
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LexicalComposerContext.Provider value={composerContext}>
      {children}
    </LexicalComposerContext.Provider>
  );
}
