export type MenuItemSeed = {
  name: string;
  sellingPrice: number;
  costPrice?: number;
  preparationTime?: number;
  description?: string;
};

export type CategorySeed = {
  id: string;
  name: string;
  items: MenuItemSeed[];
};

const pizzaSizes = [
  { suffix: "Small", key: "S" },
  { suffix: "Medium", key: "M" },
  { suffix: "Large", key: "L" },
  { suffix: "X-Large", key: "XL" },
] as const;

function pizzaItems(
  flavours: string[],
  prices: { S: number; M: number; L: number; XL: number }
): MenuItemSeed[] {
  const items: MenuItemSeed[] = [];
  for (const flavour of flavours) {
    for (const size of pizzaSizes) {
      items.push({
        name: `${flavour} (${size.suffix})`,
        sellingPrice: prices[size.key],
        costPrice: Math.round(prices[size.key] * 0.55),
        preparationTime: size.key === "S" ? 15 : size.key === "M" ? 20 : size.key === "L" ? 25 : 30,
      });
    }
  }
  return items;
}

function simpleItems(names: [string, number][]): MenuItemSeed[] {
  return names.map(([name, sellingPrice]) => ({
    name,
    sellingPrice,
    costPrice: Math.round(sellingPrice * 0.6),
  }));
}

