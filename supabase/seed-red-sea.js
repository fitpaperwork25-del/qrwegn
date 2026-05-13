// Red Sea menu seed — scraped from theredseampls.com
// Usage: node supabase/seed-red-sea.js
// Requires env vars:
//   SUPABASE_URL=https://yizvlbupvamsietgjtys.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=<your service role key>
//   RED_SEA_BUSINESS_ID=<full UUID of the Red Sea row in businesses>

const SUPABASE_URL        = process.env.SUPABASE_URL        || "https://yizvlbupvamsietgjtys.supabase.co";
const SERVICE_ROLE_KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RED_SEA_BUSINESS_ID = process.env.RED_SEA_BUSINESS_ID;

if (!SERVICE_ROLE_KEY || !RED_SEA_BUSINESS_ID) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY or RED_SEA_BUSINESS_ID");
  process.exit(1);
}

const headers = {
  "Content-Type":  "application/json",
  "apikey":        SERVICE_ROLE_KEY,
  "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
  "Prefer":        "return=representation",
};

async function post(table, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`POST ${table} failed: ${err}`);
  }
  return res.json();
}

// ── Menu data ──────────────────────────────────────────────────
const menu = [
  {
    category: "Appetizers",
    items: [
      { name: "Veggie Sambusa",           price: 7.65,  description: "Lentils (4 pcs)" },
      { name: "Roll Sampler",             price: 8.65,  description: "Misir, Shiro, and Kik" },
      { name: "French Fries",             price: 7.00,  description: null },
      { name: "Chicken Wings with Fries", price: 9.95,  description: null },
      { name: "Chicken Wings with Fries (6 pcs)", price: 12.95, description: null },
    ],
  },
  {
    category: "Breakfast",
    items: [
      { name: "Ful",                        price: 10.95, description: "Slow-cooked crushed fava beans" },
      { name: "Scrambled Egg Ethiopian Style", price: 12.00, description: "Three eggs, tomato, diced onion, and jalapeno pepper" },
      { name: "Special Egg Fir Fir",        price: 10.95, description: "Three eggs, tomato, diced onion, and berbere (spicy)" },
    ],
  },
  {
    category: "Salad",
    items: [
      { name: "House Salad", price: 9.95,  description: "With vinaigrette dressing" },
      { name: "Fish Salad",  price: 13.95, description: null },
    ],
  },
  {
    category: "Vegetarian",
    items: [
      { name: "Miser",             price: 14.95, description: "Split lentils, onion, garlic, ginger and berbere" },
      { name: "Yabesha Gomen",     price: 14.95, description: "Kale, garlic, ginger, onion, and house blend spice" },
      { name: "Ater Kik",          price: 14.95, description: "Yellow split peas, curry, onion, ginger, and garlic" },
      { name: "Lentil Alicha",     price: 14.95, description: "Lentil, turmeric, house spice" },
      { name: "Tikel Gomen",       price: 14.95, description: "Cabbage, carrots, potato, ginger, garlic, onion, and curry" },
      { name: "Shiro",             price: 14.95, description: "Ground peas simmered with red onions, berbere, garlic, cardamom, and house spices" },
      { name: "Veggie Firfir",     price: 14.95, description: "Shredded injera, house spice blend, onion, tomato, and jalapeno pepper" },
      { name: "Veggie Sampler",    price: 16.95, description: "Chef's selection of 6 freshly prepared vegetarian dishes" },
      { name: "Super Veggie Combo",price: 31.95, description: "Chef's selection of vegetarian dishes. Feeds 2 people" },
    ],
  },
  {
    category: "Beef",
    items: [
      { name: "Kitfo",               price: 21.95, description: "Lean ground beef seasoned with cardamom, berbere, and Ethiopian butter" },
      { name: "Special Kitfo",       price: 25.95, description: "Mixed with spiced collard green and cottage cheese" },
      { name: "Kitfo Dulet",         price: 21.95, description: "Beef tripe, liver mixed with lean ground beef, onions, jalapeno, cardamom, berbere, and Ethiopian butter" },
      { name: "Half-N-Half",         price: 21.95, description: "Half kitfo and half beef derek tibs" },
      { name: "Dulet",               price: 21.95, description: "Spicy country-style ground beef, liver, tripe, Ethiopian butter" },
      { name: "Abyssinia Gored Gored", price: 21.95, description: "Chunked cubed meat, homemade awaze sauce, jalapeno, herbal butter" },
      { name: "Derek Tibs",          price: 21.95, description: null },
      { name: "Lega Tibs",           price: 21.95, description: "Fresh lean beef delicately seasoned and cooked with onion, tomato, jalapenos, fresh herbs" },
      { name: "Lega Tibs Fitfit",    price: 19.95, description: "Fresh lean beef with onion, tomato, jalapenos, sauteed and mixed with injera pieces" },
      { name: "Awaze Tibs",          price: 21.95, description: "Cubed tender beef, onion, jalapenos, tomato, awaze sauce, house blend spices" },
      { name: "Tibs Firfir",         price: 19.95, description: "Beef tenderloin, onion, tomato, jalapenos sauteed and mixed with injera pieces" },
      { name: "Zilzil Tibs",         price: 22.95, description: "Lean beef strips sauteed with mixed bell peppers, onion, Ethiopian herbs and berbere" },
      { name: "Gomen Besiga",        price: 19.95, description: "Beef and collard greens, butter, traditional spices" },
      { name: "Siga Wat",            price: 19.95, description: "Beef stew, berbere sauce, traditional spices" },
      { name: "Quanta Firfir",       price: 20.95, description: "Dried strips of beef mixed with injera in a seasoned sauce" },
      { name: "Bozena Shiro",        price: 16.95, description: "Pea flour and beef, onion, garlic, pepper, touch of Ethiopian butter" },
      { name: "Godin Tibs",          price: 25.00, description: "Sizzling prime short ribs, Ethiopian herbs, fresh onion, tomatoes, garlic, jalapenos" },
      { name: "Full Kurt / Geba Weta", price: 55.00, description: "One pound raw/rare cooked meat, lime, mitmita, awaze, mustard seed" },
      { name: "Half Kurt / Geba Weta", price: 30.00, description: "Half pound raw/rare cooked meat, lime, mitmita, awaze, mustard seed" },
    ],
  },
  {
    category: "Lamb",
    items: [
      { name: "Yebeg Tibs",   price: 23.95, description: "Lamb meat, special blend of house spices, onion, tomato, jalapeno pepper, and Ethiopian butter" },
      { name: "Yebeg Alicha", price: 19.95, description: "Lamb chunks slow-cooked with onion, garlic and spiced Ethiopian butter" },
      { name: "Yebeg Kikil",  price: 20.95, description: "Lamb with bones cooked in mild green pepper and turmeric sauce, onions, garlic herbs, and spices" },
    ],
  },
  {
    category: "Chicken",
    items: [
      { name: "Doro Wat",                price: 19.95, description: "Onion, garlic, ginger, berbere, mixed spices, and spiced butter simmered to create authentic flavor" },
      { name: "Chicken Tibs with Rice",  price: 18.95, description: "Cubes of chicken breast, onion, tomato, jalapenos, house blend spices, sautéed" },
    ],
  },
  {
    category: "Seafood",
    items: [
      { name: "Asa Kitfo",   price: 17.95, description: "Groundfish cooked with olive oil, ground chili powder, onion, and jalapeno" },
      { name: "Asa Goulash", price: 17.95, description: "Cubes of tender Tilapia sautéed in aromatic herbs, onions, and tomato in berbere sauce" },
      { name: "Asa Beshiro", price: 16.95, description: "Cubes of Tilapia fish, onions, ginger, and spices mixed with Shiro" },
    ],
  },
  {
    category: "Curry",
    items: [
      { name: "Chicken Curry", price: 18.00, description: null },
    ],
  },
  {
    category: "Pasta",
    items: [
      { name: "Pasta with Meat Sauce", price: 16.95, description: "Ground beef, celery, onion, garlic tomato sauce" },
      { name: "Pasta Veggie",          price: 15.95, description: "Celery, onion, garlic tomato, and jalapeno" },
    ],
  },
  {
    category: "Sandwiches",
    items: [
      { name: "Kitfo Sandwich",         price: 16.95, description: "Special kitfo made to sandwich served on French bread" },
      { name: "Chicken Sandwich",       price: 14.95, description: "Marinated chicken breast, sautéed mushroom and onion, lettuce, tomato, mayo, topped with cheese" },
      { name: "Red Sea Steak Sandwich", price: 18.00, description: "Tender steak, sautéed onions and bell pepper on French bread with melted cheese and sauce" },
    ],
  },
  {
    category: "Combinations",
    items: [
      { name: "Half Meat Half Veggie", price: 32.95, description: "For 2+ people. Pick 4 items from Vegetarian plus Siga Wat & Yebeg Alicha" },
      { name: "Meat Combo",            price: 35.95, description: "For 2+ people. Three meat specialties: Doro, Sega & Yebeg Alicha with 2 vegetarian sides" },
      { name: "Moseb",                 price: 48.95, description: "For 3+ people. Quanta Firfir, Derek Tibs and Kitfo topped with Gomen and Cottage Cheese" },
      { name: "Moseb (Half Size)",     price: 30.95, description: "For 2 people" },
      { name: "Tour of Ethiopia",      price: 62.95, description: "For 4+ people. Roll sampler, Meat Combo, Veggie Combo & Zilzil Tibs" },
    ],
  },
  {
    category: "Kids Menu",
    items: [
      { name: "Chicken Strips with Fries (2 pcs)", price: 7.00, description: null },
      { name: "Pasta with Meat Sauce",             price: 9.25, description: null },
      { name: "Pasta with Tomato Sauce",           price: 7.95, description: null },
    ],
  },
  {
    category: "Extras",
    items: [
      { name: "Injera", price: 2.50, description: null },
      { name: "Egg",    price: 1.25, description: null },
      { name: "Veggie", price: 3.50, description: null },
      { name: "Salad",  price: 6.00, description: null },
    ],
  },
  {
    category: "Dessert",
    items: [
      { name: "Cheesecake", price: 4.50, description: null },
      { name: "Baklava",    price: 4.50, description: null },
    ],
  },
];

// ── Runner ─────────────────────────────────────────────────────
async function run() {
  console.log(`Seeding Red Sea menu → business ${RED_SEA_BUSINESS_ID}`);

  for (let order = 0; order < menu.length; order++) {
    const { category, items } = menu[order];

    // Insert category
    const [cat] = await post("menu_categories", {
      business_id:   RED_SEA_BUSINESS_ID,
      name:          category,
      display_order: order,
      is_visible:    true,
    });
    console.log(`  ✓ Category: ${category} (${cat.id})`);

    // Insert items
    const itemRows = items.map((item, i) => ({
      category_id:   cat.id,
      name:          item.name,
      price:         item.price,
      description:   item.description,
      is_available:  true,
      display_order: i,
    }));

    await post("menu_items", itemRows);
    console.log(`    ✓ ${items.length} items inserted`);
  }

  console.log("\nDone! Red Sea menu seeded successfully.");
}

run().catch((err) => { console.error(err); process.exit(1); });
