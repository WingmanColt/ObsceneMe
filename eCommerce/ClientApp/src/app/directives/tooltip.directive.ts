import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appTooltip]',
})
export class TooltipDirective {
  @Input('appTooltip') tooltipText = '';
  private static activeTooltip: HTMLElement | null = null; // Shared static ref

  private tooltip: HTMLElement;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    // Remove existing tooltip if any
    if (TooltipDirective.activeTooltip) {
      this.renderer.removeChild(document.body, TooltipDirective.activeTooltip);
      TooltipDirective.activeTooltip = null;
    }

    // Create new tooltip
    this.tooltip = this.renderer.createElement('span');
    this.tooltip.innerText = this.tooltipText;
    this.renderer.addClass(this.tooltip, 'custom-tooltip');
    this.renderer.setStyle(this.tooltip, 'position', 'absolute');
    this.renderer.setStyle(this.tooltip, 'pointerEvents', 'none');
    this.renderer.setStyle(this.tooltip, 'opacity', '0');
    this.renderer.appendChild(document.body, this.tooltip);

    // Position tooltip
    const hostPos = this.el.nativeElement.getBoundingClientRect();
    const tooltipPos = this.tooltip.getBoundingClientRect();

    const top = hostPos.top - tooltipPos.height - 10;
    const left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;

    this.renderer.setStyle(this.tooltip, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltip, 'left', `${left}px`);
    this.renderer.setStyle(this.tooltip, 'opacity', '1');

    // Store active tooltip
    TooltipDirective.activeTooltip = this.tooltip;
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    if (this.tooltip && TooltipDirective.activeTooltip === this.tooltip) {
      this.renderer.removeChild(document.body, this.tooltip);
      TooltipDirective.activeTooltip = null;
    }
  }
}
