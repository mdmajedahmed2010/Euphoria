/**
 * BIBAZ — My Account Server Actions
 * SOP §২ — Customer Features & MariaDB Integration
 */

"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  updateProfileSchema,
  changePasswordSchema,
  type ChangePasswordInput,
  type UpdateProfileInput,
} from "@/lib/validators/auth";
import { shippingAddressSchema, type ShippingAddressInput } from "@/lib/validators/order";
import { revalidatePath } from "next/cache";

// Helper: Ensure user is authenticated
async function getAuthSession() {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    throw new Error("Unauthorized access. Please login first.");
  }
  return session as typeof session & { user: NonNullable<typeof session.user> & { id: string } };
}

// ═══════════════════════════════════════════
// 1. PROFILE ACTIONS
// ═══════════════════════════════════════════

export async function getProfile() {
  try {
    const session = await getAuthSession();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });
    if (!user) {
      return { success: false, error: "User account not found." };
    }
    return { success: true, user };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to fetch profile." };
  }
}

export async function updateProfile(input: UpdateProfileInput) {
  try {
    const session = await getAuthSession();

    // Validate Zod
    const validated = updateProfileSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid update input.",
      };
    }

    const { name, phone } = validated.data;

    // Check if another user already has this phone
    if (phone) {
      const existingPhone = await prisma.user.findFirst({
        where: {
          phone,
          id: { not: session.user.id },
        },
      });
      if (existingPhone) {
        return {
          success: false,
          error: "This phone number is already registered to another user.",
        };
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { name, phone },
    });

    revalidatePath("/account");
    return { success: true, message: "Profile updated successfully." };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to update profile." };
  }
}

// ═══════════════════════════════════════════
// 2. PASSWORD ACTIONS
// ═══════════════════════════════════════════

export async function changePassword(input: ChangePasswordInput) {
  try {
    const session = await getAuthSession();

    // Validate Zod
    const validated = changePasswordSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid password inputs.",
      };
    }

    const { currentPassword, newPassword } = validated.data;

    // Find user password hash
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user) {
      return { success: false, error: "User credentials not found." };
    }

    if (user.passwordHash) {
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return { success: false, error: "Your current password is incorrect." };
      }
    }

    // Hash new password (12 salt rounds)
    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash },
    });

    return { success: true, message: "Password updated successfully." };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to update password." };
  }
}

// ═══════════════════════════════════════════
// 3. ADDRESS ACTIONS
// ═══════════════════════════════════════════

export async function getAddresses() {
  try {
    const session = await getAuthSession();
    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: "desc" },
    });
    return { success: true, addresses };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to fetch addresses." };
  }
}

export async function addAddress(input: {
  label?: string;
  address: ShippingAddressInput;
  isDefault?: boolean;
}) {
  try {
    const session = await getAuthSession();

    // Validate Zod
    const validated = shippingAddressSchema.safeParse(input.address);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid address details.",
      };
    }

    const { name, phone, street, city, area, postalCode } = validated.data;
    const makeDefault = !!input.isDefault;

    // Find existing addresses
    const userAddresses = await prisma.address.findMany({
      where: { userId: session.user.id },
    });

    // Set as default if it is the first address or explicitly checked
    const shouldBeDefault = userAddresses.length === 0 || makeDefault;

    if (shouldBeDefault) {
      // Remove default status from all others
      await prisma.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: session.user.id,
        label: input.label || "Home",
        name,
        phone,
        street,
        city,
        area,
        postalCode,
        isDefault: shouldBeDefault,
      },
    });

    revalidatePath("/account/addresses");
    return { success: true, address: newAddress, message: "Address added successfully." };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to add address." };
  }
}

export async function deleteAddress(id: string) {
  try {
    const session = await getAuthSession();

    // Verify address ownership
    const address = await prisma.address.findUnique({
      where: { id },
    });

    if (!address || address.userId !== session.user.id) {
      return { success: false, error: "Address not found or unauthorized." };
    }

    await prisma.address.delete({
      where: { id },
    });

    // If we deleted the default address, promote another one
    if (address.isDefault) {
      const nextAddress = await prisma.address.findFirst({
        where: { userId: session.user.id },
      });
      if (nextAddress) {
        await prisma.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }

    revalidatePath("/account/addresses");
    return { success: true, message: "Address deleted successfully." };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to delete address." };
  }
}

export async function setDefaultAddress(id: string) {
  try {
    const session = await getAuthSession();

    // Verify address ownership
    const address = await prisma.address.findUnique({
      where: { id },
    });

    if (!address || address.userId !== session.user.id) {
      return { success: false, error: "Address not found or unauthorized." };
    }

    // Set all other addresses for the user to false
    await prisma.address.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    });

    // Set this address to default
    await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    revalidatePath("/account/addresses");
    return { success: true, message: "Default address updated successfully." };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to update default address." };
  }
}

