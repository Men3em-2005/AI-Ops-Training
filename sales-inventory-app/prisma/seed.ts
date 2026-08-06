import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const PASSWORD = "password123";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  console.log("Seeding database...");

  // --- Branches ---
  const [downtown, uptown, eastside] = await Promise.all([
    prisma.branch.create({ data: { name: "Downtown", location: "12 Market Street" } }),
    prisma.branch.create({ data: { name: "Uptown", location: "88 Ridge Avenue" } }),
    prisma.branch.create({ data: { name: "Eastside", location: "301 Harbor Road" } }),
  ]);
  const branches = [downtown, uptown, eastside];

  // --- Categories ---
  const categoryNames = ["Household Goods", "Small Electronics", "Kitchenware", "Cleaning Supplies", "Personal Care"];
  const categories = await Promise.all(
    categoryNames.map((name) => prisma.category.create({ data: { name } }))
  );
  const catByName = new Map(categories.map((c) => [c.name, c]));

  // --- Products ---
  const productDefs: {
    name: string;
    category: string;
    unitPrice: number;
    unitOfMeasure: string;
    defaultMinStock: number;
  }[] = [
    { name: "LED Desk Lamp", category: "Small Electronics", unitPrice: 18.99, unitOfMeasure: "each", defaultMinStock: 10 },
    { name: "Bluetooth Speaker", category: "Small Electronics", unitPrice: 34.5, unitOfMeasure: "each", defaultMinStock: 8 },
    { name: "USB-C Charging Cable", category: "Small Electronics", unitPrice: 8.99, unitOfMeasure: "each", defaultMinStock: 20 },
    { name: "Digital Kitchen Scale", category: "Small Electronics", unitPrice: 15.0, unitOfMeasure: "each", defaultMinStock: 10 },
    { name: "Non-Stick Frying Pan", category: "Kitchenware", unitPrice: 22.0, unitOfMeasure: "each", defaultMinStock: 12 },
    { name: "Stainless Steel Cutlery Set", category: "Kitchenware", unitPrice: 29.99, unitOfMeasure: "set", defaultMinStock: 8 },
    { name: "Glass Storage Jar", category: "Kitchenware", unitPrice: 6.5, unitOfMeasure: "each", defaultMinStock: 25 },
    { name: "Ceramic Mug Set", category: "Kitchenware", unitPrice: 12.0, unitOfMeasure: "set of 4", defaultMinStock: 10 },
    { name: "All-Purpose Cleaner", category: "Cleaning Supplies", unitPrice: 4.25, unitOfMeasure: "bottle", defaultMinStock: 30 },
    { name: "Microfiber Cloth Pack", category: "Cleaning Supplies", unitPrice: 7.0, unitOfMeasure: "pack of 6", defaultMinStock: 20 },
    { name: "Laundry Detergent", category: "Cleaning Supplies", unitPrice: 11.5, unitOfMeasure: "bottle", defaultMinStock: 15 },
    { name: "Storage Basket", category: "Household Goods", unitPrice: 14.0, unitOfMeasure: "each", defaultMinStock: 12 },
    { name: "Throw Blanket", category: "Household Goods", unitPrice: 19.5, unitOfMeasure: "each", defaultMinStock: 10 },
    { name: "Scented Candle", category: "Household Goods", unitPrice: 9.0, unitOfMeasure: "each", defaultMinStock: 20 },
    { name: "Hand Soap Refill", category: "Personal Care", unitPrice: 5.5, unitOfMeasure: "bottle", defaultMinStock: 25 },
    { name: "Bath Towel Set", category: "Personal Care", unitPrice: 24.0, unitOfMeasure: "set", defaultMinStock: 8 },
  ];

  const products = await Promise.all(
    productDefs.map((p) =>
      prisma.product.create({
        data: {
          name: p.name,
          categoryId: catByName.get(p.category)!.id,
          unitPrice: p.unitPrice,
          unitOfMeasure: p.unitOfMeasure,
          defaultMinStock: p.defaultMinStock,
        },
      })
    )
  );

  // --- Stock (per branch, per product) ---
  // A handful of rows are deliberately seeded below minStock so the
  // low-stock banner/report have something to show immediately.
  const lowStockPairs = new Set([
    `${downtown.id}:${products[0].id}`,
    `${downtown.id}:${products[8].id}`,
    `${uptown.id}:${products[5].id}`,
  ]);

  for (const branch of branches) {
    for (const product of products) {
      const key = `${branch.id}:${product.id}`;
      const quantity = lowStockPairs.has(key)
        ? Math.max(0, product.defaultMinStock - 3)
        : product.defaultMinStock + Math.floor(Math.random() * 40) + 10;

      await prisma.stock.create({
        data: { branchId: branch.id, productId: product.id, quantity, minStock: product.defaultMinStock },
      });
    }
  }

  // --- Suppliers ---
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: { name: "Northline Wholesale", contactPerson: "Dana Reyes", phone: "555-0101" },
    }),
    prisma.supplier.create({
      data: { name: "Harborview Distributors", contactPerson: "Marcus Chen", phone: "555-0142" },
    }),
    prisma.supplier.create({
      data: { name: "CityGoods Supply Co.", contactPerson: "Priya Nair", phone: "555-0187" },
    }),
  ]);

  // --- Users ---
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const admin = await prisma.user.create({
    data: { name: "Alex Morgan", email: "admin@brightway.com", passwordHash, role: "ADMIN" },
  });

  const managers = await Promise.all([
    prisma.user.create({
      data: {
        name: "Jordan Blake",
        email: "manager.downtown@brightway.com",
        passwordHash,
        role: "MANAGER",
        branchId: downtown.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Sam Whitfield",
        email: "manager.uptown@brightway.com",
        passwordHash,
        role: "MANAGER",
        branchId: uptown.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Riley Chen",
        email: "manager.eastside@brightway.com",
        passwordHash,
        role: "MANAGER",
        branchId: eastside.id,
      },
    }),
  ]);

  const staff = await Promise.all([
    prisma.user.create({
      data: {
        name: "Taylor Reed",
        email: "staff.downtown@brightway.com",
        passwordHash,
        role: "STAFF",
        branchId: downtown.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Casey Nguyen",
        email: "staff.uptown@brightway.com",
        passwordHash,
        role: "STAFF",
        branchId: uptown.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Morgan Diaz",
        email: "staff.eastside@brightway.com",
        passwordHash,
        role: "STAFF",
        branchId: eastside.id,
      },
    }),
  ]);

  // --- Purchase Orders ---
  // 1. Fully received order (Downtown, Northline) — establishes a normal lead time.
  const po1 = await prisma.purchaseOrder.create({
    data: {
      branchId: downtown.id,
      supplierId: suppliers[0].id,
      createdById: managers[0].id,
      status: "RECEIVED",
      createdAt: daysAgo(12),
      updatedAt: daysAgo(9),
      expectedDate: daysAgo(9),
      items: {
        create: [
          { productId: products[0].id, orderedQty: 20, receivedQty: 20, unitCost: 11.0 },
          { productId: products[2].id, orderedQty: 40, receivedQty: 40, unitCost: 4.5 },
        ],
      },
    },
  });
  for (const item of [
    { productId: products[0].id, qty: 20 },
    { productId: products[2].id, qty: 40 },
  ]) {
    await prisma.stockMovement.create({
      data: {
        branchId: downtown.id,
        productId: item.productId,
        type: "PURCHASE_RECEIPT",
        quantity: item.qty,
        referenceId: po1.id,
        createdAt: daysAgo(9),
      },
    });
  }

  // 2. Partially received order (Uptown, Harborview) — some received, some outstanding.
  await prisma.purchaseOrder.create({
    data: {
      branchId: uptown.id,
      supplierId: suppliers[1].id,
      createdById: managers[1].id,
      status: "PARTIALLY_RECEIVED",
      createdAt: daysAgo(6),
      updatedAt: daysAgo(2),
      expectedDate: daysAgo(1),
      items: {
        create: [
          { productId: products[5].id, orderedQty: 15, receivedQty: 8, unitCost: 18.0 },
          { productId: products[6].id, orderedQty: 30, receivedQty: 30, unitCost: 3.2 },
        ],
      },
    },
  });

  // 3. Sent order, now overdue — feeds the supplier "late" metric.
  await prisma.purchaseOrder.create({
    data: {
      branchId: eastside.id,
      supplierId: suppliers[2].id,
      createdById: managers[2].id,
      status: "SENT",
      createdAt: daysAgo(10),
      expectedDate: daysAgo(3),
      items: {
        create: [{ productId: products[9].id, orderedQty: 25, receivedQty: 0, unitCost: 3.9 }],
      },
    },
  });

  // 4. Draft order, not yet sent.
  await prisma.purchaseOrder.create({
    data: {
      branchId: downtown.id,
      supplierId: suppliers[0].id,
      createdById: staff[0].id,
      status: "DRAFT",
      expectedDate: daysAgo(-7),
      items: {
        create: [{ productId: products[3].id, orderedQty: 10, receivedQty: 0, unitCost: 9.5 }],
      },
    },
  });

  // --- Stock Transfers ---
  // Completed: Uptown -> Downtown
  const transfer1 = await prisma.stockTransfer.create({
    data: {
      fromBranchId: uptown.id,
      toBranchId: downtown.id,
      requestedById: managers[0].id,
      status: "COMPLETED",
      createdAt: daysAgo(5),
      completedAt: daysAgo(4),
      items: { create: [{ productId: products[7].id, quantity: 10 }] },
    },
  });
  await prisma.stockMovement.createMany({
    data: [
      {
        branchId: uptown.id,
        productId: products[7].id,
        type: "TRANSFER_OUT",
        quantity: -10,
        referenceId: transfer1.id,
        createdAt: daysAgo(5),
      },
      {
        branchId: downtown.id,
        productId: products[7].id,
        type: "TRANSFER_IN",
        quantity: 10,
        referenceId: transfer1.id,
        createdAt: daysAgo(4),
      },
    ],
  });

  // In transit: Eastside -> Uptown
  const transfer2 = await prisma.stockTransfer.create({
    data: {
      fromBranchId: eastside.id,
      toBranchId: uptown.id,
      requestedById: managers[1].id,
      status: "IN_TRANSIT",
      createdAt: daysAgo(1),
      items: { create: [{ productId: products[12].id, quantity: 6 }] },
    },
  });
  await prisma.stockMovement.create({
    data: {
      branchId: eastside.id,
      productId: products[12].id,
      type: "TRANSFER_OUT",
      quantity: -6,
      referenceId: transfer2.id,
      createdAt: daysAgo(1),
    },
  });

  // Requested: Downtown -> Eastside (nothing shipped yet)
  await prisma.stockTransfer.create({
    data: {
      fromBranchId: downtown.id,
      toBranchId: eastside.id,
      requestedById: staff[2].id,
      status: "REQUESTED",
      items: { create: [{ productId: products[4].id, quantity: 5 }] },
    },
  });

  // --- Customers & Sales ---
  const customerDefs = [
    { name: "Priya Kapoor", phone: "555-2001" },
    { name: "Liam O'Connor", phone: "555-2002" },
    { name: "Sofia Martinez", phone: "555-2003" },
  ];
  const customers = await Promise.all(
    customerDefs.map((c) => prisma.customer.create({ data: c }))
  );

  const branchStaff = [
    { branch: downtown, employee: staff[0], manager: managers[0] },
    { branch: uptown, employee: staff[1], manager: managers[1] },
    { branch: eastside, employee: staff[2], manager: managers[2] },
  ];

  let saleCount = 0;
  for (let day = 13; day >= 0; day--) {
    for (const { branch, employee } of branchStaff) {
      // 0-3 sales per branch per day, weighted toward 1-2.
      const salesToday = Math.random() < 0.15 ? 0 : 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < salesToday; i++) {
        const lineCount = 1 + Math.floor(Math.random() * 3);
        const chosen = [...products].sort(() => Math.random() - 0.5).slice(0, lineCount);
        const quantities = chosen.map(() => 1 + Math.floor(Math.random() * 3));

        const subtotal = chosen.reduce((sum, p, idx) => sum + p.unitPrice * quantities[idx], 0);
        const discount = Math.random() < 0.2 ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
        const total = Math.max(0, subtotal - discount);
        const customer = Math.random() < 0.5 ? customers[Math.floor(Math.random() * customers.length)] : null;
        const createdAt = daysAgo(day);

        const sale = await prisma.sale.create({
          data: {
            branchId: branch.id,
            employeeId: employee.id,
            customerId: customer?.id,
            status: "COMPLETED",
            discount,
            subtotal,
            total,
            createdAt,
            items: {
              create: chosen.map((p, idx) => ({
                productId: p.id,
                quantity: quantities[idx],
                unitPrice: p.unitPrice,
                lineTotal: p.unitPrice * quantities[idx],
              })),
            },
          },
        });

        for (const [idx, p] of chosen.entries()) {
          await prisma.stockMovement.create({
            data: {
              branchId: branch.id,
              productId: p.id,
              type: "SALE",
              quantity: -quantities[idx],
              referenceId: sale.id,
              createdAt,
            },
          });
        }

        saleCount++;
      }
    }
  }

  // A couple of explicit cancelled/refunded examples for the UI to show.
  const anySale = await prisma.sale.findFirst({
    where: { branchId: downtown.id, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
  });
  if (anySale) {
    await prisma.sale.update({
      where: { id: anySale.id },
      data: { status: "REFUNDED", resolutionReason: "Customer returned item — wrong size." },
    });
  }

  console.log(`Seeded ${branches.length} branches, ${products.length} products, ${suppliers.length} suppliers,`);
  console.log(`${1 + managers.length + staff.length} users, and ${saleCount} sales.`);
  console.log(`Demo login password for all accounts: ${PASSWORD}`);
  console.log(`Admin: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
