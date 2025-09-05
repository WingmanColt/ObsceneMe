import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'app-paginationTwo',
  templateUrl: './paginationTwo.component.html',
  styleUrls: ['./paginationTwo.component.scss']
})
export class PaginationTwoComponent implements OnChanges {
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 1;
  @Output() pageChanged = new EventEmitter<number>();

  pages: number[] = [];

  ngOnChanges(): void {
    this.generatePageNumbers();
  }

  generatePageNumbers(): void {
    const totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.pageChanged.emit(page);
  }
}