// ═══════════════════════════════════════════
// 4. ORDER ACTIONS
// ═══════════════════════════════════════════

export async function getUserOrders() {
  try {
    const session = await getAuthSession();
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        status: true,
        total: true,
        items: {
          select: {
            quantity: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedOrders = orders.map((o) => {
      const itemCount = o.items.reduce((acc, curr) => acc + curr.quantity, 0);
      return {
        id: o.id,
        orderNumber: o.orderNumber,
        date: new Date(o.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        status: o.status,
        total: Number(o.total),
        itemCount,
      };
    });

    return { success: true, orders: formattedOrders };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to fetch orders." };
  }
}

export async function getOrderDetails(id: string) {
  try {
    const session = await getAuthSession();
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        timeline: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!order || order.userId !== session.user.id) {
      return { success: false, error: "Order not found or unauthorized." };
    }

    const address =
      typeof order.shippingAddress === "string"
        ? JSON.parse(order.shippingAddress)
        : order.shippingAddress;

    const timelineMap: Record<string, string> = {
      PENDING: "Order Placed",
      CONFIRMED: "Confirmed",
      PROCESSING: "Processing",
      SHIPPED: "Shipped",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
      RETURNED: "Returned",
      REFUNDED: "Refunded",
    };

    const activeTimeline = order.timeline.map((t) => ({
      status: timelineMap[t.status] || t.status,
      date: new Date(t.createdAt).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      active: true,
    }));

    // If timeline is empty, populate a fallback based on current status
    if (activeTimeline.length === 0) {
      activeTimeline.push({
        status: "Order Placed",
        date: new Date(order.createdAt).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        active: true,
      });
    }

    const paymentMap: Record<string, string> = {
      COD: "Cash on Delivery",
      BKASH: "bKash",
      NAGAD: "Nagad",
      SSLCOMMERZ: "Online Payment",
    };

    return {
      success: true,
      order: {
        orderNumber: order.orderNumber,
        date: new Date(order.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        status: order.status,
        items: order.items.map((item) => ({
          id: item.id,
          name: item.variant.product.name,
          size: item.variant.size || "Free Size",
          color: item.variant.color || "Default",
          quantity: item.quantity,
          price: Number(item.unitPrice),
        })),
        subtotal: Number(order.subtotal),
        shipping: Number(order.shippingCharge),
        discount: Number(order.discount),
        total: Number(order.total),
        address: {
          name: address.name,
          phone: address.phone,
          street: address.street,
          area: address.area,
          city: address.city,
          postalCode: address.postalCode,
        },
        paymentMethod: paymentMap[order.paymentMethod] || order.paymentMethod,
        timeline: activeTimeline,
      },
    };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to fetch order details." };
  }
}

// ═══════════════════════════════════════════
// 5. WISHLIST ACTIONS
// ═══════════════════════════════════════════

export async function getUserWishlist() {
  try {
    const session = await getAuthSession();
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            category: {
              select: {
                name: true,
              },
            },
            variants: {
              where: { isActive: true },
              select: {
                images: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedItems = wishlist.map((item) => {
      const product = item.product;
      const defaultVariant = product.variants[0];

      let imageUrl = "/images/products/placeholder.jpg";
      if (defaultVariant && defaultVariant.images) {
        try {
          const parsedImages =
            typeof defaultVariant.images === "string"
              ? JSON.parse(defaultVariant.images)
              : defaultVariant.images;
          if (Array.isArray(parsedImages) && parsedImages.length > 0) {
            imageUrl = parsedImages[0];
          }
        } catch {
          // Fail silently
        }
      }

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(defaultVariant?.price || product.basePrice),
        image: imageUrl,
        category: product.category.name,
      };
    });

    return { success: true, wishlist: formattedItems };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to fetch wishlist." };
  }
}

export async function toggleWishlist(productId: string) {
  try {
    const session = await getAuthSession();
    const existing = await prisma.wishlist.findFirst({
      where: { userId: session.user.id, productId },
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      revalidatePath("/account/wishlist");
      return { success: true, isWishlisted: false, message: "Removed from wishlist." };
    } else {
      await prisma.wishlist.create({
        data: { userId: session.user.id, productId },
      });
      revalidatePath("/account/wishlist");
      return { success: true, isWishlisted: true, message: "Added to wishlist." };
    }
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to update wishlist." };
  }
}
