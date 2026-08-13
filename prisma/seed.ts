import { ProductStatus } from '@prisma/client';
import { prisma } from '../lib/db';

const categoriesData = [
  {
    name: "Kundan Bridal Sets",
    slug: "kundan-bridal-sets",
    image: "/euphoria/762867867_1027766650023554_4511890854211205012_n.jpg",
  },
  {
    name: "Polki Necklaces",
    slug: "polki-necklaces",
    image: "/euphoria/766953023_2186460245228415_4551314285155222007_n.jpg",
  },
  {
    name: "Pearl Jewellery",
    slug: "pearl-jewellery",
    image: "/euphoria/769222217_1365468228389531_1251425921139694609_n.jpg",
  },
  {
    name: "Long Chains",
    slug: "long-chains",
    image: "/euphoria/773724287_1364533438546734_5029064412872943930_n.jpg",
  },
  {
    name: "Choker Sets",
    slug: "choker-sets",
    image: "/euphoria/772978487_1332257145332271_6743125412296380938_n.jpg",
  },
];

const productsData = [
  {
    name: "Emerald Drop Heavy Kundan Bridal Choker",
    price: 35000,
    categoryIndex: 0,
    image: "/euphoria/762867867_1027766650023554_4511890854211205012_n.jpg"
  },
  {
    name: "Royal Polki & Pearl Multilayer Necklace",
    price: 28500,
    categoryIndex: 1,
    image: "/euphoria/766953023_2186460245228415_4551314285155222007_n.jpg"
  },
  {
    name: "Ruby Accent Traditional Antique Necklace",
    price: 24000,
    categoryIndex: 0,
    image: "/euphoria/768310237_1712816456673993_6849973324518527495_n.jpg"
  },
  {
    name: "Classic Authentic Pearl Strand Set",
    price: 18000,
    categoryIndex: 2,
    image: "/euphoria/768398770_1045991788216535_288517747382675700_n.jpg"
  },
  {
    name: "Navratna Style Festive Kundan Necklace",
    price: 22500,
    categoryIndex: 0,
    image: "/euphoria/768432871_1914967766556133_3751784928365785225_n.jpg"
  },
  {
    name: "Golden Polki Detailed Bridal Choker",
    price: 32000,
    categoryIndex: 1,
    image: "/euphoria/769222217_1365468228389531_1251425921139694609_n.jpg"
  },
  {
    name: "Elegant Drop Pearl Party Necklace",
    price: 15500,
    categoryIndex: 2,
    image: "/euphoria/770587570_2073586856617335_3551151057027433152_n.jpg"
  },
  {
    name: "Antique Gold Plated Long Rani Haar",
    price: 29000,
    categoryIndex: 3,
    image: "/euphoria/771708723_28107443852277973_5499577680126141710_n.jpg"
  },
  {
    name: "Heavy Bridal Polki & Emerald Set",
    price: 45000,
    categoryIndex: 1,
    image: "/euphoria/771821230_1583238333404917_7863217094968182891_n.jpg"
  },
  {
    name: "Minimalist Kundan Office Wear Set",
    price: 12000,
    categoryIndex: 0,
    image: "/euphoria/772170902_2000269963904714_7559423604021220344_n.jpg"
  },
  {
    name: "Exquisite White Pearl Choker",
    price: 21000,
    categoryIndex: 4,
    image: "/euphoria/772521622_1691137395278430_6218123870385087042_n.jpg"
  },
  {
    name: "South Indian Style Temple Jewelry Chain",
    price: 36000,
    categoryIndex: 3,
    image: "/euphoria/772868621_1551292096733143_932464586131893099_n.jpg"
  },
  {
    name: "Sapphire & Kundan Statement Choker",
    price: 38500,
    categoryIndex: 4,
    image: "/euphoria/772978487_1332257145332271_6743125412296380938_n.jpg"
  },
  {
    name: "Premium Multi-Layer Pearl Haram",
    price: 31000,
    categoryIndex: 2,
    image: "/euphoria/773724287_1364533438546734_5029064412872943930_n.jpg"
  }
];

async function main() {
  console.log('Start seeding for Euphoria...');

  // Clean up existing data
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  // 1. Create Categories
  console.log('Creating Categories...');
  const createdCategories = [];
  for (const cat of categoriesData) {
    const category = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
      },
    });
    createdCategories.push(category);
    console.log(`Created category: ${category.name}`);
  }

  // 2. Create Products and Variants
  console.log('Creating Products...');
  for (let i = 0; i < productsData.length; i++) {
    const pData = productsData[i];
    const categoryId = createdCategories[pData!.categoryIndex]?.id || '';
    const imagePath = pData!.image;

    const product = await prisma.product.create({
      data: {
        name: pData!.name,
        slug: pData!.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: `Experience the epitome of elegance with our ${pData!.name}. Perfect for any special occasion. Made with premium quality authentic materials. All kind of traditional jewelry available in stock.`,
        basePrice: pData!.price,
        categoryId: categoryId,
        status: ProductStatus.ACTIVE,
        isFeatured: true,
        seoTitle: pData!.name,
        seoDesc: `Buy ${pData!.name} from Euphoria.`,
        ogImage: imagePath,
        variants: {
          create: [
            {
              sku: `EUPH-2026-${i + 1}A`,
              size: 'Standard',
              color: 'As Pictured',
              price: pData!.price,
              stock: 15,
              images: [imagePath],
            },
          ],
        },
      },
    });

    console.log(`Created product: ${product.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
