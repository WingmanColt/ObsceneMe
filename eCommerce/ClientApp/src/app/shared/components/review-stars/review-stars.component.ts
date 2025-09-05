import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-review-stars',
  templateUrl: './review-stars.component.html',
  styleUrls: ['./review-stars.component.scss']
})
export class ReviewStarsComponent implements OnInit {
  @Input() productRating: number = 0;  // Input for the product rating (a float)
  @Input() ratingVotes: number = 0;  // Input for the product rating (a float)
  @Input() maxStars: number = 5;  // Input for the max number of stars (default 5)
  
  stars: number[] = []; // Array to represent stars

  ngOnInit(): void {
    this.generateStars();
  }

  // Generate an array to represent the stars
  generateStars(): void {
    this.stars = Array(this.maxStars).fill(0).map((_, index) => index + 1);
  }

  // Method to determine the class for each star based on rating
  getStarClass(index: number): string {
    const fullStar = index < Math.floor(this.productRating);
    const halfStar = index === Math.floor(this.productRating) && this.productRating % 1 !== 0;

    if (fullStar) {
      return 'star-list__item'; // Full star class
    } else if (halfStar) {
      return 'star-list__item star-list__item-half'; // Half-filled star class
    } else {
      return 'star-list__item star-list__item-gray'; // Gray star (unfilled)
    }
  }
}
