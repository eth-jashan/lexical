// @flow strict-local

import type {OutlineEditor, ViewType} from 'outline';

import {useEffect} from 'react';
import {TextNode} from 'outline';

const baseEmojiStyle =
  'background-size: 16px 16px;' +
  'height: 16px;' +
  'width: 16px;' +
  'background-position: center;' +
  'background-repeat: no-repeat;' +
  'display: inline-block;' +
  'margin: 0 1px;' +
  'text-align: center;' +
  'vertical-align: middle;';

const happySmile =
  baseEmojiStyle +
  'background-image: url(https://static.xx.fbcdn.net/images/emoji.php/v9/t4c/1/16/1f642.png);';
const veryHappySmile =
  baseEmojiStyle +
  'background-image: url(https://static.xx.fbcdn.net/images/emoji.php/v9/t51/1/16/1f603.png);';
const unhappySmile =
  baseEmojiStyle +
  'background-image: url(https://static.xx.fbcdn.net/images/emoji.php/v9/tcb/1/16/1f641.png);';
const heart =
  baseEmojiStyle +
  'background-image: url(https://static.xx.fbcdn.net/images/emoji.php/v9/t6c/1/16/2764.png);';

const specialSpace = '　';

const emojis: {[string]: string} = {
  ':)': happySmile,
  ':D': veryHappySmile,
  ':(': unhappySmile,
  '<3': heart,
};

function textNodeTransform(node: TextNode, view: ViewType): void {
  const text = node.getTextContent();
  for (let i = 0; i < text.length; i++) {
    const possibleEmoji = text.slice(i, i + 2);
    const emojiStyle = emojis[possibleEmoji];

    if (emojiStyle !== undefined) {
      let targetNode;
      if (i === 0) {
        [targetNode] = node.splitText(i + 2);
      } else {
        [, targetNode] = node.splitText(i, i + 2);
      }
      const emojiInline = createEmoji(emojiStyle);
      targetNode.replace(emojiInline);
      emojiInline.wrapInTextNodes();
      emojiInline.selectAfter(0, 0);
      break;
    }
  }
}

export function useEmojiPlugin(editor: null | OutlineEditor): void {
  useEffect(() => {
    if (editor !== null) {
      const removeNodeType = editor.addNodeType('emoji', EmojiNode);
      const removeTransform = editor.addTextTransform(textNodeTransform);
      return () => {
        removeNodeType();
        removeTransform();
      };
    }
  }, [editor]);
}

function createEmoji(cssText: string): TextNode {
  return new EmojiNode(cssText, specialSpace).makeImmutable();
}

class EmojiNode extends TextNode {
  _cssText: string;

  constructor(cssText: string, text: string) {
    super(text);
    this._cssText = cssText;
    this._type = 'emoji';
  }
  clone() {
    const clone = new EmojiNode(this._cssText, this._text);
    clone._parent = this._parent;
    clone._key = this._key;
    clone._flags = this._flags;
    return clone;
  }
  _create() {
    const dom = super._create();
    dom.style.cssText = this._cssText;
    return dom;
  }
}