export const DESERT_BITE_MENU: CategorySeed[] = [
  {
    id: "cat-burgers",
    name: "Burgers",
    items: simpleItems([
      ["Zinger Burger", 250],
      ["Zinger Cheese", 300],
      ["Tower Burger", 350],
      ["Duble Decker", 400],
      ["Chicken Burger", 200],
      ["Grilled Burger", 250],
      ["Grilled Cheese Burger", 300],
    ]),
  },
  {
    id: "cat-shawarma",
    name: "Shawarma",
    items: simpleItems([
      ["Small Shawarma", 130],
      ["Chicken Shawarma", 150],
      ["Chicken Cheese Shawarma", 200],
      ["Grilled Shawarma", 240],
      ["Grilled Cheese Shawarma", 260],
      ["Malai Boti Shawarma", 240],
      ["Zinger Shawarma", 250],
      ["Zinger Cheese Shawarma", 270],
      ["Vegetable Shawarma", 150],
    ]),
  },
  {
    id: "cat-pratha",
    name: "Pratha Rolls",
    items: simpleItems([
      ["Chicken Pratha", 200],
      ["Chicken Cheese Pratha", 250],
      ["Zinger Pratha", 250],
      ["Zinger Cheese Pratha", 280],
      ["Vegetable Pratha", 200],
    ]),
  },
  {
    id: "cat-pizza-regular",
    name: "Pizza - Regular",
    items: pizzaItems(
      [
        "Chicken Tikka",
        "Chicken Fajita",
        "Chicken Tandori",
        "Chicken Achari",
        "Chicken Lover",
        "Vegetarian Pizza",
        "Mushroom Pizza",
        "Hot & Spicy",
      ],
      { S: 500, M: 900, L: 1300, XL: 1700 }
    ),
  },
  {
    id: "cat-pizza-special",
    name: "Pizza - Special",
    items: pizzaItems(
      ["Malai Boti", "B.B.Q Pizza", "Cheese Gold", "Afghani Pizza", "Thin Crust"],
      { S: 600, M: 1050, L: 1450, XL: 1900 }
    ),
  },
  {
    id: "cat-pizza-over-special",
    name: "Pizza - Over Special",
    items: pizzaItems(
      [
        "Special DB Pizza",
        "Crown Crust Pizza",
        "Kabab Crust Pizza",
        "Lasania Pizza",
        "Behari Kabab",
        "Cheese Crust",
      ],
      { S: 650, M: 1150, L: 1550, XL: 2100 }
    ),
  },
  {
    id: "cat-fried",
    name: "Fried Items",
    items: simpleItems([
      ["10 Hot Wings", 600],
      ["10 Hot Shots", 500],
      ["10 Nuggets", 450],
      ["Leg Piece", 350],
      ["Drum Stick", 150],
    ]),
  },
  {
    id: "cat-wings",
    name: "Special Wings",
    items: simpleItems([
      ["10 Perri Perri Wings", 700],
      ["10 Bar B.Q Wings", 700],
    ]),
  },
  {
    id: "cat-fries",
    name: "Fries",
    items: simpleItems([
      ["Regular Fries", 150],
      ["Medium Fries", 200],
      ["Large Fries", 300],
      ["Cheese Loaded Fries", 500],
      ["Bar B.Q Fries", 500],
    ]),
  },
  {
    id: "cat-sandwiches",
    name: "Sandwiches",
    items: simpleItems([
      ["Plane Sandwich", 150],
      ["Club Sandwich", 300],
    ]),
  },
  {
    id: "cat-pasta-rice",
    name: "Pasta & Rice",
    items: simpleItems([
      ["White Sauce Pasta", 400],
      ["Chicken Macaroni", 300],
      ["Chicken Fried Rise", 350],
      ["Special Fried Rise", 350],
    ]),
  },
  {
    id: "cat-burger-deals",
    name: "Burger Deals",
    items: simpleItems([
      ["Burger Deal 1 - Zinger + Fries + Drink", 420],
      ["Burger Deal 2 - Chicken + Fries + Drink", 370],
      ["Burger Deal 3 - Zinger + 5 Wings + Fries + Drink", 750],
      ["Burger Deal 4 - 4 Zinger + 10 Wings + 1.5L Drink", 1750],
      ["Burger Deal 5 - 5 Zinger + 1.5L Drink", 1400],
      ["Burger Deal 6 - 2 Zinger + 2 Chicken + 10 Wings + 1.5L", 1650],
      ["Burger Deal 7 - 4 Zinger + 4 Drum Sticks + 1.5L", 1750],
      ["Burger Deal 8 - 10 Zinger + 2.25L Drink", 2750],
      ["Burger Deal 9 - 2 Leg + 5 Wings + 5 Nuggets + 1L", 1320],
      ["Burger Deal 10 - 5 Drum + 10 Nuggets + Loaded Fries + 1.5L", 1850],
    ]),
  },
  {
    id: "cat-pizza-deals",
    name: "Pizza Deals",
    items: simpleItems([
      ["Pizza Deal 1 - Small Pizza + Regular Drink", 530],
      ["Pizza Deal 2 - Medium Pizza + 500ml Drink", 1000],
      ["Pizza Deal 3 - Large Pizza + 1L Drink", 1400],
      ["Pizza Deal 4 - X-Large Pizza + 1.5L Drink", 1770],
    ]),
  },
  {
    id: "cat-family-deals",
    name: "Friends & Family",
    items: simpleItems([
      ["Family Deal 5 - 2 Small Pizzas + 2 Zinger + 1L", 1640],
      ["Family Deal 6 - 2 Medium Pizzas + 4 Zinger + 1.5L", 2950],
      ["Family Deal 7 - 1 Large Pizza + 4 Wings + 1.5L", 1650],
      ["Family Deal 8 - 1 X-Large + 4 Wings + 2 Zinger + 1.5L", 2500],
    ]),
  },
  {
    id: "cat-super-deals",
    name: "Pizza Super Deals",
    items: simpleItems([
      ["Super Deal 1 - 3 Small Pizzas + FREE 1L Drink", 1550],
      ["Super Deal 2 - 3 Medium Pizzas + FREE 1.5L Drink", 2780],
      ["Super Deal 3 - 3 Large Pizzas + FREE 2.25L Drink", 4000],
      ["Super Deal 4 - 3 Family Pizzas + FREE 2.25L Drink", 5200],
    ]),
  },
  {
    id: "cat-birthday",
    name: "Birthday Deal",
    items: simpleItems([
      ["Birthday Deal - 3 Large Pizzas + 2 Pound Cake + 1.5L", 5300],
    ]),
  },
];
