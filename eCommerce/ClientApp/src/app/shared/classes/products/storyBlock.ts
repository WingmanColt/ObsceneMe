export interface StoryBlock {
  id: string;
  blockId?: string;
  type?: 'title' | 'text' | 'image-left' | 'image-right' | 'video' | 'list' | 'notes' | 'custom';
  heading?: string;
  content?: string[];
  image?: string;
  customHtml?: string;
  videoUrl?: string; 
  isPlaying?: boolean;
}

export interface StoryPage {
  template?: 'default' | 'hero' | 'minimal';
  style?: 'light' | 'dark';
  blocks?: StoryBlock[];
  html?: string; // generated before save
}
export interface EditableStoryBlock extends StoryBlock {
  contentString?: string; // only used in the editor
}