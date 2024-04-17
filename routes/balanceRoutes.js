const mongoose = require('mongoose');
const router = require('express').Router();
const moment = require('moment-timezone');

const User = require('../db/user');
const Profile = require('../db/profile');
const utils = require('../lib/utils');
const Space = require('../db/space');
const Transaction = require('../db/transaction');


// get total balance in (an optional) timeframe
router.get('/timeframe-total-balance/:userId', async (req, res) => {
    const userId = req.params.userId;
    const userIdObject = new mongoose.Types.ObjectId(userId);
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const userTimeZone = req.headers['x-user-timezone'];

    let query = {
        userId: userIdObject,
        type: { $ne: 'transfer'}
    }
    if (startDate && endDate) {
        query.date = {
            $gte: startDate,
            $lte: endDate
        }
    }

    try {
        let balance = await Transaction.aggregate([
            {
                $match: query
            },
            {
                $group: {
                    _id: null,
                    totalExpense: {
                        $sum: {
                            $cond: { if : { $eq: ['$type', 'expense'] }, then: '$amount', else: 0 }
                        }
                    },
                    totalIncome: {
                        $sum: {
                            $cond: { if : { $eq: ['$type', 'income'] }, then: '$amount', else: 0 }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalBalance: { $subtract: ['$totalIncome', '$totalExpense']},
                    totalIncome: '$totalIncome',
                    totalExpense: '$totalExpense'
                }
            }
        ])
        if (balance.length > 0) {
            console.log("Got Total Balance Succssefully");
            res.status(200).json({ sucess: true, balance: balance[0] })
        } else if (balance.length === 0) {
            console.log("Empty Total Balance");
            res.status(204).json({ sucess: true, msg: "no data to calculate the balances" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ sucess: false, msg: "interanal server error" })
    }
})

// get accounts balance in (an optional) timeframe
router.get('/timeframe-account-balance/:userId', async (req,res) => {
    const userId = req.params.userId;
    const userIdObject = new mongoose.Types.ObjectId(userId);
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    let query = {
        userId: userIdObject,
    }
    if (startDate && endDate) {
        query.date = {
            $gte: startDate,
            $lte: endDate
        }
    }

    try {
        let accountsBalance = await Transaction.aggregate([
            {
                $match: query
            },
            {
                $group: {
                    _id: "$accountId",
                    totalIncome: {
                        $sum: {
                            $cond: { if:
                                { 
                                    $eq: ["$type", "income"] }, 
                                    then: "$amount",
                                    else: 0 
                                }
                        }
                    },
                    totalExpense: {
                        $sum: {
                            $cond: { if:
                                { 
                                    $eq: ["$type", "expense"] }, 
                                    then: "$amount",
                                    else: 0 
                                }
                        }
                    },
                    totalTransferOut: {
                        $sum: {
                            $cond: { 
                                if: { 
                                        $and: [
                                            { $eq: ["$type", "transfer"] }, 
                                            // { $eq: ["$fromAccountId", "$accountId"] }, 
                                            { $ne: ["$toAccountId", ""] }
                                        ]
                                    },
                                    then: "$amount",
                                    else: 0 
                                }
                        }
                    },
                    totalTransferIn: {
                        $sum: {
                            $cond: { 
                                if: { 
                                        $and: [
                                            { $eq: ["$type", "transfer"] }, 
                                            // { $eq: ["$toAccountId", "$accountId"] }, 
                                            { $ne: ["$fromAccountId", ""] }
                                        ]
                                    },
                                    then: "$amount",
                                    else: 0 
                                }
                        }
                    }
                }
            },
            {
                $project: {
                    accountId: "$_id",
                    _id: 0,
                    balance: {
                        $subtract: [
                            { $add: ["$totalIncome", "$totalTransferIn"] },
                            { $add: ["$totalExpense", "$totalTransferOut"] }
                        ]
                    }
                }
            }
        ]);
        if (accountsBalance.length > 0) {
            console.log("Got Account Balances Successfully");
            res.status(200).json({ sucess: true, accountsBalance: accountsBalance })
        } else if (accountsBalance === 0) {
            res.status(204).json({ sucess: false, msg: "No account data to show" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ sucess: false, msg: "interanal server error" })
    }
})

// NOT USED YET IN THE PROJECT
// get categories balance in (an optional) timeframe
router.get('/timeframe-category-amount/:userId', async (req,res) => {
    const userId = req.params.userId;
    const userIdObject = new mongoose.Types.ObjectId(userId);
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    let query = {
        userId: userIdObject,
        type: { $ne: "transfer" }
    }
    if (startDate && endDate) {
        query.date = {
            $gte: startDate,
            $lte: endDate
        }
    }

    try {
        const categoryAmount = await Transaction.aggregate([
            {
                $match: query
            },
            {
                $group: {
                    _id: {
                        type: "$type",
                        categoryId: "$categoryId"
                    },
                    totalAmount: { $sum: "$amount" }
                }
            },
            {
                $group: {
                    _id: "$_id.type",
                    categories: {
                        $push: {
                            categoryId: "$_id.categoryId",
                            totalAmount: "$totalAmount"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    type: "$_id",
                    categories: 1
                }
            }
        ]);
        console.log("Got Category Amounts Successfully");

        res.status(200).json({ sucess: true, categoryAmount: categoryAmount })
    } catch (error) {
        console.log(error);
        res.status(500).json({ sucess: false, msg: "interanal server error" })
    }
})

router.get('/last90days-expense-income-balance/:userId', async (req, res) => {
    const userId = req.params.userId;
    const userIdObject = new mongoose.Types.ObjectId(userId);
    // const dateGap = req.query.dateGap;
    const userTimeZone = req.headers['x-user-timezone'];

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const startDateLocal = moment(ninetyDaysAgo).tz(userTimeZone).startOf('day').toDate();
    // const endDateLocal = moment(endDate).tz(userTimeZone).endOf('day').toDate();

    let query = {
        userId: userIdObject,
        type: { $ne: "transfer" },
        date: { $gte: startDateLocal}
    }

    const emptyData = []
    for (let count = 0; count <= 90; count++) {
        const date = new Date(ninetyDaysAgo);
        date.setDate(ninetyDaysAgo.getDate() + count);
        emptyData.push({ date: new Date(date), expense: 0, income: 0 , balance: 0});
    }

    try {
        const expenseIncomeBalance = await Transaction.aggregate([
            {
                $match: query
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$date" }
                    },
                    expense: {
                        $sum: {
                            $cond: { if: { $eq: ["$type", "expense"] }, then: "$amount", else: 0 }
                        }
                    },
                    income: {
                        $sum: {
                            $cond: { if: { $eq: ["$type", "income"] }, then: "$amount", else: 0 }
                        }
                    },
                    // balance: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", { $subtract: [0, "$amount"] }] } }
                }
            },
            { $sort: { "_id": 1 } },
            {
                $project: {
                    date: "$_id",
                    expense: 1,
                    income: 1,
                    balance: { $subtract: ["$income", "$expense"] },
                    _id: 0
                }
            }
        ]);

        const formerBalance = await Transaction.aggregate([
            {
                $match: {
                    userId: userIdObject,
                    date: { $lte: ninetyDaysAgo },
                    type: { $ne: "transfer" },
                }
            },
            {
                $group: {
                    _id: null,
                    totalExpense: { $sum: { $cond: { if : { $eq: ['$type', 'expense'] }, then: '$amount', else: 0 } } },
                    totalIncome: { $sum: { $cond: { if : { $eq: ['$type', 'income'] }, then: '$amount', else: 0 } } } }
            },
            {
                $project: {
                    _id: 0,
                    totalBalance: {
                        $subtract: ["$totalIncome", "$totalExpense"] ,
                    }
                }
            }
        ])
        // console.log(formerBalance, expenseIncomeBalance)
        if (formerBalance.length > 0 || expenseIncomeBalance.length > 0) {
            const aggregationMap = new Map();
            expenseIncomeBalance.forEach(item => {
                aggregationMap.set(item.date, item);
            });
            
            let currentBalance = formerBalance.length === 0 ? 0 : formerBalance[0].totalBalance;
            const mergedData = []
            emptyData.forEach(item => {
                const aggregationItem = aggregationMap.get(item.date.toISOString().split('T')[0]);
                
                if (aggregationItem) {
                    currentBalance += aggregationItem.balance;
                    mergedData.push({
                        ...item,
                        expense: aggregationItem.expense,
                        income: aggregationItem.income,
                        balance: currentBalance
                    });
                } else {
                    mergedData.push({
                        ...item,
                        balance: currentBalance
                    });
                }
            });
    
            console.log("Got Last 90 Days Income, Expense")
            res.status(200).json({ sucess: true, data: mergedData })
        } else if ((formerBalance.length === 0) && (expenseIncomeBalance.length === 0)) {
            res.status(204).json({ success: true, msg: "There is no data" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ sucess: false, msg: "interanal server error" })
    }
})

const weekStart = 1;// if it's zero it's monday
// category analytics bar + pie
router.get('/category-analytic/:userId', async(req, res) => {
    const userId = req.params.userId;
    const userIdObject = new mongoose.Types.ObjectId(userId);
    // const startDate = req.query.startDate;
    // const endDate = req.query.endDate;
    const period = req.query.period;
    const userTimeZone = req.headers['x-user-timezone'];

    let query = {};
    let groupId = {};
    query = { 
        userId: userIdObject,
        type: { $ne: "$transfer" },
    };
    emptyGaps = {};
    let startDate = '';
    let endDate = '';
    let orderId = 1;

    const importantDate = new Date();
    const today = new Date();
    if (period) {
        switch (period) {
            case "this_week":
                const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
                
                const diff = today.getDate() - dayOfWeek + (dayOfWeek <= weekStart ? -7 + weekStart : weekStart);
                
                importantDate.setDate(diff);
                // const startDateLocal = moment(importantDate).tz(userTimeZone).startOf('day').toDate();

                query.date = { $gte: moment(importantDate).tz(userTimeZone).startOf('day').toDate() };
                // gap = { $dayOfMonth: "$date" }
                groupId = {
                    gap: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    categoryId: "$categoryId",
                };
                // empty slots
                startDate = moment().startOf('week');
                endDate = moment().endOf('day');
                orderId = 1;
                for (let date = startDate.clone(); date.isBefore(endDate); date.add(1, 'day')) {
                    emptyGaps[date.format("YYYY-MM-DD")] = { 
                        gap: date.format("YYYY-MM-DD"),
                        order: orderId
                    };
                    orderId++; // Increment orderId for the next day
                };
                break;
            case "this_month":                
                importantDate.setDate(1);

                query.date = { $gte: moment(importantDate).tz(userTimeZone).startOf('day').toDate() };
                // gap = { $week: "$date" }
                groupId = {
                    gap: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    categoryId: "$categoryId",
                };
                // empty slots
                startDate = moment().startOf('month');
                endDate = moment().endOf('day');
                orderId = 1;
                for (let date = startDate.clone(); date.isBefore(endDate); date.add(1, 'day')) {
                    emptyGaps[date.format("YYYY-MM-DD")] = { 
                        gap: date.format("YYYY-MM-DD"),
                        order: orderId
                    };
                    orderId++; // Increment orderId for the next day
                };
                break;
            case "last_3_months":
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(today.getMonth() - 2)
                threeMonthsAgo.setDate(1);
                threeMonthsAgo.setHours(0, 0, 0, 0);

                // importantDate.setDate(threeMonthsAgo);

                query.date = { $gte: moment(threeMonthsAgo).tz(userTimeZone).startOf('day').toDate() };
                // gap = { $week: "$date" }
                groupId = {
                    gap: { $week: "$date" },
                    categoryId: "$categoryId",
                };
                // empty slots
                startDate = moment().subtract(2, 'months').startOf('month');
                endDate = moment().endOf('day');
                orderId = 1;
                for (let date = startDate.clone(); date.isBefore(endDate); date.add(1, 'week')) {
                    // Push an object containing week number and week id to the weeks array
                    emptyGaps[date.week()] = { 
                        gap: date.week(),
                        order: orderId
                    };
                    orderId++; // Increment orderId for the next week
                };
                break;
            case "last_6_months":
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(today.getMonth() - 5);
                sixMonthsAgo.setDate(1);
                sixMonthsAgo.setHours(0, 0, 0, 0);

                // importantDate.setDate(sixMonthsAgo);

                query.date = { $gte: moment(sixMonthsAgo).tz(userTimeZone).startOf('day').toDate() };
                // gap = { $month: "$date" }
                groupId = {
                    gap: { $week: "$date" },
                    categoryId: "$categoryId",
                };
                // empty slots
                startDate = moment().subtract(5, 'months').startOf('month');
                endDate = moment().endOf('day');
                orderId = 1;
                for (let date = startDate.clone(); date.isBefore(endDate); date.add(1, 'week')) {
                    // Push an object containing week number and week id to the weeks array
                    emptyGaps[date.week()] = { 
                        gap: date.week(),
                        order: orderId
                    }
                    orderId++; // Increment orderId for the next week
                }
                break;
            case "this_year":
                const thisYear = new Date();

                thisYear.setMonth(0); // January is month 0
                thisYear.setDate(1);
                thisYear.setHours(0, 0, 0, 0);

                // importantDate.setDate(thisYear)

                query.date = { $gte: moment(thisYear).tz(userTimeZone).startOf('day').toDate() };
                // gap = { $month: "$date" }
                groupId = {
                    gap: { $month: "$date" },
                    categoryId: "$categoryId",
                };
                // empty slots
                startDate = moment().startOf('year');
                endDate = moment().endOf('day');
                orderId = 1;
                for (let date = startDate.clone(); date.isBefore(endDate); date.add(1, 'month')) {
                    // Push an object containing week number and week id to the weeks array
                    emptyGaps[date.month()] = { 
                        gap: date.month(),
                        order: orderId
                    };
                    orderId++; // Increment orderId for the next week
                }
                break;

            /* 
            the reason in disabling the last 3 yaers is because the data from aggregation appebds based on gaps in both data 
            but it's a wrong approach instead I should ut ids in both of them (empty and aggregation function) and append based on ids
            */

            // case "last_3_years":
            //     const lastThreeYears = new Date();
            //     lastThreeYears.setFullYear(lastThreeYears.getFullYear() - 2); // Subtract 1 year to get last year

            //     lastThreeYears.setMonth(0); // January is month 0
            //     lastThreeYears.setDate(1);
            //     lastThreeYears.setHours(0, 0, 0, 0);

            //     // importantDate.setDate(lastThreeYears);

            //     query.date = { $gte: moment(lastThreeYears).tz(userTimeZone).startOf('day').toDate() }
            //     groupId = {
            //         gap: { $month: "$date" },
            //         categoryId: "$categoryId",
            //     }
            //     // empty slots
            //     startDate = moment().subtract(3, 'years').startOf('year')
            //     endDate = moment().endOf('day');
            //     orderId = 1;
            //     for (let date = startDate.clone(); date.isBefore(endDate); date.add(1, 'month')) {
            //         // Push an object containing week number and week id to the weeks array
            //         emptyGaps[date.month()] = { 
            //             gap: date.month(),
            //             order: orderId
            //         }
            //         orderId++; // Increment orderId for the next week
            //     }
            //     break;
            // case "max":
            //     groupId = {
            //         gap: { $month: "$date" },
            //         categoryId: "$categoryId",
            //     }
            //     break;  
            default:
                groupId = {
                    gap: { $month: "$date" },
                    categoryId: "$categoryId",
                };
                break;
        }
        importantDate.setHours(0, 0, 0, 0);
    } else {
        res.status(400).send("<h1>Query should either have period or startDate and endDate</h1>");
    }
    console.log("Query from Category Analytics", query, "GroupId from Category Analytics", groupId, "Period", period);

    try {
        // const categoryAmountBar = await Transaction.aggregate([
        //     {
        //         $match: {
        //             userId: userIdObject,
        //             // date: { $lte: ninetyDaysAgo },
        //             type: { $ne: "transfer" },
        //         }
        //         // $match: {
        //         //   date: {
        //         //     $gte: startOfThreeMonths,
        //         //     $lte: endOfThreeMonths
        //         //   }
        //         // }
        //       },
        //       {
        //         $group: {
        //           _id: { $week: "$date" }, // Group transactions by week
        //           categoryAmounts: {
        //             $push: {
        //               category: "$categoryId", // Group by category
        //               amount: "$amount", // Calculate total amount
        //               type: "$type" // Get the type of each category
        //             }
        //           }
        //         }
        //       },
        //       {
        //         $unwind: "$categoryAmounts" // Unwind categoryAmounts array
        //       },
        //       {
        //         $group: {
        //           _id: {
        //             week: "$_id",
        //             type: "$categoryAmounts.type",
        //             category: "$categoryAmounts.category"
        //           },
        //           totalAmount: { $sum: "$categoryAmounts.amount" } // Calculate total amount for each category within each week
        //         }
        //       },
        //       {
        //         $group: {
        //           _id: {
        //             week: "$_id.week",
        //             type: "$_id.type"
        //           },
        //           categories: {
        //             $push: {
        //               k: "$_id.category",
        //               v: "$totalAmount"
        //             }
        //           }
        //         }
        //       },
        //       {
        //         $project: {
        //           _id: 0,
        //           week: "$_id.week",
        //           type: "$_id.type",
        //           categoryAmounts: {
        //             $arrayToObject: {
        //               $map: {
        //                 input: "$categories",
        //                 as: "cat",
        //                 in: {
        //                   k: "$$cat.k",
        //                   v: "$$cat.v"
        //                 }
        //               }
        //             }
        //           }
        //         }
        //       },
        // ]);

        const categoryAmountPie = await Transaction.aggregate([
            {
                $match: query
            },
            {
                $group: {
                  _id: {
                    category: "$categoryId",
                    type: "$type",
                  },
                  totalAmount: { $sum: "$amount" },
                },
            },
            {
                $group: {
                    _id: "$_id.type",
                    categories: { $push: { amount: "$totalAmount", categoryId: "$_id.category" } }
                }
            },
        ]);
        const categoryAMountBar = await Transaction.aggregate([
            {
                $match: query
            },
            {
                $group: {
                    _id: groupId,
                    totalAmount: { $sum: "$amount" },
                }
            },
            {
                $group: {
                    _id: {
                        gap: "$_id.gap",
                    },
                    categoryAmounts: {
                        $push: {
                            k: "$_id.categoryId",
                            v: "$totalAmount"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    gap: "$_id.gap",
                    categoryAmounts: { $arrayToObject: "$categoryAmounts" }
                }
            }            
        ]);
        
        if (categoryAMountBar.length > 0 || categoryAmountPie.length > 0) {
            const resultPie = {};
            categoryAmountPie.forEach((entry) => {
                resultPie[entry._id] = entry.categories;
            });
    
            console.log(emptyGaps);
            const resultBar = categoryAMountBar.map(entry => {
                // { gap: entry.gap, ...entry.categoryAmounts}
                const something = entry.gap;
                console.log(emptyGaps[something])
                if (emptyGaps[something]) { // the error might be caused by having more from the aggregation that emptyGa3 
                    if (emptyGaps[something].gap === entry.gap) { 
                        emptyGaps[something].categoryAmounts = entry.categoryAmounts
                        emptyGaps[something] = { 
                            gap: entry.gap,
                            order: emptyGaps[something].order,
                            ...emptyGaps[something].categoryAmounts
                        }
                        console.log(emptyGaps[something])
                        return emptyGaps[something]
                    } else {
                        console.log(emptyGaps[something])
                        return emptyGaps[something]
                    };
                };
            });
            const emptyGapsArray = Object.values(emptyGaps);
            emptyGapsArray.sort((a, b) => a.order - b.order);
    
            // console.log("Got Category Analytics Data Successfully: ", categoryAMountBar)
            // console.log("Got Category Analytics Data Successfully: ", resultBar)
            // console.log("Got Category Analytics Data Successfully: ", emptyGapsArray)
            res.status(200).json({ sucess: true, barData: emptyGapsArray, pieData: resultPie});
        } else if ((categoryAMountBar.length === 0) && (categoryAmountPie.length === 0)) {
            console.log("Empty category Analytic Data");
            // console.log(categoryAMountBar, categoryAmountPie)
            res.status(204).json({ sucess: true, msg: "no data to calculate the analytics" });
        };
    } catch (error) {
        console.log(error);
        res.status(500).json({ sucess: false, msg: "interanal server error" });
    };
});

// sankey
router.get('/sankey/:userId', async(req,res) => {
    const userId = req.params.userId;
    const userIdObject = new mongoose.Types.ObjectId(userId);
    // const startDate = req.query.startDate;
    // const endDate = req.query.endDate; 
    const period = req.query.period;
    const userTimeZone = req.headers['x-user-timezone'];
    
    // const currentDate = new Date()
    // const startDate = new Date(currentDate.setDate(currentDate.getDate() - 30))

    const startDate = new Date()
    const today = new Date();
    
    let matchAccountInitial = {};
    let matchCategory = {}
    if(period) {
        switch (period) {
            case "this_week":
                const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
                
                const diff = today.getDate() - dayOfWeek + (dayOfWeek <= weekStart ? -7 + weekStart : weekStart);
                
                // startDate.setDate(diff);
                matchAccountInitial = {
                    userId: userIdObject,
                    date: { $lte: moment(diff).tz(userTimeZone).startOf('day').toDate() }
                };
                matchCategory = {
                    userId: userIdObject,
                    type: { $ne: "transfer" },
                    date: { $gte: moment(diff).tz(userTimeZone).startOf('day').toDate()}
                };
                break;
            case "this_month":                
                today.setDate(1);
                
                matchAccountInitial = {
                    userId: userIdObject,
                    date: { $lte: moment(today).tz(userTimeZone).startOf('day').toDate() }
                };
                matchCategory = {
                    userId: userIdObject,
                    type: { $ne: "transfer" },
                    date: { $gte: moment(today).tz(userTimeZone).startOf('day').toDate()}
                };
                break;
            case "last_3_months":
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(today.getMonth() - 2)
                threeMonthsAgo.setDate(1);

                // startDate.setDate(threeMonthsAgo);
                matchAccountInitial = {
                    userId: userIdObject,
                    date: { $lte: moment(threeMonthsAgo).tz(userTimeZone).startOf('day').toDate() }
                };
                matchCategory = {
                    userId: userIdObject,
                    type: { $ne: "transfer" },
                    date: { $gte: moment(threeMonthsAgo).tz(userTimeZone).startOf('day').toDate()}
                };
                break;
            case "last_6_months":
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(today.getMonth() - 5)
                sixMonthsAgo.setDate(1);

                // startDate.setDate(sixMonthsAgo);
                matchAccountInitial = {
                    userId: userIdObject,
                    date: { $lte: moment(sixMonthsAgo).tz(userTimeZone).startOf('day').toDate() }
                };
                matchCategory = {
                    userId: userIdObject,
                    type: { $ne: "transfer" },
                    date: { $gte: moment(sixMonthsAgo).tz(userTimeZone).startOf('day').toDate()}
                };
                break;
            case "this_year":
                const thisYear = new Date();

                thisYear.setMonth(0); // January is month 0
                thisYear.setDate(1);

                // startDate.setDate(thisYear)
                matchAccountInitial = {
                    userId: userIdObject,
                    date: { $lte: moment(thisYear).tz(userTimeZone).startOf('day').toDate() }
                };
                matchCategory = {
                    userId: userIdObject,
                    type: { $ne: "transfer" },
                    date: { $gte: moment(thisYear).tz(userTimeZone).startOf('day').toDate()}
                };
                break;
            case "last_3_years":
                const lastThreeYears = new Date();
                lastThreeYears.setFullYear(lastThreeYears.getFullYear() - 2); // Subtract 1 year to get last year

                lastThreeYears.setMonth(0); // January is month 0
                lastThreeYears.setDate(1);

                startDate.setDate(lastThreeYears);
                matchAccountInitial = {
                    userId: userIdObject,
                    date: { $lte: moment(lastThreeYears).tz(userTimeZone).startOf('day').toDate() }
                };
                matchCategory = {
                    userId: userIdObject,
                    type: { $ne: "transfer" },
                    date: { $gte: moment(lastThreeYears).tz(userTimeZone).startOf('day').toDate()}
                };
                break;
            case "max":
                matchAccountInitial = {
                    userId: userIdObject,
                };
                matchCategory = {
                    userId: userIdObject,
                    type: { $ne: "transfer" },
                };
                break;  
            default:
                matchAccountInitial = {
                    userId: userIdObject,
                };
                matchCategory = {
                    userId: userIdObject,
                    type: { $ne: "transfer" },
                };
                break;
        }
        startDate.setHours(0, 0, 0, 0);
    }

    console.log("Important Date from Sankey", startDate)
    try {
        const accountsInitialBalance = await Transaction.aggregate([
            {
                $match: matchAccountInitial
            },
            {
                $group: {
                    _id: "$accountId",
                    totalIncome: {
                        $sum: {
                            $cond: { if:
                                { 
                                    $eq: ["$type", "income"] }, 
                                    then: "$amount",
                                    else: 0 
                                }
                        }
                    },
                    totalExpense: {
                        $sum: {
                            $cond: { if:
                                { 
                                    $eq: ["$type", "expense"] }, 
                                    then: "$amount",
                                    else: 0 
                                }
                        }
                    },
                    totalTransferOut: {
                        $sum: {
                            $cond: { 
                                if: { 
                                        $and: [
                                            { $eq: ["$type", "transfer"] }, 
                                            // { $eq: ["$fromAccountId", "$accountId"] }, 
                                            { $ne: ["$toAccountId", ""] }
                                        ]
                                    },
                                    then: "$amount",
                                    else: 0 
                                }
                        }
                    },
                    totalTransferIn: {
                        $sum: {
                            $cond: { 
                                if: { 
                                        $and: [
                                            { $eq: ["$type", "transfer"] }, 
                                            // { $eq: ["$toAccountId", "$accountId"] }, 
                                            { $ne: ["$fromAccountId", ""] }
                                        ]
                                    },
                                    then: "$amount",
                                    else: 0 
                                }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    accountId: "$_id",
                    totalAmount: {
                        $subtract: [
                            { $add: ["$totalIncome", "$totalTransferIn"] },
                            { $add: ["$totalExpense", "$totalTransferOut"] }
                        ]
                    },
                    type: "initial"
                }
            }
        ]);
        
        const accountsFinalBalance = await Transaction.aggregate([
            {
                $match: {
                    userId: userIdObject,
                }
            },
            {
                $group: {
                    _id: "$accountId",
                    totalIncome: {
                        $sum: {
                            $cond: { if:
                                { 
                                    $eq: ["$type", "income"] }, 
                                    then: "$amount",
                                    else: 0 
                                }
                        }
                    },
                    totalExpense: {
                        $sum: {
                            $cond: { if:
                                { 
                                    $eq: ["$type", "expense"] }, 
                                    then: "$amount",
                                    else: 0 
                                }
                        }
                    },
                    totalTransferOut: {
                        $sum: {
                            $cond: { 
                                if: { 
                                        $and: [
                                            { $eq: ["$type", "transfer"] }, 
                                            // { $eq: ["$fromAccountId", "$accountId"] }, 
                                            { $ne: ["$toAccountId", ""] }
                                        ]
                                    },
                                    then: "$amount",
                                    else: 0 
                                }
                        }
                    },
                    totalTransferIn: {
                        $sum: {
                            $cond: { 
                                if: { 
                                        $and: [
                                            { $eq: ["$type", "transfer"] }, 
                                            // { $eq: ["$toAccountId", "$accountId"] }, 
                                            { $ne: ["$fromAccountId", ""] }
                                        ]
                                    },
                                    then: "$amount",
                                    else: 0 
                                }
                        }
                    }
                }
            },
            // {
            //     $project: {
            //         accountId: "$_id",
            //         _id: 0,
            //         balance: {
            //             $subtract: [
            //                 { $add: ["$totalIncome", "$totalTransferIn"] },
            //                 { $add: ["$totalExpense", "$totalTransferOut"] }
            //             ]
            //         }
            //     }
            // }
            {
                $project: {
                    _id: 0,
                    accountId: "$_id",
                    totalAmount: {
                        $subtract: [
                            { $add: ["$totalIncome", "$totalTransferIn"] },
                            { $add: ["$totalExpense", "$totalTransferOut"] }
                        ]
                    },
                    type: "final"
                }
            }
        ]);

        const categoriesAmount = await Transaction.aggregate([
            {
                $match: matchCategory
            },
            {
                $group: {
                    _id: {
                        type: "$type",
                        categoryId: "$categoryId",
                    },
                    totalAmount: { $sum: "$amount" },
                }
            },
            {
                $project: {
                    _id: 0,
                    categoryId: "$_id.categoryId",
                    type: "$_id.type",
                    totalAmount: "$totalAmount"
                }
            }
        ])
        // console.log("SANKEY", accountsInitialBalance, accountsFinalBalance, categoriesAmount)
        if (accountsInitialBalance.length > 0 || accountsFinalBalance.length > 0 || categoriesAmount.length > 0) {
            const combinedArray = [].concat(
                accountsInitialBalance.map(item => ({ ...item })),
                accountsFinalBalance.map(item => ({ ...item })),
                categoriesAmount.map(item => ({ ...item }))
            );
    
            console.log("Got Sankey Analytics Data Successfully: ")
            res.status(200).json({ 
                sucess: true, 
                sankeyData: combinedArray,
                // categoriesAmount: categoriesAmount, 
                // accountsInitialBalance: accountsInitialBalance, 
                // accountsFinalBalance: accountsFinalBalance
            })
        } else {
            res.status(204).json({ success: true, msg: "no related data was found" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ sucess: false, msg: "interanal server error" })
    }
})



// ?????
// get total balance
router.get('/total-balance/:userId', async (req, res) => {
    const userId = req.params.userId;
    const userIdObject = new mongoose.Types.ObjectId(userId);

    try {
        const balance = await Transaction.aggregate([
            {
                $match: {
                    userId: userIdObject,
                    $or: [
                        { type: 'expense' },
                        { type: 'income' }
                    ],
                    transfer: { $exists: false } // Ignore transfer transactions
                }
            },
            {
                $group: {
                    _id: null,
                    totalExpense: {
                        $sum: {
                            $cond: { if: { $eq: ['$type', 'expense'] }, then: '$amount', else: 0 }
                        }
                    },
                    totalIncome: {
                        $sum: {
                            $cond: { if: { $eq: ['$type', 'income'] }, then: '$amount', else: 0 }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalBalance: { $subtract: ['$totalIncome', '$totalExpense']},
                    totalIncome: '$totalIncome',
                    totalExpense: '$totalExpense'
                }
            }
        ])

        console.log("Total Balance:", balance[0]);
        res.status(200).json({ balance: balance[0] });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal server error'});
    }
})

// get balance of accounts in a specified timeframe 
router.get('/account-balance/:userId/', async (req, res) => {
    const userId = req.params.userId;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    try {
        const transactions = Transaction.find({ 
            userId: userId, 
            $and: [
                {date: { $gte: new Date(startDate) } },
                {date: { $lte: new  Date(endDate) } }
            ]
        });

        let accountBalances = {};
        (await transactions).forEach(transaction => {
            const accountId = transaction.accountId;
            const toAccountId = transaction.toAccountId;
            const amount = transaction.amount;

            if (!accountBalances[accountId]) {
                accountBalances[accountId] = 0;
            }
            if (!accountBalances[toAccountId]) {
                accountBalances[toAccountId] = 0;
            }
            if (transaction.type === "expense" || transaction.type === "transfer") {
                accountBalances[accountId] -= amount;
            } else if (transaction.type === "income") {
                accountBalances[accountId] += amount;
            } else if (accountBalances[toAccountId]) {
                accountBalances[toAccountId] += amount;
            }
        })
        const totalBalance = Object.values(accountBalances).reduce((acc, balance) => acc + balance, 0);

        console.log(accountBalances)
        res.status(200).json({ data: accountBalances , totalBalance: totalBalance});
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal server error'});
    }
})

// get balance of categories in a specified timeframe 
router.get('/category-balance/:userId', async(req, res) => {
    const userId = req.params.userId;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    try{
        let categoryBalances = {}
        const transactions = Transaction.find({
            userId: userId, 
            $and: [
                {date: { $gte: new Date(startDate) } },
                {date: { $lte: new  Date(endDate) } }
            ]
        });
        (await transactions).forEach(transaction => {
            const categoryId = transaction.categoryId;
            const amount = transaction.amount;

            if (!categoryBalances[categoryId]) {
                categoryBalances[categoryId] = 0;
            }

            categoryBalances[categoryId] -= amount;
            
            if (transaction.type === "expense") {
                categoryBalances[categoryId] -= amount;
            } else if (transaction.type === "income") {
                categoryBalances[categoryId] += amount;
            }
        })
        console.log(categoryBalances)
        res.status(200).json({ data: categoryBalances });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal server error'});
    }
})

module.exports = router;