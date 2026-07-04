import mongoose from "mongoose";
import { Invoice } from "../models/invoice.model";
import { Product } from "../models/product.model";
import { Customer } from "../models/customer.model";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import {
  AnalyticsPeriod,
  DashboardAnalytics,
  DashboardTrendPoint,
} from "../types/DashboardAnalyticsType";

const allowedPeriods: AnalyticsPeriod[] = ["daily", "weekly", "monthly"];

const periodWindows: Record<AnalyticsPeriod, number> = {
  daily: 30,
  weekly: 12,
  monthly: 12,
};

const getPeriodStartDate = (period: AnalyticsPeriod) => {
  const start = new Date();
  if (period === "daily") {
    start.setDate(start.getDate() - (periodWindows.daily - 1));
  } else if (period === "weekly") {
    start.setDate(start.getDate() - periodWindows.weekly * 7);
  } else {
    start.setMonth(start.getMonth() - (periodWindows.monthly - 1));
  }
  start.setHours(0, 0, 0, 0);
  return start;
};

const getTrendGroupStage = (period: AnalyticsPeriod) => {
  if (period === "daily") {
    return {
      key: { $dateToString: { format: "%Y-%m-%d", date: "$issueDate" } },
      label: { $dateToString: { format: "%d %b", date: "$issueDate" } },
    };
  }

  if (period === "weekly") {
    return {
      key: {
        $concat: [
          { $toString: { $isoWeekYear: "$issueDate" } },
          "-W",
          { $toString: { $isoWeek: "$issueDate" } },
        ],
      },
      label: {
        $concat: [
          "W",
          { $toString: { $isoWeek: "$issueDate" } },
          " ",
          { $toString: { $isoWeekYear: "$issueDate" } },
        ],
      },
    };
  }

  return {
    key: { $dateToString: { format: "%Y-%m", date: "$issueDate" } },
    label: { $dateToString: { format: "%b %Y", date: "$issueDate" } },
  };
};

const toNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

