import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, SecurityContext, OnChanges, SimpleChanges, ViewEncapsulation, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, FormGroup } from '@angular/forms';
import { Editor, Toolbar } from 'ngx-editor';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TEXT_FORMATTING_TYPE } from './constants';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditorComponent),
      multi: true,
    },
  ],
})
export class EditorComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {
  @Input() form: FormGroup; // Accept the form group from the parent
  @Input() contentKey: string; // The key to access the content from the form
  @Output() FormChange = new EventEmitter<any>(); // Emit the entire form

  editorContent: SafeHtml; // Local property to hold editor content

  public editor: Editor;
  toolbar: Toolbar = [
    // default value
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
    ['horizontal_rule', 'format_clear']
  ];

  private onChange: (value: string) => void;
  private onTouched: () => void;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.editor = new Editor();

    // Initialize the form control based on the content key
    if (this.form && this.contentKey) {
      this.initializeFormControl();
      this.form.get(this.contentKey)?.valueChanges.subscribe(value => this.onContentChange(value));

    // Set the initial content if available
    this.editorContent = this.form.get(this.contentKey)?.value || '';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['form'] && this.form && this.contentKey) {
      this.initializeFormControl();
    }
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  private initializeFormControl(): void {
    // Check if the control already exists
    if (!this.form.get(this.contentKey)) {
      this.form.addControl(this.contentKey, new FormControl('')); // Initialize with an empty string
    }

    // Sync the form control value to the editor
    this.editor?.setContent(this.form.get(this.contentKey)?.value || '');
  }

  onContentChange(newContent: string): void {
    const sanitizedContent = this.sanitizeHtmlContent(newContent);
    this.editorContent = sanitizedContent; // Update local property
    this.form.get(this.contentKey)?.setValue(sanitizedContent, { emitEvent: false }); // Update form control value
    this.FormChange.emit(this.form); // Emit the updated form to the parent

    if (this.onChange) {
      this.onChange(sanitizedContent as string); // Ensure sanitizedContent is a string
    }
    if (this.onTouched) {
      this.onTouched();
    }
  }

  private sanitizeHtmlContent(htmlString: string): SafeHtml {
    return this.sanitizer.sanitize(SecurityContext.HTML, htmlString) || '';
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.editorContent = value || ''; // Set content as a string
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Handle the disabled state if necessary
  }
}
