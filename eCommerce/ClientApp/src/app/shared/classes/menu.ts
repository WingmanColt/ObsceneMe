// Menu
export class Menu {
 id?: number;
 path?: string;
 title?: string;
 type?: string;
 megaMenu?: boolean;
 image?: string;
 firstImage?: string;
 secondImage?: string;
 firstColumnTitle?: string;
 secondColumnTitle?: string;
 active?: boolean;
 badge?: boolean;
 badgeText?: string;
 children?: Menu[];

 constructor(args1, args2, args3, args4) {
  this.id = args1;
  this.title = args2;
  this.type = args3;
  this.image = args4;
 }
}