export const getDashboardAnalytics = async (
  storeId: string,
  requestedPeriod: string,
) => {
  if (!allowedPeriods.includes(requestedPeriod as AnalyticsPeriod)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Period must be daily, weekly, or monthly.",
    );
  }

  const period = requestedPeriod as AnalyticsPeriod;
  const storeObjectId = new mongoose.Types.ObjectId(storeId);
  const startDate = getPeriodStartDate(period);
  const trendGroup = getTrendGroupStage(period);

  const [
    kpiAgg,
    trendAgg,
    productAgg,
    categoryAgg,
    billingStatusAgg,
    customerAgg,
    recentInvoices,
    totalProducts,
    totalCustomers,
  ] = await Promise.all([
    Invoice.aggregate([
      { $match: { storeId: storeObjectId } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalPaid: { $sum: "$paidAmount" },
          totalDue: { $sum: "$dueAmount" },
          totalInvoices: { $sum: 1 },
          totalProfit: { $sum: { $toDouble: "$totalProfit" } },
          totalProductsSold: { $sum: { $sum: "$billItems.netQuantity" } },
        },
      },
    ]),
    Invoice.aggregate([
      { $match: { storeId: storeObjectId, issueDate: { $gte: startDate } } },
      {
        $group: {
          _id: trendGroup.key,
          label: { $first: trendGroup.label },
          revenue: { $sum: "$total" },
          paid: { $sum: "$paidAmount" },
          due: { $sum: "$dueAmount" },
          invoices: { $sum: 1 },
          productsSold: { $sum: { $sum: "$billItems.netQuantity" } },
          profit: { $sum: { $toDouble: "$totalProfit" } },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Invoice.aggregate([
      { $match: { storeId: storeObjectId } },
      { $unwind: "$billItems" },
      {
        $group: {
          _id: "$billItems.product.id",
          name: { $first: "$billItems.product.name" },
          sku: { $first: "$billItems.product.sku" },
          quantitySold: { $sum: "$billItems.netQuantity" },
          revenue: { $sum: "$billItems.totalPrice" },
          profit: { $sum: "$billItems.totalProfit" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 8 },
    ]),
    Invoice.aggregate([
      { $match: { storeId: storeObjectId } },
      { $unwind: "$billItems" },
      {
        $lookup: {
          from: "products",
          localField: "billItems.product.id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: {
          path: "$productDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$productDetails.categories",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "productDetails.categories",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $unwind: {
          path: "$categoryDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: { $ifNull: ["$categoryDetails._id", "uncategorized"] },
          name: {
            $first: { $ifNull: ["$categoryDetails.name", "Uncategorized"] },
          },
          quantitySold: { $sum: "$billItems.netQuantity" },
          revenue: { $sum: "$billItems.totalPrice" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 6 },
    ]),
    Invoice.aggregate([
      { $match: { storeId: storeObjectId } },
      {
        $group: {
          _id: null,
          paid: {
            $sum: {
              $cond: [{ $lte: ["$dueAmount", 0] }, 1, 0],
            },
          },
          partial: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ["$dueAmount", 0] },
                    { $gt: ["$paidAmount", 0] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          unpaid: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ["$dueAmount", 0] },
                    { $lte: ["$paidAmount", 0] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
    Invoice.aggregate([
      { $match: { storeId: storeObjectId } },
      {
        $group: {
          _id: "$customerId",
          invoiceCount: { $sum: 1 },
          totalBilled: { $sum: "$total" },
          totalPaid: { $sum: "$paidAmount" },
          totalDue: { $sum: "$dueAmount" },
        },
      },
      { $sort: { totalBilled: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: {
          path: "$customerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          invoiceCount: 1,
          totalBilled: 1,
          totalPaid: 1,
          totalDue: 1,
          name: { $ifNull: ["$customerDetails.name", "Walk-in customer"] },
          phoneNumber: "$customerDetails.phoneNumber",
        },
      },
    ]),
    Invoice.aggregate([
      { $match: { storeId: storeObjectId } },
      { $sort: { issueDate: -1, createdAt: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: {
          path: "$customerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          invoiceNumber: 1,
          total: 1,
          paidAmount: 1,
          dueAmount: 1,
          issueDate: 1,
          status: 1,
          customerName: {
            $ifNull: ["$customerDetails.name", "Walk-in customer"],
          },
        },
      },
    ]),
    Product.countDocuments({ storeId: storeObjectId }),
    Customer.countDocuments({ storeId: storeObjectId }),
  ]);

  const kpis = kpiAgg[0] || {};
  const billingStatus = billingStatusAgg[0] || {};

  const payload: DashboardAnalytics = {
    period,
    generatedAt: new Date().toISOString(),
    kpis: {
      totalRevenue: toNumber(kpis.totalRevenue),
      totalPaid: toNumber(kpis.totalPaid),
      totalDue: toNumber(kpis.totalDue),
      totalInvoices: toNumber(kpis.totalInvoices),
      totalProductsSold: toNumber(kpis.totalProductsSold),
      totalProfit: toNumber(kpis.totalProfit),
      totalProducts,
      totalCustomers,
    },
    salesTrend: trendAgg.map(
      (point): DashboardTrendPoint => ({
        key: point._id,
        label: point.label,
        revenue: toNumber(point.revenue),
        paid: toNumber(point.paid),
        due: toNumber(point.due),
        invoices: toNumber(point.invoices),
        productsSold: toNumber(point.productsSold),
        profit: toNumber(point.profit),
      }),
    ),
    topProducts: productAgg.map((product) => ({
      productId: product._id?.toString() || "unknown",
      name: product.name || "Unknown product",
      sku: product.sku,
      quantitySold: toNumber(product.quantitySold),
      revenue: toNumber(product.revenue),
      profit: toNumber(product.profit),
    })),
    categorySales: categoryAgg.map((category) => ({
      categoryId: category._id?.toString() || "uncategorized",
      name: category.name || "Uncategorized",
      quantitySold: toNumber(category.quantitySold),
      revenue: toNumber(category.revenue),
    })),
    billingStatus: {
      paid: toNumber(billingStatus.paid),
      partial: toNumber(billingStatus.partial),
      unpaid: toNumber(billingStatus.unpaid),
    },
    topCustomers: customerAgg.map((customer) => ({
      customerId: customer._id?.toString() || "walk-in",
      name: customer.name || "Walk-in customer",
      phoneNumber: customer.phoneNumber,
      invoiceCount: toNumber(customer.invoiceCount),
      totalBilled: toNumber(customer.totalBilled),
      totalPaid: toNumber(customer.totalPaid),
      totalDue: toNumber(customer.totalDue),
    })),
    recentInvoices: recentInvoices.map((invoice) => ({
      _id: invoice._id.toString(),
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
      total: toNumber(invoice.total),
      paidAmount: toNumber(invoice.paidAmount),
      dueAmount: toNumber(invoice.dueAmount),
      issueDate: invoice.issueDate?.toISOString?.() || invoice.issueDate,
      status: invoice.status,
    })),
  };

  return payload;
};
