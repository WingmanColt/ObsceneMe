import { TBItems } from 'ngx-editor';

export const TEXT_FORMATTING_TYPE: { [key: string]: TBItems } = {
  BOLD: 'bold',
  ITALIC: 'italic',
  UNDERLINE: 'underline',
  STRIKE: 'strike',
  CODE: 'code',
  BLOCKQUOTE: 'blockquote',
  BULLET_LIST: 'bullet_list',
  ORDERED_LIST: 'ordered_list',
  LINK: 'link',
  IMAGE: 'image',
  TEXT_COLOR: 'text_color',
  BACKGROUND_COLOR: 'background_color',
  ALIGN_LEFT: 'align_left',
  ALIGN_CENTER: 'align_center',
  ALIGN_RIGHT: 'align_right',
  ALIGN_JUSTIFY: 'align_justify',
  HORIZONTAL_RULE: 'horizontal_rule',
  FORMAT_CLEAR: 'format_clear',
  // Removed SUPERSCRIPT, SUBSCRIPT, and TABLE as they are not in TBItems
};

// You can also define a type for keys if you want to enforce stricter type checking
export type TEXT_FORMATTING_KEYS = keyof typeof TEXT_FORMATTING_TYPE;
