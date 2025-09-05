import { Component, OnInit } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-returns-warranty',
  templateUrl: './returns-warranty.component.html',
  styleUrls: ['./returns-warranty.component.scss']
})
export class ReturnsWarrantyComponent implements OnInit {

  public env = environment;
  constructor() { }

  ngOnInit(): void {
  }

}
