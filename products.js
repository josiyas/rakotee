const products = [
  {
    id: 1,
    name: "Nike Air Force 1 Low(White)",
    price: 1200.00,
    images: [
      "/products/airforcew1.webp",
      "/products/airforcew2.jpeg",
      "/products/airforcew3.jpeg",
      "/products/airforcew4.jpeg"
    ],
    sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
    colors: ["White"],
    description: "A classic Nike silhouette with premium leather upper and comfortable air-cushioned sole.",
    highlights: [
      "Air-cushioned sole for comfort",
      "Classic Nike silhouette",
      "Durable and long-lasting",
      "Leather upper",
      "Lace closure",
      "Regular fit"
    ]
  },
  {
    id: 2,
    name: "ADIDAS-CAMPUS(Black)",
    price: 1700.00,
    images: [
      "/products/adidasblaq-cam1.jpg",
      "/products/adidasblaq-cam2.jpg",
      "/products/adidasblaq-cam3.jpg",
      "/products/adidasblaq-cam4.jpg"
    ],
    sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
    colors: ["BLACK"],
    description: "Premium leather upper with terry textile lining and an off-white midsole for a retro look.",
    highlights: [
      "Product Code : HQ8708",
      "Terry textile lining",
      "Durable and long-lasting",
      "Leather upper",
      "Lace closure",
      "Regular fit"
    ]
  },
  {
    id: 3,
    name: "ADIDAS-CAMPUS(Blue)",
    price: 1700.00,
    images: [
      "/products/adidasblue-cam1.jpg",
      "/products/adidasblue-cam2.jpg",
      "/products/adidasblue-cam3.jpg",
      "/products/adidasblue-cam4.jpg"
    ],
    sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
    colors: ["White"],
    description: "A versatile campus shoe updated with modern materials and proportions.",
    highlights: [
      "Air-cushioned sole for comfort",
      "Classic adidas Campus look",
      "Durable and long-lasting"
    ]
  },
  {
    id: 4,
    name: "ADIDAS-CAMPUS(Grey)",
    price: 1700.00,
    images: [
      "/products/adidasgrey-cam1.jpg",
      "/products/adidasgrey-cam2.jpg",
      "/products/adidasgrey-cam3.jpg",
      "/products/adidasgrey-cam4.jpg"
    ],
    sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
    colors: ["White n blue"],
    description: "",
    highlights: [
      "Air-cushioned sole for comfort",
      "Classic Nike silhouette",
      "Durable and long-lasting"
    ]
  },
  {
  id: 5,
  name: "ADIDAS-CAMPUS(Red)",
  price: 1700.00,
  images: [
  "/products/adidasred-cam1.jpg",
  "/products/adidasred-cam2.jpg",
  "/products/adidasred-cam3.jpg",
  ],
  sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },
  {
    id: 6,
    name: "AIRFORCE-1 ROPE-LACE(Black)",
    price: 1400.00,
    images: [
  "/products/airRblaq-cam1.jpg",
  "/products/airRblaq-cam2.jpg",
  "/products/airRblaq-cam3.jpg",
  "/products/airRblaq-cam4.jpg",
  "/products/airRblaq-cam5.jpg"
    ],
    sizes: ["2UK", "3UK", "4UK","5UK", "6UK", "7UK","8UK", "9UK", "10UK","11UK","12UK"],
    colors: ["White n blue"],
    description: "",
    highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
    id: 29,
    category: "Phones",
    name: "Iphone XR(White)",
    price: 4500.00,
  images: [
  "/products/airRpink-cam1.jpg",
  "/products/airRpink-cam2.jpg",
  "/products/airRpink-cam3.jpg",
  "/products/airRpink-cam4.jpg"
  ],
  sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
  sizes: ["64GB", "128GB", "256GB", "512GB"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },
  {
    id: 8,
    name: "AIRFORCE-1 ROPE-LACE(White)",
    price: 1400.00,
    images: [
  "/products/airRwhite-cam1.jpg",
  "/products/airRwhite-cam2.jpg",
  "/products/airRwhite-cam3.jpg",
  "/products/airRwhite-cam4.jpg"
    ],
    sizes: ["2UK", "3UK", "4UK","5UK", "6UK", "7UK","8UK", "9UK", "10UK","11UK","12UK"],
    colors: ["White n blue"],
    description: "",
    highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 9,
  name: "Nike Air Force 1 Low(Black)",
  price: 1200.00,
  images: [
  "/products/black-air1.jpg",
  "/products/black-air2.jpg",
  "/products/black-air3.jpg",
  "/products/black-air4.jpg"
  ],
  sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },
  {
    id: 10,
    name: "Jordan-4 RETRO(Black)",
    price: 2000.00,
    images: [
  "/products/black-jordan1.jpg",
  "/products/black-jordan2.jpg",
  "/products/black-jordan3.jpg",
  "/products/black-jordan4.jpg",
  "/products/black-jordan5.jpg"
    ],
    sizes: ["2UK", "3UK", "4UK","5UK", "6UK", "7UK","8UK", "9UK", "10UK","11UK","12UK"],
    colors: ["White n blue"],
    description: "",
    highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 11,
  name: "Jordan-4 RETRO(Black & RED)",
  price: 2000.00,
  images: [
  "/products/blaqnwhi-jordan1.jpg",
  "/products/blaqnwhi-jordan2.jpg",
  "/products/blaqnwhi-jordan3.jpg",
  "/products/blaqnwhi-jordan5.jpg"
  ],
  sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },
  {
    id: 12,
    name: "Dunk-low(Black)",
    price: 1200.00,
    images: [
  "/products/blq-dunk1.jpg",
  "/products/blq-dunk1.jpg",
  "/products/blq-dunk2.jpg",
  "/products/blq-dunk3.jpg"
    ],
    sizes: ["2UK", "3UK", "4UK","5UK", "6UK", "7UK","8UK", "9UK", "10UK","11UK","12UK"],
    colors: ["White n blue"],
    description: "",
    highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 13,
  name: "Dunk-Low(blue)",
  price: 1200.00,
  images: [
  "/products/blue-dunk1.jpg",
  "/products/blue-dunk3.jpg",
  "/products/blue-dunk4.jpg",
  "/products/blue-dunk2.jpg"
  ],
  sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },
  {
    id: 14,
    name: "Jordan-4 RETRO(Blue & White)",
    price: 2000.00,
    images: [
  "/products/bluenwhi-jordan1.jpg",
  "/products/bluenwhi-jordan3.jpg",
  "/products/bluenwhi-jordan4.jpg"
    ],
    sizes: ["2UK", "3UK", "4UK","5UK", "6UK", "7UK","8UK", "9UK", "10UK","11UK","12UK"],
    colors: ["White n blue"],
    description: "",
    highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 15,
  name: "Dunk-Low(grey)",
  price: 1200.00,
  images: [
  "/products/dunklowg1.webp",
  "/products/dunklowg2.webp",
  "/products/dunklowg3.webp",
  "/products/dunklowg4.webp"
  ],
  sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },
  {
    id: 16,
    name: "Jordan-4 RETRO(Grey)",
    price: 2000.00,
    images: [
  "/products/grey.webp",
  "/products/grey-(2).webp",
  "/products/grey-(3).webp",
  "/products/grey-(4).webp"
    ],
    sizes: ["2UK", "3UK", "4UK","5UK", "6UK", "7UK","8UK", "9UK", "10UK","11UK","12UK"],
    colors: ["White n blue"],
    description: "",
    highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 17,
  name: "Jordan-4 RETRO(white)",
  price: 2000.00,
  images: [
  "/products/jordan4-white.webp",
  "/products/jordan4-white-(2).webp",
  "/products/jordan4-white-(3).webp",
  "/products/jordan4-white-(4).webp"
  ],
  sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },
  {
    id: 18,
    name: "Dunk-Low(Orange)",
    price: 2000.00,
    images: [
  "/products/orange-dunk1.jpg",
  "/products/orange-dunk2.jpg",
  "/products/orange-dunk3.jpg",
  "/products/orange-dunk4.jpg"
    ],
    sizes: ["2UK", "3UK", "4UK","5UK", "6UK", "7UK","8UK", "9UK", "10UK","11UK","12UK"],
    colors: ["White n blue"],
    description: "",
    highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 19,
  name: "Puma-Campus(Black)",
  price: 1700.00,
  images: [
  "/products/pumablaq-cam1.jpg",
  "/products/pumablaq-cam2.jpg",
  "/products/pumablaq-cam3.jpg",
  "/products/pumablaq-cam4.jpg"
  ],
  sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },
  {
    id: 20,
    name: "Puma-Campus(blue)",
    price: 1700.00,
    images: [
  "/products/pumablue-cam1.jpg",
  "/products/pumablue-cam2.jpg",
  "/products/pumablue-cam3.jpg",
  "/products/pumablue-cam4.jpg"
    ],
    sizes: ["2UK", "3UK", "4UK","5UK", "6UK", "7UK","8UK", "9UK", "10UK","11UK","12UK"],
    colors: ["White n blue"],
    description: "",
    highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 21,
  name: "Puma-Campus(Green)",
  price: 1700.00,
  images: [
  "/products/pumagreen-cam1.jpg",
  "/products/pumagreen-cam2.jpg",
    
  ],
  sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },
  {
    id: 22,
    name: "Puma-Campus(Red)",
    price: 1700.00,
    images: [
  "/products/pumared-cam1.jpg",
  "/products/pumared-cam2.jpg",
  "/products/pumared-cam3.jpg",
      
    ],
    sizes: ["2UK", "3UK", "4UK","5UK", "6UK", "7UK","8UK", "9UK", "10UK","11UK","12UK"],
    colors: ["White n blue"],
    description: "",
    highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 23,
  name: "Dunk-Low(Purple)",
  price: 1200.00,
  images: [
  "/products/purple-dunk1.jpg",
  "/products/purple-dunk2.jpg",
  "/products/purple-dunk3.jpg",
  "/products/purple-dunk4.jpg"
  ],
  sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },
  {
    id: 24,
    name: "Jordan-4 RETRO(white n Red)",
    price: 2000.00,
    images: [
  "/products/redw.webp",
  "/products/redw-(2).webp",
  "/products/redw-(3).webp",
  "/products/redw-(4).webp"
    ],
    sizes: ["2UK", "3UK", "4UK","5UK", "6UK", "7UK","8UK", "9UK", "10UK","11UK","12UK"],
    colors: ["White n blue"],
    description: "",
    highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 25,
  name: "NIke Shox TL",
  price: 2900.00,
  images: [
  "/products/shoxtl-blaq1.jpg",
  "/products/shoxtl-blaq2.jpg",
  "/products/shoxtl-blaq3.jpg",
  "/products/shoxtl-blaq4.jpg",
  "/products/shoxtl-blaq5.jpg"
  ],
  sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },
  {
    id: 26,
    name: "Vans-Campus(Black)",
    price: 1800.00,
    images: [
  "/products/vansblaq-cam1.jpg",
  "/products/vansblaq-cam2.jpg",
  "/products/vansblaq-cam3.jpg",
    
    ],
    sizes: ["2UK", "3UK", "4UK","5UK", "6UK", "7UK","8UK", "9UK", "10UK","11UK","12UK"],
    colors: ["White n blue"],
    description: "",
    highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 27,
  name: "Nike-Shox TL(white)",
  price: 2900.00,
  images: [
  "/products/shoxtl-white1.jpg",
  "/products/shoxtl-white2.jpg",
  "/products/shoxtl-white3.jpg",
  "/products/shoxtl-white4.jpg",
  "/products/shoxtl-white5.jpg"
  ],
  sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },
  {
    id: 28,
    name: "Jordan-4 RETRO(white)",
    price: 2000.00,
    images: [
  "/products/white-jordan1.jpg",
  "/products/white-jordan2.jpg",
  "/products/white-jordan3.jpg",
    ],
    sizes: ["2UK", "3UK", "4UK","5UK", "6UK", "7UK","8UK", "9UK", "10UK","11UK","12UK"],
    colors: ["White n blue"],
    description: "",
    highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 29,
  name: "Iphone XR(White)",
  price: 4500.00,
  images: [
  "/products/Xr1.jpg",
  "/products/Xr2.jpg",
  "/products/Xr3.jpg",
  "/products/Xr4.jpg",
  "/products/Xr5.jpg"
  ],
  sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },
  {
    id: 30,
    name: "Iphone 11 Pro",
    category: "Phones",
    price: 7000.00,
    images: [
  "/products/11-pro1.png",
  "/products/11-pro2.png",
  "/products/11-pro3.png",
  "/products/11-pro4.png",
  "/products/11-pro5.png",
  "/products/11-pro6.png"
    ],
  sizes: ["64GB", "128GB", "256GB", "512GB"],
    colors: ["White n blue"],
    description: "",
    highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 31,
    category: "Phones",
  name: "Iphone-12 PRO Max",
  price: 10000.00,
  images: [
  "/products/12-pro-max1.png",
  "/products/12-pro-max2.png",
  "/products/12-pro-max3.png",
  "/products/12-pro-max4.png",
  "/products/12-pro-max5.png"
  ],
  sizes: ["64GB", "128GB", "256GB", "512GB"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },
  {
    id: 32,
    name: "Iphone-12 pro",
    category: "Phones",
    price: 9500.00,
    images: [
  "/products/12-pro1.png",
  "/products/12-pro2.png",
  "/products/12-pro3.png",
  "/products/12-pro4.png",
  "/products/12-pro5.png",
  "/products/12-pro6.png"
    ],
  sizes: ["64GB", "128GB", "256GB", "512GB"],
    colors: ["White n blue"],
    description: "",
    highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 33,
    category: "Phones",
  name: "Iphone-13 pro",
  price: 13000.00,
  images: [
  "/products/13-pro1.png",
  "/products/13-pro2.png",
  "/products/13-pro3.png",
  "/products/13-pro4.png",
  "/products/13-pro5.png"
  ],
  sizes: ["64GB", "128GB", "256GB", "512GB"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },
  {
    id: 34,
    name: "Iphone-11",
    category: "Phones",
    price: 5500.00,
    images: [
  "/products/111.jpg",
  "/products/112.jpg",
  "/products/113.jpg",
  "/products/114.jpg",
  "/products/115.jpg"
    ],
  sizes: ["64GB", "128GB", "256GB", "512GB"],
    colors: ["White n blue"],
    description: "",
    highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 35,
    category: "Phones",
  name: "Iphone-12",
  price: 8000.00,
  images: [
  "/products/121.png",
  "/products/122.png",
  "/products/123.png",
  "/products/124.png"
  ],
  sizes: ["64GB", "128GB", "256GB", "512GB"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },
  {
    id: 36,
    category: "Phones",
    category: "Phones",
    price: 13000.00,
    images: [
  "/products/131.png",
  "/products/132.png",
  "/products/133.png",
  "/products/134.png"
    ],
  sizes: ["64GB", "128GB", "256GB", "512GB"],
    colors: ["White n blue"],
    description: "",
    highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 37,
  name: "Nike Air Force 1 Low",
  price: 1200.00,
  images: [
  "products/airforcew1.webp",
    "/products/airforcew2.jpeg",
  "products/airforcew3.jpeg",
  "products/airforcew4.jpeg"
  ],
  sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },
  {
    id: 38,
    name: "Streetwear Tee",
    price: 1900.00,
    images: [
  "products/bluew.webp",
  "/products/bluew-(2).webp",
  "/products/bluew-(3).webp",
  "/products/bluew-(4).webp"
    ],
    sizes: ["2UK", "3UK", "4UK","5UK", "6UK", "7UK","8UK", "9UK", "10UK","11UK","12UK"],
    colors: ["White n blue"],
    description: "",
    highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 39,
  name: "Nike Air Force 1 Low",
  price: 1300.00,
  images: [
  "images/products/airforcew1.webp",
    "/images/products/airforcew2.jpeg",
  "images/products/airforcew3.jpeg",
  "images/products/airforcew4.jpeg"
  ],
  sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },
  {
    id: 40,
    name: "Streetwear Tee",
    price: 1900.00,
    images: [
      "images/products/bluew.webp",
        "/images/products/bluew-(2).webp",
      "/images/products/bluew-(3).webp",
      "/images/products/bluew-(4).webp"
    ],
    sizes: ["2UK", "3UK", "4UK","5UK", "6UK", "7UK","8UK", "9UK", "10UK","11UK","12UK"],
    colors: ["White n blue"],
    description: "",
    highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },
  {
  id: 41,
  name: "Nike Air Force 1 Low",
  price: 1300.00,
  images: [
    "images/products/airforcew1.webp",
      "/images/products/airforcew2.jpeg",
    "images/products/airforcew3.jpeg",
    "images/products/airforcew4.jpeg"
  ],
  sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },
  {
    id: 42,
    name: "Streetwear Tee",
    price: 1900.00,
    images: [
      "products/bluew.webp",
  "/products/bluew-(2).webp",
  "/products/bluew-(3).webp",
  "/products/bluew-(4).webp"
    ],
    sizes: ["2UK", "3UK", "4UK","5UK", "6UK", "7UK","8UK", "9UK", "10UK","11UK","12UK"],
    colors: ["White n blue"],
    description: "",
    highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 43,
  name: "Nike Air Force 1 Low",
  price: 1300.00,
  images: [
  "/products/airforcew1.webp",
  "/products/airforcew2.jpeg",
  "/products/airforcew3.jpeg",
  "/products/airforcew4.jpeg"
  ],
  sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 44,
  name: "Streetwear Tee",
  price: 1900.00,
  images: [
  "/products/bluew.webp",
  "/products/bluew-(2).webp",
  "/products/bluew-(3).webp",
  "/products/bluew-(4).webp"
    ],
    sizes: ["2UK", "3UK", "4UK","5UK", "6UK", "7UK","8UK", "9UK", "10UK","11UK","12UK"],
    colors: ["White n blue"],
    description: "",
    highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 45,
  name: "Nike Air Force 1 Low",
  price: 1300.00,
  images: [
  "/products/airforcew1.webp",
  "/products/airforcew2.jpeg",
  "/products/airforcew3.jpeg",
  "/products/airforcew4.jpeg"
  ],
  sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 46,
  name: "Streetwear Tee",
  price: 1900.00,
  images: [
  "/products/bluew.webp",
  "/products/bluew-(2).webp",
  "/products/bluew-(3).webp",
  "/products/bluew-(4).webp"
  ],
  sizes: ["2UK", "3UK", "4UK","5UK", "6UK", "7UK","8UK", "9UK", "10UK","11UK","12UK"],
  colors: ["White n blue"],
  description: "",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 47,
  name: "Nike Air Force 1 Low",
  price: 1300.00,
  images: [
    "products/airforcew1.webp",
    "products/airforcew2.jpeg",
    "products/airforcew3.jpeg",
    "products/airforcew4.jpeg"
  ],
  sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 48,
  name: "Streetwear Tee",
  price: 1900.00,
  images: [
    "products/bluew.webp",
  "/products/bluew-(2).webp",
  "/products/bluew-(3).webp",
  "/products/bluew-(4).webp"
  ],
  sizes: ["2UK", "3UK", "4UK","5UK", "6UK", "7UK","8UK", "9UK", "10UK","11UK","12UK"],
  colors: ["White n blue"],
  description: "",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 49,
  name: "Nike Air Force 1 Low",
  price: 1300.00,
  images: [
    "products/airforcew1.webp",
    "products/airforcew2.jpeg",
    "products/airforcew3.jpeg",
    "products/airforcew4.jpeg"
  ],
  sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 50,
  name: "Streetwear Tee",
  price: 1900.00,
  images: [
    "products/bluew.webp",
    "products/bluew (2).webp",
    "products/bluew (3).webp",
    "products/bluew (4).webp"
  ],
  sizes: ["2UK", "3UK", "4UK","5UK", "6UK", "7UK","8UK", "9UK", "10UK","11UK","12UK"],
  colors: ["White n blue"],
  description: "",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 51,
  name: "Nike Air Force 1 Low",
  price: 1300.00,
  images: [
    "products/airforcew1.webp",
    "products/airforcew2.jpeg",
    "products/airforcew3.jpeg",
    "products/airforcew4.jpeg"
  ],
  sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 52,
  name: "Streetwear Tee",
  price: 1900.00,
  images: [
    "products/bluew.webp",
    "products/bluew (2).webp",
    "products/bluew (3).webp",
    "products/bluew (4).webp"
  ],
  sizes: ["2UK", "3UK", "4UK","5UK", "6UK", "7UK","8UK", "9UK", "10UK","11UK","12UK"],
  colors: ["White n blue"],
  description: "",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 53,
  name: "Nike Air Force 1 Low",
  price: 1300.00,
  images: [
    "products/airforcew1.webp",
    "products/airforcew2.jpeg",
    "products/airforcew3.jpeg",
    "products/airforcew4.jpeg"
  ],
  sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 54,
  name: "Streetwear Tee",
  price: 1900.00,
  images: [
    "products/bluew.webp",
    "products/bluew (2).webp",
    "products/bluew (3).webp",
    "products/bluew (4).webp"
  ],
  sizes: ["2UK", "3UK", "4UK","5UK", "6UK", "7UK","8UK", "9UK", "10UK","11UK","12UK"],
  colors: ["White n blue"],
  description: "",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 55,
  name: "Nike Air Force 1 Low",
  price: 1300.00,
  images: [
    "products/airforcew1.webp",
    "products/airforcew2.jpeg",
    "products/airforcew3.jpeg",
    "products/airforcew4.jpeg"
  ],
  sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 56,
  name: "Streetwear Tee",
  price: 1900.00,
  images: [
    "products/bluew.webp",
    "products/bluew (2).webp",
    "products/bluew (3).webp",
    "products/bluew (4).webp"
  ],
  sizes: ["2UK", "3UK", "4UK","5UK", "6UK", "7UK","8UK", "9UK", "10UK","11UK","12UK"],
  colors: ["White n blue"],
  description: "",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },{
  id: 57,
  name: "Nike Air Force 1 Low",
  price: 1300.00,
  images: [
    "products/airforcew1.webp",
    "products/airforcew2.jpeg",
    "products/airforcew3.jpeg",
    "products/airforcew4.jpeg"
  ],
  sizes: ["2UK", "3UK", "4UK", "5UK", "6UK", "7UK", "8UK", "9UK", "10UK", "11UK", "12UK"],
  colors: ["White"],
  description: "A cozy and stylish hoodie made from premium materials, perfect for every season.",
  highlights: [
    "Premium leather upper",
    "Air-cushioned sole for comfort",
    "Classic Nike silhouette",
    "Durable and long-lasting"
  ]
  },


];

// Auto-tag categories for any products that don't have an explicit category.
// This uses name-based heuristics so the category filter works immediately
// without modifying every product object manually.
;(function autoTagCategories() {
  const phoneRe = /\b(iphone|xr|11 pro|12 pro|max|13 pro|iphone-|iphone)\b|\b11\b|\b12\b|\b13\b/i;
  const shoesRe = /\b(nike|adidas|jordan|dunk|puma|vans|shox|air force|airforce|airforce-1|airforce1)\b/i;
  const hubblyRe = /\b(hubbly|hubble|shisha|hookah)\b/i;
  const accessoriesRe = /\b(case|charger|cable|accessor|earbud|headphone|cover|screen protector|charger)\b/i;

  products.forEach(p => {
    if (p.category) return; // keep explicit categories
    const name = (p.name || '').toString().toLowerCase();
    if (phoneRe.test(name)) {
      p.category = 'Phones';
    } else if (shoesRe.test(name)) {
      p.category = 'Shoes';
    } else if (hubblyRe.test(name)) {
      p.category = 'Hubbly';
    } else if (accessoriesRe.test(name)) {
      p.category = 'Accessories';
    } else {
      p.category = 'Other';
    }
  });
})();

  // Ensure phone products have storage options instead of shoe sizes
  ;(function ensurePhoneStorage() {
    const storageOptions = ["64GB", "128GB", "256GB", "512GB"];
    products.forEach(p => {
      if ((p.category && p.category.toLowerCase() === 'phones')) {
        // only replace if sizes looks like shoe sizes (contains 'UK') or is missing
        if (!Array.isArray(p.sizes) || p.sizes.some(s => /UK$/i.test(s))) {
          p.sizes = [...storageOptions];
        }
      }
    });
  })();

  // Auto-build variants mapping per product: group images by detected color tokens
  ;(function buildVariants() {
    const tokenize = s => s.toString().toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    products.forEach(p => {
      if (!p.images || !Array.isArray(p.images)) return;
      const variants = {};
      p.images.forEach(img => {
        const name = img.toLowerCase();
        // try to match any declared color first
        if (p.colors && p.colors.length) {
          for (const color of p.colors) {
            const toks = tokenize(color);
            if (toks.some(t => name.includes(t))) {
              variants[color] = variants[color] || [];
              variants[color].push(img);
              return;
            }
          }
        }
        // otherwise, try to infer color token from filename
        const toks = tokenize(img);
        for (const t of toks) {
          if (/^(black|white|blaq|red|blue|grey|green|orange|pink|gold|silver|navy|brown)$/.test(t)) {
            variants[t] = variants[t] || [];
            variants[t].push(img);
            return;
          }
        }
        // fallback: push to a default 'all' bucket
        variants.all = variants.all || [];
        variants.all.push(img);
      });
      p.variants = variants;
    });
  })();
// DOM Elements
const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

// Modal Elements
const productModal = document.getElementById('productModal');
const modalImage = document.getElementById('modalImage');
const modalThumbnails = document.getElementById('modalThumbnails');
const modalName = document.getElementById('modalName');
const modalPrice = document.getElementById('modalPrice');
const modalDescription = document.getElementById('modalDescription');
const sizeSelect = document.getElementById('sizeSelect');
const colorSelect = document.getElementById('colorSelect');
const quantityInput = document.getElementById('quantityInput');
const addToCartBtn = document.getElementById('addToCartBtn');
const closeModal = document.querySelector('.close-modal');

let selectedProduct = null;

// Show loading spinner
function showLoadingSpinner(show) {
  const spinner = document.getElementById('loadingSpinner');
  if (spinner) spinner.style.display = show ? 'block' : 'none';
}

// Render products
function displayProducts(filteredProducts) {
  showLoadingSpinner(true);
  setTimeout(() => { // Simulate loading delay for UX
    productGrid.innerHTML = '';
    filteredProducts.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
  <img src="${product.images[0].startsWith('/') ? product.images[0] : '/' + product.images[0]}" alt="${product.name}" class="product-img" loading="lazy" onerror="this.onerror=null;this.src='/products/fallback.png';">
        <h3>${product.name}</h3>
        <p>R ${product.price.toFixed(2)}</p>
        <button class="btn open-modal" data-id="${product.id}">View</button>
      `;
      productGrid.appendChild(card);
    });
    showLoadingSpinner(false);
  }, 600); // 600ms delay for effect
}

// Open modal
function openModal(product) {
  selectedProduct = product;

  modalImage.src = product.images[0].startsWith('/') ? product.images[0] : '/' + product.images[0];
  modalImage.loading = 'lazy';
  modalImage.onerror = function() {
    this.onerror = null;
    this.src = '/products/fallback.png';
  };
  modalName.textContent = product.name;
  modalPrice.textContent = product.price.toFixed(2);
  modalDescription.textContent = product.description;

  // Highlights
  const highlightsList = document.getElementById("modal-highlights-list");
  highlightsList.innerHTML = "";
  if (product.highlights && product.highlights.length > 0) {
    product.highlights.forEach(point => {
      const li = document.createElement("li");
      li.textContent = point;
      highlightsList.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.textContent = "No highlights available.";
    highlightsList.appendChild(li);
  }

  // Thumbnails
  modalThumbnails.innerHTML = '';
  // helper: compute images to show for a chosen color
  function imagesForColor(color) {
    if (!color) return product.images || [];
    // prefer explicit product variants when available
    if (product.variants) {
      // exact color match
      if (product.variants[color] && product.variants[color].length) return product.variants[color];
      // tokenized color match (e.g., 'Black' -> 'black' key)
      const key = color.toString().toLowerCase();
      if (product.variants[key] && product.variants[key].length) return product.variants[key];
      // check for any variant key that contains the token
      for (const k of Object.keys(product.variants)) {
        if (k.toLowerCase().includes(key) && product.variants[k].length) return product.variants[k];
      }
    }

    const tokens = color.toString().toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    if (!tokens.length) return product.images || [];
    const imgs = (product.images || []).filter(img => {
      const name = img.toLowerCase();
      // match any color token present in the filename
      return tokens.some(t => name.includes(t));
    });
    return imgs.length ? imgs : (product.images || []);
  }

  // render thumbnails for a given image list
  function renderThumbnails(imgList) {
    modalThumbnails.innerHTML = '';
    imgList.forEach((img, idx) => {
      const thumb = document.createElement('img');
      thumb.src = img.startsWith('/') ? img : '/' + img;
      thumb.loading = 'lazy';
      thumb.className = idx === 0 ? 'selected' : '';
      thumb.onerror = function() { this.onerror = null; this.src = '/products/fallback.png'; };
      thumb.addEventListener('click', () => {
        modalImage.src = img.startsWith('/') ? img : '/' + img;
        document.querySelectorAll('#modalThumbnails img').forEach(i => i.classList.remove('selected'));
        thumb.classList.add('selected');
      });
      modalThumbnails.appendChild(thumb);
    });
    // set main image to first
    if (imgList && imgList.length) {
      modalImage.src = imgList[0].startsWith('/') ? imgList[0] : '/' + imgList[0];
    }
  }

  // Sizes
  // Update label to 'Storage:' for phone products
  try {
    const sizeLabelEl = document.getElementById('sizeLabel');
    if (sizeLabelEl) {
      sizeLabelEl.textContent = (product.category && product.category.toLowerCase() === 'phones') ? 'Storage:' : 'Size:';
    }
  } catch (e) {
    // ignore DOM errors in environments without the element
  }

  sizeSelect.innerHTML = '';
  (product.sizes || []).forEach(size => {
    const option = document.createElement('option');
    option.value = size;
    option.textContent = size;
    sizeSelect.appendChild(option);
  });

  // Colors
  colorSelect.innerHTML = '';
  product.colors.forEach(color => {
    const option = document.createElement('option');
    option.value = color;
    option.textContent = color;
    colorSelect.appendChild(option);
  });

  // When color changes, show images that match the color (filename heuristic)
  const applyColorImages = () => {
    try {
      const selectedColor = colorSelect.value;
      const imgs = imagesForColor(selectedColor);
      renderThumbnails(imgs);
    } catch (e) {
      renderThumbnails(product.images || []);
    }
  };
  colorSelect.addEventListener('change', applyColorImages);
  // initialize thumbnails according to the default or first color
  if (product.colors && product.colors.length) {
    // set the select to the first color then apply
    colorSelect.value = product.colors[0];
    applyColorImages();
  } else {
    renderThumbnails(product.images || []);
  }

  quantityInput.value = 1;
  productModal.classList.add('show');
}


// Open modal
function openProductModal(product) {
  const modal = document.getElementById("productModal");
  modal.classList.add("show");

  document.getElementById("modalImage").src = product.image;
  document.getElementById("modalName").textContent = product.name;
  document.getElementById("modalPrice").textContent = product.price;
  document.getElementById("modalDescription").textContent = product.description;

  // Populate other fields...
}

// Close modal
document.getElementById("closeModalBtn").addEventListener("click", () => {
  document.getElementById("productModal").classList.remove("show");
});

// Optional: Close when clicking outside
document.getElementById("productModal").addEventListener("click", (e) => {
  if (e.target.id === "productModal") {
    e.currentTarget.classList.remove("show");
  }
});


// Add to cart
addToCartBtn.addEventListener('click', () => {
  const size = sizeSelect.value;
  const color = colorSelect.value;
  const quantity = parseInt(quantityInput.value);
  if (!size || !color || quantity <= 0) return;

  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.find(item =>
    item.id === selectedProduct.id && item.size === size && item.color === color
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      image: selectedProduct.images[0],
      size,
      color,
      quantity
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  productModal.classList.remove('show'); // Properly close modal

  // Update cart count
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('#cartCount').forEach(el => el.textContent = count);
});

// SECURITY WARNING: Never expose sensitive information (like database passwords or API keys) in frontend code.
// Always validate and sanitize user input on the backend!

const colorFilter = document.getElementById('colorFilter');
const sizeFilter = document.getElementById('sizeFilter');
const categoryFilter = document.getElementById('categoryFilter');
const sizeFilterEl = document.getElementById('sizeFilter');

function filterProducts() {
  const term = searchInput.value.toLowerCase();
  const color = colorFilter.value;
  const size = sizeFilter.value;
  const category = categoryFilter ? categoryFilter.value : '';
  let filtered = products.filter(p => {
    const matchesTerm = p.name.toLowerCase().includes(term);
    const matchesColor = (color === '' || (p.colors && p.colors.includes(color)));
    const matchesSize = (size === '' || (p.sizes && p.sizes.includes(size)));
    let matchesCategory = true;
    if (category && category !== '') {
      if (p.category) {
        matchesCategory = p.category.toLowerCase() === category.toLowerCase();
      } else {
        // fallback to name-based mapping
        matchesCategory = getCategoryProducts(category).some(x => x.id === p.id);
      }
    }
    return matchesTerm && matchesColor && matchesSize && matchesCategory;
  });
  displayProducts(filtered);
}

searchInput.addEventListener('input', filterProducts);
colorFilter.addEventListener('change', filterProducts);
sizeFilter.addEventListener('change', filterProducts);
if (categoryFilter) categoryFilter.addEventListener('change', filterProducts);
// When category changes, adjust the size filter options to show storage options for Phones
if (categoryFilter) {
  categoryFilter.addEventListener('change', () => {
    try {
      const cat = categoryFilter.value;
      if (!sizeFilterEl) return;
      sizeFilterEl.innerHTML = '';
      const makeOption = (val, text) => {
        const o = document.createElement('option'); o.value = val; o.textContent = text || val; return o;
      };
      sizeFilterEl.appendChild(makeOption('', 'All Sizes'));
      if (cat && cat.toLowerCase() === 'phones') {
        ['64GB','128GB','256GB','512GB'].forEach(s => sizeFilterEl.appendChild(makeOption(s)));
      } else {
        ['2UK','3UK','4UK','5UK','6UK','7UK','8UK','9UK','10UK','11UK','12UK'].forEach(s => sizeFilterEl.appendChild(makeOption(s)));
      }
    } catch (e) {
      // ignore dynamic UI failures
    }
  });
}
sortSelect.addEventListener('change', () => {
  let sorted = [...products];
  const val = sortSelect.value;
  if (val === 'name') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (val === 'price') {
    sorted.sort((a, b) => a.price - b.price);
  }
  displayProducts(sorted);
});

// Handle modal open buttons
document.addEventListener('click', e => {
  if (e.target.classList.contains('open-modal')) {
    const id = +e.target.dataset.id;
    const product = products.find(p => p.id === id);
    if (product) openModal(product);
  }
});


// Helper: Get query string parameter
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Category mapping (add more as needed)
function getCategoryProducts(category) {
  if (!category) return products;
  const cat = category.toLowerCase();
  // Footwear: match by keywords in name
  if (cat === 'footwear') {
    return products.filter(p =>
      /nike|adidas|jordan|dunk|puma|vans|shox/i.test(p.name)
    );
  }
  // Phones: match by keywords in name
  if (cat === 'phones' || cat === 'phone') {
    return products.filter(p =>
      /iphone|samsung|huawei|xr|pro|max/i.test(p.name)
    );
  }
  // Sale: match by 'sale' in name (case-insensitive)
  if (cat === 'sale') {
    return products.filter(p => /sale/i.test(p.name));
  }
  // Add more categories as needed
  return products;
}

document.addEventListener('DOMContentLoaded', function() {
  const category = getQueryParam('category');
  const filtered = getCategoryProducts(category);
  displayProducts(filtered);
});
